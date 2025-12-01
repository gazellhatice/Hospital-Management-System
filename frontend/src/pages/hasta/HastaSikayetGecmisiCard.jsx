import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api";
import {
  MessageSquareWarning,
  User2,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Search,
  SortDesc,
  CalendarClock,
  RefreshCw,
} from "lucide-react";

export default function HastaSikayetGecmisiCard() {
  const [liste, setListe] = useState([]);
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "err" | "info" | ""
  const [loading, setLoading] = useState(false);

  // UI state
  const [q, setQ] = useState(""); // başlıkta arama
  const [statusTab, setStatusTab] = useState("all"); // all | acik | incele | cozuldu
  const [sortNewFirst, setSortNewFirst] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const aktifHasta = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifHasta") || "null");
    } catch {
      return null;
    }
  }, []);

  async function yukle() {
    if (!aktifHasta?.hastaId) {
      setMesaj("Hasta bilgisi bulunamadı. Giriş yapın.");
      setMesajTip("err");
      setListe([]);
      return;
    }
    let canceled = false;
    try {
      setLoading(true);
      setMesaj("");
      setMesajTip("");

      const data = await apiGet(`/api/sikayet/hasta/${aktifHasta.hastaId}`);
      if (canceled) return;

      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      setListe(arr);

      if (!arr.length) {
        setMesaj("Henüz bir şikayet kaydınız yok.");
        setMesajTip("info");
      }
    } catch (err) {
      const code = err?.response?.status;
      if (code === 401 || code === 403) {
        setMesaj("Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.");
      } else {
        setMesaj("Şikayet geçmişi yüklenemedi.");
      }
      setMesajTip("err");
      setListe([]);
    } finally {
      setLoading(false);
    }
    return () => {
      canceled = true;
    };
  }

  useEffect(() => {
    yukle();
    // sadece hastaId değişince tekrar çek
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktifHasta?.hastaId]);

  // ---- helpers ----
  function normStatus(s) {
    const t = (s || "").toLowerCase();
    if (t.includes("acik") || t.includes("açık") || t.includes("alındı") || t.includes("kaydedildi"))
      return "acik";
    if (t.includes("incele") || t.includes("değerlendir") || t.includes("degerlendir"))
      return "incele";
    if (t.includes("kapandi") || t.includes("kapandı") || t.includes("çözüldü") || t.includes("cozuldu"))
      return "cozuldu";
    return "diger";
  }

  function parseDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  const counts = useMemo(() => {
    const c = { all: liste.length, acik: 0, incele: 0, cozuldu: 0 };
    liste.forEach((x) => {
      const k = normStatus(x.durum);
      if (k === "acik") c.acik++;
      else if (k === "incele") c.incele++;
      else if (k === "cozuldu") c.cozuldu++;
    });
    return c;
  }, [liste]);

  const filtered = useMemo(() => {
    let arr = [...liste];

    if (statusTab !== "all") {
      arr = arr.filter((x) => normStatus(x.durum) === statusTab);
    }

    const qq = q.trim().toLowerCase();
    if (qq) {
      arr = arr.filter((x) => (x.baslik || "").toLowerCase().includes(qq));
    }

    arr.sort((a, b) => {
      const da = parseDate(a.olusturulmaZamani) || new Date(0);
      const db = parseDate(b.olusturulmaZamani) || new Date(0);
      return sortNewFirst ? db - da : da - db;
    });

    return arr;
  }, [liste, q, statusTab, sortNewFirst]);

  return (
    <section className="bg-white/70 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-[0_8px_40px_-8px_rgba(16,185,129,0.18)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_50px_-10px_rgba(16,185,129,0.28)]">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          {/* sol */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
              <ClipboardList className="w-4 h-4" />
              <span>Şikayet Geçmişim</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 leading-tight">Takip Durumu</h2>
            <p className="text-[13px] text-slate-600">Gönderdiğiniz şikayetler ve yönetimin yanıtları.</p>
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
              {aktifHasta?.tcKimlikNo ? `TC ${aktifHasta.tcKimlikNo}` : "Kimlik doğrulanmadı"}
            </div>
          </div>
        </div>

        {/* filtre-ara-sırala */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Tab active={statusTab === "all"} onClick={() => setStatusTab("all")} label={`Tümü (${counts.all})`} />
            <Tab active={statusTab === "acik"} onClick={() => setStatusTab("acik")} color="amber" label={`Alındı/Açık (${counts.acik})`} />
            <Tab active={statusTab === "incele"} onClick={() => setStatusTab("incele")} color="sky" label={`İnceleniyor (${counts.incele})`} />
            <Tab active={statusTab === "cozuldu"} onClick={() => setStatusTab("cozuldu")} color="emerald" label={`Çözüldü (${counts.cozuldu})`} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Başlığa göre ara…"
                className="w-64 rounded-lg border border-emerald-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              onClick={() => setSortNewFirst((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-[12px] text-emerald-700 hover:bg-emerald-100 transition"
              title="Yeni→Eski / Eski→Yeni sırala"
            >
              <SortDesc className="w-4 h-4" />
              {sortNewFirst ? "Yeni → Eski" : "Eski → Yeni"}
            </button>

            <button
              type="button"
              onClick={yukle}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition"
              title="Yenile"
            >
              <RefreshCw className="w-4 h-4" />
              Yenile
            </button>
          </div>
        </div>

        {/* mesajlar */}
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
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">Bilgilendirme</div>
                  <div className="opacity-90">{mesaj}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* CONTENT */}
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
            <ul className="divide-y divide-emerald-100/70">
              {filtered.map((s) => {
                const isOpen = expanded === s.sikayetId;
                return (
                  <li key={s.sikayetId} className="relative px-5 py-4 hover:bg-emerald-50/70 transition">
                    <div className="flex items-start justify-between gap-3">
                      {/* sol: başlık + zaman */}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 leading-snug break-words">
                          {s.baslik || "Başlık yok"}
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span>{formatDateTime(s.olusturulmaZamani)}</span>
                        </div>
                      </div>

                      {/* sağ: durum + expand */}
                      <div className="flex items-center gap-2 shrink-0">
                        <DurumBadge durum={s.durum} />
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : s.sikayetId)}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[12px] text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          {isOpen ? (
                            <>
                              {/* ChevronUp */}▲ Kapat
                            </>
                          ) : (
                            <>
                              {/* ChevronDown */}▼ Detay
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* detay */}
                    {isOpen && (
                      <div className="mt-3 rounded-xl border border-emerald-100 bg-white/60 shadow-sm p-3 text-[13px] text-slate-800">
                        <div className="mb-2 text-[12px] font-semibold text-slate-600">Şikayet Metni</div>
                        <div className="whitespace-pre-line break-words">
                          {s.icerik?.trim() ? s.icerik : "Detay verilmedi."}
                        </div>

                        {s.mudurNotu?.trim() && (
                          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
                            <div className="text-[12px] font-medium text-emerald-700 uppercase tracking-wide flex items-center gap-2 mb-1">
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Müdür Notu</span>
                            </div>
                            <div className="text-slate-800 break-words">{s.mudurNotu}</div>
                          </div>
                        )}

                        <div className="mt-2 text-[11px] text-slate-400">Kayıt #{s.sikayetId}</div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* --- küçük bileşenler --- */

function Tab({ active, onClick, label, color = "slate" }) {
  const colors =
    {
      slate: "border-slate-200 text-slate-700 hover:bg-slate-100",
      amber: "border-amber-200 text-amber-700 hover:bg-amber-100",
      sky: "border-sky-200 text-sky-700 hover:bg-sky-100",
      emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    }[color] || "border-slate-200 text-slate-700 hover:bg-slate-100";

  const activeCls = active ? "bg-white border shadow-sm" : "bg-emerald-50/60";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition border ${colors} ${activeCls}`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-12 h-12 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center mb-3">
        <MessageSquareWarning className="w-6 h-6 text-emerald-500" />
      </div>
      <div className="text-sm font-medium text-slate-700">Henüz bir şikayet kaydınız yok</div>
      <div className="text-[12px] text-slate-500 max-w-[280px] leading-snug mt-1">
        Yaşadığınız bir sorun varsa “Şikayet Oluştur” alanından yönetimle paylaşabilirsiniz.
      </div>
    </div>
  );
}

function DurumBadge({ durum }) {
  const normalized = (durum || "").toLowerCase();
  let bg = "bg-gray-100",
    text = "text-gray-700",
    border = "border-gray-200",
    label = durum || "—";

  if (normalized.includes("acik") || normalized.includes("açık") || normalized.includes("alındı") || normalized.includes("kaydedildi")) {
    bg = "bg-amber-50";
    text = "text-amber-700";
    border = "border-amber-200";
    if (!durum) label = "Alındı";
  } else if (normalized.includes("incele") || normalized.includes("değerlendir") || normalized.includes("degerlendir")) {
    bg = "bg-sky-50";
    text = "text-sky-700";
    border = "border-sky-200";
    if (!durum) label = "İnceleniyor";
  } else if (normalized.includes("kapandi") || normalized.includes("kapandı") || normalized.includes("çözüldü") || normalized.includes("cozuldu")) {
    bg = "bg-emerald-50";
    text = "text-emerald-700";
    border = "border-emerald-200";
    if (!durum) label = "Çözüldü";
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

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}
