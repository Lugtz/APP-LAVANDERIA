import Constants from "expo-constants";

// Detecta automáticamente la IP de la computadora donde corre Expo (evita
// tener que hardcodear la IP a mano y actualizarla cada vez que cambia).
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const localhostIp = debuggerHost.split(":").shift();
    return `http://${localhostIp}:8000`;
  }

  return "http://10.0.2.2:8000";
};

export const API_BASE_URL = getBaseUrl();

console.log("🔗 Conectando a la API en:", API_BASE_URL);

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = body?.detail || `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function buildQuery(params) {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries).toString();
}

async function apiRequest(requestFn) {
  try {
    const data = await requestFn();
    return { data, error: null };
  } catch (err) {
    const message = err.message || "Ocurrió un error de conexión con el servidor.";
    console.error("❌ Error de API:", message);
    return { data: null, error: message };
  }
}

export const EmployeesService = {
  list: () => apiRequest(() => fetchAPI("/employees/")),
};

export const CatalogService = {
  services: () => apiRequest(() => fetchAPI("/catalog/services")),
  searchDryCleaning: (q) => apiRequest(() => fetchAPI(`/catalog/dry-cleaning${buildQuery({ q })}`)),
  expenseCategories: () => apiRequest(() => fetchAPI("/catalog/expense-categories")),
};

export const OrdersService = {
  create: (payload) =>
    apiRequest(() => fetchAPI("/orders/", { method: "POST", body: JSON.stringify(payload) })),
  list: (params) => apiRequest(() => fetchAPI(`/orders/${buildQuery(params)}`)),
  get: (id) => apiRequest(() => fetchAPI(`/orders/${id}`)),
  updateStatus: (id, status) =>
    apiRequest(() =>
      fetchAPI(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) })
    ),
  dashboardSummary: () => apiRequest(() => fetchAPI("/orders/dashboard/summary")),
};

export const ExpensesService = {
  create: (payload) =>
    apiRequest(() => fetchAPI("/expenses/", { method: "POST", body: JSON.stringify(payload) })),
  list: () => apiRequest(() => fetchAPI("/expenses/")),
};

export const CutsService = {
  get: (dateFrom, dateTo) =>
    apiRequest(() => fetchAPI(`/cuts/${buildQuery({ date_from: dateFrom, date_to: dateTo })}`)),
};