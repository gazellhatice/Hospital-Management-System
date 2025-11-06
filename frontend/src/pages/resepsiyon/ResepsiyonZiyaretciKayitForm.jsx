import { useMemo, useState } from "react";
import { apiPost } from "../../api";
import {
  User2,
  ShieldAlert,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  UserCheck,
  FileText,
  Loader2,
  Info,
} from "lucide-react";

export default function ResepsiyonZiyaretciKayitForm() {
  // form state
  const [adSoyad, setAdSoyad] = useState("");
  const [ziyaretSebebi, setZiyaretSebebi] = useState("");
  const [notlar, setNotlar] = useState("");

  // ui state
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err" | ""
  const [loading, setLoading] = useState(false);

  // login context
  const aktifResepsiyonist = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifResepsiyonist") || "null");
    } catch {
      return null;
    }
  }, []);

  // validations
  const isNameValid = adSoyad.trim().length >= 3;
  const isReasonValid = ziyaretSebebi.trim().length >= 3;
  const formValid =
    isNameValid &&
    isReasonValid &&
    !!aktifResepsiyonist?.resepsiyonistId;

  async function handleSubmit(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");

    if (!aktifResepsiyonist?.resepsiyonistId) {
      setMesaj("Resepsiyonist bilgisi bulunamadı. Giriş yapın.");
      setMesajTip("err");
      return;
    }
    if (!formValid) {
      setMesaj("Lütfen zorunlu alanları doğru şekilde doldurun.");
      setMesajTip("err");
      return;
    }

    try {
      setLoading(true);
      const res = await apiPost("/api/ziyaretci/ekle", {
        resepsiyonistId: aktifResepsiyonist.resepsiyonistId,
        adSoyad: adSoyad.trim(),
        ziyaretSebebi: ziyaretSebebi.trim(),
        notlar: notlar.trim(),
      });

      const id = res?.ziyaretciId ?? res?.data?.ziyaretciId ?? "—";
      setMesaj("Ziyaretçi kaydedildi. ID: " + id);
      setMesajTip("ok");

      // reset
      setAdSoyad("");
      setZiyaretSebebi("");
      setNotlar("");
    } catch (err) {
      setMesaj("Kayıt başarısız oldu. Lütfen bilgileri kontrol edin.");
      setMesajTip("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-cyan-200 rounded-2xl shadow-[0_20px_48px_-6px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col space-y-6 p-6">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* sol */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-cyan-700">
            <ClipboardList className="w-4 h-4 text-cyan-600" />
            <span>Ziyaretçi Kaydı Oluştur</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
            Hastaneye Giriş Kaydı
          </h2>

          <p className="text-[13px] text-gray-500 leading-snug flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-600 mt-[1px]" />
            <span>
              Hastaneye gelen ziyaretçiyi sisteme işleyin. Müdür raporlarda
              giriş sebebi ve açan personeli görebilir.
            </span>
          </p>
        </div>

        {/* sağ: aktif resepsiyonist */}
        <div className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-[12px] text-gray-700 shadow-sm min-w-[200px] max-w-[260px]">
          <div className="font-semibold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-600" />
            <span>{aktifResepsiyonist?.adSoyad || "—"}</span>
          </div>
          <div className="text-[11px] text-gray-500 leading-snug mt-1">
            Resepsiyonist ID:{" "}
            <span className="text-gray-700 font-medium">
              {aktifResepsiyonist?.resepsiyonistId || "—"}
            </span>
          </div>
        </div>
      </header>

      {/* giriş uyarısı */}
      {!aktifResepsiyonist && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
          <div className="leading-snug">
            <div className="font-semibold text-rose-700">Resepsiyon girişi yapılmamış</div>
            <div className="text-rose-700/90">
              Kayıt açmak için önce resepsiyon olarak giriş yapmalısınız.
            </div>
          </div>
        </div>
      )}

      {/* bilgi kutusu */}
      <div className="text-[12px] text-cyan-800 flex items-start gap-2 bg-cyan-50/70 border border-cyan-200 rounded-lg px-3 py-2">
        <Info className="w-4 h-4 text-cyan-600 mt-[2px]" />
        <span>
          <b>Zorunlu alanlar:</b> Ad Soyad ve Ziyaret Sebebi. Not opsiyoneldir.
        </span>
      </div>

      {/* MESAJ BLOĞU */}
      {mesaj && (
        <div>
          {mesajTip === "ok" ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-emerald-700">Kayıt alındı</div>
                <div className="text-emerald-700/90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-rose-700">İşlem başarısız</div>
                <div className="text-rose-700/90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM */}
      <form className="grid gap-6 text-sm md:grid-cols-2" onSubmit={handleSubmit}>
        {/* Ad Soyad */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">
            Ad Soyad <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${adSoyad.length === 0 ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500" : isNameValid ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500" : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"}`}
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              placeholder="örn: Ayşe Korkmaz"
            />
            <User2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!isNameValid && adSoyad.length > 0 && (
            <p className="text-[11px] text-amber-600 mt-2 leading-snug">Lütfen en az 3 karakter girin.</p>
          )}
        </div>

        {/* Ziyaret Sebebi */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">
            Ziyaret Sebebi <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${ziyaretSebebi.length === 0 ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500" : isReasonValid ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500" : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"}`}
              value={ziyaretSebebi}
              onChange={(e) => setZiyaretSebebi(e.target.value)}
              placeholder="örn: Hasta yakını / Evrak teslim / Teknik servis"
            />
            <MessageSquare className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!isReasonValid && ziyaretSebebi.length > 0 && (
            <p className="text-[11px] text-amber-600 mt-2 leading-snug">Lütfen en az 3 karakter girin.</p>
          )}
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">
            Mümkün olduğunca spesifik yazın. Örn: “Dahiliye 302, hasta yakını” veya “Röntgen cihazı için teknik servis”.
          </p>
        </div>

        {/* Notlar */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">
            Not (opsiyonel)
          </label>
          <div className="relative">
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none resize-none placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              value={notlar}
              onChange={(e) => setNotlar(e.target.value)}
              placeholder="örn: 14:30'da geldi, 20 dk bekledi"
            />
            <FileText className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug italic">
            Bu not yönetim raporunda görünebilir.
          </p>
        </div>

        {/* Kaydet */}
        <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(8,145,178,0.35)] hover:bg-cyan-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!formValid || loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Kaydediliyor
              </span>
            ) : (
              "Kaydı Oluştur"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
