import { useMemo, useState } from "react";
import { apiPost } from "../../api";
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User2,
  Info,
  Wand2,
} from "lucide-react";

export default function DoktorSlotAcForm() {
  const [tarih, setTarih] = useState("");
  const [baslangic, setBaslangic] = useState("");
  const [bitis, setBitis] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err" | ""
  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  const aktifDoktor = JSON.parse(localStorage.getItem("aktifDoktor") || "null");

  // --- Bugünün tarihi ---
  const today = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, []);

  // --- Süre Hesaplama ---
  const durationText = useMemo(() => {
    if (!baslangic || !bitis) return "—";
    const [sh, sm] = baslangic.split(":").map(Number);
    const [eh, em] = bitis.split(":").map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    if (isNaN(mins) || mins <= 0) return "Geçersiz aralık";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h} sa ${m} dk`;
    if (h > 0) return `${h} saat`;
    return `${m} dk`;
  }, [baslangic, bitis]);

  // --- Hızlı Bitiş Ayarlama ---
  function setEndByDelta(mins = 30) {
    if (!baslangic) return;
    const [h, m] = baslangic.split(":").map(Number);
    const tot = h * 60 + m + mins;
    const nh = Math.floor(tot / 60);
    const nm = tot % 60;
    setBitis(`${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`);
  }

  // --- Hazır Zaman Aralıkları ---
  function applyPreset(range) {
    if (!tarih) setTarih(today);
    if (range === "am") {
      setBaslangic("09:00");
      setBitis("12:00");
    } else if (range === "pm") {
      setBaslangic("13:00");
      setBitis("17:00");
    }
  }

  // --- Form Validasyonu ---
  function validate() {
    const next = {};
    if (!tarih) next.tarih = "Tarih boş olamaz.";
    if (!baslangic) next.baslangic = "Başlangıç saati gerekli.";
    if (!bitis) next.bitis = "Bitiş saati gerekli.";
    if (baslangic && bitis && baslangic >= bitis) {
      next.bitis = "Bitiş saati başlangıçtan büyük olmalı.";
    }
    setFieldErr(next);
    return Object.keys(next).length === 0;
  }

  // --- Slot Oluştur ---
  async function handleSubmit(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");
    if (!validate()) return;

    const payload = {
      doktorId: aktifDoktor?.doktorId ?? aktifDoktor?.id ?? null,
      tarih,
      baslangicSaat: baslangic,
      bitisSaat: bitis,
      aciklama,
    };

    if (!payload.doktorId) {
      setMesaj("Doktor kimliği bulunamadı. Lütfen tekrar giriş yapın.");
      setMesajTip("err");
      return;
    }

    try {
      setLoading(true);
      const resp = await apiPost("/api/slot/doktor/slot-ac", payload);
      const s = resp?.tarih ? resp : resp?.data;

      setMesaj(
        `Slot açıldı: ${s?.tarih ?? tarih} ${s?.baslangicSaat ?? baslangic}–${s?.bitisSaat ?? bitis}`
      );
      setMesajTip("ok");

      setBaslangic("");
      setBitis("");
      setAciklama("");
      setFieldErr({});
    } catch (err) {
      console.error("Slot açılırken hata:", err);
      const serverMsg =
        err?.response?.data ||
        err?.message ||
        "Slot açılamadı. Lütfen bilgileri kontrol edin.";
      setMesaj(serverMsg);
      setMesajTip("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white/70 backdrop-blur-md border border-sky-100 rounded-3xl shadow-[0_8px_40px_-8px_rgba(14,165,233,0.15)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_50px_-10px_rgba(14,165,233,0.25)]">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-sky-700">
            <CalendarClock className="w-4 h-4" />
            <span>Muayene Saati Oluştur</span>
          </div>

          <h2 className="text-xl font-semibold text-slate-900 leading-tight">
            Slot Aç
          </h2>

          <p className="text-[13px] text-slate-600 leading-snug flex items-start gap-1">
            <Info className="w-3.5 h-3.5 text-sky-500 mt-[2px] flex-shrink-0" />
            <span>
              Oluşturulan slotlar resepsiyon tarafından randevuya dönüştürülebilir.
            </span>
          </p>
        </div>

        <div className="sm:text-right flex flex-col items-start sm:items-end">
          <div className="text-[13px] font-medium text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-100 text-sky-700 border border-sky-200 shadow-sm">
              <User2 className="w-4 h-4" />
            </div>
            <span>{aktifDoktor?.adSoyad || "—"}</span>
          </div>
          <div className="text-[12px] text-slate-400 leading-none">
            {aktifDoktor?.brans || "Branş bilgisi yok"}
          </div>
        </div>
      </header>

      {/* MESAJ BLOĞU */}
      {mesaj && (
        <div className="px-6 pt-4">
          {mesajTip === "ok" ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold">Başarılı</div>
                <div className="opacity-90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold">Hata</div>
                <div className="opacity-90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HIZLI DOLDUR */}
      <div className="px-6 pt-5">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <Wand2 className="w-4 h-4 text-sky-500" />
            Hızlı doldur:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("am")}
            className="rounded-full border border-sky-200 bg-sky-50/60 px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-100 transition"
          >
            09:00–12:00
          </button>
          <button
            type="button"
            onClick={() => applyPreset("pm")}
            className="rounded-full border border-sky-200 bg-sky-50/60 px-3 py-1.5 font-medium text-sky-700 hover:bg-sky-100 transition"
          >
            13:00–17:00
          </button>
          <button
            type="button"
            onClick={() => setEndByDelta(30)}
            className="rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-100 transition"
          >
            +30 dk
          </button>
          <button
            type="button"
            onClick={() => setEndByDelta(45)}
            className="rounded-full border border-amber-200 bg-amber-50/60 px-3 py-1.5 font-medium text-amber-700 hover:bg-amber-100 transition"
          >
            +45 dk
          </button>
          <button
            type="button"
            onClick={() => setEndByDelta(60)}
            className="rounded-full border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 font-medium text-indigo-700 hover:bg-indigo-100 transition"
          >
            +60 dk
          </button>
        </div>
      </div>

      {/* FORM */}
      <form
        className="px-6 pb-6 pt-4 grid gap-6 text-sm md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        {/* Tarih */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1">
            Tarih
          </label>
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            min={today}
            required
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              fieldErr.tarih ? "border-rose-300 ring-rose-200" : "border-slate-300"
            }`}
          />
          {fieldErr.tarih && (
            <p className="mt-1 text-[12px] text-rose-600">{fieldErr.tarih}</p>
          )}
        </div>

        {/* Başlangıç Saati */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1">
            Başlangıç Saati
          </label>
          <input
            type="time"
            value={baslangic}
            onChange={(e) => setBaslangic(e.target.value)}
            required
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              fieldErr.baslangic ? "border-rose-300 ring-rose-200" : "border-slate-300"
            }`}
          />
          {fieldErr.baslangic && (
            <p className="mt-1 text-[12px] text-rose-600">{fieldErr.baslangic}</p>
          )}
        </div>

        {/* Bitiş Saati */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1">
            Bitiş Saati
          </label>
          <input
            type="time"
            value={bitis}
            onChange={(e) => setBitis(e.target.value)}
            required
            min={baslangic || undefined}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
              fieldErr.bitis ? "border-rose-300 ring-rose-200" : "border-slate-300"
            }`}
          />
          {fieldErr.bitis && (
            <p className="mt-1 text-[12px] text-rose-600">{fieldErr.bitis}</p>
          )}
        </div>

        {/* Açıklama */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">
            Açıklama (opsiyonel)
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder="örn: Poliklinik kontrol"
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            maxLength={120}
          />
          <div className="mt-1 text-[11px] text-slate-400">
            {aciklama.length}/120
          </div>
        </div>

        {/* Özet satırı */}
        <div className="md:col-span-2 flex flex-wrap items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2 text-[13px] text-slate-700">
          <Clock className="w-4 h-4 text-sky-600" />
          <span>
            <b>Tarih:</b> {tarih || "—"}
          </span>
          <span>•</span>
          <span>
            <b>Saat:</b> {baslangic || "--:--"} – {bitis || "--:--"}
          </span>
          <span>•</span>
          <span>
            <b>Süre:</b> {durationText}
          </span>
        </div>

        {/* Buton */}
        <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(2,132,199,0.35)] hover:bg-sky-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Slot Oluştur"}
          </button>
        </div>
      </form>
    </section>
  );
}
