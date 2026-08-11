import os
import sys
import time
import cv2

from app.config import settings
from app.database import SessionLocal
from app.models.employee import Employee

# ================= CONSTANTES =================
FACE_DATA_DIR = os.path.join(os.path.dirname(__file__), "face_data")
TARGET_FRAME_COUNT = 50
CAPTURE_INTERVAL_SECONDS = 0.15  # Ritmo entre capturas
# ==============================================

def check_admin_pin() -> bool:
    if not settings.ADMIN_ENROLL_PIN:
        print("⚠️  No hay ADMIN_ENROLL_PIN configurado en tu .env — configúralo antes de continuar.")
        return False

    entered = input("PIN de administrador: ").strip()
    if entered != settings.ADMIN_ENROLL_PIN:
        print("❌ PIN incorrecto. Enrolamiento cancelado.")
        return False
    return True

def find_employee(name: str):
    db = SessionLocal()
    try:
        normalized = name.strip().lower()
        employees = db.query(Employee).all()
        for employee in employees:
            if employee.name.strip().lower() == normalized:
                return employee
        return None
    finally:
        db.close()

def next_photo_number(employee_folder: str) -> int:
    if not os.path.exists(employee_folder):
        return 1
    existing = [f for f in os.listdir(employee_folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    return len(existing) + 1

def obtener_instruccion(numero_foto, total_fotos):
    """Guía al usuario para capturar todos los ángulos del rostro"""
    cuarto = total_fotos // 4
    if numero_foto <= cuarto:
        return "Mire fijamente de frente..."
    elif numero_foto <= cuarto * 2:
        return "Gire levemente a la izquierda..."
    elif numero_foto <= cuarto * 3:
        return "Gire levemente a la derecha..."
    else:
        return "Mueva la cara arriba y abajo..."

def capture_burst(employee_folder: str, normalized_name: str, target_count: int = TARGET_FRAME_COUNT) -> int:
    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        print("❌ No se pudo abrir la cámara. Verifica que esté conectada y no esté en uso.")
        return 0

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    
    # IMPORTANTE: Eliminamos cualquier archivo .pkl viejo para forzar a DeepFace 
    # a recalcular los rostros en el próximo login.
    pkl_path = os.path.join(FACE_DATA_DIR, "representations_vgg_face.pkl")
    if os.path.exists(pkl_path):
        os.remove(pkl_path)
        print("♻️  Archivo de caché de rostros eliminado para forzar actualización.")

    saved_count = next_photo_number(employee_folder) - 1
    start_count = saved_count
    last_capture_time = 0.0

    print(f"\n📷 Cámara abierta. Sigue las instrucciones en pantalla.\nPresiona ESC en la ventana de la cámara para cortar antes de tiempo.\n")

    while saved_count - start_count < target_count:
        ok, frame = cam.read()
        if not ok: 
            print("❌ Error leyendo la cámara.")
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))

        display_frame = frame.copy()
        
        # Dibujar rectángulos
        for (x, y, w, h) in faces:
            cv2.rectangle(display_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Instrucciones de movimiento
        progreso_actual = saved_count - start_count + 1
        instruccion = obtener_instruccion(progreso_actual, target_count)
        
        cv2.putText(display_frame, instruccion, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.putText(display_frame, f"Capturadas: {progreso_actual-1}/{target_count} - ESC para salir", 
                    (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0) if len(faces) > 0 else (0, 0, 255), 2)

        cv2.imshow("Enrolamiento facial - Agua Clara", display_frame)

        now = time.time()
        # Guardar foto solo si hay rostro detectado y pasó el intervalo
        if len(faces) > 0 and (now - last_capture_time) >= CAPTURE_INTERVAL_SECONDS:
            saved_count += 1
            destination_path = os.path.join(employee_folder, f"{normalized_name}_{saved_count}.jpg")
            cv2.imwrite(destination_path, frame)
            last_capture_time = now

        if cv2.waitKey(1) & 0xFF == 27:  # ESC
            print("Captura interrumpida por el usuario.")
            break

    cam.release()
    cv2.destroyAllWindows()
    return saved_count - start_count

def main():
    print("=== Enrolamiento de rostro — Agua Clara ===\n")

    if not check_admin_pin():
        sys.exit(1)

    name = input("\nNombre de la empleada (debe coincidir con el registro existente): ").strip()

    employee = find_employee(name)
    if not employee:
        print(f"❌ No se encontró ninguna empleada llamada '{name}' en la base de datos.")
        print("   Verifica el nombre exacto en la tabla `employees` antes de reintentar.")
        sys.exit(1)

    print(f"✅ Empleada encontrada: {employee.name} (id {employee.id})")

    normalized_name = employee.name.strip().lower()
    employee_folder = os.path.join(FACE_DATA_DIR, normalized_name)
    os.makedirs(employee_folder, exist_ok=True)

    captured = capture_burst(employee_folder, normalized_name)

    if captured == 0:
        print("\n⚠️  No se guardó ninguna foto. Intenta de nuevo con mejor iluminación.")
    else:
        print(f"\n🎉 Enrolamiento de {employee.name} completo — {captured} foto(s) nuevas guardadas.")

if __name__ == "__main__":
    main()