import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DB_SERVER: str = os.getenv("DB_SERVER", "")
    DB_NAME: str = os.getenv("DB_NAME", "")
    DB_USER: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_DRIVER: str = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")

    # PIN requerido para poder enrolar el rostro de una nueva empleada
    # (evita que cualquiera con acceso a la computadora agregue rostros).
    ADMIN_ENROLL_PIN: str = os.getenv("ADMIN_ENROLL_PIN", "")

    @property
    def DATABASE_URL(self) -> str:
        odbc_str = (
            f"DRIVER={{{self.DB_DRIVER}}};"
            f"SERVER={self.DB_SERVER},1433;"
            f"DATABASE={self.DB_NAME};"
            f"UID={self.DB_USER};"
            f"PWD={self.DB_PASSWORD};"
            f"Encrypt=no;"
            f"TrustServerCertificate=yes;"
        )
        return f"mssql+pyodbc:///?odbc_connect={urllib.parse.quote_plus(odbc_str)}"


settings = Settings()