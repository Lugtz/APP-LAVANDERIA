"""
Puebla la base de datos con los catálogos fijos definidos en las
especificaciones (sección 7). Correr con:

    python -m app.seed.seed_data

Es idempotente: si un registro ya existe (por nombre), no lo duplica.
"""

from app.database import SessionLocal, Base, engine
from app.models.employee import Employee
from app.models.catalog import ServicePrice, DryCleaningItem, ExpenseCategory

EMPLOYEES = ["Marian", "Lupita"]

EXPENSE_CATEGORIES = [
    "Préstamo",
    "Sueldos",
    "Renta",
    "Jabón",
    "Suavitel",
    "Papel",
    "Bolsas de plástico",
    "Luz",
    "Agua",
    "Otro",
]

SERVICE_PRICES = [
    ("Lavado por kilo", 35.00),
    ("Cobertor individual", 75.00),
    ("Cobertor matrimonial", 85.00),
    ("Cobertor queen size", 95.00),
    ("Par de tenis", 45.00),
    ("Docena de planchado", 120.00),
]

# Catálogo de tintorería tal como viene en el documento (sección 7.C).
# El documento lo marca como "completo" pero solo lista 30 items — si en el
# negocio hay más, agregarlos aquí siguiendo el mismo formato (nombre, precio).
DRY_CLEANING_ITEMS = [
    ("7KG MIN(NO PLANCHADO)", 4.55),
    ("ABRIGO CORTO O NIÑO", 89.70),
    ("ABRIGO CUELLO PIEL/PELO RIESGO", 290.55),
    ("ABRIGO NORM(LARGO)", 126.75),
    ("ALMOHADA RIESGO GRANDE", 115.70),
    ("ALMOHADA RIESGO NORMAL", 98.15),
    ("ALMOHADA RIESGO PLUMA", 141.05),
    ("ALMOHADA RIESGO SONAIRE", 354.25),
    ("BAMBINETO 2 PZAS", 136.50),
    ("BAMBINETO 3 PZAS", 152.75),
    ("BAMBINETO 4 PZAS", 189.80),
    ("BAMBINETO 5 PZAS", 231.40),
    ("BANDA NORMAL", 46.80),
    ("BATA BAÑO", 85.15),
    ("BATA CLINICA", 72.15),
    ("BATA SACERDOTE", 94.90),
    ("BATA SEDA", 105.95),
    ("BERMUDA NORMAL", 45.00),
    ("TRAJE 2P NIÑA(O)", 114.40),
    ("TRAJE 2P NORM", 126.75),
    ("TRAJE 2P VINIL RIESGO", 149.50),
    ("TRAJE 3PZ CHARRO NIÑO RIESGO", 239.20),
    ("TRAJE 3PZ CHARRO RIESGO", 342.55),
    ("TRAJE 3PZ LINO O SEDA", 213.85),
    ("TRAJE 3PZ NORM", 188.50),
    ("VELO 1ERA COM", 101.40),
    ("VELO NOVIA SOLO", 189.80),
    ("VESTIDO NOVIA (1 a 5 PZAS)", 702.65),
    ("VESTIDO 15 AÑOS 1 CAPA", 354.25),
    ("VESTIDO 15 AÑOS 2 CAPAS", 379.60),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for name in EMPLOYEES:
            if not db.query(Employee).filter_by(name=name).first():
                db.add(Employee(name=name))

        for name in EXPENSE_CATEGORIES:
            if not db.query(ExpenseCategory).filter_by(name=name).first():
                db.add(ExpenseCategory(name=name))

        for name, price in SERVICE_PRICES:
            if not db.query(ServicePrice).filter_by(name=name).first():
                db.add(ServicePrice(name=name, price=price))

        for name, price in DRY_CLEANING_ITEMS:
            if not db.query(DryCleaningItem).filter_by(name=name).first():
                db.add(DryCleaningItem(name=name, price=price))

        db.commit()
        print("Seed completado.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
