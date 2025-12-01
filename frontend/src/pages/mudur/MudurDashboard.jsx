import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users2,
  ClipboardList,
  FileText,
  LogOut,
  Building2,
  ShieldCheck,
  Bell,
  RefreshCw,
  Download,
  ChevronRight,
} from "lucide-react";

import MudurSikayetYonetimiCard from "./MudurSikayetYonetimiCard.jsx";
import MudurZiyaretciRaporCard from "./MudurZiyaretciRaporCard.jsx";
import MudurResepsiyonistYonetimiCard from "./MudurResepsiyonistYonetimiCard.jsx";

export default function MudurDashboard() {
  const [tab, setTab] = useState("home");
  const [notif, setNotif] = useState(3); // mock bildirim sayısı

  const aktifMudur = useMemo(
    () => JSON.parse(localStorage.getItem("aktifMudur") || "null"),
    []
  );

  const year = new Date().getFullYear();

  function cikisYap() {
    try {
      localStorage.removeItem("aktifMudur");
    } catch {}
    window.location.href = "/personel-giris";
  }

  function handleTabKey(e, nextTab) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setTab(nextTab);
    }
  }

  function exportCsv() {
    alert("TODO: CSV export bağla (şikayet/ziyaretçi/personel)");
  }

  const title =
    tab === "home"
      ? "Genel Görünüm"
      : tab === "sikayet"
      ? "Şikayet Yönetimi"
      : tab === "ziyaret"
      ? "Ziyaretçi Raporları"
      : "Resepsiyonist Yönetimi";

  const subtitle =
    tab === "home"
      ? "Özet metrikler ve hızlı erişim kartları."
      : tab === "sikayet"
      ? "Şikayetleri inceleyin, durum güncelleyin, not ekleyin."
      : tab === "ziyaret"
      ? "Tarih aralığına göre ziyaretçi istatistiklerini görün."
      : "Resepsiyonistleri ekleyin, etkinleştirin veya pasif yapın.";

  const itemBase =
    "group flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:shadow-sm transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

  const active =
    "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 shadow-sm [&_svg]:text-indigo-600 dark:[&_svg]:text-indigo-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-black">
      {/* ===== Top Bar ===== */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-black/40 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900 rounded-full px-2.5 py-1 shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Sonn</span>
            </div>
            <div className="hidden md:flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Müdür Paneli
              </span>
              <ChevronRight className="w-3 h-3 mx-1.5 text-slate-400" />
              <span className="capitalize">{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-700 dark:hover:border-indigo-800 dark:hover:text-indigo-300 hover:shadow-sm transition"
              onClick={() => window.location.reload()}
              title="Yenile"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
            <button
              className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-700 dark:hover:border-indigo-800 dark:hover:text-indigo-300 hover:shadow-sm transition"
              title="Bildirimler"
              onClick={() => setNotif((n) => Math.max(0, n - 1))}
              aria-label="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              Bildirimler
              {notif > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] grid place-items-center rounded-full bg-rose-600 text-white">
                  {notif}
                </span>
              )}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-700 dark:hover:border-indigo-800 dark:hover:text-indigo-300 hover:shadow-sm transition"
              title="Rapor İndir (CSV)"
              onClick={exportCsv}
            >
              <Download className="w-4 h-4" />
              Dışa Aktar
            </button>
            <button
              onClick={cikisYap}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950 px-3 py-2 text-[12px] font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900 hover:shadow-sm transition"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* ===== Layout ===== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* ===== Sidebar ===== */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="sticky top-20 space-y-4">
              {/* Kullanıcı kartı */}
              {aktifMudur && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 grid place-items-center text-indigo-700 dark:text-indigo-200 font-semibold">
                      {aktifMudur.adSoyad?.[0] ?? "M"}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                        {aktifMudur.adSoyad}
                      </div>
                      {aktifMudur.email && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {aktifMudur.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Yetki: Yönetici
                  </div>
                </motion.div>
              )}

              {/* Nav */}
              <nav className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-3">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 pb-2">
                  Menüler
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setTab("home")}
                    onKeyDown={(e) => handleTabKey(e, "home")}
                    className={`${itemBase} ${tab === "home" ? active : ""}`}
                    aria-current={tab === "home" ? "page" : undefined}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="font-medium">Genel Görünüm</span>
                  </button>

                  <button
                    onClick={() => setTab("sikayet")}
                    onKeyDown={(e) => handleTabKey(e, "sikayet")}
                    className={`${itemBase} ${tab === "sikayet" ? active : ""}`}
                    aria-current={tab === "sikayet" ? "page" : undefined}
                  >
                    <ClipboardList className="w-4 h-4" />
                    <span className="font-medium">Şikayet Yönetimi</span>
                  </button>

                  <button
                    onClick={() => setTab("ziyaret")}
                    onKeyDown={(e) => handleTabKey(e, "ziyaret")}
                    className={`${itemBase} ${tab === "ziyaret" ? active : ""}`}
                    aria-current={tab === "ziyaret" ? "page" : undefined}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Ziyaretçi Raporları</span>
                  </button>

                  <button
                    onClick={() => setTab("resepsiyon")}
                    onKeyDown={(e) => handleTabKey(e, "resepsiyon")}
                    className={`${itemBase} ${tab === "resepsiyon" ? active : ""}`}
                    aria-current={tab === "resepsiyon" ? "page" : undefined}
                  >
                    <Users2 className="w-4 h-4" />
                    <span className="font-medium">Resepsiyonist Yönetimi</span>
                  </button>
                </div>
              </nav>

              {/* Bilgi kartı */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 shadow-sm p-4">
                <div className="text-[12px] text-slate-600 dark:text-slate-300">
                  Bu panel üzerinden şikayet süreçlerini, ziyaretçi
                  raporlarını ve personel yönetimini tek yerden kontrol edin.
                </div>
                <div className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
                  İpucu: Üst bardaki{" "}
                  <Bell className="inline w-3.5 h-3.5" /> bildirim ve{" "}
                  <Download className="inline w-3.5 h-3.5" /> dışa aktar
                  butonlarını kullanabilirsiniz.
                </div>
              </div>
            </div>
          </aside>

          {/* ===== Main ===== */}
          <main className="col-span-12 lg:col-span-9 space-y-6">
            {/* Başlık + alt aksiyonlar */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h1>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
                    {subtitle}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:text-indigo-700 dark:hover:border-indigo-800 dark:hover:text-indigo-300 hover:shadow-sm transition"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-[12px] font-medium text-white hover:bg-indigo-700 shadow-sm transition"
                    onClick={() => alert("TODO: hızlı aksiyon bağla")}
                  >
                    <Bell className="w-4 h-4" />
                    Hızlı Aksiyon
                  </button>
                </div>
              </div>
            </section>

            {/* Home: KPI + Kartlar */}
            {tab === "home" && (
              <>
                {/* KPI'lar */}
                <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Açık Şikayet", value: "12", hint: "+3 bugün" },
                    { title: "Bugünkü Ziyaret", value: "48", hint: "10:00 itibarıyla" },
                    { title: "Aktif Resepsiyonist", value: "4", hint: "Toplam 5" },
                    { title: "Bekleyen Onay", value: "2", hint: "Doktor/Personel" },
                  ].map((k, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow transition"
                    >
                      <div className="text-[12px] text-slate-500 dark:text-slate-400">
                        {k.title}
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        {k.value}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        {k.hint}
                      </div>
                    </motion.div>
                  ))}
                </section>

                {/* Hızlı kartlar – 2 kolon layout */}
                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                  <MudurSikayetYonetimiCard />
                  <MudurZiyaretciRaporCard />
                  <MudurResepsiyonistYonetimiCard />
                </section>
              </>
            )}

            {/* Şikayet Yönetimi sekmesi – kart ortalanmış */}
            {tab === "sikayet" && (
              <section className="flex justify-center">
                <div className="w-full max-w-5xl">
                  <MudurSikayetYonetimiCard />
                </div>
              </section>
            )}

            {/* Ziyaretçi Raporları sekmesi – aynı şekilde ortalanmış */}
            {tab === "ziyaret" && (
              <section className="flex justify-center">
                <div className="w-full max-w-5xl">
                  <MudurZiyaretciRaporCard />
                </div>
              </section>
            )}

            {/* Resepsiyonist Yönetimi sekmesi – kart ortalanmış */}
            {tab === "resepsiyon" && (
              <section className="flex justify-center">
                <div className="w-full max-w-5xl">
                  <MudurResepsiyonistYonetimiCard />
                </div>
              </section>
            )}

            {/* Alt bilgi */}
            <footer className="pt-2 pb-8 text-[11px] text-slate-400 dark:text-slate-500">
              © {year} Hospital Sonn · Yönetim Paneli
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
