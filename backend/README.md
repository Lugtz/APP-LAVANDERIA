# Agua Clara - Backend (API REST)

Stack: FastAPI + SQLAlchemy + pyodbc (SQL Server / Somee)

## Instalación

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # y llenar credenciales reales de Somee
```

## Correr en desarrollo

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Docs automáticas: http://localhost:8000/docs

## Sembrar catálogos (categorías de gastos, precios base, tintorería)

```bash
python -m app.seed.seed_data
```

## Notas de arquitectura

- `app/models` — Modelos SQLAlchemy (tablas).
- `app/schemas` — Modelos Pydantic (validación de entrada/salida de la API).
- `app/routers` — Endpoints agrupados por dominio (empleadas, pedidos, gastos, tintorería, corte).
- `app/database.py` — Motor de conexión y sesión de SQLAlchemy hacia SQL Server.
- `app/seed` — Scripts para poblar catálogos fijos definidos en las especificaciones.

Pendiente de implementar conforme se avance: subida de evidencia fotográfica (recibida en base64 desde el
frontend, ya comprimida a 800x800 JPEG calidad 60% según la lógica de `expo-image-manipulator`), y el
armado del link de WhatsApp (esto se resuelve del lado del frontend con `Linking`, el backend solo entrega
folio y saldos).
