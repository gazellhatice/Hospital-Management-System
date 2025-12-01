import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  UserPlus,
  CalendarDays,
  ClipboardList,
  LogOut,
  Building2,
  AlertTriangle,
  Lock,
} from "lucide-react";

import ResepsiyonYeniHastaForm from "./ResepsiyonYeniHastaForm.jsx";
import RandevuOlusturForm from "./RandevuOlusturForm.jsx";
import ResepsiyonZiyaretciKayitForm from "./ResepsiyonZiyaretciKayitForm.jsx";

export default function ResepsiyonDashboard() {
  // sekme durumu: kalıcı
  const [tab, _setTab] = useState(() => localStorage.getItem("resTab") || "home");
  const setTab = (t) => {
    _setTab(t);
    localStorage.setItem("resTab", t);
  };

  // aktif kullanıcıyı güvenli oku
  const aktifResepsiyon = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifResepsiyonist") || "null");
    } catch {
      return null;
    }
  }, []);

  // kilit ekranı için opsiyonel otomatik yönlendirme
  useEffect(() => {
    let timer;
    if (!aktifResepsiyon) {
      timer = setTimeout(() => {
        // kullanıcı beklerse otomatik login sayfasına taşı
        if (!localStorage.getItem("aktifResepsiyonist")) {
          // hala yoksa yönlendir
          window.location.href = "/personel-giris";
        }
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [aktifResepsiyon]);

  function cikisYap() {
    localStorage.removeItem("aktifResepsiyonist");
    window.location.href = "/personel-giris";
  }

  const itemBase =
    "group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:shadow-sm transition cursor-pointer";
  const active =
    "text-amber-700 bg-amber-50 border border-amber-200 shadow-sm [&_svg]:text-amber-600";

  // Giriş yoksa kilit ekranı
  if (!aktifResepsiyon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/40 p-6">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm border border-amber-100 rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)] p-6 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-amber-700 bg-amber-100/70 border border-amber-200 rounded-full px-2.5 py-1 shadow-sm">
            <Building2 className="w-3.5 h-3.5" />
            <span>Resepsiyon Paneli</span>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-base font-semibold text-slate-900">Giriş Gerekli</div>
            <p className="text-sm text-slate-600">
              Bu sayfaya erişmek için resepsiyon hesabınızla giriş yapın.
            </p>
            <a
              href="/personel-giris"
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(245,158,11,0.35)] hover:bg-amber-700 transition"
            >
              Giriş Sayfasına Git
            </a>
            <p className="text-[11px] text-slate-400 mt-2">
              Otomatik yönlendirme birkaç saniye içinde yapılacak…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-amber-50/30">
      {/* === SOL MENÜ === */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-amber-100 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.08)] flex flex-col">
        {/* Üst Başlık */}
        <div className="p-4 border-b border-amber-100">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-amber-700 bg-amber-100/70 border border-amber-200 rounded-full px-2.5 py-1 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Resepsiyon Paneli</span>
          </div>
          <div className="mt-3 text-base font-semibold text-slate-900 leading-tight">
            Hoş geldiniz 👋
          </div>
          <div className="text-[12px] text-slate-500 leading-snug">
            Hasta kaydı, randevu ve ziyaretçi işlemleri.
          </div>
        </div>

        {/* Navigasyon */}
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <button
            onClick={() => setTab("home")}
            className={`${itemBase} ${tab === "home" ? active : ""}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Genel Görünüm</span>
          </button>

          <button
            onClick={() => setTab("hasta")}
            className={`${itemBase} ${tab === "hasta" ? active : ""}`}
          >
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">Yeni Hasta Kaydı</span>
          </button>

          <button
            onClick={() => setTab("randevu")}
            className={`${itemBase} ${tab === "randevu" ? active : ""}`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium">Randevu Oluştur</span>
          </button>

          <button
            onClick={() => setTab("ziyaret")}
            className={`${itemBase} ${tab === "ziyaret" ? active : ""}`}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="font-medium">Ziyaretçi Kaydı</span>
          </button>
        </nav>

        {/* Alt Bilgi */}
        <div className="border-t border-amber-100 p-4 text-sm flex flex-col gap-3">
          <div className="rounded-lg border border-amber-100 bg-white shadow-sm p-3">
            <div className="text-[12px] text-slate-500 leading-none mb-1">
              Oturum Açık
            </div>
            <div className="font-semibold text-slate-900 text-[13px] leading-tight">
              {aktifResepsiyon.adSoyad}
            </div>
            {aktifResepsiyon.email && (
              <div className="text-[11px] text-slate-400 leading-snug">
                {aktifResepsiyon.email}
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

          <div className="text-[10px] text-slate-400 leading-snug">
            Bu panel yalnızca yetkili resepsiyonistler içindir.
          </div>
        </div>
      </aside>

      {/* === ANA İÇERİK === */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50 to-amber-100" />
        <div className="relative p-6 sm:p-8 space-y-6">
          {tab === "home" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-1">
                <ResepsiyonYeniHastaForm />
              </div>
              <div className="lg:col-span-1">
                <RandevuOlusturForm />
              </div>
              <div className="lg:col-span-2">
                <ResepsiyonZiyaretciKayitForm />
              </div>
            </div>
          )}

          {tab === "hasta" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">Yeni Hasta Kaydı</h1>
              <ResepsiyonYeniHastaForm />
            </div>
          )}

          {tab === "randevu" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">Randevu Oluştur</h1>
              <RandevuOlusturForm />
            </div>
          )}

          {tab === "ziyaret" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">Ziyaretçi Kaydı</h1>
              <ResepsiyonZiyaretciKayitForm />
            </div>
          )}

          {/* küçük uyarı—rol dışı erişimi engellemek istersen backend JWT/RBAC ile de kilitle */}
          {!aktifResepsiyon?.resepsiyonId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-[13px] text-amber-800 shadow-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-[2px]" />
                <div>
                  <div className="font-semibold">Uyarı</div>
                  Resepsiyon kimliği doğrulanamadı. İşlemleriniz sınırlı olabilir.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
