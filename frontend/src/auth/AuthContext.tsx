import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axiosClient from "../api/axiosClient";

export type UserInfo = {
  rol: "MUDUR" | "DOKTOR" | "RESEPSIYON" | "HASTA" | null;
  id: number | null;
  adSoyad: string | null;
  email: string | null;
};

type AuthContextType = {
  user: UserInfo;
  login: (email: string, sifre: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : { rol: null, id: null, adSoyad: null, email: null };
  });

  const login = async (email: string, sifre: string) => {
    const res = await axiosClient.post("/auth/login", null, { params: { email, sifre } });
    const newUser = {
      rol: res.data.rol,
      id: res.data.id,
      adSoyad: res.data.adSoyad,
      email: res.data.email,
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser({ rol: null, id: null, adSoyad: null, email: null });
    localStorage.removeItem("user");
  };

  useEffect(() => {
    // auto cleanup if needed
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth(){
  const ctx = useContext(AuthContext);
  if(!ctx){
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
