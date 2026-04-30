import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api";

const AuthContext = createContext(null);

const stored = JSON.parse(localStorage.getItem("task_manager_auth") || "null");

export function AuthProvider({ children }) {
  const [token, setToken] = useState(stored?.token || "");
  const [user, setUser] = useState(stored?.user || null);

  useEffect(() => {
    setAuthToken(token);
    if (token && user) {
      localStorage.setItem("task_manager_auth", JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem("task_manager_auth");
    }
  }, [token, user]);

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    setToken(data.token);
    setUser(data.user);
  }

  async function signup(payload) {
    const { data } = await api.post("/auth/signup", payload);
    setToken(data.token);
    setUser(data.user);
  }

  async function updateProfile(payload) {
    const { data } = await api.patch("/users/me", payload);
    setUser(data.user);
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, signup, updateProfile, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
