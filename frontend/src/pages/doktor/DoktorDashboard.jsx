import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Clock4,
  FileSignature,
  LogOut,
  Stethoscope,
} from "lucide-react";

import DoktorBugunkuRandevularCard from "./DoktorBugunkuRandevularCard.jsx";
import DoktorSlotAcForm from "./DoktorSlotAcForm.jsx";
import DoktorReceteYazForm from "./DoktorReceteYazForm.jsx";

export default function DoktorDashboard() {
  const [tab, setTab] = useState("home"); // "home" | "randevu" | "slot" | "recete"
  const aktifDoktor = JSON.parse(localStorage.getItem("aktifDoktor") || "null");

  function cikisYap() {
    localStorage.removeItem("aktifDoktor");
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
            <Stethoscope className="w-3.5 h-3.5 text-indigo-700" />
            <span>Doktor Paneli</span>
          </div>
          <div className="mt-3 text-base font-semibold text-slate-900 leading-tight">
            Hoş geldiniz 👋
          </div>
          <div className="text-[12px] text-slate-500 leading-snug">
            Randevular, slot ve reçete işlemleri.
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
            onClick={() => setTab("randevu")}
            className={`${itemBase} ${tab === "randevu" ? active : ""}`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="font-medium">Bugünkü Randevular</span>
          </button>

          <button
            onClick={() => setTab("slot")}
            className={`${itemBase} ${tab === "slot" ? active : ""}`}
          >
            <Clock4 className="w-4 h-4" />
            <span className="font-medium">Slot (Muayene Saati) Aç</span>
          </button>

          <button
            onClick={() => setTab("recete")}
            className={`${itemBase} ${tab === "recete" ? active : ""}`}
          >
            <FileSignature className="w-4 h-4" />
            <span className="font-medium">Reçete Yaz</span>
          </button>
        </nav>

        {/* Alt Bilgi */}
        <div className="border-t border-slate-200 p-4 text-sm flex flex-col gap-3">
          {aktifDoktor ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-3">
                <div className="text-[12px] text-slate-500 leading-none mb-1">
                  Oturum Açık
                </div>
                <div className="font-semibold text-slate-900 text-[13px] leading-tight">
                  {aktifDoktor.adSoyad}
                </div>
                {aktifDoktor.uzmanlik && (
                  <div className="text-[11px] text-slate-400 leading-snug">
                    {aktifDoktor.uzmanlik}
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
            Bu panel yalnızca kayıtlı doktorlar içindir.
          </div>
        </div>
      </aside>

      {/* === ANA İÇERİK === */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />
        <div className="relative p-6 sm:p-8 space-y-6">
          {tab === "home" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DoktorBugunkuRandevularCard />
              </div>
              <div className="lg:col-span-3">
                <DoktorSlotAcForm />
              </div>
              <div className="lg:col-span-3">
                <DoktorReceteYazForm />
              </div>
            </div>
          )}

          {tab === "randevu" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">
                Bugünkü Randevular
              </h1>
              <DoktorBugunkuRandevularCard />
            </div>
          )}

          {tab === "slot" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">
                Muayene Saati (Slot) Aç
              </h1>
              <DoktorSlotAcForm />
            </div>
          )}

          {tab === "recete" && (
            <div className="space-y-6">
              <h1 className="text-xl font-semibold text-slate-900">
                Reçete Yaz
              </h1>
              <DoktorReceteYazForm />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
