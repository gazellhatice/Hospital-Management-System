import { useMemo, useState } from "react";
import { apiPost } from "../../api";
import {
  UserPlus,
  User2,
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  LockKeyhole,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Info,
} from "lucide-react";

export default function ResepsiyonYeniHastaForm() {
  // form state
  const [adSoyad, setAdSoyad] = useState("");
  const [tc, setTc] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [adres, setAdres] = useState("");

  // ui state
  const [showPass, setShowPass] = useState(false);
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

  // --- validations ---
  const tcOnlyDigits = useMemo(() => tc.replace(/\D/g, ""), [tc]);
  const telOnlyDigits = useMemo(() => telefon.replace(/\D/g, ""), [telefon]);

  const isTcValid = useMemo(() => /^[0-9]{11}$/.test(tcOnlyDigits), [tcOnlyDigits]);
  const isTelValid = useMemo(() => /^05[0-9]{9}$/.test(telOnlyDigits), [telOnlyDigits]); // TR mobil formatı
  const isEmailValid = useMemo(
    () => (email.trim().length === 0 ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    [email]
  );
  const isPassValid = useMemo(() => (sifre?.length || 0) >= 6, [sifre]);
  const isNameValid = useMemo(() => adSoyad.trim().length >= 3, [adSoyad]);

  const formValid =
    isNameValid && isTcValid && isTelValid && isEmailValid && isPassValid && !!aktifResepsiyonist?.resepsiyonistId;

  // helpers
  function handleTcChange(v) {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    setTc(digits);
  }
  function handleTelChange(v) {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    setTelefon(digits);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");

    if (!formValid) {
      setMesaj("Lütfen zorunlu alanları doğru şekilde doldurun.");
      setMesajTip("err");
      return;
    }

    try {
      setLoading(true);
      const kaydedilen = await apiPost("/api/resepsiyon/hasta-ekle", {
        resepsiyonistId: aktifResepsiyonist?.resepsiyonistId,
        hasta: {
          adSoyad: adSoyad.trim(),
          tcKimlikNo: tcOnlyDigits,
          telefon: telOnlyDigits,
          email: email.trim(),
          sifre: sifre,
          adres: adres.trim(),
        },
      });

      const ad = kaydedilen?.adSoyad ?? kaydedilen?.data?.adSoyad ?? adSoyad;
      setMesaj("Hasta kaydedildi: " + ad);
      setMesajTip("ok");

      // reset form
      setAdSoyad("");
      setTc("");
      setTelefon("");
      setEmail("");
      setSifre("");
      setAdres("");
    } catch (err) {
      setMesaj("Hata: hasta kaydedilemedi. Lütfen bilgileri kontrol edin.");
      setMesajTip("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-cyan-200 rounded-2xl shadow-[0_20px_48px_-6px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col space-y-6 p-6">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-cyan-700">
            <UserPlus className="w-4 h-4 text-cyan-600" />
            <span>Yeni Hasta Kaydı</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
            Hasta Sisteme Eklensin
          </h2>

          <p className="text-[13px] text-gray-500 leading-snug flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-600 mt-[1px]" />
            <span>
              Bu kayıt direkt veritabanına düşer. Hasta bu bilgilerle kendi paneline giriş yapabilir.
            </span>
          </p>
        </div>

        {/* aktif resepsiyonist bilgisi */}
        <div className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-[12px] text-gray-700 shadow-sm min-w-[220px] max-w-[280px]">
          <div className="font-semibold text-gray-900 flex items-center gap-2">
            <User2 className="w-4 h-4 text-cyan-600" />
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

      {/* GİRİŞ UYARISI */}
      {!aktifResepsiyonist && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
          <div className="leading-snug">
            <div className="font-semibold text-rose-700">Resepsiyon girişi yapılmamış</div>
            <div className="text-rose-700/90">
              Hasta kaydı açmak için önce resepsiyon olarak giriş yapmalısınız.
            </div>
          </div>
        </div>
      )}

      {/* DURUM MESAJI */}
      {mesaj && (
        <div>
          {mesajTip === "ok" ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-emerald-700">Kayıt oluşturuldu</div>
                <div className="text-emerald-700/90">{mesaj}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-rose-700">Kayıt başarısız</div>
                <div className="text-rose-700/90">{mesaj}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BİLGİLENDİRME */}
      <div className="text-[12px] text-cyan-800 flex items-start gap-2 bg-cyan-50/70 border border-cyan-200 rounded-lg px-3 py-2">
        <Info className="w-4 h-4 text-cyan-600 mt-[2px]" />
        <span>
          <b>Zorunlu alanlar:</b> Ad Soyad, TC, Telefon, Şifre. E-posta opsiyoneldir ancak önerilir.
        </span>
      </div>

      {/* FORM */}
      <form className="grid gap-6 text-sm md:grid-cols-2" onSubmit={handleSubmit}>
        {/* Ad Soyad */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Ad Soyad</label>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${isNameValid ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500" : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"}`}
              value={adSoyad}
              onChange={(e) => setAdSoyad(e.target.value)}
              placeholder="Örn: Elif Karan"
            />
            <User2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!isNameValid && (
            <p className="text-[11px] text-amber-600 mt-2 leading-snug">Lütfen en az 3 karakter girin.</p>
          )}
        </div>

        {/* TC Kimlik */}
        <div className="md:col-span-1">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">TC Kimlik No</label>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${tcOnlyDigits.length === 0 ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500" : isTcValid ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500" : "border-rose-300 focus:ring-rose-500 focus:border-rose-500"}`}
              value={tcOnlyDigits}
              onChange={(e) => handleTcChange(e.target.value)}
              placeholder="11 haneli TC"
              inputMode="numeric"
              maxLength={11}
            />
            <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!isTcValid && tcOnlyDigits.length > 0 && (
            <p className="text-[11px] text-rose-600 mt-2 leading-snug">TC 11 haneli olmalıdır.</p>
          )}
        </div>

        {/* Telefon */}
        <div className="md:col-span-1">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Telefon</label>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${telOnlyDigits.length === 0 ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500" : isTelValid ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500" : "border-rose-300 focus:ring-rose-500 focus:border-rose-500"}`}
              value={telOnlyDigits}
              onChange={(e) => handleTelChange(e.target.value)}
              placeholder="05xxxxxxxxx"
              inputMode="numeric"
              maxLength={11}
            />
            <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!isTelValid && telOnlyDigits.length > 0 && (
            <p className="text-[11px] text-rose-600 mt-2 leading-snug">Telefon 05 ile başlamalı ve 11 hane olmalı.</p>
          )}
        </div>

        {/* E-posta (opsiyonel) */}
        <div className="md:col-span-1">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">E-posta (opsiyonel)</label>
          <div className="relative">
            <input
              type="email"
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${email.length === 0 ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500" : isEmailValid ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500" : "border-rose-300 focus:ring-rose-500 focus:border-rose-500"}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!isEmailValid && (
            <p className="text-[11px] text-rose-600 mt-2 leading-snug">Geçerli bir e-posta girin veya boş bırakın.</p>
          )}
        </div>

        {/* Şifre */}
        <div className="md:col-span-1">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Geçici Şifre</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              className={`w-full rounded-lg border px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${sifre.length === 0 ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500" : isPassValid ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500" : "border-rose-300 focus:ring-rose-500 focus:border-rose-500"}`}
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="en az 6 karakter"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
              tabIndex={-1}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <LockKeyhole className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {!isPassValid && sifre.length > 0 && (
            <p className="text-[11px] text-rose-600 mt-2 leading-snug">Şifre en az 6 karakter olmalı.</p>
          )}
          <p className="text-[11px] text-amber-600 mt-2 leading-snug">
            Güvenlik notu: Bu şifre şu an <b>düz metin</b> olarak kaydediliyor. Bir sonraki sürümde hash’lenecek.
          </p>
        </div>

        {/* Adres */}
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Adres</label>
          <div className="relative">
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none resize-none placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              value={adres}
              onChange={(e) => setAdres(e.target.value)}
              placeholder="Mahalle / Cadde / No / İlçe / İl"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          </div>
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
              "Kaydet"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
