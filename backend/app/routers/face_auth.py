import base64
import os
import tempfile

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.schemas.misc import EmployeeOut

router = APIRouter(prefix="/auth", tags=["Autenticación facial"])

FACE_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "face_data")

class FaceLoginRequest(BaseModel):
    photo_base64: str

@router.post("/face-login", response_model=EmployeeOut)
def face_login(payload: FaceLoginRequest, db: Session = Depends(get_db)):
    from deepface import DeepFace
    
    # 1. Decodificar la imagen
    try:
        image_bytes = base64.b64decode(payload.photo_base64)
    except Exception:
        raise HTTPException(status_code=400, detail="La foto enviada no es un base64 válido.")

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp.write(image_bytes)
        captured_path = tmp.name

    try:
        # 2. Usar DeepFace.find en lugar de múltiples verify()
        # Busca directamente en toda la carpeta face_data de golpe.
        try:
            dfs = DeepFace.find(
                img_path=captured_path,
                db_path=FACE_DATA_DIR,
                enforce_detection=False,
                silent=True,
                threshold=0.4 # Tu umbral de distancia
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en DeepFace: {str(e)}")

        if len(dfs) == 0 or dfs[0].empty:
            raise HTTPException(
                status_code=401,
                detail="Rostro no reconocido. Intenta de nuevo o usa el PIN."
            )

        # 3. Obtener la identidad del mejor match
        # dfs[0] es un DataFrame de Pandas. La columna 'identity' tiene la ruta del match.
        # Ej: app/face_data/marian/marian_15.jpg
        best_match_path = dfs[0].iloc[0]['identity']
        
        # Extraemos el nombre de la carpeta (ej. "marian")
        matched_folder_name = os.path.basename(os.path.dirname(best_match_path))

        # 4. Buscar a la empleada en la base de datos
        employee = db.query(Employee).filter(
            Employee.name.ilike(matched_folder_name)
        ).first()

        if not employee:
            raise HTTPException(
                status_code=401,
                detail="Rostro detectado, pero la empleada no está en la Base de Datos."
            )

        return employee

    finally:
        os.remove(captured_path)