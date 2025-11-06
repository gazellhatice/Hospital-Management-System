import { useMemo, useState } from "react";
import { apiPost } from "../../api";
import {
  AlertTriangle,
  CheckCircle2,
  User2,
  MessageSquareWarning,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function HastaSikayetForm() {
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err" | ""
  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState({}); // { baslik?: string, icerik?: string, genel?: string }

  const aktifHasta = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifHasta") || "null");
    } catch {
      return null;
    }
  }, []);

  const BASLIK_MAX = 80;
  const ICERIK_MAX = 800;
  const BASLIK_MIN = 8;
  const ICERIK_MIN = 20;

  function applyTemplate(key) {
    if (key === "bekleme") {
      setBaslik((prev) => prev || "Poliklinikte uzun bekleme süresi");
      setIcerik((prev) =>
        prev ||
        [
          "Tarih/saat: __/__/____ __:__",
          "Bölüm/Poliklinik: __________",
          "Karşılaştığım durum: Bekleme süresi çok uzundu.",
          "Talep: Randevu saatlerine uyum ve bilgilendirme.",
        ].join("\n")
      );
    } else if (key === "iletisim") {
      setBaslik((prev) => prev || "Personel iletişim dili hakkında geri bildirim");
      setIcerik((prev) =>
        prev ||
        [
          "Tarih/saat: __/__/____ __:__",
          "Birim: __________",
          "Karşılaştığım durum: Üslup/iletişim uygun değildi.",
          "Talep: Daha nazik/çözüm odaklı iletişim.",
        ].join("\n")
      );
    } else if (key === "temizlik") {
      setBaslik((prev) => prev || "Alan temizliği ve hijyen");
      setIcerik((prev) =>
        prev ||
        [
          "Tarih/saat: __/__/____ __:__",
          "Yer: __________",
          "Karşılaştığım durum: Temizlik/hijyen yetersizdi.",
          "Talep: Daha sık temizlik ve kontrol.",
        ].join("\n")
      );
    }
  }

  function validate() {
    const next = {};
    if (!aktifHasta || !aktifHasta.hastaId) {
      next.genel = "Giriş yapılmadı. Devam etmek için hasta girişi yapın.";
    }
    const b = (baslik || "").trim();
    const i = (icerik || "").trim();

    if (!b) next.baslik = "Başlık boş olamaz.";
    else if (b.length < BASLIK_MIN) next.baslik = `Başlık en az ${BASLIK_MIN} karakter olmalı.`;
    else if (b.length > BASLIK_MAX) next.baslik = `Başlık en fazla ${BASLIK_MAX} karakter.`;

    if (!i) next.icerik = "Detay boş olamaz.";
    else if (i.length < ICERIK_MIN) next.icerik = `Detay en az ${ICERIK_MIN} karakter olmalı.`;
    else if (i.length > ICERIK_MAX) next.icerik = `Detay en fazla ${ICERIK_MAX} karakter.`;

    setFieldErr(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");

    if (!validate()) {
      setMesaj(fieldErr.genel || "Lütfen form hatalarını düzeltin.");
      setMesajTip("err");
      return;
    }

    try {
      setLoading(true);
      const s = await apiPost("/api/sikayet/olustur", {
        hastaId: aktifHasta?.hastaId,
        baslik: baslik.trim(),
        icerik: icerik.trim(),
      });

      setMesaj("Şikayetiniz alındı. Durum: " + (s?.durum ?? "KAYDEDİLDİ"));
      setMesajTip("ok");
      setBaslik("");
      setIcerik("");
      setFieldErr({});
    } catch (err) {
      setMesaj("Şikayet kaydedilemedi. Lütfen tekrar deneyin.");
      setMesajTip("err");
    } finally {
      setLoading(false);
    }
  }

  const baslikCount = baslik.length;
  const icerikCount = icerik.length;

  const disabledAll = !aktifHasta || !aktifHasta.hastaId || loading;

  return (
    <section className="bg-white/70 backdrop-blur-md border border-emerald-100 rounded-3xl shadow-[0_8px_40px_-8px_rgba(16,185,129,0.18)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_50px_-10px_rgba(16,185,129,0.28)]">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* sol */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
            <MessageSquareWarning className="w-4 h-4" />
            <span>Şikayet Oluştur</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight">
            Yönetim ile Paylaşın
          </h2>
          <p className="text-[13px] text-slate-600">
            Buraya yazdıklarınız doğrudan hastane yönetimine iletilir.
          </p>
        </div>

        {/* sağ: hasta bilgisi */}
        <div className="sm:text-right flex flex-col items-start sm:items-end">
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
      </header>

      {/* GİRİŞ UYARISI */}
      {!aktifHasta && (
        <div className="px-6 pt-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
            <div className="leading-snug">
              <div className="font-semibold">Giriş yapılmadı</div>
              <div className="opacity-90">Devam etmek için hasta olarak giriş yapmalısınız.</div>
            </div>
          </div>
        </div>
      )}

      {/* SON DURUM MESAJI */}
      {mesaj && (
        <div className="px-6 pt-4">
          {mesajTip === "ok" ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold">Talebiniz alındı</div>
                <div className="opacity-90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold">Kaydedilemedi</div>
                <div className="opacity-90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM */}
      <form className="px-6 pb-6 pt-4 flex flex-col gap-6 text-sm" onSubmit={handleSubmit}>
        {/* Hızlı şablonlar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
            <Sparkles className="w-4 h-4" /> Hızlı Şablonlar:
          </span>
          <button
            type="button"
            onClick={() => applyTemplate("bekleme")}
            className="rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100 transition"
            disabled={disabledAll}
          >
            Bekleme Süresi
          </button>
          <button
            type="button"
            onClick={() => applyTemplate("iletisim")}
            className="rounded-full border border-amber-200 bg-amber-50/60 px-3 py-1.5 text-[12px] font-medium text-amber-700 hover:bg-amber-100 transition"
            disabled={disabledAll}
          >
            İletişim Dili
          </button>
          <button
            type="button"
            onClick={() => applyTemplate("temizlik")}
            className="rounded-full border border-sky-200 bg-sky-50/60 px-3 py-1.5 text-[12px] font-medium text-sky-700 hover:bg-sky-100 transition"
            disabled={disabledAll}
          >
            Temizlik
          </button>
        </div>

        {/* Başlık */}
        <div className="flex-1">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">Konu / Başlık</label>
          <input
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
              fieldErr.baslik ? "border-rose-300 ring-rose-200" : "border-slate-300"
            }`}
            placeholder="Örn: Poliklinikte çok uzun bekledim"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value.slice(0, BASLIK_MAX))}
            disabled={disabledAll}
          />
          <div className="mt-1 flex items-center justify-between">
            {fieldErr.baslik ? (
              <p className="text-[12px] text-rose-600">{fieldErr.baslik}</p>
            ) : (
              <p className="text-[11px] text-slate-400 leading-snug">Kısa ve anlaşılır yazın.</p>
            )}
            <span className="text-[11px] text-slate-400">
              {baslikCount}/{BASLIK_MAX}
            </span>
          </div>
        </div>

        {/* İçerik */}
        <div className="flex-1">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">Detay</label>
          <textarea
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none resize-y min-h-[120px] placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
              fieldErr.icerik ? "border-rose-300 ring-rose-200" : "border-slate-300"
            }`}
            rows={6}
            placeholder="Ne yaşandığını, kimle yaşandığını ve ne talep ettiğinizi açık yazın."
            value={icerik}
            onChange={(e) => setIcerik(e.target.value.slice(0, ICERIK_MAX))}
            disabled={disabledAll}
          />
          <div className="mt-1 flex items-center justify-between">
            {fieldErr.icerik ? (
              <p className="text-[12px] text-rose-600">{fieldErr.icerik}</p>
            ) : (
              <p className="text-[11px] text-slate-400 leading-snug italic">
                İsterseniz belirli bir doktor/oda/saat de belirtebilirsiniz.
              </p>
            )}
            <span className="text-[11px] text-slate-400">
              {icerikCount}/{ICERIK_MAX}
            </span>
          </div>
        </div>

        {/* GÖNDER BUTONU */}
        <div className="flex flex-col sm:flex-row sm:justify-end">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={disabledAll}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Gönder
          </button>
        </div>

        {/* privacy note */}
        <div className="text-[11px] text-slate-400 leading-snug text-center sm:text-right">
          Kişisel sağlık bilgileriniz gizli tutulur. Bu form yalnızca kalite iyileştirme amacıyla kullanılır.
        </div>
      </form>
    </section>
  );
}
