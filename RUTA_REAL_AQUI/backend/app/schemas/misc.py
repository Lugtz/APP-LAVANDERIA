from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class ExpenseCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class ExpenseCreate(BaseModel):
    category_id: int
    employee_id: int
    amount: Decimal
    description: str | None = None


class ExpenseOut(ExpenseCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class ServicePriceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    price: Decimal


class DryCleaningItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    price: Decimal


class CutSummaryOut(BaseModel):
    """Resumen financiero para la pestaña Corte: Ingresos vs Gastos."""

    date_from: datetime
    date_to: datetime
    total_income: Decimal
    total_expenses: Decimal
    net: Decimal
