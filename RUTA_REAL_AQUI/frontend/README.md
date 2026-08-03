# Agua Clara - Frontend (Expo / React Native)

## Instalación

```bash
npm install
```

## Correr en desarrollo

```bash
npx expo start
```

Escanea el QR con Expo Go, o corre en emulador con `npm run android` / `npm run ios`.

## Antes de correr

1. En `src/services/api.js`, ajusta `API_BASE_URL` a la IP local de tu backend
   (no uses `localhost`, el celular/emulador no la resuelve).
2. El backend debe estar corriendo y con el seed de catálogos ya ejecutado
   (`python -m app.seed.seed_data` desde `/backend`), o el selector de login
   y los catálogos aparecerán vacíos.

## Estructura

- `src/screens` — Las 6 pantallas de Bottom Tabs + Login.
- `src/components/CustomModal.js` — Reemplazo global de `alert()`.
- `src/services/api.js` — Cliente HTTP centralizado, con `apiRequest()` que
  nunca deja que un error de red tumbe la app (regresa `{ data, error }`).
- `src/services/imageService.js` — Cámara + compresión de evidencia
  fotográfica (800x800 máx, JPEG, calidad 60%, base64), según especificación.
- `src/context/UserContext.js` — Selector de perfil (Marian/Lupita) persistido
  en AsyncStorage, sin contraseñas.
- `src/constants` — Paleta de colores y catálogos base.

## Pendiente de implementar / próximos pasos sugeridos

- Integrar el buscador de tintorería (`CatalogService.searchDryCleaning`) en
  `NewOrderScreen` — la lógica de "agregar item" ya existe (`addServiceItem`),
  solo falta un input de búsqueda que llame al endpoint y listar resultados.
- `CustomModal` de confirmación antes de eliminar (usa `cancelText` +
  `onCancel` + `onConfirm`, ya soportado por el componente).
- Manejo de sesión expirada / logout desde la UI (la función `logout()` de
  `UserContext` ya existe, falta un botón que la use).
