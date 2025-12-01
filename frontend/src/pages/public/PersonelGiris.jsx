import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiPost } from "../../api";
import {
  ShieldAlert,
  Stethoscope,
  Headset,
  Mail,
  LockKeyhole,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";

/* Helpers */
const isEmail = (v) => /\S+@\S+\.\S+/.test(String(v || "").trim());
const nonEmpty = (v) => String(v || "").trim().length > 0;

function useCapsLock() {
  const [capsOn, setCapsOn] = useState(false);
  function handle(e) {
    if (e?.getModifierState && e.key?.length === 1) {
      setCapsOn(e.getModifierState("CapsLock"));
    }
  }
  return { capsOn, handle };
}

/* Reusable role card */
function RoleCard({
  roleKey,
  badge,
  title,
  description,
  apiPath,
  navigateTo,
  storageKey,
  theme, // { base, ring, shadow, badgeBg, badgeText, badgeBorder }
}) {
  const navigate = useNavigate();
  const { capsOn, handle } = useCapsLock();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" }); // ok | err

  const valid = useMemo(() => isEmail(email) && nonEmpty(pwd), [email, pwd]);

  // remember last email per role
  useEffect(() => {
    try {
      const k = `loginEmail:${roleKey}`;
      const remembered = localStorage.getItem(k);
      if (remembered) setEmail(remembered);
    } catch {}
  }, [roleKey]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setMsg({ type: "", text: "" });
    if (!valid) {
      setMsg({ type: "err", text: "Geçerli e-posta ve şifre girin." });
      return;
    }
    try {
      setLoading(true);
      const res = await apiPost(apiPath, { email: email.trim(), sifre: pwd });

      // clear other roles
      try {
        ["aktifMudur", "aktifDoktor", "aktifResepsiyonist", "aktifHasta", "user"].forEach((k) =>
          localStorage.removeItem(k)
        );
      } catch {}

      localStorage.setItem(storageKey, JSON.stringify(res));
      try {
        localStorage.setItem(`loginEmail:${roleKey}`, email);
      } catch {}

      setMsg({ type: "ok", text: "Giriş başarılı. Yönlendiriliyorsunuz..." });
      navigate(navigateTo);
    } catch (err) {
      const fallback =
        roleKey === "mudur"
          ? "Müdür girişi başarısız. Bilgilerinizi kontrol edin veya yetki durumunuza bakın."
          : roleKey === "doktor"
          ? "Doktor girişi başarısız. Hesabınız pasif olabilir veya şifre hatalı."
          : "Resepsiyon girişi başarısız. Hesap devre dışı olabilir ya da bilgiler hatalı.";
      setMsg({ type: "err", text: err?.response?.data?.message || fallback });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`bg-white/90 backdrop-blur-sm border rounded-2xl p-6 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] flex flex-col gap-5 ${theme.base}`}
    >
      <div className="flex flex-col gap-2">
        <div
          className={`inline-flex items-center gap-2 text-[11px] font-semibold rounded-full px-2.5 py-1 shadow-sm w-fit ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
        >
          {badge}
        </div>
        <div className="text-lg font-semibold text-gray-900 leading-tight">{title}</div>
        <p className="text-[12px] text-gray-500 leading-snug">{description}</p>
      </div>

      {msg.text && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-3 rounded-lg px-4 py-3 text-[13px] shadow-sm border
          ${
            msg.type === "ok"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
              : "border-rose-200 bg-rose-50/80 text-rose-700"
          }`}
          role={msg.type === "ok" ? "status" : "alert"}
          aria-live={msg.type === "ok" ? "polite" : "assertive"}
        >
          {msg.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 mt-[2px]" />
          ) : (
            <AlertTriangle className="w-4 h-4 mt-[2px]" />
          )}
          <div className="leading-snug">{msg.text}</div>
        </motion.div>
      )}

      <form className="space-y-4 text-sm" onSubmit={submit} noValidate>
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">E-posta</label>
          <div className="relative">
            <input
              className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 ${
                isEmail(email)
                  ? `${theme.ring}`
                  : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@..."
              autoComplete="username"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-1">Şifre</label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-12 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 ${
                nonEmpty(pwd)
                  ? `${theme.ring}`
                  : "border-amber-300 focus:ring-amber-500 focus:border-amber-500"
              }`}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={handle}
              onKeyUp={handle}
              aria-describedby={capsOn ? `caps-${roleKey}` : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 active:scale-[0.98] transition"
              aria-label={showPwd ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPwd ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
            </button>
            <LockKeyhole className="w-4 h-4 text-gray-400 absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {capsOn && (
            <p id={`caps-${roleKey}`} className="mt-1 text-[11px] text-amber-600">
              Caps Lock açık olabilir.
            </p>
          )}
        </div>

        <button
          disabled={!valid || loading}
          className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed ${theme.shadow}`}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Giriş yapılıyor
            </span>
          ) : (
            "Giriş Yap"
          )}
        </button>
      </form>
    </section>
  );
}

