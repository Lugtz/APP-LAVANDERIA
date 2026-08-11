// Precios base de lavandería (sección 7.B). El catálogo de tintorería
// (7.C) es muy grande y se busca vía API (services/api.js -> searchDryCleaning),
// no se replica aquí para no desincronizarse del backend.
export const SERVICE_PRICES = [
  { name: "Lavado por kilo", price: 35.0 },
  { name: "Cobertor individual", price: 75.0 },
  { name: "Cobertor matrimonial", price: 85.0 },
  { name: "Cobertor queen size", price: 95.0 },
  { name: "Par de tenis", price: 45.0 },
  { name: "Docena de planchado", price: 120.0 },
];

export const EXPENSE_CATEGORIES = [
  "Préstamo",
  "Sueldos",
  "Renta",
  "Jabón",
  "Suavitel",
  "Papel",
  "Bolsas de plástico",
  "Luz",
  "Agua",
  "Otro",
];

export const ORDER_STATUSES = ["Recibido", "Lavadora", "Secadora","Planchado", "Doblado", "Listo"];

export const EMPLOYEES = ["Marian", "Lupita"];
