import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { UserProvider, useUser } from "./src/context/UserContext";
import BottomTabs from "./src/navigation/BottomTabs";
import LoginScreen from "./src/screens/LoginScreen";
import { colors } from "./src/constants/colors";

function RootNavigator() {
  const { currentUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.blue600} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {currentUser ? <BottomTabs /> : <LoginScreen />}
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
