import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

import { useUser } from "../context/UserContext";
import { EmployeesService } from "../services/api";
import CustomModal from "../components/CustomModal";
import { colors, radii, APP_LOGO_EMOJI } from "../constants/colors";

export default function LoginScreen() {
  const { selectUser } = useUser();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    const { data, error } = await EmployeesService.list();
    if (error) {
      setErrorModal(true);
    } else {
      setEmployees(data);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>{APP_LOGO_EMOJI}</Text>
      <Text style={styles.title}>Agua Clara</Text>
      <Text style={styles.subtitle}>¿Quién eres?</Text>

      {loading ? (
        <ActivityIndicator color={colors.blue600} />
      ) : (
        <View style={styles.buttonsWrap}>
          {employees.map((employee) => (
            <TouchableOpacity
              key={employee.id}
              style={styles.profileButton}
              onPress={() => selectUser(employee)}
            >
              <Text style={styles.profileButtonText}>{employee.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <CustomModal
        visible={errorModal}
        type="danger"
        title="Error de conexión"
        message="No se pudo cargar la lista de empleadas. Verifica tu conexión e intenta de nuevo."
        confirmText="Reintentar"
        onConfirm={() => {
          setErrorModal(false);
          loadEmployees();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 32 },
  buttonsWrap: { width: "100%", gap: 12 },
  profileButton: {
    backgroundColor: colors.blue600,
    paddingVertical: 16,
    borderRadius: radii.lg,
    alignItems: "center",
  },
  profileButtonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
});
