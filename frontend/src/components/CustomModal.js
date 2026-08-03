import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, radii } from "../constants/colors";

/**
 * Reemplaza alert() en toda la app (sección 3 de las especificaciones).
 * Tipos: "success" (verde), "danger" (rojo, ej. confirmar eliminación),
 * "info" (azul, confirmación/información general).
 *
 * Uso típico:
 *   <CustomModal
 *     visible={modal.visible}
 *     type="danger"
 *     title="¿Eliminar pedido?"
 *     message="Esta acción no se puede deshacer."
 *     onConfirm={handleDelete}
 *     onCancel={() => setModal({ visible: false })}
 *   />
 */
export default function CustomModal({
  visible,
  type = "info",
  title,
  message,
  confirmText = "Aceptar",
  cancelText,
  onConfirm,
  onCancel,
}) {
  const accentColor = colors[type] || colors.info;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {cancelText ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
                <Text style={styles.secondaryButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: accentColor }]}
              onPress={onConfirm || onCancel}
            >
              <Text style={styles.primaryButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 20,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    backgroundColor: colors.slate50,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
});
