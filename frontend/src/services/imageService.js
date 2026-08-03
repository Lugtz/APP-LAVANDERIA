import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const MAX_DIMENSION = 800; // px, manteniendo relación de aspecto
const JPEG_QUALITY = 0.6; // 60%

/**
 * Lanza la cámara y devuelve la evidencia fotográfica ya comprimida y
 * codificada en base64, lista para meter al JSON del body de /orders.
 *
 * Reglas obligatorias (sección 5 de las especificaciones):
 *  - Dimensiones máximas: 800x800 (relación de aspecto conservada)
 *  - Formato: JPEG
 *  - Calidad: 60%
 *  - Salida: base64
 *
 * Devuelve null si el usuario cancela o si no se otorgó permiso de cámara.
 */
export async function captureAndCompressEvidence() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1, // la compresión real la hace expo-image-manipulator después
  });

  if (result.canceled || !result.assets?.length) {
    return null;
  }

  const originalUri = result.assets[0].uri;
  const originalWidth = result.assets[0].width;
  const originalHeight = result.assets[0].height;

  // Redimensionar manteniendo relación de aspecto: solo se fija el lado
  // más largo a 800px, ImageManipulator calcula el otro automáticamente.
  const resizeAction =
    originalWidth >= originalHeight
      ? { resize: { width: MAX_DIMENSION } }
      : { resize: { height: MAX_DIMENSION } };

  const manipulated = await ImageManipulator.manipulateAsync(
    originalUri,
    [resizeAction],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  return manipulated.base64; // string base64, sin prefijo data:image/...
}
