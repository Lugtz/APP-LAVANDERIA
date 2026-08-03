from datetime import date, datetime, time

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order
from app.models.expense import Expense
from app.schemas.misc import CutSummaryOut

router = APIRouter(prefix="/cuts", tags=["Corte"])


@router.get("/", response_model=CutSummaryOut)
def get_cut(
    date_from: date = Query(default_factory=date.today),
    date_to: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
):
    """
    Resumen financiero (Ingresos vs Gastos) para un rango de fechas.
    Por defecto, el corte del día de hoy.
    """
    start = datetime.combine(date_from, time.min)
    end = datetime.combine(date_to, time.max)

    total_income = (
        db.query(func.coalesce(func.sum(Order.advance), 0))
        .filter(Order.created_at >= start, Order.created_at <= end)
        .scalar()
    )

    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.created_at >= start, Expense.created_at <= end)
        .scalar()
    )

    return CutSummaryOut(
        date_from=start,
        date_to=end,
        total_income=total_income,
        total_expenses=total_expenses,
        net=total_income - total_expenses,
    )
