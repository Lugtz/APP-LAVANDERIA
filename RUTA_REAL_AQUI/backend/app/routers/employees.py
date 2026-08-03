from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.schemas.misc import EmployeeOut

router = APIRouter(prefix="/employees", tags=["Empleadas"])


@router.get("/", response_model=list[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    """
    Lista de perfiles para el selector de login (Marian, Lupita).
    El frontend guarda el elegido en AsyncStorage como currentUser.
    """
    return db.query(Employee).all()
