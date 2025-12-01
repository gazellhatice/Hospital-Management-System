import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPut } from "../../api";
import {
  ClipboardList,
  ShieldAlert,
  Filter,
  Search,
  User2,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  Hourglass,
  CheckCheck,
  Loader2,
  X,
  RefreshCw,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------------------------- utils --------------------------------- */
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

/* ========================= MudurSikayetYonetimiCard ======================== */
export default function MudurSikayetYonetimiCard() {
  const [sikayetler, setSikayetler] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err" | ""

  const [seciliDurum, setSeciliDurum] = useState(""); // ACILDI | INCELEMEDE | COZUMLENDI | ""
  const [arama, setArama] = useState("");
  const dArama = useDebouncedValue(arama, 400);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalId, setModalId] = useState(null);
  const [modalTargetDurum, setModalTargetDurum] = useState("");
  const [modalNot, setModalNot] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // refs for focus management
  const searchRef = useRef(null);
  const modalTextareaRef = useRef(null);

  async function yukle() {
    try {
      setLoading(true);
      setMesaj("");
      setMesajTip("");
      const params = [];
      if (seciliDurum) params.push(`durum=${encodeURIComponent(seciliDurum)}`);
      if (dArama) params.push(`q=${encodeURIComponent(dArama)}`);
      const qs = params.length ? `?${params.join("&")}` : "";
      const data = await apiGet("/api/sikayet/mudur/liste" + qs);
      setSikayetler(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message || "Şikayetler yüklenemedi.";
      setMesaj(serverMsg);
      setMesajTip("err");
      setSikayetler([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    yukle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seciliDurum, dArama]);

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      // Ctrl/Cmd + K => focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Esc => close modal
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // counts for quick chips (client)
  const counts = useMemo(() => {
    const c = { all: 0, ACILDI: 0, INCELEMEDE: 0, COZUMLENDI: 0 };
    c.all = sikayetler.length;
    for (const s of sikayetler) {
      const d = (s.durum || "").toUpperCase();
      if (c[d] !== undefined) c[d]++;
    }
    return c;
  }, [sikayetler]);

  function openModal(sikayetId, hedefDurum) {
    setModalId(sikayetId);
    setModalTargetDurum(hedefDurum);
    setModalNot("");
    setModalOpen(true);
    setTimeout(() => modalTextareaRef.current?.focus(), 10);
  }

  async function onConfirmModal() {
    if (!modalId || !modalTargetDurum) return;
    setModalLoading(true);
    setMesaj("");
    setMesajTip("");

    // optimistic update
    const prev = sikayetler.slice();
    const idx = prev.findIndex((x) => x.sikayetId === modalId);
    if (idx !== -1) {
      const draft = prev.slice();
      draft[idx] = {
        ...draft[idx],
        durum: modalTargetDurum,
        mudurNotu: modalNot || draft[idx].mudurNotu,
      };
      setSikayetler(draft);
    }

    try {
      await apiPut("/api/sikayet/mudur/guncelle", {
        sikayetId: modalId,
        yeniDurum: modalTargetDurum,
        mudurNotu: modalNot || "",
      });
      setMesaj("Şikayet durumu güncellendi.");
      setMesajTip("ok");
      setModalOpen(false);
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message || "Güncelleme başarısız.";
      setMesaj(serverMsg);
      setMesajTip("err");
      // revert
      yukle();
    } finally {
      setModalLoading(false);
    }
  }

  // pagination slice
  const total = sikayetler.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const items = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sikayetler.slice(start, start + pageSize);
  }, [sikayetler, pageSafe]);

  // export CSV (client side)
  function exportCsv() {
    const headers = [
      "sikayetId",
      "hasta",
      "baslik",
      "icerik",
      "durum",
      "mudurNotu",
    ];
    const rows = sikayetler.map((s) => [
      s.sikayetId,
      s.hasta?.adSoyad || "",
      cleanCsv(s.baslik),
      cleanCsv(s.icerik),
      s.durum || "",
      cleanCsv(s.mudurNotu || ""),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sikayetler_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function cleanCsv(text) {
    const t = String(text ?? "").replaceAll("\n", " ").replaceAll("\r", " ");
    if (t.includes(",") || t.includes('"')) {
      return `"${t.replaceAll('"', '""')}"`;
    }
    return t;
  }

  return (
    <section className="w-full h-full bg-slate-950/70 backdrop-blur-xl border border-slate-800/70 rounded-3xl shadow-[0_24px_80px_-16px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col lg:col-span-3">
      {/* HEADER / TOOLBAR */}
      <header className="px-6 py-5 border-b border-slate-800/70 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/70 sticky top-0 z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Left */}
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-sky-300/90">
              <ClipboardList className="w-4 h-4 text-sky-300" />
              <span>Şikayet Yönetimi</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-50 leading-tight">
              Hasta Şikayetleri
            </h2>
            <p className="text-[12px] text-slate-400 leading-snug flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-[1px]" />
              <span>
                Durum değiştirirken kısa bir yönetim notu bırakmanız önerilir.
              </span>
            </p>
          </div>

          {/* Right: filters */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={seciliDurum === ""}
                label={`Hepsi (${counts.all})`}
                onClick={() => setSeciliDurum("")}
              />
              <FilterChip
                tone="red"
                active={seciliDurum === "ACILDI"}
                label={`Açıldı (${counts.ACILDI})`}
                onClick={() => setSeciliDurum("ACILDI")}
              />
              <FilterChip
                tone="amber"
                active={seciliDurum === "INCELEMEDE"}
                label={`İncelemede (${counts.INCELEMEDE})`}
                onClick={() => setSeciliDurum("INCELEMEDE")}
              />
              <FilterChip
                tone="emerald"
                active={seciliDurum === "COZUMLENDI"}
                label={`Çözümlendi (${counts.COZUMLENDI})`}
                onClick={() => setSeciliDurum("COZUMLENDI")}
              />
            </div>

            {/* Search */}
            <div className="min-w-[260px]">
              <label className="text-[12px] font-medium text-slate-300 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                Başlık / içerik arama{" "}
                <span className="text-slate-500">(Ctrl/⌘+K)</span>
              </label>
              <div className="mt-1 relative">
                <input
                  ref={searchRef}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-9 py-2.5 text-sm text-slate-50 shadow-sm outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70 transition"
                  placeholder="Örn: bekleme, ilgi, iletişim…"
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                  aria-label="Şikayet arama"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {arama ? (
                  <button
                    type="button"
                    aria-label="Aramayı temizle"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-800"
                    onClick={() => setArama("")}
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={yukle}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-[12px] font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-900 hover:shadow-sm transition"
              >
                <RefreshCw className="w-4 h-4" /> Yenile
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-[12px] font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-900 hover:shadow-sm transition"
              >
                <Download className="w-4 h-4" /> Dışa Aktar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* GLOBAL MESSAGE */}
      <AnimatePresence initial={false}>
        {mesaj && (
          <motion.div
            key="banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="px-6 pt-4"
          >
            {mesajTip === "ok" ? (
              <Banner tone="emerald" title="Başarılı" text={mesaj} />
            ) : (
              <Banner tone="rose" title="Hata oluştu" text={mesaj} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BODY */}
      <div className="px-6 pb-6 pt-4 flex-1 min-h-0">
        {loading ? (
          <SkeletonList />
        ) : sikayetler.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((s) => (
                <li
                  key={s.sikayetId}
                  className="border border-slate-800 rounded-xl bg-slate-950/70 shadow-[0_16px_50px_-20px_rgba(0,0,0,0.9)] hover:border-slate-600 hover:shadow-[0_18px_60px_-18px_rgba(0,0,0,1)] transition-shadow px-4 py-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left: hasta + içerik */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 text-slate-200 border border-slate-700 shadow-sm">
                          <User2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-slate-50 leading-snug">
                            {s.baslik || "Başlık yok"}
                          </div>
                          <div className="text-[12px] text-slate-400 leading-none">
                            Hasta: {s.hasta?.adSoyad || "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-[13px] text-slate-200 leading-snug break-words">
                        {s.icerik?.trim() ? (
                          s.icerik
                        ) : (
                          <em className="text-slate-500">Detay verilmemiş.</em>
                        )}
                      </div>

                      {s.mudurNotu?.trim() ? (
                        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-[13px] leading-snug">
                          <div className="text-[11px] font-medium uppercase tracking-wide flex items-center gap-2 mb-1 text-slate-400">
                            <ShieldAlert className="w-3.5 h-3.5 text-slate-200" />
                            <span>Müdür Notu</span>
                          </div>
                          <div className="text-slate-100 break-words">
                            {s.mudurNotu}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
                        <DurumBadge durum={s.durum} />
                        <span className="text-slate-500">#{s.sikayetId}</span>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col items-stretch gap-2 min-w-[190px]">
                      <button
                        onClick={() => openModal(s.sikayetId, "INCELEMEDE")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 text-amber-300 text-[12px] font-semibold px-3 py-2 border border-amber-400/60 hover:bg-amber-400/15 hover:border-amber-300 transition"
                      >
                        <Hourglass className="w-3.5 h-3.5" />
                        <span>İncelemede</span>
                      </button>
                      <button
                        onClick={() => openModal(s.sikayetId, "COZUMLENDI")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 text-emerald-300 text-[12px] font-semibold px-3 py-2 border border-emerald-400/60 hover:bg-emerald-400/15 hover:border-emerald-300 transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Çözümlendi</span>
                      </button>
                      <div className="text-[11px] text-slate-500 text-center leading-snug mt-1">
                        Son durum:{" "}
                        <span className="font-medium text-slate-200">
                          {s.durum || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
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
                >
                  Önceki
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-900 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
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

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
            aria-modal
            role="dialog"
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-slate-950/95 shadow-[0_24px_80px_rgba(0,0,0,0.85)] border border-slate-800 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="text-sm font-semibold text-slate-50">
                  Yönetim Notu Ekle
                </div>
                <button
                  className="p-1 rounded-md hover:bg-slate-800"
                  onClick={() => setModalOpen(false)}
                  disabled={modalLoading}
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="text-[13px] text-slate-300 mb-2">
                  Bu işlemde şikayetin durumu{" "}
                  <b className="text-slate-50">
                    {modalTargetDurum === "INCELEMEDE"
                      ? "İNCELEMEDE"
                      : "ÇÖZÜMLENDİ"}
                  </b>{" "}
                  olarak güncellenecek.
                </div>
                <label className="block text-[12px] font-medium text-slate-200 mb-1">
                  Müdür Notu (opsiyonel)
                </label>
                <textarea
                  ref={modalTextareaRef}
                  rows={4}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-50 shadow-sm outline-none resize-y placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500/70 transition"
                  placeholder="Kısa bir açıklama ekleyebilirsiniz…"
                  value={modalNot}
                  onChange={(e) => setModalNot(e.target.value)}
                  disabled={modalLoading}
                />
              </div>

              <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/80">
                <button
                  className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-100 hover:bg-slate-900 hover:border-slate-500 transition"
                  onClick={() => setModalOpen(false)}
                  disabled={modalLoading}
                >
                  Vazgeç
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 text-white text-sm font-semibold shadow-[0_12px_32px_rgba(56,189,248,0.55)] hover:bg-sky-400 active:scale-[0.99] transition disabled:opacity-60"
                  onClick={onConfirmModal}
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Onayla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* --------------------------------- helpers -------------------------------- */
function Banner({ tone = "emerald", title, text }) {
  const map = {
    emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  };
  return (
    <div
      className={classNames(
        "flex items-start gap-3 rounded-lg px-4 py-3 text-[13px] shadow-sm border",
        map[tone]
      )}
    >
      {tone === "emerald" ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
      ) : (
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
      )}
      <div className="leading-snug">
        <div className="font-semibold">{title}</div>
        <div className="opacity-90">{text}</div>
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, tone = "slate" }) {
  const tones = {
    slate:
      "text-slate-200 bg-slate-900/70 border-slate-700 hover:bg-slate-900 hover:border-slate-500",
    red: "text-red-200 bg-red-900/40 border-red-700 hover:bg-red-900/60 hover:border-red-500",
    amber:
      "text-amber-200 bg-amber-900/40 border-amber-700 hover:bg-amber-900/60 hover:border-amber-500",
    emerald:
      "text-emerald-200 bg-emerald-900/40 border-emerald-700 hover:bg-emerald-900/60 hover:border-emerald-500",
  };
  const activeCls = active ? "ring-2 ring-offset-0 ring-sky-500" : "";
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "text-[12px] font-medium px-3 py-1.5 rounded-full border transition",
        tones[tone],
        activeCls
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function DurumBadge({ durum }) {
  const normalized = (durum || "").toLowerCase();

  let bg = "bg-slate-900/60";
  let text = "text-slate-200";
  let border = "border-slate-600";
  let icon = <CheckCircle className="w-3.5 h-3.5" />;
  let label = durum || "—";

  if (normalized.includes("acil") || normalized.includes("açıl")) {
    bg = "bg-red-900/40";
    text = "text-red-200";
    border = "border-red-600";
    icon = <AlertTriangle className="w-3.5 h-3.5" />;
    if (!durum) label = "Açıldı";
  } else if (normalized.includes("incele")) {
    bg = "bg-amber-900/40";
    text = "text-amber-200";
    border = "border-amber-600";
    icon = <Hourglass className="w-3.5 h-3.5" />;
    if (!durum) label = "İncelemede";
  } else if (
    normalized.includes("cozum") ||
    normalized.includes("çözüm") ||
    normalized.includes("çözümlen") ||
    normalized.includes("cozumlen")
  ) {
    bg = "bg-emerald-900/40";
    text = "text-emerald-200";
    border = "border-emerald-600";
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    if (!durum) label = "Çözümlendi";
  }

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap",
        bg,
        text,
        border
      )}
    >
      {icon}
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-950/60 py-10 px-6 text-center shadow-inner">
      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 shadow-sm flex items-center justify-center mb-3 mx-auto">
        <ClipboardList className="w-5 h-5 text-slate-400" />
      </div>
      <div className="text-sm font-medium text-slate-100">
        Şikayet bulunamadı
      </div>
      <div className="text-[12px] text-slate-400 max-w-[280px] leading-snug mx-auto">
        Seçtiğiniz filtre veya arama ile eşleşen kayıt yok.
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
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
