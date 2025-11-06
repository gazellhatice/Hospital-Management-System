import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  ClipboardPen,
  CalendarPlus,
  UserRoundPlus,
  LogOut,
  FileUser,
  LayoutDashboard,
} from "lucide-react";

export default function ResepsiyonPanelLayout() {
  const navigate = useNavigate();
  const aktifResepsiyonist = JSON.parse(
    localStorage.getItem("aktifResepsiyonist") || "null"
  );

  function cikisYap() {
    localStorage.removeItem("aktifResepsiyonist");
    navigate("/personel-giris");
  }

  return (
    <div className="min-h-screen flex bg-orange-50/40">
      {/* Sol Menü */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm shadow-[0_24px_64px_-8px_rgba(0,0,0,0.18)] border-r border-orange-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-200">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-orange-800 bg-orange-50 border border-orange-300 rounded-full px-2.5 py-1 shadow-sm">
            <ClipboardPen className="w-3.5 h-3.5 text-orange-700" />
            <span>Resepsiyon Paneli</span>
          </div>

          <div className="mt-3 text-base font-semibold text-orange-800 leading-tight">
            Günlük Operasyon
          </div>
          <div className="text-[12px] text-orange-600/70 leading-snug">
            Hasta kaydı, randevu ve ziyaretçi işlemleri
          </div>
        </div>

        {/* Navigasyon */}
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <Link
            to="/panel/resepsiyon"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-orange-800 hover:bg-orange-100 hover:text-orange-900 hover:shadow-sm transition"
          >
            <LayoutDashboard className="w-4 h-4 text-orange-500 group-hover:text-orange-700" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>

          <Link
            to="/panel/resepsiyon/hasta-ekle"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-orange-800 hover:bg-orange-100 hover:text-orange-900 hover:shadow-sm transition"
          >
            <UserRoundPlus className="w-4 h-4 text-orange-500 group-hover:text-orange-700" />
            <span className="font-medium">Yeni Hasta Kaydı</span>
          </Link>

          <Link
            to="/panel/resepsiyon/randevu"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-orange-800 hover:bg-orange-100 hover:text-orange-900 hover:shadow-sm transition"
          >
            <CalendarPlus className="w-4 h-4 text-orange-500 group-hover:text-orange-700" />
            <span className="font-medium">Randevu Oluştur</span>
          </Link>

          <Link
            to="/panel/resepsiyon/ziyaretci"
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-orange-800 hover:bg-orange-100 hover:text-orange-900 hover:shadow-sm transition"
          >
            <FileUser className="w-4 h-4 text-orange-500 group-hover:text-orange-700" />
            <span className="font-medium">Ziyaretçi Kaydı</span>
          </Link>
        </nav>

        {/* Alt Kısım (Kullanıcı + Çıkış) */}
        <div className="border-t border-orange-200 p-4 text-sm flex flex-col gap-3">
          {aktifResepsiyonist ? (
            <>
              <div className="rounded-lg border border-orange-200 bg-white shadow-sm p-3">
                <div className="text-[12px] text-orange-600 leading-none mb-1">
                  Oturum Açık
                </div>
                <div className="font-semibold text-orange-900 text-[13px] leading-tight">
                  {aktifResepsiyonist.adSoyad}
                </div>
                {aktifResepsiyonist.email && (
                  <div className="text-[11px] text-orange-600/80 leading-snug">
                    {aktifResepsiyonist.email}
                  </div>
                )}
              </div>

              <button
                onClick={cikisYap}
                className="inline-flex items-center gap-2 text-[12px] font-medium text-red-600 hover:text-red-700 hover:underline underline-offset-4 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </>
          ) : (
            <Link
              to="/personel-giris"
              className="inline-flex items-center gap-2 text-[12px] font-medium text-orange-700 hover:text-orange-900 hover:underline underline-offset-4 transition"
            >
              <ClipboardPen className="w-4 h-4" />
              <span>Giriş Yap</span>
            </Link>
          )}

          <div className="text-[10px] text-orange-600/70 leading-snug">
            Tüm hasta ve ziyaretçi kayıtları otomatik olarak yönetime
            raporlanır.
          </div>
        </div>
      </aside>

      {/* Sağ Ana İçerik */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50 to-orange-100" />
        <div className="relative p-6 sm:p-8 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
