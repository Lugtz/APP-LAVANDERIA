from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.catalog import ServicePrice, DryCleaningItem, ExpenseCategory
from app.schemas.misc import ServicePriceOut, DryCleaningItemOut, ExpenseCategoryOut

router = APIRouter(prefix="/catalog", tags=["Catálogos"])


@router.get("/services", response_model=list[ServicePriceOut])
def list_services(db: Session = Depends(get_db)):
    """Precios base: Lavado por kilo, Cobertores, Tenis, Planchado, etc."""
    return db.query(ServicePrice).all()


@router.get("/dry-cleaning", response_model=list[DryCleaningItemOut])
def search_dry_cleaning(
    q: str | None = Query(default=None, description="Texto de búsqueda para el buscador de tintorería"),
    db: Session = Depends(get_db),
):
    """Buscador del catálogo de tintorería usado en la pantalla Nuevo Pedido."""
    query = db.query(DryCleaningItem)
    if q:
        query = query.filter(DryCleaningItem.name.ilike(f"%{q}%"))
    return query.order_by(DryCleaningItem.name).all()


@router.get("/expense-categories", response_model=list[ExpenseCategoryOut])
def list_expense_categories(db: Session = Depends(get_db)):
    return db.query(ExpenseCategory).all()
