import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Button, Alert, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { OrdersService } from "../services/api";
import CustomModal from "../components/CustomModal";
import { ORDER_STATUSES } from "../constants/catalog";
import { colors, radii } from "../constants/colors";

export default function KanbanScreen() {
  const [orders, setOrders] = useState([]);
  const [errorModal, setErrorModal] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Estados para la Edición de prendas/kilos
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItems, setEditingItems] = useState([]);

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

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  async function advanceStatus(order) {
    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    const nextStatus = ORDER_STATUSES[currentIndex + 1];
    
    if (!nextStatus) {
      Alert.alert("Finalizado", "Este pedido ya se encuentra en su última etapa.");
      return;
    }

    const { error } = await OrdersService.updateStatus(order.id, nextStatus);
    if (error) {
      setErrorModal(true);
      return;
    }
    
    setDetailsModalVisible(false);
    load();
  }

  // ELIMINAR / CANCELAR PEDIDO
  const handleCancel = (order) => {
    Alert.alert(
      "Cancelar Pedido",
      `¿Estás segura de eliminar permanentemente el folio ${order.folio}?`,
      [
        { text: "No", style: "cancel" },
        { 
          text: "Sí, cancelar", 
          style: "destructive",
          onPress: async () => {
            const { error } = await OrdersService.delete(order.id);
            if (error) {
              setErrorModal(true);
            } else {
              setDetailsModalVisible(false);
              load();
            }
          } 
        }
      ]
    );
  };

  // APERTURA DE EDICIÓN
  const openEditModal = () => {
    if (!selectedOrder) return;
    // Preparamos los items para editar
    const itemsCopy = selectedOrder.items.map(item => ({
      description: item.description,
      quantity: String(item.quantity),
      unit_price: item.unit_price
    }));
    setEditingItems(itemsCopy);
    setEditModalVisible(true);
  };

  // GUARDAR EDICIÓN (PUT al backend)
  const handleSaveEdit = async () => {
    const formattedItems = editingItems.map(item => ({
      description: item.description,
      quantity: parseFloat(item.quantity || 0),
      unit_price: parseFloat(item.unit_price || 0)
    }));

    const { error } = await OrdersService.update(selectedOrder.id, formattedItems);
    if (error) {
      setErrorModal(true);
    } else {
      Alert.alert("Éxito", "El pedido se ha actualizado correctamente.");
      setEditModalVisible(false);
      setDetailsModalVisible(false);
      load();
    }
  };

  const updateQuantityInEdit = (text, index) => {
    const updated = [...editingItems];
    updated[index].quantity = text;
    setEditingItems(updated);
  };

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
                    onPress={() => openOrderDetails(order)}
                  >
                    <Text style={styles.cardCustomer}>{order.customer_name}</Text>
                    <Text style={styles.cardFolio}>{order.folio}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* MODAL DETALLES DEL PEDIDO */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Pedido {selectedOrder.folio}</Text>
                <Text style={styles.modalSubtitle}>Cliente: {selectedOrder.customer_name}</Text>
                
                <View style={styles.detailsBox}>
                  <Text style={styles.detailText}>Estado: <Text style={{fontWeight: 'bold'}}>{selectedOrder.status}</Text></Text>
                  <Text style={styles.detailText}>Total: <Text style={{fontWeight: 'bold'}}>${Number(selectedOrder.total).toFixed(2)}</Text></Text>
                  <Text style={styles.detailText}>Anticipo: <Text style={{fontWeight: 'bold'}}>${Number(selectedOrder.advance).toFixed(2)}</Text></Text>
                  <Text style={styles.detailText}>Resta: <Text style={{fontWeight: 'bold', color: '#D32F2F'}}>${Number(selectedOrder.balance).toFixed(2)}</Text></Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.btn, styles.btnAdvance]} onPress={() => advanceStatus(selectedOrder)}>
                    <Text style={styles.btnTextWhite}>Avanzar Estado ➡️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.btn, styles.btnEdit]} onPress={openEditModal}>
                    <Text style={styles.btnTextWhite}>✏️ Editar Prendas / Kilos</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => handleCancel(selectedOrder)}>
                    <Text style={styles.btnTextWhite}>🗑️ Cancelar Pedido</Text>
                  </TouchableOpacity>
                </View>

                <Button title="Cerrar" color={colors.textMuted} onPress={() => setDetailsModalVisible(false)} />
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL PARA EDITAR KILOS / PRENDAS */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: '40%' }]}>
            <Text style={styles.modalTitle}>Editar Cantidades</Text>
            <Text style={styles.modalSubtitle}>Ajusta los kilos o prendas de la nota:</Text>

            <ScrollView style={{ maxHeight: 200, marginBottom: 15 }}>
              {editingItems.map((item, idx) => (
                <View key={idx} style={styles.editRow}>
                  <Text style={{ flex: 1, fontWeight: '600' }}>{item.description}</Text>
                  <TextInput
                    style={styles.inputQty}
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(text) => updateQuantityInEdit(text, idx)}
                  />
                  <Text style={{ marginLeft: 5 }}>qty/kg</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={[styles.btn, styles.btnAdvance, { marginBottom: 10 }]} onPress={handleSaveEdit}>
              <Text style={styles.btnTextWhite}>💾 Guardar Cambios y Recalcular</Text>
            </TouchableOpacity>

            <Button title="Cancelar Edición" color={colors.textMuted} onPress={() => setEditModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <CustomModal
        visible={errorModal}
        type="danger"
        title="Error de conexión"
        message="No se pudo procesar la solicitud en el servidor."
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: '50%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: colors.blue700 },
  modalSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 15 },
  detailsBox: { backgroundColor: colors.slate50, padding: 15, borderRadius: radii.md, marginBottom: 15 },
  detailText: { fontSize: 15, marginBottom: 5, color: colors.text },
  actionButtons: { gap: 10, marginBottom: 15 },
  btn: { padding: 13, borderRadius: radii.md, alignItems: 'center' },
  btnAdvance: { backgroundColor: '#4CAF50' },
  btnEdit: { backgroundColor: '#2196F3' },
  btnCancel: { backgroundColor: '#F44336' },
  btnTextWhite: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  editRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.slate50, padding: 10, borderRadius: radii.sm, marginBottom: 8 },
  inputQty: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 6, width: 60, textAlign: 'center', backgroundColor: 'white' }
});