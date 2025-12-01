import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../../api";
import {
  CalendarDays,
  ClipboardList,
  Clock4,
  User2,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Download,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* --- yardımcılar --- */
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function toIsoDayStart(d) {
  return `${d}T00:00:00`;
}
function toIsoDayEnd(d) {
  return `${d}T23:59:59`;
}
function fmtDateTime(s) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(s);
  }
}
function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

/* sebeplere küçük rozet rengi (dark theme) */
function reasonColors(reason) {
  const r = String(reason || "").toLowerCase();
  if (r.includes("randevu"))
    return {
      bg: "bg-indigo-500/10",
      text: "text-indigo-200",
      border: "border-indigo-400/60",
    };
  if (r.includes("ziyaret"))
    return {
      bg: "bg-emerald-500/10",
      text: "text-emerald-200",
      border: "border-emerald-400/60",
    };
  if (r.includes("evrak") || r.includes("belge"))
    return {
      bg: "bg-amber-500/10",
      text: "text-amber-200",
      border: "border-amber-400/60",
    };
  if (r.includes("acil") || r.includes("acil "))
    return {
      bg: "bg-rose-500/10",
      text: "text-rose-200",
      border: "border-rose-400/60",
    };
  return {
    bg: "bg-slate-900/60",
    text: "text-slate-200",
    border: "border-slate-600",
  };
}

