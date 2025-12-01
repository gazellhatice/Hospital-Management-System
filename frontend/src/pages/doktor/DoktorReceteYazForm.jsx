import { useMemo, useState } from "react";
import { apiPost } from "../../api";
import {
  Pill,
  User2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Info,
} from "lucide-react";

export default function DoktorReceteYazForm() {
  const [hastaId, setHastaId] = useState("");
  const [ilacListesi, setIlacListesi] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err" | ""
  const [loading, setLoading] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  const aktifDoktor = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifDoktor") || "null");
    } catch {
      return null;
    }
  }, []);

  // — Yardımcılar —
  const ilacCount = useMemo(() => {
    const clean = ilacListesi.trim();
    if (!clean) return 0;
    return clean
      .split(/\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean).length;
  }, [ilacListesi]);

  function applyTemplate(t) {
    if (t === "grip") {
      setIlacListesi(
        [
          "Paracetamol 500 mg — günde 3x1",
          "Dekonjestan sprey — günde 2x",
          "Bol sıvı ve istirahat",
        ].join("\n")
      );
    } else if (t === "agri") {
      setIlacListesi(
        ["Ibuprofen 400 mg — günde 2x1", "Kas gevşetici — gece 1"].join("\n")
      );
    } else if (t === "ab") {
      setIlacListesi(
        [
          "Amoksisilin/klavulanat 875/125 mg — 12 saatte 1",
          "Probiyotik — günde 1",
        ].join("\n")
      );
    }
  }

  // validate -> hata nesnesi döndürür
  function validate() {
    const next = {};
    const hId = Number(hastaId);

    if (!aktifDoktor || !aktifDoktor.doktorId) {
      next.genel = "Lütfen önce doktor olarak giriş yapın.";
    }
    if (!hId || Number.isNaN(hId)) {
      next.hastaId = "Geçerli bir Hasta ID girin (sayı).";
    }
    if (!ilacListesi.trim()) {
      next.ilacListesi = "İlaç listesi boş olamaz.";
    }
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");

    const errs = validate();
    setFieldErr(errs);
    if (Object.keys(errs).length > 0) {
      setMesaj(errs.genel || "Lütfen form hatalarını düzeltin.");
      setMesajTip("err");
      return;
    }

    try {
      setLoading(true);
      const rec = await apiPost("/api/recete/yaz", {
        doktorId: Number(aktifDoktor.doktorId),
        hastaId: Number(hastaId),
        ilacListesi: ilacListesi.trim(),
        aciklama: aciklama.trim(),
      });

      const id = rec?.receteId ?? rec?.data?.receteId ?? "—";
      setMesaj("Reçete oluşturuldu. Reçete ID: " + id);
      setMesajTip("ok");

      setHastaId("");
      setIlacListesi("");
      setAciklama("");
      setFieldErr({});
    } catch (err) {
      // olası backend mesajını çıkar
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Reçete oluşturulamadı. Lütfen bilgileri kontrol edin.";
      setMesaj(String(serverMsg));
      setMesajTip("err");
    } finally {
      setLoading(false);
    }
  }

  const disableAll = !aktifDoktor || !aktifDoktor.doktorId || loading;

  return (
    <section className="bg-white/70 backdrop-blur-md border border-indigo-100 rounded-3xl shadow-[0_8px_40px_-8px_rgba(79,70,229,0.2)] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_50px_-10px_rgba(79,70,229,0.3)]">
      {/* HEADER */}
      <header className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-indigo-700">
            <Pill className="w-4 h-4" />
            <span>Yeni Reçete</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 leading-tight">
            Reçete Yaz
          </h2>
          <p className="text-[13px] text-slate-600 flex items-start gap-1">
            <Info className="w-3.5 h-3.5 text-indigo-500 mt-[2px]" />
            Kaydedilen reçete hastanın panelinde “Reçetelerim” olarak görünür.
          </p>
        </div>

        {/* Doktor badge */}
        <div className="sm:text-right flex flex-col items-start sm:items-end">
          <div className="text-[13px] font-medium text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm">
              <User2 className="w-4 h-4" />
            </div>
            <span>{aktifDoktor?.adSoyad || "—"}</span>
          </div>
          <div className="text-[12px] text-slate-400 leading-none">
            {aktifDoktor?.brans || aktifDoktor?.uzmanlik || "Branş bilgisi yok"}
          </div>
        </div>
      </header>

      {/* GLOBAL MESAJ */}
      {mesaj && (
        <div className="px-6 pt-4">
          {mesajTip === "ok" ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold">İşlem başarılı</div>
                <div className="opacity-90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold">İşlem başarısız</div>
                <div className="opacity-90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="px-6 pb-6 pt-4 grid gap-6 text-sm md:grid-cols-12"
      >
        {/* Hasta ID */}
        <div className="md:col-span-3">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">
            Hasta ID
          </label>
          <div className="relative">
            <input
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErr.hastaId
                  ? "border-rose-300 ring-rose-200"
                  : "border-slate-300"
              }`}
              placeholder="örn: 1"
              value={hastaId}
              onChange={(e) =>
                setHastaId(e.target.value.replace(/\D/g, "").slice(0, 9))
              }
              inputMode="numeric"
              disabled={disableAll}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 select-none">
              ID
            </div>
          </div>
          {fieldErr.hastaId && (
            <p className="mt-1 text-[12px] text-rose-600">{fieldErr.hastaId}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-2 leading-snug">
            Not: Şimdilik ID ile seçim yapılıyor.
          </p>
        </div>

        {/* Hızlı şablonlar */}
        <div className="md:col-span-9">
          <label className="block text-[13px] font-medium text-slate-700 mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Hızlı Şablonlar
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyTemplate("grip")}
              className="rounded-full border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-[12px] font-medium text-indigo-700 hover:bg-indigo-100 transition"
            >
              Grip / Üst Solunum
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("agri")}
              className="rounded-full border border-amber-200 bg-amber-50/60 px-3 py-1.5 text-[12px] font-medium text-amber-700 hover:bg-amber-100 transition"
            >
              Ağrı Yönetimi
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("ab")}
              className="rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-[12px] font-medium text-emerald-700 hover:bg-emerald-100 transition"
            >
              Antibiyotik + Destek
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Şablonlar ilaç listesine eklenir, göndermeden önce düzenleyebilirsiniz.
          </p>
        </div>

        {/* İlaç Listesi */}
        <div className="md:col-span-12">
          <label className="block text-[13px] font-medium text-slate-700 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>İlaç Listesi</span>
          </label>
          <textarea
            rows={4}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none resize-y min-h-[96px] transition focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              fieldErr.ilacListesi
                ? "border-rose-300 ring-rose-200"
                : "border-slate-300"
            }`}
            placeholder={"Örnek:\nParacetamol 500 mg — günde 3x1\n..."}
            value={ilacListesi}
            onChange={(e) => setIlacListesi(e.target.value)}
            disabled={disableAll}
          />
          {fieldErr.ilacListesi && (
            <p className="mt-1 text-[12px] text-rose-600">
              {fieldErr.ilacListesi}
            </p>
          )}

          {/* Mini özet satırı */}
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-[12px] text-slate-700">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>
              <b>Kalem sayısı:</b> {ilacCount}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              Satırları virgül/; ile de ayırabilirsiniz.
            </span>
          </div>
        </div>

        {/* Açıklama */}
        <div className="md:col-span-12">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">
            Açıklama (opsiyonel)
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none resize-y min-h-[84px] placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Kullanım talimatı / uyarı"
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            maxLength={240}
            disabled={disableAll}
          />
          <div className="mt-1 text-[11px] text-slate-400">
            {aciklama.length}/240
          </div>
        </div>

        {/* Önizleme */}
        <div className="md:col-span-12">
          <div className="rounded-2xl border border-slate-200 bg-white/60 shadow-sm p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 mb-2">
              <Pill className="w-4 h-4" />
              Reçete Önizleme
            </div>
            <div className="text-[13px] text-slate-800 whitespace-pre-wrap">
              {ilacListesi.trim() ? ilacListesi : "—"}
            </div>
            {aciklama.trim() && (
              <div className="mt-3 text-[12px] text-slate-600">
                <span className="font-semibold">Not: </span>
                {aciklama}
              </div>
            )}
          </div>
        </div>

        {/* Gönder butonu */}
        <div className="md:col-span-12 flex flex-col sm:flex-row sm:justify-end">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={disableAll}
          >
            {loading ? "Kaydediliyor..." : "Reçeteyi Kaydet"}
          </button>
        </div>
      </form>
    </section>
  );
}
