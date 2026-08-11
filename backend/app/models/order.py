import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Boolean,
    Enum,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class OrderStatus(str, enum.Enum):
    RECIBIDO = "Recibido"
    LAVADORA = "Lavadora"
    SECADORA = "Secadora"
    PLANCHADO = "Planchado"
    DOBLADO = "Doblado"
    LISTO = "Listo"
    ENTREGADO = "Entregado"


class Order(Base):
    """
    Pedido de lavandería / tintorería.
    `is_dry_cleaning` marca si el pedido debe aparecer en la pestaña Tintorería.
    `photo_evidence_base64` guarda la imagen ya comprimida por el frontend
    (800x800 max, JPEG, calidad 60%) — ver services/imageService.js del frontend.
    """

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    folio = Column(String(20), unique=True, nullable=False, index=True)

    customer_name = Column(String(150), nullable=False)
    customer_phone = Column(String(20), nullable=False)

    total = Column(Numeric(10, 2), nullable=False, default=0)
    advance = Column(Numeric(10, 2), nullable=False, default=0)  # Anticipo
    balance = Column(Numeric(10, 2), nullable=False, default=0)  # Resta

    status = Column(Enum(OrderStatus), nullable=False, default=OrderStatus.RECIBIDO)
    is_dry_cleaning = Column(Boolean, default=False)

    photo_evidence_base64 = Column(Text, nullable=True)

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employee = relationship("Employee")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """
    Línea de un pedido. Sirve tanto para servicios regulares (Lavado por kilo,
    Cobertores) como para artículos de tintorería — ambos comparten la misma
    forma (descripción, cantidad, precio unitario, subtotal).
    """

    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)

    description = Column(String(150), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
