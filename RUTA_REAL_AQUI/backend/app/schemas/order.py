from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict


class OrderStatusSchema(str, Enum):
    RECIBIDO = "Recibido"
    LAVADORA = "Lavadora"
    SECADORA = "Secadora"
    DOBLADO = "Doblado"
    LISTO = "Listo"


class OrderItemCreate(BaseModel):
    description: str
    quantity: int = 1
    unit_price: Decimal


class OrderItemOut(OrderItemCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    subtotal: Decimal


class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    advance: Decimal = Decimal("0")
    is_dry_cleaning: bool = False
    employee_id: int
    items: list[OrderItemCreate]
    # Imagen ya comprimida en el cliente (800x800, JPEG, calidad 0.6)
    photo_evidence_base64: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatusSchema


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    folio: str
    customer_name: str
    customer_phone: str
    total: Decimal
    advance: Decimal
    balance: Decimal
    status: OrderStatusSchema
    is_dry_cleaning: bool
    employee_id: int
    created_at: datetime
    items: list[OrderItemOut] = []
