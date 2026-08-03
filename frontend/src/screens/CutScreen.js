import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { CutsService } from "../services/api";
import CustomModal from "../components/CustomModal";
import { colors, radii } from "../constants/colors";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CutScreen() {
  const [summary, setSummary] = useState(null);
  const [errorModal, setErrorModal] = useState(false);

  const load = useCallback(async () => {
    const today = todayISO();
    const { data, error } = await CutsService.get(today, today);
    if (error) {
      setErrorModal(true);
      return;
    }
    setSummary(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Corte del día</Text>

      {summary && (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Ingresos</Text>
            <Text style={[styles.value, { color: colors.success }]}>
              +${Number(summary.total_income).toFixed(2)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gastos</Text>
            <Text style={[styles.value, { color: colors.danger }]}>
              -${Number(summary.total_expenses).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.row, styles.netRow]}>
            <Text style={styles.netLabel}>Neto</Text>
            <Text style={styles.netValue}>${Number(summary.net).toFixed(2)}</Text>
          </View>
        </View>
      )}

      <CustomModal
        visible={errorModal}
        type="danger"
        title="Error de conexión"
        message="No se pudo cargar el corte del día."
        confirmText="Cerrar"
        onConfirm={() => setErrorModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: colors.textMuted },
  value: { fontWeight: "700" },
  netRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 },
  netLabel: { fontWeight: "700", color: colors.text },
  netValue: { fontWeight: "700", fontSize: 18, color: colors.blue700 },
});
