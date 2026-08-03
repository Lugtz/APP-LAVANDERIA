import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Linking } from "react-native";
import { Camera, Trash2 } from "lucide-react-native";

import { useUser } from "../context/UserContext";
import { OrdersService } from "../services/api";
import { captureAndCompressEvidence } from "../services/imageService";
import CustomModal from "../components/CustomModal";
import { SERVICE_PRICES } from "../constants/catalog";
import { colors, radii } from "../constants/colors";

export default function NewOrderScreen() {
  const { currentUser } = useUser();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState([]); // { description, quantity, unit_price }
  const [advance, setAdvance] = useState("");
  const [photoBase64, setPhotoBase64] = useState(null);
  const [modal, setModal] = useState({ visible: false });

  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const advanceNum = Number(advance) || 0;
  const balance = total - advanceNum;

  function addServiceItem(service) {
    setItems((prev) => [...prev, { description: service.name, quantity: 1, unit_price: service.price }]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCapturePhoto() {
    // Compresión obligatoria: 800x800 max, JPEG, calidad 60%, base64.
    // Ver src/services/imageService.js para la lógica exacta.
    const base64 = await captureAndCompressEvidence();
    if (base64) setPhotoBase64(base64);
  }

  function buildWhatsAppMessage(folio) {
    return (
      `Hola ${customerName}, tu pedido *${folio}* en Agua Clara ha sido registrado.\n` +
      `Total: $${total.toFixed(2)}\n` +
      `Anticipo: $${advanceNum.toFixed(2)}\n` +
      `Saldo pendiente: $${balance.toFixed(2)}`
    );
  }

  async function handleSave() {
    if (!customerName || !customerPhone || items.length === 0) {
      setModal({
        visible: true,
        type: "danger",
        title: "Faltan datos",
        message: "Captura nombre, teléfono y al menos un servicio antes de guardar.",
      });
      return;
    }

    const { data, error } = await OrdersService.create({
      customer_name: customerName,
      customer_phone: customerPhone,
      advance: advanceNum,
      is_dry_cleaning: false,
      employee_id: currentUser.id,
      items: items.map(({ description, quantity, unit_price }) => ({ description, quantity, unit_price })),
      photo_evidence_base64: photoBase64,
    });

    if (error) {
      setModal({ visible: true, type: "danger", title: "Error al guardar", message: error });
      return;
    }

    // Abrir WhatsApp preinstalado con folio y saldos (sección 6.3)
    const phoneDigits = customerPhone.replace(/\D/g, "");
    const message = encodeURIComponent(buildWhatsAppMessage(data.folio));
    const whatsappUrl = `whatsapp://send?phone=${phoneDigits}&text=${message}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    }

    setModal({
      visible: true,
      type: "success",
      title: "Pedido guardado",
      message: `Folio ${data.folio} registrado correctamente.`,
    });

    // reset del formulario
    setCustomerName("");
    setCustomerPhone("");
    setItems([]);
    setAdvance("");
    setPhotoBase64(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.field}>
        <Text style={styles.label}>Nombre del cliente</Text>
        <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View>
        <Text style={styles.label}>Servicios regulares</Text>
        <View style={styles.chipsWrap}>
          {SERVICE_PRICES.map((service) => (
            <TouchableOpacity key={service.name} style={styles.chip} onPress={() => addServiceItem(service)}>
              <Text style={styles.chipText}>
                {service.name} · ${service.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Nota: el buscador de tintorería (Catalog­Service.searchDryCleaning) se
          integra igual que addServiceItem, agregando el resultado elegido a `items`. */}

      <View>
        <Text style={styles.label}>Conceptos agregados</Text>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {item.quantity} × {item.description} — ${(item.unit_price * item.quantity).toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.photoButton} onPress={handleCapturePhoto}>
        <Camera size={18} color={colors.blue700} />
        <Text style={styles.photoButtonText}>
          {photoBase64 ? "Foto capturada ✓" : "Tomar evidencia fotográfica"}
        </Text>
      </TouchableOpacity>

      <View style={styles.field}>
        <Text style={styles.label}>Anticipo</Text>
        <TextInput
          style={styles.input}
          value={advance}
          onChangeText={setAdvance}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Anticipo</Text>
          <Text style={styles.summaryValue}>${advanceNum.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelBold}>Resta</Text>
          <Text style={styles.summaryValueBold}>${balance.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar y enviar por WhatsApp</Text>
      </TouchableOpacity>

      <CustomModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText="Aceptar"
        onConfirm={() => setModal({ visible: false })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: colors.text },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue500,
    borderRadius: radii.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipText: { color: colors.blue700, fontSize: 12, fontWeight: "600" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    padding: 10,
    marginTop: 6,
  },
  itemText: { color: colors.text, fontSize: 13 },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue500,
    borderRadius: radii.md,
    padding: 12,
    justifyContent: "center",
  },
  photoButtonText: { color: colors.blue700, fontWeight: "600" },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: colors.textMuted },
  summaryValue: { color: colors.text, fontWeight: "600" },
  summaryLabelBold: { color: colors.text, fontWeight: "700" },
  summaryValueBold: { color: colors.blue700, fontWeight: "700", fontSize: 16 },
  saveButton: {
    backgroundColor: colors.blue600,
    borderRadius: radii.lg,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: { color: colors.white, fontWeight: "700" },
});
