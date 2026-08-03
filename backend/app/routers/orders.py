from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Pedidos"])


def _generate_folio(db: Session) -> str:
    """Folio simple correlativo tipo AC-000123. Ajustar si se requiere otro formato."""
    count = db.query(Order).count() + 1
    return f"AC-{count:06d}"


@router.post("/", response_model=OrderOut)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """
    Crea un pedido (POS). Calcula total a partir de los items, guarda el
    anticipo y la resta, y opcionalmente la evidencia fotográfica ya
    comprimida por el frontend.
    """
    total = sum(item.unit_price * item.quantity for item in payload.items)
    balance = total - payload.advance

    order = Order(
        folio=_generate_folio(db),
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        total=total,
        advance=payload.advance,
        balance=balance,
        is_dry_cleaning=payload.is_dry_cleaning,
        employee_id=payload.employee_id,
        photo_evidence_base64=payload.photo_evidence_base64,
        status=OrderStatus.RECIBIDO,
    )

    for item in payload.items:
        order.items.append(
            OrderItem(
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.unit_price * item.quantity,
            )
        )

    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/", response_model=list[OrderOut])
def list_orders(
    status: OrderStatus | None = None,
    dry_cleaning_only: bool = False,
    db: Session = Depends(get_db),
):
    """
    Lista de pedidos. Usada por el tablero Kanban (filtrando por status) y
    por la pestaña Tintorería (dry_cleaning_only=True).
    """
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if dry_cleaning_only:
        query = query.filter(Order.is_dry_cleaning.is_(True))
    return query.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    """Mueve un pedido entre columnas del Kanban (Recibido -> ... -> Listo)."""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.get("/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    """
    Ingresos del día (suma de anticipos) + últimos pedidos, para la
    pantalla Inicio.

    NOTA: ajustar la zona horaria del filtro de "hoy" según donde corra el
    servidor vs donde está el negocio, para evitar desfases de día.
    """
    today = date.today()
    start = datetime.combine(today, time.min)
    end = datetime.combine(today, time.max)

    today_income = (
        db.query(func.coalesce(func.sum(Order.advance), 0))
        .filter(Order.created_at >= start, Order.created_at <= end)
        .scalar()
    )

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()

    return {
        "today_income": today_income,
        "recent_orders": recent_orders,
    }
