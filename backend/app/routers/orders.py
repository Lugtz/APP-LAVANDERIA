from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate, OrderUpdate

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
        query = query.filter(Order.is_dry_cleaning == True)
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
@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Elimina un pedido por completo (Cancelar)."""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    db.delete(order)
    db.commit()
    return {"detail": "Pedido cancelado y eliminado correctamente"}


@router.put("/{order_id}", response_model=OrderOut)
def update_order(order_id: int, payload: OrderUpdate, db: Session = Depends(get_db)):
    """Edita un pedido: reemplaza la ropa y recalcula los totales."""
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    # 1. Borramos la ropa viejita de este pedido
    db.query(OrderItem).filter(OrderItem.order_id == order_id).delete()

    # 2. Calculamos el nuevo total con la ropa actualizada
    new_total = sum(item.unit_price * item.quantity for item in payload.items)
    new_balance = new_total - order.advance

    # 3. Actualizamos los números del pedido
    order.total = new_total
    order.balance = new_balance

    # 4. Metemos la ropa nueva a la base de datos
    for item in payload.items:
        order.items.append(
            OrderItem(
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.unit_price * item.quantity,
            )
        )

    db.commit()
    db.refresh(order)
    return order
@router.post("/{order_id}/deliver")
def deliver_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    if order.status == models.OrderStatus.ENTREGADO:
        raise HTTPException(status_code=400, detail="El pedido ya fue entregado anteriormente")

    # Guardamos cuánto se cobró en este momento (la resta)
    monto_cobrado = order.balance
    
    # Actualizamos el pedido
    order.status = models.OrderStatus.ENTREGADO
    order.balance = 0 # La resta queda en 0 porque ya pagó
    # Opcional: order.advance = order.total (Dependiendo de cómo hagas tu contabilidad)

    db.commit()
    db.refresh(order)
    
    return {
        "message": "Pedido entregado con éxito", 
        "cobrado": monto_cobrado, 
        "order": order
    }