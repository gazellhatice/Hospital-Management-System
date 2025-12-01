import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  ClipboardList,
  LogOut,
  HeartPulse,
  AlertTriangle,
  LogIn,
} from "lucide-react";

import HastaRandevularCard from "./HastaRandevularCard.jsx";
import HastaRecetelerCard from "./HastaRecetelerCard.jsx";
import HastaSikayetForm from "./HastaSikayetForm.jsx";
import HastaSikayetGecmisiCard from "./HastaSikayetGecmisiCard.jsx";

const TABS = ["home", "randevu", "recete", "sikayet"];

export default function HastaDashboard() {
  // güvenli localStorage okuma
  let parsedHasta = null;
  try {
    parsedHasta = JSON.parse(localStorage.getItem("aktifHasta") || "null");
  } catch {}

  const [aktifHasta, setAktifHasta] = useState(parsedHasta);
  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem("hastaTab");
    return TABS.includes(saved) ? saved : "home";
  });

  useEffect(() => {
    localStorage.setItem("hastaTab", tab);
  }, [tab]);

  function cikisYap() {
    const ok = confirm("Çıkış yapmak istediğinize emin misiniz?");
    if (!ok) return;
    localStorage.removeItem("aktifHasta");
    setAktifHasta(null);
    window.location.href = "/hasta-giris";
  }

  const itemBase =
    "group flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const active =
    "text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm";

  // sekmeler için erişilebilirlik
  function TabButton({ id, icon: Icon, label }) {
    const isActive = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className={`${itemBase} ${isActive ? active : ""}`}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${id}`}
        id={`tab-${id}`}
      >
        <Icon className="w-4 h-4" />
        <span className="font-medium">{label}</span>
      </button>
    );
  }

  // Oturum yoksa: giriş çağrısı
  if (!aktifHasta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50/40 p-6">
        <div className="max-w-md w-full rounded-2xl border border-emerald-100 bg-white shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Oturum bulunamadı</h1>
          <p className="mt-1 text-sm text-gray-600">
            Devam edebilmek için lütfen hasta hesabınızla giriş yapın.
          </p>
          <button
            onClick={() => (window.location.href = "/hasta-giris")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:bg-emerald-700 active:scale-[0.99] transition"
          >
            <LogIn className="w-4 h-4" />
            Giriş Yap
          </button>
          <div className="mt-3 text-[11px] text-gray-400">
            Verileriniz KVKK kapsamında korunur.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-emerald-50/40">
      {/* === SOL MENÜ === */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-emerald-100 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] flex flex-col">
        {/* Üst Başlık */}
        <div className="p-4 border-b border-emerald-100">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 rounded-full px-2.5 py-1 shadow-sm">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
            <span>Hasta Paneli</span>
          </div>
          <div className="mt-3 text-base font-semibold text-gray-900 leading-tight">
            Hoş geldiniz 👋
          </div>
          <div className="text-[12px] text-gray-500 leading-snug">
            Randevu ve reçetelerinizi yönetin.
          </div>
        </div>

        {/* Navigasyon (sekme butonları) */}
        <nav
          className="flex-1 p-4 space-y-1 text-sm"
          role="tablist"
          aria-label="Hasta paneli sekmeleri"
        >
          <TabButton id="home" icon={LayoutDashboard} label="Ana Sayfa" />
          <TabButton id="randevu" icon={CalendarDays} label="Randevularım" />
          <TabButton id="recete" icon={FileText} label="Reçetelerim" />
          <TabButton id="sikayet" icon={ClipboardList} label="Şikayetlerim" />
        </nav>

        {/* Alt Bilgi / Kullanıcı */}
        <div className="border-t border-emerald-100 p-4 text-sm text-gray-600 flex flex-col gap-3">
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

          <div className="text-[10px] text-gray-400 leading-snug">
            Verileriniz KVKK kapsamında korunur.
          </div>
        </div>
      </aside>

      {/* === İÇERİK === */}
      <main className="flex-1 relative overflow-y-auto">
        {/* overlay tıklamayı engellemesin */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-emerald-50 to-emerald-100" />
        <div className="relative p-6 sm:p-8 space-y-6">
          {tab === "home" && (
            <div
              className="grid gap-6 md:grid-cols-2"
              id="panel-home"
              role="tabpanel"
              aria-labelledby="tab-home"
            >
              <HastaRandevularCard />
              <HastaRecetelerCard />
              <div className="md:col-span-2">
                <HastaSikayetForm />
              </div>
              <div className="md:col-span-2">
                <HastaSikayetGecmisiCard />
              </div>
            </div>
          )}

          {tab === "randevu" && (
            <div
              className="space-y-6"
              id="panel-randevu"
              role="tabpanel"
              aria-labelledby="tab-randevu"
            >
              <h1 className="text-xl font-semibold text-gray-900">Randevularım</h1>
              <HastaRandevularCard />
            </div>
          )}

          {tab === "recete" && (
            <div
              className="space-y-6"
              id="panel-recete"
              role="tabpanel"
              aria-labelledby="tab-recete"
            >
              <h1 className="text-xl font-semibold text-gray-900">Reçetelerim</h1>
              <HastaRecetelerCard />
            </div>
          )}

          {tab === "sikayet" && (
            <div
              className="space-y-6"
              id="panel-sikayet"
              role="tabpanel"
              aria-labelledby="tab-sikayet"
            >
              <h1 className="text-xl font-semibold text-gray-900">Şikayetlerim</h1>
              <HastaSikayetForm />
              <HastaSikayetGecmisiCard />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
