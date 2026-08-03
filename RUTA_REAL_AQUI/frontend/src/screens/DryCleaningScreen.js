import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { OrdersService } from "../services/api";
import CustomModal from "../components/CustomModal";
import { ORDER_STATUSES } from "../constants/catalog";
import { colors, radii } from "../constants/colors";

export default function DryCleaningScreen() {
  const [orders, setOrders] = useState([]);
  const [errorModal, setErrorModal] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await OrdersService.list({ dry_cleaning_only: true });
    if (error) {
      setErrorModal(true);
      return;
    }
    setOrders(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function advanceStatus(order) {
    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    const nextStatus = ORDER_STATUSES[currentIndex + 1];
    if (!nextStatus) return;
    const { error } = await OrdersService.updateStatus(order.id, nextStatus);
    if (error) {
      setErrorModal(true);
      return;
    }
    load();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 10, padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.customer}>{item.customer_name}</Text>
              <Text style={styles.folio}>Folio {item.folio}</Text>
            </View>
            <TouchableOpacity style={styles.statusButton} onPress={() => advanceStatus(item)}>
              <Text style={styles.statusButtonText}>{item.status}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay pedidos de tintorería registrados.</Text>
        }
      />

      <CustomModal
        visible={errorModal}
        type="danger"
        title="Error de conexión"
        message="No se pudo cargar/actualizar los pedidos de tintorería."
        confirmText="Cerrar"
        onConfirm={() => setErrorModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  customer: { fontWeight: "600", color: colors.text },
  folio: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  statusButton: {
    backgroundColor: colors.blue600,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusButtonText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  emptyText: { color: colors.textMuted, textAlign: "center", marginTop: 20 },
});
