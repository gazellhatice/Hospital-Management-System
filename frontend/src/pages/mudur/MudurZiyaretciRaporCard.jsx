import { useMemo, useState } from "react";
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

export default function MudurZiyaretciRaporCard() {
  const [baslangicTarih, setBaslangicTarih] = useState("");
  const [bitisTarih, setBitisTarih] = useState("");
  const [liste, setListe] = useState([]);
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "err" | "ok" | ""
  const [loading, setLoading] = useState(false);

  // sıralama + sayfalama
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function toIsoDayStart(d) {
    return `${d}T00:00:00`;
  }
  function toIsoDayEnd(d) {
    return `${d}T23:59:59`;
  }
  function todayStr() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }
  function daysAgoStr(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
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

  async function raporCek(e) {
    e?.preventDefault?.();
    setMesaj("");
    setMesajTip("");
    setListe([]);

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

    const baslangicStr = toIsoDayStart(baslangicTarih);
    const bitisStr = toIsoDayEnd(bitisTarih);

    try {
      setLoading(true);
      const params = new URLSearchParams({
        baslangic: baslangicStr,
        bitis: bitisStr,
      });
      const data = await apiGet(`/api/ziyaretci/mudur/liste?${params.toString()}`);
      const arr = Array.isArray(data) ? data : [];
      setListe(arr);
      setMesaj(`Rapor hazır. ${arr.length} kayıt bulundu.`);
      setMesajTip("ok");
      setPage(1); // yeni sorguda sayfayı başa al
    } catch (err) {
      setMesaj("Ziyaretçi listesi alınamadı.");
      setMesajTip("err");
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
      setBaslangicTarih(daysAgoStr(6)); // bugün dahil 7 gün
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
      return sortAsc ? (ta < tb ? -1 : 1) : (ta > tb ? -1 : 1);
    });
    return arr;
  }, [liste, sortAsc]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const items = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe]);

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
    <section className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-[0_20px_48px_-6px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:col-span-3">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <ClipboardList className="w-4 h-4 text-gray-700" />
              <span>Ziyaretçi Raporu</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-tight">
              Giriş / Çıkış Kayıtları
            </h2>
            <p className="text-[13px] text-gray-500 leading-snug flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-[1px]" />
              <span>
                Hastaneye kim gelmiş, hangi amaçla gelmiş ve kaydı kim açmış? Tarih aralığı seçip raporlayın.
              </span>
            </p>
          </div>

          {/* Sağ: CSV ve sıralama */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortAsc((s) => !s)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
              title="Tarih/saat’e göre sırala"
              type="button"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortAsc ? "Tarih Artan" : "Tarih Azalan"}
            </button>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
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
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                value={baslangicTarih}
                onChange={(e) => setBaslangicTarih(e.target.value)}
              />
              <CalendarDays className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                value={bitisTarih}
                onChange={(e) => setBitisTarih(e.target.value)}
              />
              <CalendarDays className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-1 flex items-end gap-2">
            <button
              className="w-full inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:bg-black active:scale-[0.99] transition"
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

          {/* Hızlı aralık butonları */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50"
              onClick={() => quickRange("today")}
            >
              Bugün
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50"
              onClick={() => quickRange("last7")}
            >
              Son 7 Gün
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50"
              onClick={() => quickRange("thisMonth")}
            >
              Bu Ay
            </button>
          </div>
        </form>
      </header>

      {/* MESAJ BLOĞU */}
      {mesaj && (
        <div className="px-6 pt-4">
          {mesajTip === "err" ? (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-rose-700">Rapor alınamadı</div>
                <div className="text-rose-700/90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-emerald-700">Rapor hazır</div>
                <div className="text-emerald-700/90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RAPOR TABLOSU / LİSTE */}
      <div className="px-6 pb-6 pt-4 flex-1 min-h-0">
        <div className="border border-gray-200 rounded-xl bg-white shadow-inner max-h-64 overflow-auto">
          {loading ? (
            <SkeletonList />
          ) : liste.length === 0 ? (
            // boş state
            <div className="flex flex-col items-center justify-center text-center py-10 px-6">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-sm font-medium text-gray-700">
                Henüz liste yok
              </div>
              <div className="text-[12px] text-gray-500 max-w-[240px] leading-snug">
                Tarih aralığı seçip “Raporu Getir” butonuna tıklayın.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {items.map((z) => (
                <li
                  key={z.ziyaretciId}
                  className="px-4 py-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    {/* SOL BLOK: ziyaretçi ve sebep */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                        <User2 className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-gray-900 leading-tight">
                          {z.adSoyad || "Ziyaretçi ?"}
                        </div>
                        <div className="text-[12px] text-gray-500 leading-snug">
                          {z.ziyaretSebebi || "Sebep yok"}
                        </div>
                      </div>
                    </div>

                    {/* SAĞ BLOK: saat / resepsiyonist / not */}
                    <div className="flex flex-col items-start md:items-end gap-1 text-sm shrink-0">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock4 className="w-4 h-4 text-gray-500" />
                        <span className="tabular-nums">
                          {fmtDateTime(z.ziyaretTarihiSaat)}
                        </span>
                      </div>

                      <div className="text-[12px] text-gray-500 leading-snug">
                        Not: <span className="text-gray-700">{z.notlar || "—"}</span>
                      </div>

                      <div className="text-[11px] text-gray-400 leading-none">
                        Kaydı Açan:{" "}
                        <span className="text-gray-600 font-medium">
                          {z.resepsiyonist?.adSoyad || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SAYFALAMA */}
        {liste.length > 0 && (
          <div className="mt-5 flex items-center justify-between text-sm">
            <div className="text-gray-500">
              Toplam <b>{total}</b> kayıt — Sayfa {pageSafe}/{totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe <= 1}
                type="button"
              >
                Önceki
              </button>
              <button
                className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
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

/* Skeleton loader */
function SkeletonList() {
  return (
    <ul className="space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="border border-gray-200 rounded-xl bg-white shadow-sm px-4 py-4"
        >
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
