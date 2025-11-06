import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../../api";
import {
  UserRound,
  CreditCard,
  Phone,
  Mail,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Info,
} from "lucide-react";

export default function HastaKayit() {
  const [adSoyad, setAdSoyad] = useState("");
  const [tc, setTc] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [telefon, setTelefon] = useState("");
  const [adres, setAdres] = useState("");

  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();

  // === Validation helpers ===
  const tcDigits = useMemo(() => tc.replace(/\D/g, ""), [tc]);
  const telDigits = useMemo(() => telefon.replace(/\D/g, ""), [telefon]);

  const isNameValid = adSoyad.trim().length >= 3;
  const isTcValid = /^[0-9]{11}$/.test(tcDigits);
  const isTelValid = /^05[0-9]{9}$/.test(telDigits);
  const isEmailValid = email.trim().length > 0 && /\S+@\S+\.\S+/.test(email);
  const isPassValid = sifre.length >= 6;
  const formValid = isNameValid && isTcValid && isTelValid && isEmailValid && isPassValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");

    if (!formValid) {
      setMesaj("Lütfen tüm zorunlu alanları doğru şekilde doldurun.");
      setMesajTip("err");
      return;
    }

    try {
      setLoading(true);
      const yeniHasta = await apiPost("/api/hasta/kayit", {
        adSoyad: adSoyad.trim(),
        tcKimlikNo: tcDigits,
        telefon: telDigits,
        email: email.trim(),
        sifre,
        adres: adres.trim(),
      });

      localStorage.setItem("aktifHasta", JSON.stringify(yeniHasta));
      setMesaj("Hesabınız oluşturuldu. Yönlendiriliyorsunuz...");
      setMesajTip("ok");

      setAdSoyad("");
      setTc("");
      setTelefon("");
      setEmail("");
      setSifre("");
      setAdres("");

      setTimeout(() => navigate("/panel/hasta"), 1500);
    } catch (err) {
      console.error("Hasta kayıt hatası:", err);
      setMesaj("Kayıt başarısız. TC zaten kayıtlı olabilir veya bilgiler eksik.");
      setMesajTip("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] p-6 sm:p-8 flex flex-col gap-6">
        {/* HEADER */}
        <header className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 rounded-full px-2.5 py-1 shadow-sm w-fit">
            <UserRound className="w-3.5 h-3.5 text-emerald-700" />
            <span>Yeni Hasta Kaydı</span>
          </div>

          <div className="text-xl font-semibold text-gray-900 leading-tight">
            Hesabınızı Oluşturun
          </div>

          <p className="text-[13px] text-gray-500 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-[1px]" />
            <span>
              Kendi hesabınızı önceden açarak resepsiyonda bekleme süresini
              azaltabilirsiniz. Verileriniz gizli tutulur.
            </span>
          </p>
        </header>

        {/* Bilgilendirme kutusu */}
        <div className="text-[12px] text-emerald-800 flex items-start gap-2 bg-emerald-50/70 border border-emerald-200 rounded-lg px-3 py-2">
          <Info className="w-4 h-4 text-emerald-600 mt-[2px]" />
          <span>
            <b>Zorunlu alanlar:</b> Ad Soyad, TC, Telefon, E-posta, Şifre. Adres isteğe bağlıdır.
          </span>
        </div>

        {/* MESAJ BLOKLARI */}
        {mesaj && (
          <div>
            {mesajTip === "ok" ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-700 shadow-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold text-emerald-700">
                    Kayıt oluşturuldu
                  </div>
                  <div className="text-emerald-700/90">{mesaj}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/70 px-4 py-3 text-[13px] text-rose-700 shadow-sm animate-fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold text-rose-700">
                    Kayıt başarısız
                  </div>
                  <div className="text-rose-700/90">{mesaj}</div>
                  <div className="text-[11px] text-rose-500/80 mt-1 leading-snug">
                    TC numarası zaten kayıtlı olabilir veya zorunlu alan boş.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Ad Soyad */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Ad Soyad</label>
            <div className="relative">
              <input
                className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 transition
                ${isNameValid ? "border-gray-300 focus:ring-emerald-500" : "border-amber-300 focus:ring-amber-500"}`}
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                placeholder="Örn: Elif Karan"
              />
              <UserRound className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* TC Kimlik */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              TC Kimlik No
            </label>
            <div className="relative">
              <input
                inputMode="numeric"
                maxLength={11}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 transition
                ${isTcValid ? "border-gray-300 focus:ring-emerald-500" : "border-amber-300 focus:ring-amber-500"}`}
                value={tcDigits}
                onChange={(e) => setTc(e.target.value)}
                placeholder="11 haneli TC"
              />
              <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {!isTcValid && tcDigits.length > 0 && (
              <p className="text-[11px] text-amber-600 mt-2">TC 11 haneli olmalı.</p>
            )}
          </div>

          {/* Telefon */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <div className="relative">
              <input
                inputMode="numeric"
                maxLength={11}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 transition
                ${isTelValid ? "border-gray-300 focus:ring-emerald-500" : "border-amber-300 focus:ring-amber-500"}`}
                value={telDigits}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="05xx xxx xx xx"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {!isTelValid && telDigits.length > 0 && (
              <p className="text-[11px] text-amber-600 mt-2">Telefon 05 ile başlamalı ve 11 hane olmalı.</p>
            )}
          </div>

          {/* E-posta */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <div className="relative">
              <input
                type="email"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 transition
                ${isEmailValid ? "border-gray-300 focus:ring-emerald-500" : "border-amber-300 focus:ring-amber-500"}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {!isEmailValid && email.length > 0 && (
              <p className="text-[11px] text-amber-600 mt-2">Geçerli bir e-posta adresi girin.</p>
            )}
          </div>

          {/* Şifre */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 transition
                ${isPassValid ? "border-gray-300 focus:ring-emerald-500" : "border-amber-300 focus:ring-amber-500"}`}
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="En az 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
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
            {!isPassValid && sifre.length > 0 && (
              <p className="text-[11px] text-amber-600 mt-2">Şifre en az 6 karakter olmalı.</p>
            )}
          </div>

          {/* Adres */}
          <div className="text-sm">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">
              Adres (opsiyonel)
            </label>
            <div className="relative">
              <textarea
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none resize-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
                placeholder="Mahalle / Cadde / No / İlçe / İl"
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={!formValid || loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Kayıt yapılıyor
              </span>
            ) : (
              "Kayıt Ol"
            )}
          </button>
        </form>

        {/* Back to login */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex-1 h-px bg-gray-200" />
          <span>Zaten hesabınız var mı?</span>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <Link
          to="/hasta-giris"
          className="w-full inline-flex items-center justify-center rounded-lg border border-emerald-600 text-emerald-700 bg-white px-4 py-2.5 text-sm font-medium shadow-[0_4px_16px_rgba(16,185,129,0.15)] hover:bg-emerald-50 active:scale-[0.99] transition"
        >
          Giriş Yap
        </Link>

        {/* KVKK */}
        <div className="text-[11px] text-gray-400 leading-snug text-center">
          Bu form kimlik doğrulama amacıyla TC Kimlik Numarası toplar.
          Paylaştığınız bilgiler tıbbi hizmet dışında üçüncü kişilerle paylaşılmaz.
        </div>
      </section>
    </div>
  );
}
