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
} from "lucide-react";

/* Basit debounce helper */
function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function MudurSikayetYonetimiCard() {
  const [sikayetler, setSikayetler] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err" | ""

  const [seciliDurum, setSeciliDurum] = useState(""); // filtre (ACILDI | INCELEMEDE | COZUMLENDI | "")
  const [arama, setArama] = useState("");
  const dArama = useDebouncedValue(arama, 400);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalId, setModalId] = useState(null);
  const [modalTargetDurum, setModalTargetDurum] = useState("");
  const [modalNot, setModalNot] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // pagination (client-side)
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
      setMesaj("Şikayetler yüklenemedi.");
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

  function openModal(sikayetId, hedefDurum) {
    setModalId(sikayetId);
    setModalTargetDurum(hedefDurum);
    setModalNot("");
    setModalOpen(true);
  }

  async function onConfirmModal() {
    if (!modalId || !modalTargetDurum) return;
    setModalLoading(true);
    setMesaj("");
    setMesajTip("");

    // İyimser güncelleme için eski listeyi sakla
    const prev = sikayetler.slice();
    const idx = prev.findIndex((x) => x.sikayetId === modalId);
    if (idx !== -1) {
      const draft = prev.slice();
      draft[idx] = { ...draft[idx], durum: modalTargetDurum, mudurNotu: modalNot || draft[idx].mudurNotu };
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
      // geri al
      setSikayetler(prev);
      setMesaj("Güncelleme başarısız.");
      setMesajTip("err");
    } finally {
      setModalLoading(false);
    }
  }

  // sayfalama hesapları
  const total = sikayetler.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const items = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sikayetler.slice(start, start + pageSize);
  }, [sikayetler, pageSafe]);

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-[0_20px_48px_-6px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
      {/* HEADER / TOOLBAR */}
      <header className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          {/* Left: title & desc */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
              <ClipboardList className="w-4 h-4 text-gray-700" />
              <span>Şikayet Yönetimi</span>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                Hasta Şikayetleri
              </h2>
              <p className="text-[13px] text-gray-500 leading-snug flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-[1px]" />
                <span>
                  Hastaların ilettiği tüm kayıtlar burada. Durum değiştirirken
                  yönetim notu bırakmanız önerilir.
                </span>
              </p>
            </div>
          </div>

          {/* Right: filters */}
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex flex-col text-sm min-w-[200px]">
              <label className="text-[12px] font-medium text-gray-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                Duruma göre filtre
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                value={seciliDurum}
                onChange={(e) => setSeciliDurum(e.target.value)}
              >
                <option value="">Hepsi</option>
                <option value="ACILDI">AÇILDI</option>
                <option value="INCELEMEDE">İNCELEMEDE</option>
                <option value="COZUMLENDI">ÇÖZÜMLENDİ</option>
              </select>
            </div>

            <div className="flex flex-col text-sm min-w-[260px]">
              <label className="text-[12px] font-medium text-gray-600 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-gray-500" />
                Başlık / içerik arama
              </label>
              <div className="mt-1 relative">
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-9 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                  placeholder="Örn: bekleme, ilgi, iletişim..."
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {arama ? (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100"
                    onClick={() => setArama("")}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GLOBAL MESSAGE */}
      {mesaj && (
        <div className="px-6 pt-4">
          {mesajTip === "ok" ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-emerald-700">Başarılı</div>
                <div className="text-emerald-700/90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-rose-700">Hata oluştu</div>
                <div className="text-rose-700/90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BODY */}
      <div className="px-6 pb-6 pt-4 flex-1 min-h-0">
        {loading ? (
          <SkeletonList />
        ) : sikayetler.length === 0 ? (
          <div className="border border-gray-200 rounded-xl bg-white/70 py-10 px-6 text-center shadow-inner">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center mb-3 mx-auto">
              <ClipboardList className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-sm font-medium text-gray-700">
              Şikayet bulunamadı
            </div>
            <div className="text-[12px] text-gray-500 max-w-[260px] leading-snug mx-auto">
              Seçtiğiniz filtre/aramaya göre sonuç yok.
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {items.map((s) => (
                <li
                  key={s.sikayetId}
                  className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow px-4 py-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* SOL: hasta + içerik */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                          <User2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-gray-900 leading-snug">
                            {s.baslik || "Başlık yok"}
                          </div>
                          <div className="text-[12px] text-gray-500 leading-none">
                            Hasta: {s.hasta?.adSoyad || "?"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-[13px] text-gray-600 leading-snug italic break-words">
                        {s.icerik && s.icerik.trim() !== ""
                          ? s.icerik
                          : "Detay verilmemiş."}
                      </div>

                      {s.mudurNotu && s.mudurNotu.trim() !== "" && (
                        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] leading-snug">
                          <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-gray-700" />
                            <span>Müdür Notu</span>
                          </div>
                          <div className="text-gray-800 break-words">
                            {s.mudurNotu}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
                        <DurumBadge durum={s.durum} />
                        <span className="text-gray-400">#{s.sikayetId}</span>
                      </div>
                    </div>

                    {/* SAĞ: aksiyonlar */}
                    <div className="flex flex-col items-stretch gap-2 min-w-[180px]">
                      <button
                        onClick={() => openModal(s.sikayetId, "INCELEMEDE")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-100 text-amber-800 text-[12px] font-semibold px-3 py-2 border border-amber-200 hover:bg-amber-200/60 hover:border-amber-300 transition"
                      >
                        <Hourglass className="w-3.5 h-3.5" />
                        <span>İncelemede</span>
                      </button>

                      <button
                        onClick={() => openModal(s.sikayetId, "COZUMLENDI")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-100 text-emerald-800 text-[12px] font-semibold px-3 py-2 border border-emerald-200 hover:bg-emerald-200/60 hover:border-emerald-300 transition"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Çözümlendi</span>
                      </button>

                      <div className="text-[11px] text-gray-400 text-center leading-snug mt-1">
                        Son durum:{" "}
                        <span className="font-medium text-gray-600">
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

      {/* Modal: Müdür Notu */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">
                Yönetim Notu Ekle
              </div>
              <button
                className="p-1 rounded-md hover:bg-gray-100"
                onClick={() => setModalOpen(false)}
                disabled={modalLoading}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="text-[13px] text-gray-600 mb-2">
                Bu işlemde şikayetin durumu{" "}
                <b>
                  {modalTargetDurum === "INCELEMEDE"
                    ? "İNCELEMEDE"
                    : "ÇÖZÜMLENDİ"}
                </b>{" "}
                olarak güncellenecek.
              </div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Müdür Notu (opsiyonel)
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none resize-y placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
                placeholder="Kısa bir açıklama ekleyebilirsiniz…"
                value={modalNot}
                onChange={(e) => setModalNot(e.target.value)}
                disabled={modalLoading}
              />
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                className="px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                onClick={() => setModalOpen(false)}
                disabled={modalLoading}
              >
                Vazgeç
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold shadow hover:bg-black active:scale-[0.99] transition disabled:opacity-60"
                onClick={onConfirmModal}
                disabled={modalLoading}
              >
                {modalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* Şikayet Durum Badge - yönetici için net renk kodu */
function DurumBadge({ durum }) {
  const normalized = (durum || "").toLowerCase();

  let bg = "bg-gray-100";
  let text = "text-gray-700";
  let border = "border-gray-300";
  let icon = <CheckCircle className="w-3.5 h-3.5" />;
  let label = durum || "—";

  if (normalized.includes("acil") || normalized.includes("açıl")) {
    bg = "bg-red-50";
    text = "text-red-700";
    border = "border-red-200";
    icon = <AlertTriangle className="w-3.5 h-3.5" />;
    if (!durum) label = "Açıldı";
  } else if (normalized.includes("incele")) {
    bg = "bg-amber-50";
    text = "text-amber-700";
    border = "border-amber-200";
    icon = <Hourglass className="w-3.5 h-3.5" />;
    if (!durum) label = "İncelemede";
  } else if (
    normalized.includes("cozum") ||
    normalized.includes("çözüm") ||
    normalized.includes("çözümlen") ||
    normalized.includes("cozumlen")
  ) {
    bg = "bg-emerald-50";
    text = "text-emerald-700";
    border = "border-emerald-200";
    icon = <CheckCircle2 className="w-3.5 h-3.5" />;
    if (!durum) label = "Çözümlendi";
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

/* Skeleton loader */
function SkeletonList() {
  return (
    <ul className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
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
