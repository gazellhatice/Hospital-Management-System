import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiPost } from "../../api";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  AlertTriangle,
  CheckCircle2,
  UserRound,
  Eye,
  EyeOff,
  Loader2,
  Info,
} from "lucide-react";

export default function HastaGiris() {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [beniHatirla, setBeniHatirla] = useState(true);

  const [hata, setHata] = useState("");
  const [okMesaj, setOkMesaj] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const navigate = useNavigate();

  // basit doğrulamalar
  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPwdValid = String(sifre).length >= 6;
  const formValid = isEmailValid && isPwdValid;

  // input yardım metinleri için id'leri memola
  const emailHelpId = useMemo(() => "email-help-" + Math.random().toString(36).slice(2, 8), []);
  const passHelpId = useMemo(() => "pass-help-" + Math.random().toString(36).slice(2, 8), []);

  // "beni hatırla" için e-postayı hatırla
  useEffect(() => {
    try {
      const remembered = localStorage.getItem("hastaLoginEmail");
      if (remembered) setEmail(remembered);
    } catch {}
  }, []);

  function handleKeyPress(e) {
    // CapsLock uyarısı
    if (e.getModifierState && e.key?.length === 1) {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return; // double submit koruması
    setHata("");
    setOkMesaj("");

    if (!formValid) {
      setHata("Lütfen geçerli bir e-posta ve en az 6 karakterli şifre girin.");
      return;
    }

    try {
      setLoading(true);

      const hasta = await apiPost("/api/hasta/giris", { email, sifre });

      const normalized = {
        hastaId: Number(hasta?.hastaId),
        adSoyad: hasta?.adSoyad || "",
        email: hasta?.email || email,
        tcKimlikNo: hasta?.tcKimlikNo || "",
      };

      if (!normalized.hastaId || Number.isNaN(normalized.hastaId)) {
        throw new Error("Sunucudan geçerli hastaId gelmedi.");
      }

      // çakışabilecek anahtarları temizle
      try {
        localStorage.removeItem("aktifHasta");
        localStorage.removeItem("hasta");
        localStorage.removeItem("user");
      } catch {}

      // giriş verisini kaydet
      localStorage.setItem("aktifHasta", JSON.stringify(normalized));

      // beni hatırla
      try {
        if (beniHatirla) localStorage.setItem("hastaLoginEmail", email);
        else localStorage.removeItem("hastaLoginEmail");
      } catch {}

      setOkMesaj("Giriş başarılı. Yönlendiriliyorsunuz...");
      navigate("/panel/hasta");
    } catch (err) {
      console.error("Hasta login error:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
      setHata(serverMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] p-6 sm:p-8 flex flex-col gap-6">
        {/* HEADER */}
        <header className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 rounded-full px-2.5 py-1 shadow-sm w-fit">
            <UserRound className="w-3.5 h-3.5" />
            <span>Hasta Portalı</span>
          </div>

          <div className="text-xl font-semibold text-gray-900 leading-tight">Giriş Yap</div>

          <p className="text-[13px] text-gray-500 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-[1px]" />
            <span>
              Randevularım, Reçetelerim ve Şikayet Takibim tek panelde. Giriş bilgileriniz üçüncü kişilerle
              paylaşılmaz.
            </span>
          </p>
        </header>

        {/* İpucu kutusu */}
        <div className="text-[12px] text-emerald-800 flex items-start gap-2 bg-emerald-50/70 border border-emerald-200 rounded-lg px-3 py-2">
          <Info className="w-4 h-4 text-emerald-600 mt-[2px]" />
          <span>
            Güvenliğiniz için ortak bilgisayarlarda <b>beni hatırla</b> seçeneğini kapalı tutun.
          </span>
        </div>

        {/* MESAJ BLOKLARI */}
        {hata && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
            <div className="leading-snug">
              <div className="font-semibold">Giriş başarısız</div>
              <div className="opacity-90">{hata}</div>
              <div className="text-[11px] opacity-75 mt-1 leading-snug">E-posta / şifre eşleşmiyor olabilir.</div>
            </div>
          </motion.div>
        )}

        {okMesaj && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
            <div className="leading-snug">
              <div className="font-semibold">Giriş başarılı</div>
              <div className="opacity-90">{okMesaj}</div>
            </div>
          </motion.div>
        )}

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* email */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1" htmlFor="email">
              E-posta
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${
                  email.length === 0
                    ? "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                    : isEmailValid
                    ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
                    : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                }`}
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyUp={handleKeyPress}
                onKeyDown={handleKeyPress}
                aria-invalid={!isEmailValid && email.length > 0}
                aria-describedby={!isEmailValid && email.length > 0 ? emailHelpId : undefined}
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {!isEmailValid && email.length > 0 && (
              <p id={emailHelpId} className="text-[11px] text-amber-600 mt-2 leading-snug">
                Lütfen geçerli bir e-posta adresi girin.
              </p>
            )}
          </div>

          {/* şifre */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1" htmlFor="password">
              Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition
                ${
                  sifre.length === 0
                    ? "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
                    : isPwdValid
                    ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
                    : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"
                }`}
                placeholder="******"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                onKeyUp={handleKeyPress}
                onKeyDown={handleKeyPress}
                aria-invalid={!isPwdValid && sifre.length > 0}
                aria-describedby={!isPwdValid && sifre.length > 0 ? passHelpId : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 active:scale-[0.98] transition"
                aria-label={showPwd ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPwd ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
              <LockKeyhole className="w-4 h-4 text-gray-400 absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {capsOn && (
              <div className="mt-2 text-[11px] text-amber-600 leading-snug">Caps Lock açık olabilir.</div>
            )}
            {!isPwdValid && sifre.length > 0 && (
              <p id={passHelpId} className="text-[11px] text-amber-600 mt-2 leading-snug">
                Şifreniz en az 6 karakter olmalı.
              </p>
            )}

            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 text-[12px] text-gray-600 select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={beniHatirla}
                  onChange={(e) => setBeniHatirla(e.target.checked)}
                />
                Beni hatırla
              </label>

              {/* Şifreyi unuttum (ileride route eklenebilir) */}
              <span className="text-[12px] text-emerald-700 hover:underline cursor-pointer">
                Şifremi unuttum
              </span>
            </div>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={!formValid || loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Giriş yapılıyor
              </span>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        {/* AYIRICI */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex-1 h-px bg-gray-200" />
          <span>Hesabın yok mu?</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        {/* KAYIT CTA */}
        <Link
          to="/hasta-kayit"
          className="w-full inline-flex items-center justify-center rounded-lg border border-emerald-600 text-emerald-700 bg-white px-4 py-2.5 text-sm font-medium shadow-[0_4px_16px_rgba(16,185,129,0.15)] hover:bg-emerald-50 active:scale-[0.99] transition"
        >
          Yeni Hasta Kaydı Oluştur
        </Link>

        {/* alt bilgi */}
        <div className="text-[11px] text-gray-400 leading-snug text-center">
          Bu panel kişisel sağlık bilgilerinizi içerir. Ortak bilgisayarlarda işiniz bittikten sonra çıkış yapmayı
          unutmayın.
        </div>
      </section>
    </div>
  );
}
