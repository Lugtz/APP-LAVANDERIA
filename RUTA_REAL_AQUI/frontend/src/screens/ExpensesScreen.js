import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

import { useUser } from "../context/UserContext";
import { ExpensesService } from "../services/api";
import CustomModal from "../components/CustomModal";
import { EXPENSE_CATEGORIES } from "../constants/catalog";
import { colors, radii } from "../constants/colors";

export default function ExpensesScreen() {
  const { currentUser } = useUser();
  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [modal, setModal] = useState({ visible: false });

  async function handleSave() {
    if (!category || !amount) {
      setModal({
        visible: true,
        type: "danger",
        title: "Faltan datos",
        message: "Selecciona una categoría y captura el monto.",
      });
      return;
    }

    // NOTA: category_id aquí asume que el índice del catálogo local coincide
    // con el id en BD tras el seed. En producción, reemplazar por
    // CatalogService.expenseCategories() y usar el id real devuelto por la API.
    const { error } = await ExpensesService.create({
      category_id: EXPENSE_CATEGORIES.indexOf(category) + 1,
      employee_id: currentUser.id,
      amount: Number(amount),
      description,
    });

    if (error) {
      setModal({ visible: true, type: "danger", title: "Error al guardar", message: error });
      return;
    }

    setModal({ visible: true, type: "success", title: "Gasto registrado", message: "Se guardó correctamente." });
    setCategory(null);
    setAmount("");
    setDescription("");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.chipsWrap}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipSelected]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Monto</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput style={styles.input} value={description} onChangeText={setDescription} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar gasto</Text>
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
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chipSelected: { backgroundColor: colors.blue600, borderColor: colors.blue600 },
  chipText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  chipTextSelected: { color: colors.white },
  saveButton: {
    backgroundColor: colors.blue600,
    borderRadius: radii.lg,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: { color: colors.white, fontWeight: "700" },
});
