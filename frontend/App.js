import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { UserProvider, useUser } from "./src/context/UserContext";
import BottomTabs from "./src/navigation/BottomTabs";
import FaceLogin from "./src/screens/FaceLogin";
import { colors } from "./src/constants/colors";

function RootNavigator() {
  const { currentUser, isLoading } = useUser();

  // 1. Mientras lee la memoria, muestra cargando...
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.blue600} size="large" />
      </View>
    );
  }

  // 2. REGLA ESTRICTA: ¿Hay usuario? Muestra BottomTabs. ¿No hay? Muestra FaceLogin.
  return (
    <NavigationContainer>
      {currentUser ? <BottomTabs /> : <FaceLogin />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.white },
});