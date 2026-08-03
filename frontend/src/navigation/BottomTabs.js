import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, KanbanSquare, PlusCircle, Shirt, Wallet, Receipt } from "lucide-react-native";

import DashboardScreen from "../screens/DashboardScreen";
import KanbanScreen from "../screens/KanbanScreen";
import NewOrderScreen from "../screens/NewOrderScreen";
import DryCleaningScreen from "../screens/DryCleaningScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import CutScreen from "../screens/CutScreen";
import { colors } from "../constants/colors";

const Tab = createBottomTabNavigator();

const ICONS = {
  Inicio: Home,
  Proceso: KanbanSquare,
  "Nuevo Pedido": PlusCircle,
  Tintorería: Shirt,
  Gastos: Receipt,
  Corte: Wallet,
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.blue600,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { color: colors.text, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => {
          const Icon = ICONS[route.name];
          return Icon ? <Icon color={color} size={size} /> : null;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} />
      <Tab.Screen name="Proceso" component={KanbanScreen} />
      <Tab.Screen name="Nuevo Pedido" component={NewOrderScreen} />
      <Tab.Screen name="Tintorería" component={DryCleaningScreen} />
      <Tab.Screen name="Gastos" component={ExpensesScreen} />
      <Tab.Screen name="Corte" component={CutScreen} />
    </Tab.Navigator>
  );
}