export default function PersonelGiris() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-gray-900 leading-tight">Personel Girişi</h1>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Her rol kendi paneline giriş yapar. Tüm işlemler denetim amaçlı kaydedilir.
        </p>
      </header>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Müdür */}
        <RoleCard
          roleKey="mudur"
          badge={
            <span className="inline-flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Müdür Paneli</span>
            </span>
          }
          title="Müdür Girişi"
          description="Randevu denetimi, şikayet yönetimi, resepsiyon yetkileri, ziyaretçi raporları."
          apiPath="/api/mudur/giris"
          navigateTo="/panel/mudur"
          storageKey="aktifMudur"
          theme={{
            base: "border-gray-300",
            ring: "border-gray-300 focus:ring-gray-800 focus:border-gray-800",
            shadow: "bg-gray-900 hover:bg-black shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
            badgeBg: "bg-gray-100",
            badgeText: "text-gray-800",
            badgeBorder: "border border-gray-300",
          }}
        />

        {/* Doktor */}
        <RoleCard
          roleKey="doktor"
          badge={
            <span className="inline-flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doktor Paneli</span>
            </span>
          }
          title="Doktor Girişi"
          description="Bugünkü randevularım, reçete yaz, muayene saatlerimi aç/kapat."
          apiPath="/api/doktor/giris"
          navigateTo="/panel/doktor"
          storageKey="aktifDoktor"
          theme={{
            base: "border-indigo-200",
            ring: "border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500",
            shadow: "bg-indigo-600 hover:bg-indigo-700 shadow-[0_12px_32px_rgba(79,70,229,0.45)]",
            badgeBg: "bg-indigo-100/70",
            badgeText: "text-indigo-700",
            badgeBorder: "border border-indigo-200",
          }}
        />

        {/* Resepsiyon */}
        <RoleCard
          roleKey="resepsiyon"
          badge={
            <span className="inline-flex items-center gap-2">
              <Headset className="w-3.5 h-3.5" />
              <span>Resepsiyon Paneli</span>
            </span>
          }
          title="Resepsiyon Girişi"
          description="Hasta kaydı aç, randevu oluştur, kapıdan giren ziyaretçiyi kayda al."
          apiPath="/api/resepsiyon/giris"
          navigateTo="/panel/resepsiyon"
          storageKey="aktifResepsiyonist"
          theme={{
            base: "border-cyan-200",
            ring: "border-cyan-300 focus:ring-cyan-500 focus:border-cyan-500",
            shadow: "bg-cyan-600 hover:bg-cyan-700 shadow-[0_12px_32px_rgba(8,145,178,0.45)]",
            badgeBg: "bg-cyan-100/70",
            badgeText: "text-cyan-700",
            badgeBorder: "border border-cyan-200",
          }}
        />
      </div>

      {/* Footer note */}
      <div className="text-[11px] text-gray-400 leading-snug text-center">
        Bu sayfa yalnızca yetkili personele özeldir. Yetkisiz erişimler kayıt altına alınır ve idari birime rapor
        edilir.
      </div>
    </div>
  );
}
