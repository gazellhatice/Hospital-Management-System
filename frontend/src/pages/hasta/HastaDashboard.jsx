import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  ClipboardList,
  LogOut,
  HeartPulse,
} from "lucide-react";

import HastaRandevularCard from "./HastaRandevularCard.jsx";
import HastaRecetelerCard from "./HastaRecetelerCard.jsx";
import HastaSikayetForm from "./HastaSikayetForm.jsx";
import HastaSikayetGecmisiCard from "./HastaSikayetGecmisiCard.jsx";

export default function HastaDashboard() {
  const [tab, setTab] = useState("home"); // "home" | "randevu" | "recete" | "sikayet"
  const aktifHasta = JSON.parse(localStorage.getItem("aktifHasta") || "null");

  function cikisYap() {
    localStorage.removeItem("aktifHasta");
    window.location.href = "/hasta-giris";
  }

  const itemBase =
    "group flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm transition cursor-pointer";
  const active =
    "text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm";

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
        <nav className="flex-1 p-4 space-y-1 text-sm">
          <button
            onClick={() => setTab("home")}
            className={`${itemBase} ${tab === "home" ? active : ""}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Ana Sayfa</span>
          </button>

          <button
            onClick={() => setTab("randevu")}
            className={`${itemBase} ${tab === "randevu" ? active : ""}`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium">Randevularım</span>
          </button>

          <button
            onClick={() => setTab("recete")}
            className={`${itemBase} ${tab === "recete" ? active : ""}`}
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">Reçetelerim</span>
          </button>

          <button
            onClick={() => setTab("sikayet")}
            className={`${itemBase} ${tab === "sikayet" ? active : ""}`}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="font-medium">Şikayetlerim</span>
          </button>
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
          ) : null}

          <div className="text-[10px] text-gray-400 leading-snug">
            Verileriniz KVKK kapsamında korunur.
          </div>
        </div>
      </aside>

      {/* === İÇERİK === */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50 to-emerald-100" />
        <div className="relative p-6 sm:p-8 space-y-6">
          {tab === "home" && (
            <div className="grid gap-6 md:grid-cols-2">
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
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-gray-900">Randevularım</h1>
              <HastaRandevularCard />
            </div>
          )}

          {tab === "recete" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-gray-900">Reçetelerim</h1>
              <HastaRecetelerCard />
            </div>
          )}

          {tab === "sikayet" && (
            <div className="space-y-6">
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