/* basit debounce */
function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function MudurZiyaretciRaporCard() {
  const [baslangicTarih, setBaslangicTarih] = useState(daysAgoStr(6)); // default: Son 7 gün
  const [bitisTarih, setBitisTarih] = useState(todayStr());
  const [liste, setListe] = useState([]);
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "err" | "ok" | ""
  const [loading, setLoading] = useState(false);

  // sıralama + sayfalama
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // iptal edilebilir fetch için controller ref
  const abortRef = useRef(null);
  const listBoxRef = useRef(null);

  // otomatik rapor + debounced tarih dinleme
  const dStart = useDebounced(baslangicTarih, 300);
  const dEnd = useDebounced(bitisTarih, 300);
  useEffect(() => {
    raporCek();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    // tarih aralığı değişince otomatik yenilesin
    if (dStart && dEnd) raporCek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dStart, dEnd]);

  async function raporCek(e) {
    e?.preventDefault?.();
    setMesaj("");
    setMesajTip("");

    if (!baslangicTarih || !bitisTarih) {
      setMesaj("Lütfen başlangıç ve bitiş tarihlerini seçin.");
      setMesajTip("err");
      return;
    }
    if (bitisTarih < baslangicTarih) {
      setMesaj("Bitiş tarihi başlangıçtan önce olamaz.");
      setMesajTip("err");
      return;
    }

    // önceki isteği iptal et
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const baslangicStr = toIsoDayStart(baslangicTarih);
    const bitisStr = toIsoDayEnd(bitisTarih);

    try {
      setLoading(true);
      const params = new URLSearchParams({
        baslangic: baslangicStr,
        bitis: bitisStr,
      });
      const data = await apiGet(
        `/api/ziyaretci/mudur/liste?${params.toString()}`,
        {
          signal: controller.signal,
        }
      );
      const arr = Array.isArray(data) ? data : [];
      setListe(arr);
      setMesaj(`Rapor hazır. ${arr.length} kayıt bulundu.`);
      setMesajTip("ok");
      setPage(1);
      // yeni veri gelince liste tepesine kaydır
      queueMicrotask(() =>
        listBoxRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      );
    } catch (err) {
      if (err?.name === "AbortError") return; // sessiz iptal
      setMesaj("Ziyaretçi listesi alınamadı.");
      setMesajTip("err");
      setListe([]);
    } finally {
      setLoading(false);
    }
  }

  function quickRange(range) {
    if (range === "today") {
      const t = todayStr();
      setBaslangicTarih(t);
      setBitisTarih(t);
    } else if (range === "last7") {
      setBaslangicTarih(daysAgoStr(6));
      setBitisTarih(todayStr());
    } else if (range === "thisMonth") {
      const d = new Date();
      const y = d.getFullYear();
      const m = d.getMonth();
      const start = new Date(y, m, 1).toISOString().slice(0, 10);
      const end = new Date(y, m + 1, 0).toISOString().slice(0, 10);
      setBaslangicTarih(start);
      setBitisTarih(end);
    }
  }

  const sorted = useMemo(() => {
    const arr = (liste || []).slice();
    arr.sort((a, b) => {
      const ta = a?.ziyaretTarihiSaat || "";
      const tb = b?.ziyaretTarihiSaat || "";
      if (ta === tb) return 0;
      return sortAsc ? (ta < tb ? -1 : 1) : ta > tb ? -1 : 1;
    });
    return arr;
  }, [liste, sortAsc]);

  // özet metrikler
  const summary = useMemo(() => {
    const total = sorted.length;
    const uniqueVisitors = uniq(sorted.map((z) => z?.adSoyad)).length;
    const byReason = sorted.reduce((acc, z) => {
      const key = (z?.ziyaretSebebi || "Diğer").trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const topReasons = Object.entries(byReason)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const byResepsiyonist = sorted.reduce((acc, z) => {
      const key = z?.resepsiyonist?.adSoyad || "—";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const topResepsiyonist = Object.entries(byResepsiyonist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    return { total, uniqueVisitors, topReasons, topResepsiyonist };
  }, [sorted]);

  // sayfalama
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const items = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe]);

  // sayfa değişince kutunun tepesine kaydır
  useEffect(() => {
    listBoxRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageSafe]);

  // kısayollar: Ctrl/⌘+Enter -> Raporu Getir, Alt+←/→ sayfa
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        raporCek();
      }
      if (e.altKey && e.key === "ArrowLeft") {
        setPage((p) => Math.max(1, p - 1));
      }
      if (e.altKey && e.key === "ArrowRight") {
        setPage((p) => Math.min(totalPages, p + 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages]);

  function downloadCSV() {
    const headers = [
      "ziyaretciId",
      "adSoyad",
      "ziyaretSebebi",
      "ziyaretTarihiSaat",
      "notlar",
      "resepsiyonist",
    ];
    const rows = sorted.map((z) => [
      z?.ziyaretciId ?? "",
      z?.adSoyad ?? "",
      z?.ziyaretSebebi ?? "",
      z?.ziyaretTarihiSaat ?? "",
      (z?.notlar ?? "").replace(/\s+/g, " ").trim(),
      z?.resepsiyonist?.adSoyad ?? "",
    ]);
    const csv =
      headers.join(";") +
      "\n" +
      rows
        .map((row) =>
          row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ziyaretci_raporu.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="bg-slate-950/70 backdrop-blur-xl border border-slate-800/70 rounded-3xl shadow-[0_24px_80px_-16px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col lg:col-span-3">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-slate-800/70 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/70 flex flex-col gap-4 sticky top-16 z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-sky-300/90">
              <ClipboardList className="w-4 h-4 text-sky-300" />
              <span>Ziyaretçi Raporu</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-50 leading-tight">
              Giriş / Çıkış Kayıtları
            </h2>
            <p className="text-[13px] text-slate-400 leading-snug flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 mt-[1px]" />
              <span>
                Hastaneye kim gelmiş, hangi amaçla ve kaydı kim açmış? Tarih
                aralığı seçip raporlayın.{" "}
                <span className="text-slate-500">
                  Ctrl/⌘+Enter: Raporu Getir • Alt+←/→: Sayfa
                </span>
              </span>
            </p>
          </div>

          {/* Sağ: sıralama & dışa aktar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSortAsc((s) => !s);
                setPage(1);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900 hover:border-slate-500 transition"
              title="Tarih/saat’e göre sırala"
              type="button"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortAsc ? "Tarih Artan" : "Tarih Azalan"}
            </button>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900 hover:border-slate-500 transition"
              title="CSV olarak indir"
              type="button"
            >
              <Download className="w-4 h-4" />
              Dışa aktar
            </button>
          </div>
        </div>

        {/* Tarih filtresi + hızlı aralıklar */}
        <form onSubmit={raporCek} className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-slate-200 mb-1">
              Başlangıç Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 pr-10 text-sm text-slate-50 shadow-sm outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70 transition placeholder:text-slate-500"
                value={baslangicTarih}
                max={bitisTarih || undefined}
                onChange={(e) => setBaslangicTarih(e.target.value)}
              />
              <CalendarDays className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-slate-200 mb-1">
              Bitiş Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 pr-10 text-sm text-slate-50 shadow-sm outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70 transition placeholder:text-slate-500"
                value={bitisTarih}
                min={baslangicTarih || undefined}
                max={todayStr()}
                onChange={(e) => setBitisTarih(e.target.value)}
              />
              <CalendarDays className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-1 flex items-end gap-2">
            <button
              className="w-full inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(56,189,248,0.55)] hover:bg-sky-400 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor
                </span>
              ) : (
                "Raporu Getir"
              )}
            </button>
          </div>

          {/* hızlı aralıklar */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-100 hover:bg-slate-900 hover:border-slate-500 transition"
              onClick={() => quickRange("today")}
            >
              Bugün
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-100 hover:bg-slate-900 hover:border-slate-500 transition"
              onClick={() => quickRange("last7")}
            >
              Son 7 Gün
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-100 hover:bg-slate-900 hover:border-slate-500 transition"
              onClick={() => quickRange("thisMonth")}
            >
              Bu Ay
            </button>
          </div>
        </form>
      </header>

      {/* ÖZET KARTLAR */}
      <div className="px-6 pt-4 grid gap-3 sm:grid-cols-3">
        <MotionSummary>
          <SummaryCard
            label="Toplam Ziyaret"
            value={summary.total}
            icon={<ClipboardList className="w-4 h-4" />}
          />
        </MotionSummary>
        <MotionSummary delay={0.05}>
          <SummaryCard
            label="Benzersiz Ziyaretçi"
            value={summary.uniqueVisitors}
            icon={<User2 className="w-4 h-4" />}
          />
        </MotionSummary>
        <MotionSummary delay={0.1}>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 shadow-sm p-3">
            <div className="text-[11px] font-semibold text-slate-300 mb-2">
              Öne Çıkan Sebepler
            </div>
            <div className="flex flex-wrap gap-1.5">
              {summary.topReasons.length === 0 ? (
                <span className="text-[12px] text-slate-500">—</span>
              ) : (
                summary.topReasons.map(([reason, count]) => {
                  const c = reasonColors(reason);
                  return (
                    <span
                      key={reason}
                      className={`inline-flex items-center gap-1 rounded-full ${c.bg} ${c.text} border ${c.border} px-2 py-0.5 text-[11px]`}
                    >
                      {reason} • {count}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </MotionSummary>
      </div>

      {/* MESAJ BLOĞU */}
      {mesaj && (
        <div className="px-6 pt-3">
          {mesajTip === "err" ? (
            <div className="flex items-start gap-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-200 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-rose-100">
                  Rapor alınamadı
                </div>
                <div className="text-rose-200/90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-200 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-emerald-100">
                  Rapor hazır
                </div>
                <div className="text-emerald-200/90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RAPOR LİSTESİ */}
      <div className="px-6 pb-6 pt-4 flex-1 min-h-0">
        <div
          ref={listBoxRef}
          className="border border-slate-800 rounded-xl bg-slate-950/70 shadow-inner max-h-64 overflow-auto"
        >
          {loading ? (
            <SkeletonList />
          ) : liste.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-slate-800/80 text-sm">
              <AnimatePresence initial={false}>
                {items.map((z) => (
                  <motion.li
                    key={z.ziyaretciId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="px-4 py-4 bg-slate-950/70 hover:bg-slate-900/80 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      {/* SOL: ziyaretçi & sebep */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 text-slate-200 border border-slate-700 shadow-sm">
                          <User2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-slate-50 leading-tight truncate">
                            {z.adSoyad || "Ziyaretçi ?"}
                          </div>
                          <div className="text-[12px] text-slate-300 leading-snug mt-1">
                            {(() => {
                              const c = reasonColors(z?.ziyaretSebebi);
                              return (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full ${c.bg} ${c.text} border ${c.border} px-2 py-0.5`}
                                >
                                  {z.ziyaretSebebi || "Sebep yok"}
                                </span>
                              );
                            })()}
                          </div>
                          {z?.notlar ? (
                            <div className="mt-2 text-[12px] text-slate-300 leading-snug italic max-w-[48rem] break-words">
                              Not: {z.notlar}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* SAĞ: saat / resepsiyonist */}
                      <div className="flex flex-col items-start md:items-end gap-1 text-sm shrink-0">
                        <div className="flex items-center gap-2 text-slate-100">
                          <Clock4 className="w-4 h-4 text-slate-400" />
                          <span className="tabular-nums">
                            {fmtDateTime(z.ziyaretTarihiSaat)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-none">
                          Kaydı Açan:{" "}
                          <span className="text-slate-200 font-medium">
                            {z.resepsiyonist?.adSoyad || "—"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-none">
                          #{z?.ziyaretciId}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* SAYFALAMA */}
        {liste.length > 0 && (
          <div className="mt-5 flex items-center justify-between text-sm">
            <div className="text-slate-400">
              Toplam <b className="text-slate-100">{total}</b> kayıt — Sayfa{" "}
              {pageSafe}/{totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-900 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1}
                type="button"
              >
                Önceki
              </button>
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-900 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe >= totalPages}
                type="button"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* --- küçük UI parçaları --- */
function SummaryCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 shadow-sm p-3">
      <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-900 border border-slate-700 text-slate-200">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-50">
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 shadow-sm flex items-center justify-center mb-3">
        <ClipboardList className="w-5 h-5 text-slate-400" />
      </div>
      <div className="text-sm font-medium text-slate-100">Henüz liste yok</div>
      <div className="text-[12px] text-slate-400 max-w-[240px] leading-snug">
        Tarih aralığı seçip “Raporu Getir” butonuna tıklayın.
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="border border-slate-800 rounded-xl bg-slate-950/70 shadow-sm px-4 py-4"
        >
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-4/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* motion helper */
function MotionSummary({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay }}
    >
      {children}
    </motion.div>
  );
}
