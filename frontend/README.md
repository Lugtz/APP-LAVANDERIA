# APP-LAVANDERIA

Sistema integral para el control de recepción, seguimiento, entrega de prendas y cortes de caja para lavanderías y tintorerías. Consta de un backend desarrollado en FastAPI con Microsoft SQL Server y una aplicación móvil desarrollada en React Native con Expo.

---
## Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
4. [Instrucciones de Ejecución del Backend](#instrucciones-de-ejecución-del-backend)
5. [Instrucciones de Ejecución de la App Móvil](#instrucciones-de-ejecución-de-la-app-móvil)
6. [Módulos Principales de la Aplicación](#módulos-principales-de-la-aplicación)

---
## Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas antes de iniciar:
* Python 3.10 o superior
* Node.js v18 o superior
* npm o yarn
* Microsoft SQL Server
* ODBC Driver 17 for SQL Server
* Expo Go (instalado en un dispositivo móvil Android/iOS para pruebas)

---
## Estructura del Proyecto
```text
APP-LAVANDERIA/
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── enroll_face.py
│   │   ├── main.py
│   │   ├── models/
│   │   │   └── order.py
│   │   ├── routers/
│   │   │   ├── cuts.py
│   │   │   ├── expenses.py
│   │   │   ├── face_auth.py
│   │   │   └── orders.py
│   │   ├── schemas/
│   │   │   └── order.py
│   │   └── services/
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── constants/
    │   │   └── catalog.js
    │   ├── navigation/
    │   │   └── BottomTabs.js
    │   ├── screens/
    │   │   ├── CutScreen.js
    │   │   ├── DashboardScreen.js
    │   │   ├── ExpensesScreen.js
    │   │   ├── FaceLogin.js
    │   │   ├── KanbanScreen.js
    │   │   └── NewOrderScreen.js
    │   └── services/
    │       └── api.js
    ├── App.js
    ├── package.json
    └── package-lock.json
```

---
## Estructura de la Base de Datos
La base de datos relacional opera sobre Microsoft SQL Server (`app_lavanderia`). A continuación se describe la estructura técnica general de las tablas principales y sus relaciones:

### Tablas Principales

**1. employees**
Almacena el registro del personal de la lavandería.
* `id` (Integer, Primary Key)
* `name` (String)
* `role` (String)

**2. orders**
Representa las órdenes de servicio generadas en el sistema.
* `id` (Integer, Primary Key)
* `folio` (String, Unique, Index)
* `customer_name` (String)
* `customer_phone` (String)
* `total` (Numeric 10,2)
* `advance` (Numeric 10,2) - Anticipo pagado al recibir las prendas.
* `balance` (Numeric 10,2) - Saldo pendiente de pago.
* `status` (Enum/VARCHAR 50) - Estados: Recibido, Lavadora, Secadora, Planchado, Doblado, Listo, Entregado.
* `is_dry_cleaning` (Boolean) - Identifica si es un servicio de tintorería.
* `photo_evidence_base64` (Text) - Evidencia fotográfica comprimida.
* `employee_id` (Integer, Foreign Key -> employees.id)
* `created_at` (DateTime)
* `updated_at` (DateTime)

**3. order_items**
Desglose de productos o servicios incluidos en cada orden.
* `id` (Integer, Primary Key)
* `order_id` (Integer, Foreign Key -> orders.id)
* `description` (String)
* `quantity` (Numeric 10,2)
* `unit_price` (Numeric 10,2)
* `subtotal` (Numeric 10,2)

**4. expenses**
Registra los egresos o gastos operativos diarios.
* `id` (Integer, Primary Key)
* `description` (String)
* `amount` (Numeric 10,2)
* `employee_id` (Integer, Foreign Key -> employees.id)
* `created_at` (DateTime)

**5. cuts**
Registra el historial de cortes de caja realizados.
* `id` (Integer, Primary Key)
* `cut_date` (DateTime)
* `total_income` (Numeric 10,2)
* `total_expenses` (Numeric 10,2)
* `net` (Numeric 10,2)
* `employee_id` (Integer, Foreign Key -> employees.id)

### Diagrama de Relaciones
```text
+-----------------+       +-------------------+       +--------------------+
|    EMPLOYEES    |       |      ORDERS       |       |    ORDER_ITEMS     |
+-----------------+       +-------------------+       +--------------------+
| id (PK)         |<-----+| id (PK)           |<-----+| id (PK)            |
| name            |   |   | folio             |       | order_id (FK)      |
| role            |   |   | customer_name     |       | description        |
+-----------------+   |   | total             |       | quantity           |
  |         |         |   | advance           |       | unit_price         |
  |         |         |   | balance           |       | subtotal           |
  |         |         |   | status            |       +--------------------+
  |         |         |   | employee_id (FK)  |
  |         |         |   +-------------------+
  |         |         |
  |         |         +-----------------------+
  |         +-----------------------------+   |
  v                                       v   |
+-----------------+                     +--------------------+
|    EXPENSES     |                     |        CUTS        |
+-----------------+                     +--------------------+
| id (PK)         |                     | id (PK)            |
| description     |                     | cut_date           |
| amount          |                     | total_income       |
| employee_id (FK)|                     | total_expenses     |
+-----------------+                     | net                |
                                        | employee_id (FK)   |
                                        +--------------------+
```

---
## Instrucciones de Ejecución del Backend

1. Navegar a la carpeta del proyecto:
```bash
cd APP-LAVANDERIA
```

2. Crear y activar un entorno virtual de Python:
   * En Windows:
   ```bash
   python -m venv venv
   . env\Scripts ctivate
   ```
   * En macOS/Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Instalar dependencias del servidor:
```bash
pip install -r backend/requirements.txt
```

4. Configurar variables de entorno y conexión:
Asegúrate de configurar la cadena de conexión a SQL Server dentro de `backend/app/database.py` indicando servidor, base de datos, usuario y contraseña.

5. Iniciar el servidor con Uvicorn:
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
La API estará accesible en `http://localhost:8000`. Puedes consultar la documentación interactiva OpenAPI en `http://localhost:8000/docs`.

---
## Instrucciones de Ejecución de la App Móvil

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias de Node:
```bash
npm install
```

3. Iniciar el servidor de desarrollo Expo:
```bash
npx expo start
```

4. Ejecutar en dispositivo o emulador:
* Abre la aplicación **Expo Go** en tu dispositivo móvil.
* Escanea el código QR desplegado en la terminal.
* Asegúrate de que el teléfono y la computadora se encuentren conectados a la misma red local para permitir la conexión automática detectada en `api.js`.

---
## Módulos Principales de la Aplicación

* **Autenticación Facial:** Módulo para inicio de sesión mediante reconocimiento facial (`face_auth.py` y `FaceLogin.js`).
* **Creación de Pedidos:** Registro de cliente, prendas/servicios, cálculo automático de anticipos y recepción de evidencia fotográfica.
* **Seguimiento Kanban:** Actualización del estado del pedido (Recibido, Lavadora, Secadora, Planchado, Doblado, Listo, Entregado).
* **Entrega y Cobro de Restante:** Flujo final que permite marcar una orden como entregada, liquidando el saldo pendiente a $0 y sumando el dinero cobrado a los ingresos del día.
* **Gastos Operativos:** Formulario para registrar salidas de efectivo asociadas a insumos u operaciones de la sucursal.
* **Corte de Caja:** Módulo consolidado que calcula automáticamente total de ingresos (anticipos + cobros finales), egresos y saldo neto para el cierre diario de operaciones.