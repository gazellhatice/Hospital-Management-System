import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { apiGet } from "../../api";
import {
  CalendarClock,
  Clock,
  User2,
  StickyNote,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* === küçük yardımcılar === */
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
function byTime(a, b) {
  const ta = `${a?.slot?.tarih || ""}T${a?.slot?.baslangicSaat || ""}`;
  const tb = `${b?.slot?.tarih || ""}T${b?.slot?.baslangicSaat || ""}`;
  if (ta === tb) return 0;
  return ta < tb ? -1 : 1;
}

export default function DoktorBugunkuRandevularCard() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [err, setErr] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const aktifDoktor = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("aktifDoktor") || "null"); }
    catch { return null; }
  }, []);

  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!aktifDoktor) {
      setMesaj("Doktor bilgisi bulunamadı. Giriş yapın.");
      return;
    }
    try {
      setErr("");
      setMesaj("");
      setLoading(true);
      const data = await apiGet(`/api/randevu/doktor/${aktifDoktor.doktorId}`);
      if (!isMounted.current) return;
      setRaw(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch {
      if (!isMounted.current) return;
      setErr("Randevular yüklenemedi. Daha sonra tekrar deneyin.");
      setRaw([]);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [aktifDoktor]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    // opsiyonel: her 60 sn'de bir arkaplanda tazele
    const t = setInterval(fetchData, 60000);
    return () => { isMounted.current = false; clearInterval(t); };
  }, [fetchData]);

  // yalnızca BUGÜN olanları al, saatine göre sırala
  const today = todayStr();
  const liste = useMemo(() => {
    const arr = (raw || []).filter(r => (r?.slot?.tarih || "") === today);
    arr.sort(byTime);
    return arr;
  }, [raw, today]);

  return (
    <section className="bg-white/70 backdrop-blur-md border border-sky-100 rounded-3xl shadow-[0_8px_40px_-8px_rgba(14,165,233,0.15)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_50px_-10px_rgba(14,165,233,0.25)]">
      {/* ÜST BAŞLIK */}
      <header className="px-6 py-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-700">
            <CalendarClock className="w-4 h-4" />
            <span>Bugünkü Randevular</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight mt-0.5">
            Randevu Planım
          </h2>
          <p className="text-[13px] text-slate-500">
            {today} tarihindeki planlanan/onaylı randevular
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[13px] font-medium text-slate-800">
            {aktifDoktor?.adSoyad || "—"}
          </span>
          <span className="text-[12px] text-slate-400">
            {aktifDoktor?.brans || aktifDoktor?.uzmanlik || "Branş bilgisi yok"}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-[12px] text-sky-700 hover:bg-sky-50 transition"
              title="Yenile (60 sn oto)"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </button>
            <span className="text-[11px] text-slate-400">
              {lastUpdated ? `Güncellendi: ${lastUpdated.toLocaleTimeString("tr-TR")}` : ""}
            </span>
          </div>
        </div>
      </header>

      {/* MESAJ / HATA */}
      {mesaj && (
        <div className="mx-6 mt-4 mb-2 rounded-xl border border-sky-200 bg-sky-50/70 text-sky-700 text-[13px] px-3 py-2 flex items-start gap-2 shadow-sm">
          <Activity className="w-4 h-4 mt-[1px]" />
          <span>{mesaj}</span>
        </div>
      )}
      {err && (
        <div className="mx-6 mt-4 mb-2 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-700 text-[13px] px-3 py-2 flex items-start gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 mt-[1px]" />
          <span>{err}</span>
        </div>
      )}

      {/* LİSTE */}
      <div className="mx-6 mb-6 mt-2">
        <div className="border border-sky-50 rounded-2xl bg-gradient-to-b from-white to-sky-50/30 shadow-inner overflow-hidden">
          {loading ? (
            <SkeletonList />
          ) : liste.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-sky-100/70">
              <AnimatePresence initial={false}>
                {liste.map((r, i) => (
                  <motion.li
                    key={r.randevuId}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="relative px-5 py-4 transition-all hover:bg-sky-50/80 group"
                  >
                    {/* timeline çizgisi */}
                    {i !== liste.length - 1 && (
                      <span className="absolute left-[22px] top-[56px] bottom-0 w-[2px] bg-sky-100" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Hasta avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-sky-100 border border-sky-200 text-sky-700 shadow-sm group-hover:scale-105 transition-transform">
                          <User2 className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Hasta bilgisi */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {r.hasta?.adSoyad || "Hasta ?"}
                          </h3>
                          <StatusBadge durum={r.randevuDurumu} />
                        </div>

                        <div className="mt-0.5 text-[12px] text-slate-500">
                          {r.hasta?.tcKimlikNo
                            ? `TC ${r.hasta.tcKimlikNo}`
                            : "Kimlik bilgisi yok"}
                        </div>

                        {/* Notlar */}
                        <div className="mt-2 flex items-start gap-2 text-[13px] text-slate-600">
                          <StickyNote className="w-4 h-4 text-slate-400 shrink-0 mt-[2px]" />
                          <p className="italic leading-snug line-clamp-2 break-words">
                            {r.notlar && r.notlar.trim() !== ""
                              ? r.notlar
                              : "Not eklenmemiş."}
                          </p>
                        </div>

                        {/* Saat bilgisi */}
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                          <Clock className="w-4 h-4 text-sky-500" />
                          <span className="tabular-nums">
                            {r.slot?.tarih || "—"} {r.slot?.baslangicSaat || "--:--"} -{" "}
                            {r.slot?.bitisSaat || "--:--"}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-auto">
                            ID #{r.randevuId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* küçük özet */}
        {!loading && (
          <div className="mt-3 text-[12px] text-slate-500">
            Bugün toplam <b>{liste.length}</b> randevu.
          </div>
        )}
      </div>
    </section>
  );
}

/* === RANDEVU DURUM BADGE === */
function StatusBadge({ durum }) {
  const normalized = (durum || "").toLowerCase();
  let bg = "bg-gray-100",
    text = "text-gray-700",
    border = "border-gray-200";

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
      {durum || "—"}
    </span>
  );
}

/* === boş/iskelet === */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-white border border-sky-200 flex items-center justify-center shadow-sm mb-3">
        <Clock className="w-6 h-6 text-sky-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">Bugün için randevu yok</p>
      <p className="text-[12px] text-slate-500 max-w-[260px]">
        Henüz planlanmış bir hasta ziyareti bulunmuyor.
      </p>
    </div>
  );
}
function SkeletonList() {
  return (
    <ul className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="border border-sky-100 rounded-xl bg-white shadow-sm px-4 py-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-sky-100/60 rounded w-1/3" />
            <div className="h-3 bg-sky-100/60 rounded w-2/3" />
            <div className="h-3 bg-sky-100/60 rounded w-full" />
            <div className="h-3 bg-sky-100/60 rounded w-4/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}
