from sqlalchemy import Column, Integer, String, Numeric

from app.database import Base


class ServicePrice(Base):
    """Precios base de lavandería (lavado por kilo, cobertores, tenis, planchado)."""

    __tablename__ = "service_prices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)


class DryCleaningItem(Base):
    """Catálogo completo de tintorería (nombre + precio)."""

    __tablename__ = "dry_cleaning_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)


class ExpenseCategory(Base):
    """Categorías fijas de gastos (Préstamo, Sueldos, Renta, etc.)."""

    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
