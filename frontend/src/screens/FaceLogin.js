import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Button } from 'react-native';
import { useUser } from '../context/UserContext';

export default function FaceLogin() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  
  const { selectUser } = useUser();
  // Cambia la IP de .163 a .27
  const API_URL = 'http://192.168.100.27:8000/auth/face-login';

  if (!permission) return <View />;
  
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>Necesitamos permiso para usar la cámara</Text>
        <Button onPress={requestPermission} title="Otorgar permiso" color="#4CAF50" />
      </View>
    );
  }

  const takePictureAndLogin = async () => {
    if (!cameraRef.current) return;
    setIsProcessing(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: true,
      });
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_base64: photo.base64 }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Automático: en cuanto reconoce, entra — sin botón adicional
        selectUser(data);
      } else {
        Alert.alert("Acceso denegado ❌", data.detail || "Rostro no reconocido");
        setIsProcessing(false);
      }
    } catch (error) {
      Alert.alert("Error de conexión", "Revisa que tu IP sea correcta y el servidor esté corriendo.");
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reconocimiento Facial</Text>
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      </View>
      <TouchableOpacity 
        style={[styles.button, isProcessing && styles.buttonDisabled]} 
        onPress={takePictureAndLogin} 
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>{isProcessing ? "Procesando..." : "Identificarme"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  cameraContainer: { width: 300, height: 400, borderRadius: 20, overflow: 'hidden', marginBottom: 30, borderWidth: 3, borderColor: '#4CAF50' },
  camera: { flex: 1 },
  button: { backgroundColor: '#4CAF50', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  buttonDisabled: { backgroundColor: '#9E9E9E' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});