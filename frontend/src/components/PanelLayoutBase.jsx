import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import {
  Calendar,
  FileText,
  ClipboardList,
  UserCircle,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

export default function HastaPanelLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const aktifHasta = JSON.parse(localStorage.getItem("aktifHasta") || "null");

  const menuler = [
    { label: "Genel Bakış", to: "/panel/hasta", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Randevularım", to: "/panel/hasta/randevular", icon: <Calendar className="w-4 h-4" /> },
    { label: "Reçetelerim", to: "/panel/hasta/receteler", icon: <FileText className="w-4 h-4" /> },
    { label: "Şikayetlerim", to: "/panel/hasta/sikayetler", icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Profil Bilgilerim", to: "/panel/hasta/profil", icon: <UserCircle className="w-4 h-4" /> },
  ];

  function cikisYap() {
    localStorage.removeItem("aktifHasta");
    navigate("/hasta-giris");
  }

  return (
    <div className="min-h-screen flex bg-blue-50/40">
      {/* Sol Menü */}
      <aside className="w-64 bg-white shadow-md flex flex-col border-r border-blue-200">
        {/* Header */}
        <div className="p-4 border-b border-blue-200">
          <div className="text-lg font-bold text-blue-700 flex items-center gap-2">
            🏥 Hasta Paneli
          </div>
          <div className="text-[12px] text-blue-600/70 leading-snug mt-1">
            Randevularınızı yönetin, reçetelerinizi görüntüleyin.
          </div>
        </div>

        {/* Menü */}
        <nav className="flex-1 p-4 space-y-1 text-sm">
          {menuler.map((m) => {
            const aktif = location.pathname === m.to;
            return (
              <Link
                key={m.to}
                to={m.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
                  aktif
                    ? "bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                }`}
              >
                {m.icon}
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* Kullanıcı + Çıkış */}
        <div className="border-t border-blue-200 p-4 text-sm text-gray-600">
          {aktifHasta ? (
            <>
              <div className="font-medium mb-1 text-gray-800">
                {aktifHasta.adSoyad}
              </div>
              <div className="text-xs text-gray-500 mb-2">{aktifHasta.email}</div>
              <button
                onClick={cikisYap}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:underline text-xs font-medium"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </>
          ) : (
            <Link to="/hasta-giris" className="text-blue-600 hover:underline text-xs">
              Giriş Yap
            </Link>
          )}
        </div>
      </aside>

      {/* Sağ İçerik */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100" />
        <div className="relative p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
