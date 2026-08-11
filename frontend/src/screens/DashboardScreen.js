import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { OrdersService } from "../services/api";
import CustomModal from "../components/CustomModal";
import { colors, radii } from "../constants/colors";

// 1. Importamos tu contexto de usuario
import { useUser } from "../context/UserContext";

export default function DashboardScreen() {
  const [summary, setSummary] = useState({ today_income: 0, recent_orders: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  // 2. Sacamos a la empleada activa y la función para borrar la memoria (logout)
  const { currentUser, logout } = useUser();

  const load = useCallback(async () => {
    const { data, error } = await OrdersService.dashboardSummary();
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

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      
      {/* --- NUEVO: Fila de bienvenida y botón de Cerrar Sesión --- */}
      <View style={styles.headerRow}>
        <Text style={styles.greeting}>¡Hola, {currentUser?.name || "Empleada"}! 👋</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>
      {/* ----------------------------------------------------------- */}

      <View style={styles.incomeCard}>
        <Text style={styles.incomeLabel}>Ingresos de hoy</Text>
        <Text style={styles.incomeValue}>${Number(summary.today_income).toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Últimos pedidos</Text>

      <FlatList
        data={summary.recent_orders}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View>
              <Text style={styles.orderCustomer}>{item.customer_name}</Text>
              <Text style={styles.orderFolio}>Folio {item.folio}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderTotal}>${Number(item.total).toFixed(2)}</Text>
              <Text style={styles.orderStatus}>{item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no hay pedidos registrados.</Text>}
      />

      <CustomModal
        visible={errorModal}
        type="danger"
        title="Error de conexión"
        message="No se pudo cargar el resumen del día."
        confirmText="Cerrar"
        onConfirm={() => setErrorModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  
  // Estilos nuevos para la barra de arriba
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: '#F44336', // Rojo alerta
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.md,
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Fin de estilos nuevos

  incomeCard: {
    backgroundColor: colors.blue600,
    borderRadius: radii.lg,
    padding: 20,
    marginBottom: 20,
  },
  incomeLabel: { color: colors.white, opacity: 0.85, fontSize: 13 },
  incomeValue: { color: colors.white, fontSize: 32, fontWeight: "700", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 10 },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderCustomer: { fontWeight: "600", color: colors.text },
  orderFolio: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  orderRight: { alignItems: "flex-end" },
  orderTotal: { fontWeight: "700", color: colors.text },
  orderStatus: { color: colors.blue600, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.textMuted, textAlign: "center", marginTop: 20 },
});