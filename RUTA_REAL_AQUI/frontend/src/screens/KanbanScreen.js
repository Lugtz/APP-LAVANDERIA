import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { OrdersService } from "../services/api";
import CustomModal from "../components/CustomModal";
import { ORDER_STATUSES } from "../constants/catalog";
import { colors, radii } from "../constants/colors";

export default function KanbanScreen() {
  const [orders, setOrders] = useState([]);
  const [errorModal, setErrorModal] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await OrdersService.list();
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
    if (!nextStatus) return; // ya está en "Listo"

    const { error } = await OrdersService.updateStatus(order.id, nextStatus);
    if (error) {
      setErrorModal(true);
      return;
    }
    load();
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {ORDER_STATUSES.map((status) => (
          <View key={status} style={styles.column}>
            <Text style={styles.columnTitle}>{status}</Text>
            <ScrollView contentContainerStyle={{ gap: 8 }}>
              {orders
                .filter((o) => o.status === status)
                .map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.card}
                    onPress={() => advanceStatus(order)}
                  >
                    <Text style={styles.cardCustomer}>{order.customer_name}</Text>
                    <Text style={styles.cardFolio}>{order.folio}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      <CustomModal
        visible={errorModal}
        type="danger"
        title="Error de conexión"
        message="No se pudo actualizar/cargar los pedidos."
        confirmText="Cerrar"
        onConfirm={() => setErrorModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  column: {
    width: 180,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  columnTitle: { fontWeight: "700", color: colors.blue700, marginBottom: 10 },
  card: {
    backgroundColor: colors.slate50,
    borderRadius: radii.sm,
    padding: 10,
  },
  cardCustomer: { fontWeight: "600", color: colors.text, fontSize: 13 },
  cardFolio: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
