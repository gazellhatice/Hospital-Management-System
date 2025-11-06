import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Clock4,
  FileSignature,
  LogOut,
  Stethoscope,
} from "lucide-react";

export default function DoktorPanelLayout() {
  const navigate = useNavigate();
  const aktifDoktor = JSON.parse(localStorage.getItem("aktifDoktor") || "null");

  function cikisYap() {
    localStorage.removeItem("aktifDoktor");
    navigate("/personel-giris");
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm shadow-[0_24px_64px_-8px_rgba(0,0,0,0.15)] border-r border-slate-200 flex flex-col">
        {/* HEADER / BRAND */}
        <div className="p-4 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 border border-indigo-200 rounded-full px-2.5 py-1 shadow-sm">
            <Stethoscope className="w-3.5 h-3.5 text-indigo-700" />
            <span>Doktor Paneli</span>
          </div>

          <div className="mt-3 text-base font-semibold text-slate-900 leading-tight">
            Klinik Çalışma Alanı
          </div>
          <div className="text-[12px] text-slate-500 leading-snug">
            Randevu takvimi, reçete, slot yönetimi.
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link
            to="/panel/doktor"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm transition"
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>

          <Link
            to="/panel/doktor"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm transition"
          >
            <CalendarDays className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            <span className="font-medium">Bugünkü Randevularım</span>
          </Link>

          <Link
            to="/panel/doktor"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm transition"
          >
            <Clock4 className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            <span className="font-medium">Muayene Saati (Slot) Aç</span>
          </Link>

          <Link
            to="/panel/doktor"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm transition"
          >
            <FileSignature className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            <span className="font-medium">Reçete Yaz</span>
          </Link>
        </nav>

        {/* FOOTER / ACCOUNT */}
        <div className="border-t border-slate-200 p-4 text-sm flex flex-col gap-3">
          {aktifDoktor ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-3">
                <div className="text-[12px] text-slate-500 leading-none mb-1">
                  Oturum Açık
                </div>
                <div className="font-semibold text-slate-900 leading-tight text-[13px]">
                  {aktifDoktor.adSoyad}
                </div>
                {/* uzmanlık vs. varsa burada gösterilir / aktifDoktor.uzmanlik gibi */}
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
              className="inline-flex items-center gap-2 text-[12px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 transition"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Giriş Yap</span>
            </Link>
          )}

          <div className="text-[10px] text-slate-400 leading-snug">
            Bu panel yalnızca ilgili doktora atanmış randevuları görüntüler.
            İzinsiz görüntüleme girişimleri kayıt altındadır.
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto">
        {/* üstte hafif gradient background, içerik kartlarını patlatacak */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />

        {/* actual routed content */}
        <div className="relative p-6 sm:p-8 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
