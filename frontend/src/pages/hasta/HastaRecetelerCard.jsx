import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../../api";
import {
  Pill,
  User2,
  CalendarClock,
  FileText,
  AlertTriangle,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function HastaRecetelerCard() {
  const [liste, setListe] = useState([]);
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(null);

  const aktifHasta = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifHasta") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const hastaId = aktifHasta && aktifHasta.hastaId;
    if (!hastaId) {
      setMesaj("Hasta bilgisi bulunamadı. Lütfen giriş yapın.");
      setMesajTip("err");
      setListe([]);
      return;
    }

    let iptal = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiGet(`/api/recete/hasta/${hastaId}`);
        if (iptal) return;
        const arr = Array.isArray(data) ? data : [];
        setListe(arr);
        if (arr.length === 0) {
          setMesaj("Kayıtlı reçeteniz bulunmuyor.");
          setMesajTip("info");
        } else {
          setMesaj("");
          setMesajTip("");
        }
      } catch (e) {
        if (iptal) return;
        console.error("Recete fetch error:", e);
        setMesaj("Reçeteler yüklenemedi.");
        setMesajTip("err");
        setListe([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      iptal = true;
    };
  }, [aktifHasta && aktifHasta.hastaId]);

  const fTarih = (iso) => {
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
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return liste;
    return liste.filter(
      (r) =>
        (r.doktorAdSoyad || "").toLowerCase().includes(qq) ||
        (r.ilacListesi || "").toLowerCase().includes(qq)
    );
  }, [q, liste]);

  return (
    <section className="bg-white/70 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-[0_8px_40px_-8px_rgba(16,185,129,0.2)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_50px_-10px_rgba(16,185,129,0.28)]">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
            <Pill className="w-4 h-4" />
            <span>Reçetelerim</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight">
            Doktor Tarafından Yazılan İlaçlarınız
          </h2>
          <p className="text-[13px] text-slate-600 flex items-start gap-1">
            <FileText className="w-3.5 h-3.5 text-emerald-500 mt-[2px]" />
            <span>Kullanım talimatlarını dikkatle okuyun.</span>
          </p>
        </div>

        {/* Hasta bilgisi */}
        <div className="sm:text-right flex flex-col items-start sm:items-end">
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
      </header>

      {/* Search */}
      <div className="px-6 pt-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Doktor veya ilaç adına göre ara…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-emerald-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
          <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* MESAJ */}
      {mesaj && (
        <div className="px-6 pt-4">
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
            <ul className="divide-y divide-emerald-100/70">
              {filtered.map((rec) => {
                const isOpen = expanded === rec.receteId;
                return (
                  <li
                    key={rec.receteId}
                    className="relative px-5 py-4 hover:bg-emerald-50/70 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 shadow-sm">
                            <User2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {rec.doktorAdSoyad || "Doktor bilgisi yok"}
                            </div>
                            <div className="text-[12px] text-slate-500">
                              {fTarih(rec.olusturulmaZamani)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(isOpen ? null : rec.receteId)
                        }
                        className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1.5 text-[12px] text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1"
                      >
                        {isOpen ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" /> Kapat
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" /> Detay
                          </>
                        )}
                      </button>
                    </div>

                    {/* collapse alanı */}
                    {isOpen && (
                      <div className="mt-3 ml-11 rounded-xl border border-emerald-100 bg-white/60 shadow-sm p-3 text-[13px] text-slate-800">
                        <div className="mb-2 text-[12px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5" />
                          İlaç Listesi
                        </div>
                        <div className="whitespace-pre-line break-words leading-snug mb-3">
                          {rec.ilacListesi || "—"}
                        </div>

                        <div className="text-[12px] text-slate-600 italic">
                          {rec.aciklama?.trim()
                            ? rec.aciklama
                            : "Açıklama yok"}
                        </div>

                        <div className="mt-2 text-[11px] text-slate-400">
                          Reçete #{rec.receteId}
                        </div>
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

/* boş state */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-12 h-12 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center mb-3">
        <Pill className="w-6 h-6 text-emerald-500" />
      </div>
      <div className="text-sm font-medium text-slate-700">
        Kayıtlı reçeteniz bulunmuyor
      </div>
      <div className="text-[12px] text-slate-500 max-w-[280px] leading-snug mt-1">
        Muayene sonrası yazılan reçeteler burada listelenecek.
      </div>
    </div>
  );
}
