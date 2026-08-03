from sqlalchemy import Column, Integer, String

from app.database import Base


class Employee(Base):
    """
    Perfiles estáticos de empleadas (Marian, Lupita).
    No hay contraseñas: el frontend selecciona una fila de esta tabla
    y la guarda como currentUser en AsyncStorage.
    """

    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
