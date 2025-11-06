import { useState } from "react";
import {
  LayoutDashboard,
  Users2,
  ClipboardList,
  FileText,
  LogOut,
  Building2,
} from "lucide-react";

import MudurSikayetYonetimiCard from "./MudurSikayetYonetimiCard.jsx";
import MudurZiyaretciRaporCard from "./MudurZiyaretciRaporCard.jsx";
import MudurResepsiyonistYonetimiCard from "./MudurResepsiyonistYonetimiCard.jsx";

export default function MudurDashboard() {
  const [tab, setTab] = useState("home");
  const aktifMudur = JSON.parse(localStorage.getItem("aktifMudur") || "null");

  function cikisYap() {
    localStorage.removeItem("aktifMudur");
    window.location.href = "/personel-giris";
  }

  const itemBase =
    "group flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm transition cursor-pointer";
  const active =
    "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-sm [&_svg]:text-indigo-600";

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* === SOL MENÜ === */}
      <aside className="w-64 bg-white/90 backdrop-blur-sm border-r border-slate-200 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.1)] flex flex-col">
        {/* Üst Başlık */}
        <div className="p-4 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 border border-indigo-200 rounded-full px-2.5 py-1 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-indigo-700" />
            <span>Müdür Paneli</span>
          </div>
          <div className="mt-3 text-base font-semibold text-slate-900 leading-tight">
            Hoş geldiniz 👋
          </div>
          <div className="text-[12px] text-slate-500 leading-snug">
            Resepsiyon, ziyaretçi ve şikayet yönetimi alanı.
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
            onClick={() => setTab("sikayet")}
            className={`${itemBase} ${tab === "sikayet" ? active : ""}`}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="font-medium">Şikayet Yönetimi</span>
          </button>

          <button
            onClick={() => setTab("ziyaret")}
            className={`${itemBase} ${tab === "ziyaret" ? active : ""}`}
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">Ziyaretçi Raporları</span>
          </button>

          <button
            onClick={() => setTab("resepsiyon")}
            className={`${itemBase} ${tab === "resepsiyon" ? active : ""}`}
          >
            <Users2 className="w-4 h-4" />
            <span className="font-medium">Resepsiyonist Yönetimi</span>
          </button>
        </nav>

        {/* Alt Bilgi */}
        <div className="border-t border-slate-200 p-4 text-sm flex flex-col gap-3">
          {aktifMudur ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-3">
                <div className="text-[12px] text-slate-500 leading-none mb-1">
                  Oturum Açık
                </div>
                <div className="font-semibold text-slate-900 text-[13px] leading-tight">
                  {aktifMudur.adSoyad}
                </div>
                {aktifMudur.email && (
                  <div className="text-[11px] text-slate-400 leading-snug">
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
          ) : null}

          <div className="text-[10px] text-slate-400 leading-snug">
            Bu panel yalnızca yönetici kullanıcıları içindir.
          </div>
        </div>
      </aside>

      {/* === ANA İÇERİK === */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />
        <div className="relative p-6 sm:p-8 space-y-6">
          {tab === "home" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <MudurSikayetYonetimiCard />
              <MudurZiyaretciRaporCard />
              <MudurResepsiyonistYonetimiCard />
            </div>
          )}

          {tab === "sikayet" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">
                Şikayet Yönetimi
              </h1>
              <MudurSikayetYonetimiCard />
            </div>
          )}

          {tab === "ziyaret" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">
                Ziyaretçi Raporları
              </h1>
              <MudurZiyaretciRaporCard />
            </div>
          )}

          {tab === "resepsiyon" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">
                Resepsiyonist Yönetimi
              </h1>
              <MudurResepsiyonistYonetimiCard />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
