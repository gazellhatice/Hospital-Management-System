import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api";
import {
  CalendarClock,
  User2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Loader2,
  CalendarRange,
  ArrowUpDown,
  X,
  Download,
} from "lucide-react";

/* --- küçük yardımcılar --- */
function parseDateTime(r) {
  // "YYYY-MM-DD" + "HH:mm"
  const d = r?.slot?.tarih;
  const b = r?.slot?.baslangicSaat;
  if (!d) return null;
  const iso = b ? `${d}T${b}:00` : `${d}T00:00:00`;
  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt;
}
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function inThisWeek(dt) {
  const now = new Date();
  const day = now.getDay() || 7; // pazar=0 -> 7
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return dt >= monday && dt <= sunday;
}
function normalizeStatus(s) {
  const t = (s || "").toLowerCase();
  if (t.includes("onay") || t.includes("kabul")) return "onay";
  if (t.includes("bekle")) return "bekle";
  if (t.includes("iptal") || t.includes("cancel") || t.includes("no-show"))
    return "iptal";
  return "diger";
}

export default function HastaRandevularCard() {
  const [liste, setListe] = useState([]);
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "err" | "info" | ""
  const [loading, setLoading] = useState(false);

  // ---- filtre UI state ----
  const [q, setQ] = useState("");                    // doktor adı arama
  const [statusTab, setStatusTab] = useState("all"); // all|onay|bekle|iptal
  const [dateFilter, setDateFilter] = useState("all"); // all|today|week
  const [sortAsc, setSortAsc] = useState(true);

  // sayfalama
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // aktifHasta'yı sadece ilk render'da oku -> referans sabit kalsın
  const [aktifHasta] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifHasta") || "null");
    } catch {
      return null;
    }
  });

  // ---- veri yükleme ----
  useEffect(() => {
    let isMounted = true;

    async function yukle() {
      if (!aktifHasta?.hastaId) {
        if (!isMounted) return;
        setListe([]);
        setMesaj("Hasta bilgisi bulunamadı. Giriş yapın.");
        setMesajTip("err");
        return;
      }

      try {
        if (!isMounted) return;
        setLoading(true);

        const data = await apiGet(`/api/randevu/hasta/${aktifHasta.hastaId}`);
        const list = Array.isArray(data) ? data : (data?.data ?? []);

        if (!isMounted) return;
        setListe(list);
        setMesaj("");
        setMesajTip("");
      } catch {
        if (!isMounted) return;
        setMesaj("Randevular yüklenemedi.");
        setMesajTip("err");
        setListe([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    yukle();
    return () => { isMounted = false; };
  }, [aktifHasta?.hastaId]);

  // ---- filtrelenmiş + sıralanmış veri ----
  const filtered = useMemo(() => {
    let arr = [...liste];

    if (statusTab !== "all") {
      arr = arr.filter((r) => normalizeStatus(r.randevuDurumu) === statusTab);
    }

    if (dateFilter !== "all") {
      arr = arr.filter((r) => {
        const dt = parseDateTime(r);
        if (!dt) return false;
        const now = new Date();
        if (dateFilter === "today") return isSameDay(dt, now);
        if (dateFilter === "week") return inThisWeek(dt);
        return true;
      });
    }

    const qq = q.trim().toLowerCase();
    if (qq) {
      arr = arr.filter((r) =>
        (r?.doktor?.adSoyad || "").toLowerCase().includes(qq)
      );
    }

    // tarih + saat’e göre sıralama
    arr.sort((a, b) => {
      const da = parseDateTime(a);
      const db = parseDateTime(b);
      if (!da && !db) return 0;
      if (!da) return sortAsc ? 1 : -1;
      if (!db) return sortAsc ? -1 : 1;
      return sortAsc ? da - db : db - da;
    });

    return arr;
  }, [liste, statusTab, dateFilter, q, sortAsc]);

  // sayaçlar
  const counts = useMemo(() => {
    const c = { all: liste.length, onay: 0, bekle: 0, iptal: 0 };
    liste.forEach((r) => {
      const s = normalizeStatus(r.randevuDurumu);
      if (s === "onay") c.onay++;
      else if (s === "bekle") c.bekle++;
      else if (s === "iptal") c.iptal++;
    });
    return c;
  }, [liste]);

  // sayfalama hesapları
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const items = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSafe]);

  // arama sıfırla
  function clearSearch() {
    setQ("");
    setPage(1);
  }

  // CSV dışa aktar
  function downloadCSV() {
    const headers = ["randevuId","tarih","baslangicSaat","bitisSaat","doktor","brans","durum","notlar"];
    const rows = filtered.map((r) => [
      r?.randevuId ?? "",
      r?.slot?.tarih ?? "",
      r?.slot?.baslangicSaat ?? "",
      r?.slot?.bitisSaat ?? "",
      r?.doktor?.adSoyad ?? "",
      r?.doktor?.brans ?? "",
      r?.randevuDurumu ?? "",
      (r?.notlar ?? "").replace(/\s+/g, " ").trim(),
    ]);
    const csv =
      headers.join(";") + "\n" +
      rows.map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(";")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "randevularim.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="bg-white/70 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-[0_8px_40px_-8px_rgba(16,185,129,0.18)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_50px_-10px_rgba(16,185,129,0.28)]">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 flex flex-col gap-4 sm:gap-5">
        <div className="flex items-start justify-between gap-4">
          {/* sol */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
              <CalendarClock className="w-4 h-4" />
              <span>Randevularım</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 leading-tight">
              Planlanmış Muayeneleriniz
            </h2>
            <p className="text-[13px] text-slate-600">
              Tarih, saat ve doktor bilgisini buradan takip edebilirsiniz.
            </p>
          </div>

          {/* hasta chip */}
          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="text-[13px] font-medium text-slate-800 flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                <User2 className="w-4 h-4" />
              </div>
              <span>{aktifHasta?.adSoyad || "—"}</span>
            </div>
            <div className="text-[12px] text-slate-400 leading-none">
              {aktifHasta?.tcKimlikNo
                ? `TC ${aktifHasta.tcKimlikNo}`
                : "Kimlik doğrulanmadı"}
            </div>
          </div>
        </div>

        {/* filtre satırı */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* status tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <TabButton
              active={statusTab === "all"}
              onClick={() => { setStatusTab("all"); setPage(1); }}
              label={`Tümü (${counts.all})`}
            />
            <TabButton
              active={statusTab === "onay"}
              onClick={() => { setStatusTab("onay"); setPage(1); }}
              color="emerald"
              label={`Onaylı (${counts.onay})`}
            />
            <TabButton
              active={statusTab === "bekle"}
              onClick={() => { setStatusTab("bekle"); setPage(1); }}
              color="amber"
              label={`Beklemede (${counts.bekle})`}
            />
            <TabButton
              active={statusTab === "iptal"}
              onClick={() => { setStatusTab("iptal"); setPage(1); }}
              color="rose"
              label={`İptal (${counts.iptal})`}
            />
          </div>

          {/* arama + tarih hızlı filtre + sıralama + dışa aktar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                className="w-64 rounded-lg border border-emerald-200 bg-white pl-9 pr-9 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Doktor adına göre ara…"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
              <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              {q ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-emerald-50"
                  title="Temizle"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              ) : null}
            </div>

            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-2 py-1.5 text-[12px] text-emerald-800">
              <Filter className="w-4 h-4" />
              <button
                type="button"
                onClick={() => { setDateFilter("all"); setPage(1); }}
                className={`rounded-md px-2 py-1 transition ${
                  dateFilter === "all"
                    ? "bg-white border border-emerald-200 shadow-sm"
                    : "hover:bg-emerald-100"
                }`}
              >
                Hepsi
              </button>
              <button
                type="button"
                onClick={() => { setDateFilter("today"); setPage(1); }}
                className={`rounded-md px-2 py-1 transition ${
                  dateFilter === "today"
                    ? "bg-white border border-emerald-200 shadow-sm"
                    : "hover:bg-emerald-100"
                }`}
                title="Bugün"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => { setDateFilter("week"); setPage(1); }}
                className={`rounded-md px-2 py-1 transition ${
                  dateFilter === "week"
                    ? "bg-white border border-emerald-200 shadow-sm"
                    : "hover:bg-emerald-100"
                }`}
                title="Bu Hafta"
              >
                Bu Hafta
              </button>
              <CalendarRange className="w-4 h-4 opacity-70" />
            </div>

            <button
              type="button"
              onClick={() => { setSortAsc(s => !s); setPage(1); }}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm hover:bg-emerald-50"
              title="Tarih/saat’e göre sırala"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortAsc ? "Tarih Artan" : "Tarih Azalan"}
            </button>

            <button
              type="button"
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm hover:bg-emerald-50"
              title="CSV olarak indir"
            >
              <Download className="w-4 h-4" />
              Dışa aktar
            </button>
          </div>
        </div>

        {/* hata/info */}
        {mesaj && (
          <div>
            {mesajTip === "err" ? (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">Bir şeyler ters gitti</div>
                  <div className="opacity-90">{mesaj}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
                {mesaj}
              </div>
            )}
          </div>
        )}
      </header>

      {/* İÇERİK */}
      <div className="px-6 pb-6 pt-4">
        <div className="border border-emerald-50 rounded-2xl bg-gradient-to-b from-white to-emerald-50/30 shadow-inner overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="ml-2 text-sm text-slate-600">Yükleniyor…</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ul className="divide-y divide-emerald-100/70">
                {items.map((r, i) => (
                  <li
                    key={r.randevuId}
                    className="relative px-5 py-4 hover:bg-emerald-50/70 transition"
                  >
                    {/* timeline çizgisi */}
                    {i !== items.length - 1 && (
                      <span className="absolute left-[22px] top-[56px] bottom-0 w-[2px] bg-emerald-100" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* avatar */}
                      <div className="shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 shadow-sm">
                          <User2 className="w-4 h-4" />
                        </div>
                      </div>

                      {/* içerik */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {r.doktor?.adSoyad || "Doktor bilgisi yok"}
                            </h3>
                            <p className="text-[12px] text-slate-500">
                              {r.doktor?.brans || "Branş bilgisi yok"}
                            </p>
                          </div>

                          <StatusBadge durum={r.randevuDurumu} />
                        </div>

                        {/* notlar */}
                        {r?.notlar?.trim() ? (
                          <p className="mt-2 text-[13px] text-slate-600 italic line-clamp-2">
                            {r.notlar}
                          </p>
                        ) : (
                          <p className="mt-2 text-[13px] text-slate-400">
                            Not eklenmemiş.
                          </p>
                        )}

                        {/* saat & id */}
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="tabular-nums">
                            {r.slot?.tarih || "—"} {r.slot?.baslangicSaat || "--:--"} -{" "}
                            {r.slot?.bitisSaat || "--:--"}
                          </span>
                          <span className="ml-auto text-[11px] text-slate-400">
                            Randevu #{r.randevuId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* sayfalama */}
              <div className="px-5 py-3 flex items-center justify-between text-sm">
                <div className="text-slate-600">
                  Toplam <b>{total}</b> kayıt — Sayfa {pageSafe}/{totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pageSafe <= 1}
                  >
                    Önceki
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50"
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
      </div>
    </section>
  );
}

/* --- küçük bileşenler --- */

function TabButton({ active, onClick, label, color = "slate" }) {
  const colorMap =
    {
      slate: "border-slate-200 text-slate-700 hover:bg-slate-100",
      emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-100",
      amber: "border-amber-200 text-amber-700 hover:bg-amber-100",
      rose: "border-rose-200 text-rose-700 hover:bg-rose-100",
    }[color] || "border-slate-200 text-slate-700 hover:bg-slate-100";

  const activeCls = active ? "bg-white border shadow-sm" : "bg-emerald-50/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition border ${colorMap} ${activeCls}`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-12 h-12 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center mb-3">
        <Clock className="w-6 h-6 text-emerald-500" />
      </div>
      <div className="text-sm font-medium text-slate-700">
        Kayıtlı randevunuz bulunmuyor
      </div>
      <div className="text-[12px] text-slate-500 max-w-[280px] leading-snug mt-1">
        Yeni bir muayene saati oluşturmak için resepsiyonla iletişime
        geçebilirsiniz.
      </div>
    </div>
  );
}

function StatusBadge({ durum }) {
  const normalized = (durum || "").toLowerCase();

  let bg = "bg-gray-100";
  let text = "text-gray-700";
  let border = "border-gray-200";
  let label = durum || "—";

  if (normalized.includes("onay") || normalized.includes("kabul")) {
    bg = "bg-emerald-50";
    text = "text-emerald-700";
    border = "border-emerald-200";
  } else if (normalized.includes("bekle")) {
    bg = "bg-amber-50";
    text = "text-amber-700";
    border = "border-amber-200";
  } else if (
    normalized.includes("iptal") ||
    normalized.includes("cancel") ||
    normalized.includes("no-show")
  ) {
    bg = "bg-rose-50";
    text = "text-rose-700";
    border = "border-rose-200";
  }

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap",
        bg,
        text,
        border,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
