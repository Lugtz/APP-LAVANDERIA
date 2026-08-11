from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import employees, catalog, orders, expenses, cuts, face_auth

# Crea las tablas si no existen (para desarrollo; en producción usar migraciones, ej. Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agua Clara API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(catalog.router)
app.include_router(orders.router)
app.include_router(expenses.router)
app.include_router(cuts.router)
app.include_router(face_auth.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}