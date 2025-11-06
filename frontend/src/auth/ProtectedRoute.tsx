import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

type ProtectedRouteProps = {
  allowedRoles: string[]; // örnek: ["MUDUR"]
  children: JSX.Element;
};

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // login yapılmadıysa
  if (!user.rol) {
    return <Navigate to="/" replace />;
  }

  // rol uyumsuzsa
  if (!allowedRoles.includes(user.rol)) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="bg-white shadow-lg border border-red-300 rounded-lg p-8 text-center">
          <h1 className="text-xl font-bold text-red-700 mb-2">Erişim Engellendi 🚫</h1>
          <p className="text-gray-600 mb-4">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
          <a
            href="/"
            className="inline-block bg-red-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-red-700"
          >
            Giriş Sayfasına Dön
          </a>
        </div>
      </div>
    );
  }

  // her şey doğruysa, sayfayı göster
  return children;
}
