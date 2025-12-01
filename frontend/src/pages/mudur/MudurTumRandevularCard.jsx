import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../../api";
import {
  CalendarDays,
  CalendarCheck,
  User2,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock4,
  Filter,
  Search,
  ArrowUpDown,
  Download,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---- küçük yardımcılar ---- */
function fDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString("tr-TR");
  } catch {
    return s;
  }
}
function fTime(s) {
  return s || "--:--";
}

/* basit metin araması (hasta/doktor/not/durum) */
function matchSearch(r, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    r?.hasta?.adSoyad,
    r?.doktor?.adSoyad,
    r?.notlar,
    r?.randevuDurumu,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export default function MudurTumRandevularCard() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err"

  // toolbar state
  const [durum, setDurum] = useState(""); // "", "BEKLEMEDE", "ONAYLANDI", "GERCEKLESTI", "IPTAL"
  const [q, setQ] = useState("");
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD
  const [sortAsc, setSortAsc] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // refs + kısayollar
  const searchRef = useRef(null);
  useEffect(() => {
    function onKey(e) {
      // Ctrl/⌘ + K => aramaya fokus
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Esc => aramayı temizle
      if (e.key === "Escape") {
        setQ("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ilk yükleme
  useEffect(() => {
    (async () => {
      setLoading(true);
      setMesaj("");
      setMesajTip("");
      try {
        const data = await apiGet("/api/randevu/mudur/tum");
        setRaw(Array.isArray(data) ? data : []);
      } catch (err) {
        const serverMsg = err?.response?.data?.message || "Randevular alınamadı.";
        setMesaj(serverMsg);
        setMesajTip("err");
        setRaw([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // tarih aralığı mantığı + hızlı kısayollar
  const dateError = useMemo(() => {
    if (from && to && from > to) return "Başlangıç tarihi, bitiş tarihinden büyük olamaz.";
    return "";
  }, [from, to]);

  function setToday() {
    const d = new Date();
    const iso = d.toISOString().slice(0, 10);
    setFrom(iso);
    setTo(iso);
    setPage(1);
  }
  function setThisWeek() {
    const d = new Date();
    const day = d.getDay() || 7; // pazar=7
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    setFrom(monday.toISOString().slice(0, 10));
    setTo(sunday.toISOString().slice(0, 10));
    setPage(1);
  }
  function clearFrom() {
    setFrom("");
    setPage(1);
  }
  function clearTo() {
    setTo("");
    setPage(1);
  }

  // filtreleme + sıralama
  const filtered = useMemo(() => {
    let arr = raw.slice();

    if (durum) {
      const d = durum.toLowerCase();
      arr = arr.filter((r) => (r?.randevuDurumu || "").toLowerCase().includes(d));
    }
    if (from) {
      arr = arr.filter((r) => {
        const d = r?.slot?.tarih;
        return !d || from <= d; // YYYY-MM-DD string karşılaştırması
      });
    }
    if (to) {
      arr = arr.filter((r) => {
        const d = r?.slot?.tarih;
        return !d || d <= to;
      });
    }
    if (q.trim()) {
      arr = arr.filter((r) => matchSearch(r, q.trim()));
    }

    // tarih + saat’e göre sıralama
    arr.sort((a, b) => {
      const ta = `${a?.slot?.tarih || ""}T${a?.slot?.baslangicSaat || ""}`;
      const tb = `${b?.slot?.tarih || ""}T${b?.slot?.baslangicSaat || ""}`;
      if (ta === tb) return 0;
      return sortAsc ? (ta < tb ? -1 : 1) : ta > tb ? -1 : 1;
    });

    return arr;
  }, [raw, durum, from, to, q, sortAsc]);

  // durum sayaçları (Hepsi/BEKLEMEDE/ONAYLANDI/GERCEKLESTI/IPTAL)
  const counts = useMemo(() => {
    const c = { all: 0, BEKLEMEDE: 0, ONAYLANDI: 0, GERCEKLESTI: 0, IPTAL: 0 };
    c.all = filtered.length;
    for (const r of filtered) {
      const d = (r?.randevuDurumu || "").toUpperCase();
      if (c[d] !== undefined) c[d]++;
    }
    return c;
  }, [filtered]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const items = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  useEffect(() => {
    // sayfa değişince üst kısma hafif kaydır
    const el = document.querySelector("#randevu-list-top");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [pageSafe]);

  function resetFilters() {
    setDurum("");
    setQ("");
    setFrom("");
    setTo("");
    setSortAsc(true);
    setPage(1);
  }

  function downloadCSV() {
    const headers = [
      "randevuId",
      "tarih",
      "baslangicSaat",
      "bitisSaat",
      "hasta",
      "doktor",
      "durum",
      "notlar",
    ];
    const rows = filtered.map((r) => [
      r?.randevuId ?? "",
      r?.slot?.tarih ?? "",
      r?.slot?.baslangicSaat ?? "",
      r?.slot?.bitisSaat ?? "",
      r?.hasta?.adSoyad ?? "",
      r?.doktor?.adSoyad ?? "",
      r?.randevuDurumu ?? "",
      (r?.notlar ?? "").replace(/\s+/g, " ").trim(),
    ]);
    const csv =
      headers.join(";") +
      "\n" +
      rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tum_randevular.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-[0_20px_48px_-6px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          {/* Sol */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <CalendarDays className="w-4 h-4 text-gray-700" />
              <span>Tüm Randevular</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-tight">Genel Randevu Kayıtları</h2>
            <p className="text-[13px] text-gray-500 leading-snug flex items-start gap-2">
              <ClipboardList className="w-4 h-4 text-gray-500 mt-[1px]" />
              <span>
                Resepsiyonun oluşturduğu ve doktorların onayladığı tüm kayıtlar burada listelenir.
              </span>
            </p>
          </div>

          {/* Sağ: özet + dışa aktar */}
          <div className="flex items-center gap-3">
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              title="CSV olarak indir"
            >
              <Download className="w-4 h-4" />
              Dışa aktar
            </button>
            <div className="rounded-lg bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1.5 text-[13px] font-medium shadow-sm flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-gray-600" />
              <span>{filtered.length} kayıt</span>
            </div>
          </div>
        </div>

        {/* Toolbar: filtreler */}
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {/* Durum */}
          <div className="flex flex-col text-sm">
            <label className="text-[12px] font-medium text-gray-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              Durum
            </label>
            <div className="flex gap-2 mt-1">
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                value={durum}
                onChange={(e) => {
                  setDurum(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Hepsi</option>
                <option value="BEKLEMEDE">BEKLEMEDE</option>
                <option value="ONAYLANDI">ONAYLANDI</option>
                <option value="GERCEKLESTI">GERÇEKLEŞTİ</option>
                <option value="IPTAL">İPTAL</option>
              </select>
              {/* sayac chipleri */}
              <div className="hidden xl:flex items-center gap-1 text-[11px] text-gray-600">
                <Chip label={`Beklemede ${counts.BEKLEMEDE}`} />
                <Chip label={`Onaylandı ${counts.ONAYLANDI}`} />
                <Chip label={`Gerçekleşti ${counts.GERCEKLESTI}`} />
                <Chip label={`İptal ${counts.IPTAL}`} />
              </div>
            </div>
          </div>

          {/* Tarih aralığı */}
          <div className="flex flex-col text-sm">
            <label className="text-[12px] font-medium text-gray-600">Başlangıç</label>
            <div className="relative mt-1">
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
              {from ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100"
                  onClick={clearFrom}
                  aria-label="Başlangıç tarihini temizle"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              ) : null}
            </div>
            <div className="flex gap-2 mt-2">
              <QuickBtn onClick={setToday} label="Bugün" />
              <QuickBtn onClick={setThisWeek} label="Bu Hafta" />
            </div>
          </div>
          <div className="flex flex-col text-sm">
            <label className="text-[12px] font-medium text-gray-600">Bitiş</label>
            <div className="relative mt-1">
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
              {to ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100"
                  onClick={clearTo}
                  aria-label="Bitiş tarihini temizle"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Arama */}
          <div className="flex flex-col text-sm md:col-span-2">
            <label className="text-[12px] font-medium text-gray-600 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-gray-500" />
              Hasta / Doktor / Not
              <span className="ml-2 text-[10px] text-gray-400">Ctrl/⌘+K</span>
            </label>
            <div className="mt-1 relative">
              <input
                ref={searchRef}
                className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                placeholder="örn: Ayşe, Kardiyoloji, kontrol..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                aria-label="Hasta, doktor veya notlarda ara"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {q ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100"
                  onClick={() => setQ("")}
                  aria-label="Aramayı temizle"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Sıralama + Sıfırla */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-2 pt-1">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setSortAsc((s) => !s)}
              type="button"
              title="Tarih/saat’e göre sırala"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortAsc ? "Tarih Artan" : "Tarih Azalan"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              onClick={resetFilters}
              type="button"
            >
              Filtreleri Sıfırla
            </button>
          </div>

          {/* tarih hatası */}
          {dateError ? (
            <div className="md:col-span-5">
              <BannerErr title="Tarih aralığı hatası" text={dateError} />
            </div>
          ) : null}
        </div>
      </header>

      {/* MESAJ */}
      {mesaj && (
        <div className="px-6 pt-4">
          {mesajTip === "err" ? (
            <BannerErr title="Randevular alınamadı" text={mesaj} />
          ) : (
            <BannerOk text={mesaj} />
          )}
        </div>
      )}

      {/* LİSTE */}
      <div id="randevu-list-top" className="px-6 pb-6 pt-4 flex-1 min-h-0">
        {loading ? (
          <SkeletonList />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {items.map((r) => (
                  <motion.li
                    key={r.randevuId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white hover:bg-gray-50 transition-colors px-4 py-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      {/* SOL */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                          <User2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="text-sm font-semibold text-gray-900 leading-tight truncate">
                            {r?.hasta?.adSoyad || "Hasta ?"}
                          </div>
                          <div className="text-[12px] text-gray-500 leading-none truncate">
                            → {r?.doktor?.adSoyad || "Doktor ?"}
                          </div>
                          {r?.notlar ? (
                            <div className="mt-2 text-[12px] text-gray-600 leading-snug italic max-w-[48rem] break-words">
                              Not: {r.notlar}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* SAĞ */}
                      <div className="flex flex-col items-start md:items-end gap-1 text-sm shrink-0">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock4 className="w-4 h-4 text-gray-500" />
                          <span className="tabular-nums">
                            {fDate(r?.slot?.tarih)} {fTime(r?.slot?.baslangicSaat)} - {fTime(r?.slot?.bitisSaat)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <DurumBadge durum={r?.randevuDurumu} />
                        </div>
                        <div className="text-[11px] text-gray-400 leading-none mt-1">#{r?.randevuId}</div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Pagination */}
            <div className="mt-5 flex items-center justify-between text-sm">
              <div className="text-gray-500">
                Toplam <b>{total}</b> kayıt — Sayfa {pageSafe}/{totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe <= 1}
                >
                  Önceki
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe >= totalPages}
                >
                  Sonraki
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/* ---- UI parçaları ---- */
function Chip({ label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white/70 px-2 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      {label}
    </span>
  );
}

function QuickBtn({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs hover:bg-gray-50"
    >
      {label}
    </button>
  );
}

function BannerOk({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-700 shadow-sm"
    >
      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
      <div className="leading-snug">{text}</div>
    </motion.div>
  );
}
function BannerErr({ title, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm"
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
      <div className="leading-snug">
        <div className="font-semibold text-rose-700">{title}</div>
        <div className="text-rose-700/90">{text}</div>
      </div>
    </motion.div>
  );
}

function DurumBadge({ durum }) {
  const normalized = (durum || "").toLowerCase();

  let bg = "bg-gray-100";
  let text = "text-gray-700";
  let border = "border-gray-300";
  let label = durum || "—";
  let icon = <Clock4 className="w-3.5 h-3.5" />;

  if (normalized.includes("bekle")) {
    bg = "bg-amber-50";
    text = "text-amber-700";
    border = "border-amber-200";
  } else if (
    normalized.includes("onay") ||
    normalized.includes("tamam") ||
    normalized.includes("gercekles") ||
    normalized.includes("gerçekleş")
  ) {
    bg = "bg-emerald-50";
    text = "text-emerald-700";
    border = "border-emerald-200";
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
  } else if (normalized.includes("iptal")) {
    bg = "bg-rose-50";
    text = "text-rose-700";
    border = "border-rose-200";
    icon = <AlertTriangle className="w-3.5 h-3.5" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap ${bg} ${text} ${border}`}
    >
      {icon}
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="border border-gray-200 rounded-xl bg-white/70 py-10 px-6 text-center shadow-inner">
      <div className="w-10 h-10 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center mb-3 mx-auto">
        <CalendarDays className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-sm font-medium text-gray-700">Uygun randevu bulunamadı</div>
      <div className="text-[12px] text-gray-500 max-w-[260px] leading-snug mx-auto">
        Filtre/arama ölçütlerini değiştirerek tekrar deneyin.
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="border border-gray-200 rounded-xl bg-white shadow-sm px-4 py-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}