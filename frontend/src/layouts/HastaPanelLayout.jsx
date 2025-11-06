// HastaPanelLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  ClipboardList,
  LogOut,
  HeartPulse,
} from "lucide-react";

export default function HastaPanelLayout() {
  const navigate = useNavigate();
  const aktifHasta = JSON.parse(localStorage.getItem("aktifHasta") || "null");

  function cikisYap() {
    localStorage.removeItem("aktifHasta");
    navigate("/hasta-giris");
  }

  const baseItem =
    "group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm transition";
  const idle =
    "text-gray-700 [&_svg]:text-gray-400 group-hover:[&_svg]:text-emerald-600";
  const active =
    "text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm [&_svg]:text-emerald-600";

  return (
    <div className="min-h-screen flex bg-emerald-50/40">
      {/* Sol Menü */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-emerald-100 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] flex flex-col">
        <div className="p-4 border-b border-emerald-100">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 rounded-full px-2.5 py-1 shadow-sm">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
            <span>Hasta Paneli</span>
          </div>
          <div className="mt-3 text-base font-semibold text-gray-900 leading-tight">
            Hoş geldiniz 👋
          </div>
          <div className="text-[12px] text-gray-500 leading-snug">
            Randevularınızı ve reçetelerinizi buradan yönetebilirsiniz.
          </div>
        </div>

        {/* Navigasyon */}
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <NavLink
            to="/panel/hasta"
            end
            className={({ isActive }) =>
              `${baseItem} ${isActive ? active : idle}`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Ana Sayfa</span>
          </NavLink>

          <NavLink
            to="/panel/hasta/randevular"
            className={({ isActive }) =>
              `${baseItem} ${isActive ? active : idle}`
            }
          >
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium">Randevularım</span>
          </NavLink>

          <NavLink
            to="/panel/hasta/receteler"
            className={({ isActive }) =>
              `${baseItem} ${isActive ? active : idle}`
            }
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">Reçetelerim</span>
          </NavLink>

          <NavLink
            to="/panel/hasta/sikayetler"
            className={({ isActive }) =>
              `${baseItem} ${isActive ? active : idle}`
            }
          >
            <ClipboardList className="w-4 h-4" />
            <span className="font-medium">Şikayetlerim</span>
          </NavLink>
        </nav>

        {/* Alt Bilgi / Kullanıcı */}
        <div className="border-t border-emerald-100 p-4 text-sm text-gray-600 flex flex-col gap-3">
          {aktifHasta ? (
            <>
              <div className="rounded-lg border border-emerald-100 bg-white shadow-sm p-3">
                <div className="text-[12px] text-gray-500 leading-none mb-1">
                  Oturum Açık
                </div>
                <div className="font-semibold text-gray-800 text-[13px] leading-tight">
                  {aktifHasta.adSoyad}
                </div>
                {aktifHasta.email && (
                  <div className="text-[11px] text-gray-400 leading-snug">
                    {aktifHasta.email}
                  </div>
                )}
              </div>

              <button
                onClick={cikisYap}
                className="inline-flex items-center gap-2 text-[12px] font-medium text-rose-600 hover:text-rose-700 hover:underline underline-offset-4 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/hasta-giris"
              className="inline-flex items-center gap-2 text-[12px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-4 transition"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Giriş Yap</span>
            </NavLink>
          )}

          <div className="text-[10px] text-gray-400 leading-snug">
            Verileriniz yalnızca size özeldir. KVKK kapsamında gizliliğiniz
            korunur.
          </div>
        </div>
      </aside>

      {/* İçerik Alanı */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50 to-emerald-100" />
        <div className="relative p-6 sm:p-8 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
