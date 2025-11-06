import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  CheckSquare,
  ClipboardList,
  UserCheck,
  Users,
  LogOut,
} from "lucide-react";

export default function MudurPanelLayout() {
  const navigate = useNavigate();
  const aktifMudur = JSON.parse(localStorage.getItem("aktifMudur") || "null");

  function cikisYap() {
    localStorage.removeItem("aktifMudur");
    navigate("/personel-giris");
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-slate-300 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)] flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-slate-300">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-900 bg-slate-200/70 border border-slate-400 rounded-full px-2.5 py-1 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-900" />
            <span>Yönetim Paneli</span>
          </div>

          <div className="mt-3 text-base font-semibold text-slate-900 leading-tight">
            İdari Kontrol
          </div>
          <div className="text-[12px] text-slate-500 leading-snug">
            Slot onayı, şikayet takibi, resepsiyon yetkileri.
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link
            to="/panel/mudur"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 hover:shadow-sm transition"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>

          <Link
            to="/panel/mudur/slot-onay"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 hover:shadow-sm transition"
          >
            <CheckSquare className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
            <span className="font-medium">Slot Onay</span>
          </Link>

          <Link
            to="/panel/mudur/sikayetler"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 hover:shadow-sm transition"
          >
            <ClipboardList className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
            <span className="font-medium">Şikayet Yönetimi</span>
          </Link>

          <Link
            to="/panel/mudur/ziyaretciler"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 hover:shadow-sm transition"
          >
            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
            <span className="font-medium">Ziyaretçi Raporu</span>
          </Link>

          <Link
            to="/panel/mudur/resepsiyonist"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-900/5 hover:text-slate-900 hover:shadow-sm transition"
          >
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
            <span className="font-medium">Resepsiyonist Yönetimi</span>
          </Link>
        </nav>

        {/* ACCOUNT / FOOTER */}
        <div className="border-t border-slate-300 p-4 text-sm flex flex-col gap-3">
          {aktifMudur ? (
            <>
              <div className="rounded-lg border border-slate-300 bg-white shadow-sm p-3">
                <div className="text-[12px] text-slate-500 leading-none mb-1">
                  Oturum Açık
                </div>
                <div className="font-semibold text-slate-900 text-[13px] leading-tight">
                  {aktifMudur.adSoyad}
                </div>
                {aktifMudur.email && (
                  <div className="text-[11px] text-slate-500 leading-snug">
                    {aktifMudur.email}
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
            <Link
              to="/personel-giris"
              className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-800 hover:text-black hover:underline underline-offset-4 transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Giriş Yap</span>
            </Link>
          )}

          <div className="text-[10px] text-slate-400 leading-snug">
            Bu panelde yapılan işlemler, denetim ve hukuki raporlama amacıyla
            kayda alınır.
          </div>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 relative overflow-y-auto">
        {/* arka plan: yönetim dashboard vibe */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-200" />

        <div className="relative p-6 sm:p-8 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
