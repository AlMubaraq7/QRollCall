/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from "react";
import * as authApi from "../api/auth";

export const AuthContext = createContext(null);

function getStoredUser() {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  return storedUser && token ? JSON.parse(storedUser) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser); // lazy initializer — runs once, no effect needed

  const loginUser = async (email, password) => {
    const { user, token } = await authApi.login(email, password);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
