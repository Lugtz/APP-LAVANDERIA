import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "currentUser";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) setCurrentUser(JSON.parse(stored));
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function selectUser(employee) {
    // employee: { id, name } proveniente de GET /employees/
    setCurrentUser(employee);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(employee));
  }

  async function logout() {
    setCurrentUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  return (
    <UserContext.Provider value={{ currentUser, selectUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
