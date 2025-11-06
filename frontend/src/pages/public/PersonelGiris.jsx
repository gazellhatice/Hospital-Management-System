import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../api";
import {
  ShieldAlert,
  ClipboardList,
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

/* Basit helpers */
const isEmail = (v) => /\S+@\S+\.\S+/.test(String(v || "").trim());
const nonEmpty = (v) => String(v || "").trim().length > 0;

export default function PersonelGiris() {
  const navigate = useNavigate();

  // Müdür
  const [mudurEmail, setMudurEmail] = useState("");
  const [mudurSifre, setMudurSifre] = useState("");
  const [mudurShowPwd, setMudurShowPwd] = useState(false);
  const [mudurLoading, setMudurLoading] = useState(false);
  const [mudurMsg, setMudurMsg] = useState({ type: "", text: "" });

  // Doktor
  const [doktorEmail, setDoktorEmail] = useState("");
  const [doktorSifre, setDoktorSifre] = useState("");
  const [doktorShowPwd, setDoktorShowPwd] = useState(false);
  const [doktorLoading, setDoktorLoading] = useState(false);
  const [doktorMsg, setDoktorMsg] = useState({ type: "", text: "" });

  // Resepsiyon
  const [resEmail, setResEmail] = useState("");
  const [resSifre, setResSifre] = useState("");
  const [resShowPwd, setResShowPwd] = useState(false);
  const [resLoading, setResLoading] = useState(false);
  const [resMsg, setResMsg] = useState({ type: "", text: "" });

  // Canlı doğrulamalar
  const mudurValid = useMemo(() => isEmail(mudurEmail) && nonEmpty(mudurSifre), [mudurEmail, mudurSifre]);
  const doktorValid = useMemo(() => isEmail(doktorEmail) && nonEmpty(doktorSifre), [doktorEmail, doktorSifre]);
  const resValid   = useMemo(() => isEmail(resEmail)   && nonEmpty(resSifre),   [resEmail, resSifre]);

  function clearAllRoles() {
    try {
      localStorage.removeItem("aktifMudur");
      localStorage.removeItem("aktifDoktor");
      localStorage.removeItem("aktifResepsiyonist");
      localStorage.removeItem("aktifHasta");
      localStorage.removeItem("user");
    } catch (_) {}
  }

  async function handleMudur(e) {
    e.preventDefault();
    setMudurMsg({ type: "", text: "" });
    if (!mudurValid) {
      setMudurMsg({ type: "err", text: "Geçerli e-posta ve şifre girin." });
      return;
    }
    try {
      setMudurLoading(true);
      const mudur = await apiPost("/api/mudur/giris", { email: mudurEmail.trim(), sifre: mudurSifre });
      clearAllRoles();
      localStorage.setItem("aktifMudur", JSON.stringify(mudur));
      setMudurMsg({ type: "ok", text: "Giriş başarılı. Yönlendiriliyorsunuz..." });
      navigate("/panel/mudur");
    } catch (err) {
      setMudurMsg({ type: "err", text: "Müdür girişi başarısız. Bilgilerinizi kontrol edin veya yetki durumunuza bakın." });
    } finally {
      setMudurLoading(false);
    }
  }

  async function handleDoktor(e) {
    e.preventDefault();
    setDoktorMsg({ type: "", text: "" });
    if (!doktorValid) {
      setDoktorMsg({ type: "err", text: "Geçerli e-posta ve şifre girin." });
      return;
    }
    try {
      setDoktorLoading(true);
      const doktor = await apiPost("/api/doktor/giris", { email: doktorEmail.trim(), sifre: doktorSifre });
      clearAllRoles();
      localStorage.setItem("aktifDoktor", JSON.stringify(doktor));
      setDoktorMsg({ type: "ok", text: "Giriş başarılı. Yönlendiriliyorsunuz..." });
      navigate("/panel/doktor");
    } catch (err) {
      setDoktorMsg({ type: "err", text: "Doktor girişi başarısız. Hesabınız pasif olabilir veya şifre hatalı." });
    } finally {
      setDoktorLoading(false);
    }
  }

  async function handleResepsiyon(e) {
    e.preventDefault();
    setResMsg({ type: "", text: "" });
    if (!resValid) {
      setResMsg({ type: "err", text: "Geçerli e-posta ve şifre girin." });
      return;
    }
    try {
      setResLoading(true);
      const resepsiyonist = await apiPost("/api/resepsiyon/giris", { email: resEmail.trim(), sifre: resSifre });
      clearAllRoles();
      localStorage.setItem("aktifResepsiyonist", JSON.stringify(resepsiyonist));
      setResMsg({ type: "ok", text: "Giriş başarılı. Yönlendiriliyorsunuz..." });
      navigate("/panel/resepsiyon");
    } catch (err) {
      setResMsg({ type: "err", text: "Resepsiyon girişi başarısız. Hesap devre dışı olabilir ya da bilgiler hatalı." });
    } finally {
      setResLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ÜST BAŞLIK */}
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-gray-900 leading-tight">Personel Girişi</h1>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Her rol kendi paneline giriş yapar. Tüm işlemler denetim amaçlı kaydedilir.
        </p>
      </header>

      {/* 3 KART GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* MÜDÜR */}
        <section className="bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-full px-2.5 py-1 shadow-sm w-fit">
              <ShieldAlert className="w-3.5 h-3.5 text-gray-800" />
              <span>Müdür Paneli</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 leading-tight">Müdür Girişi</div>
            <p className="text-[12px] text-gray-500 leading-snug">
              Randevu denetimi, şikayet yönetimi, resepsiyonist yetkileri, ziyaretçi raporları.
            </p>
          </div>

          {mudurMsg.text && (
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 text-[13px] shadow-sm
              ${mudurMsg.type === "ok"
                ? "border border-emerald-200 bg-emerald-50/70 text-emerald-700"
                : "border border-rose-200 bg-rose-50/70 text-rose-700"}`}>
              {mudurMsg.type === "ok" ? <CheckCircle2 className="w-4 h-4 mt-[2px]" /> : <AlertTriangle className="w-4 h-4 mt-[2px]" />}
              <div className="leading-snug">{mudurMsg.text}</div>
            </div>
          )}

          <form className="space-y-4 text-sm" onSubmit={handleMudur}>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">E-posta</label>
              <div className="relative">
                <input
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none
                    ${isEmail(mudurEmail) ? "border-gray-300 focus:ring-2 focus:ring-gray-800" : "border-amber-300 focus:ring-2 focus:ring-amber-500"} transition`}
                  value={mudurEmail}
                  onChange={(e) => setMudurEmail(e.target.value)}
                  placeholder="mudur@..."
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Şifre</label>
              <div className="relative">
                <input
                  type={mudurShowPwd ? "text" : "password"}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-12 text-sm text-gray-900 shadow-sm outline-none
                    ${nonEmpty(mudurSifre) ? "border-gray-300 focus:ring-2 focus:ring-gray-800" : "border-amber-300 focus:ring-2 focus:ring-amber-500"} transition`}
                  value={mudurSifre}
                  onChange={(e) => setMudurSifre(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setMudurShowPwd((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 active:scale-[0.98] transition"
                  aria-label={mudurShowPwd ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {mudurShowPwd ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
                <LockKeyhole className="w-4 h-4 text-gray-400 absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              disabled={!mudurValid || mudurLoading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] hover:bg-black active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mudurLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Giriş yapılıyor</span> : "Giriş Yap"}
            </button>
          </form>
        </section>

        {/* DOKTOR */}
        <section className="bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-2xl shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 border border-indigo-200 rounded-full px-2.5 py-1 shadow-sm w-fit">
              <Stethoscope className="w-3.5 h-3.5 text-indigo-700" />
              <span>Doktor Paneli</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 leading-tight">Doktor Girişi</div>
            <p className="text-[12px] text-gray-500 leading-snug">Bugünkü randevularım, reçete yaz, muayene saatlerimi aç/kapat.</p>
          </div>

          {doktorMsg.text && (
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 text-[13px] shadow-sm
              ${doktorMsg.type === "ok"
                ? "border border-emerald-200 bg-emerald-50/70 text-emerald-700"
                : "border border-rose-200 bg-rose-50/70 text-rose-700"}`}>
              {doktorMsg.type === "ok" ? <CheckCircle2 className="w-4 h-4 mt-[2px]" /> : <AlertTriangle className="w-4 h-4 mt-[2px]" />}
              <div className="leading-snug">{doktorMsg.text}</div>
            </div>
          )}

          <form className="space-y-4 text-sm" onSubmit={handleDoktor}>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">E-posta</label>
              <div className="relative">
                <input
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none
                    ${isEmail(doktorEmail) ? "border-gray-300 focus:ring-2 focus:ring-indigo-500" : "border-amber-300 focus:ring-2 focus:ring-amber-500"} transition`}
                  value={doktorEmail}
                  onChange={(e) => setDoktorEmail(e.target.value)}
                  placeholder="dr@..."
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Şifre</label>
              <div className="relative">
                <input
                  type={doktorShowPwd ? "text" : "password"}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-12 text-sm text-gray-900 shadow-sm outline-none
                    ${nonEmpty(doktorSifre) ? "border-gray-300 focus:ring-2 focus:ring-indigo-500" : "border-amber-300 focus:ring-2 focus:ring-amber-500"} transition`}
                  value={doktorSifre}
                  onChange={(e) => setDoktorSifre(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setDoktorShowPwd((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 active:scale-[0.98] transition"
                  aria-label={doktorShowPwd ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {doktorShowPwd ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
                <LockKeyhole className="w-4 h-4 text-gray-400 absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              disabled={!doktorValid || doktorLoading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(79,70,229,0.45)] hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {doktorLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Giriş yapılıyor</span> : "Giriş Yap"}
            </button>
          </form>
        </section>

        {/* RESEPSİYON */}
        <section className="bg-white/80 backdrop-blur-sm border border-cyan-200 rounded-2xl shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-cyan-700 bg-cyan-100/70 border border-cyan-200 rounded-full px-2.5 py-1 shadow-sm w-fit">
              <Headset className="w-3.5 h-3.5 text-cyan-700" />
              <span>Resepsiyon Paneli</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 leading-tight">Resepsiyon Girişi</div>
            <p className="text-[12px] text-gray-500 leading-snug">Hasta kaydı aç, randevu oluştur, kapıdan giren ziyaretçiyi kayda al.</p>
          </div>

          {resMsg.text && (
            <div className={`flex items-start gap-3 rounded-lg px-4 py-3 text-[13px] shadow-sm
              ${resMsg.type === "ok"
                ? "border border-emerald-200 bg-emerald-50/70 text-emerald-700"
                : "border border-rose-200 bg-rose-50/70 text-rose-700"}`}>
              {resMsg.type === "ok" ? <CheckCircle2 className="w-4 h-4 mt-[2px]" /> : <AlertTriangle className="w-4 h-4 mt-[2px]" />}
              <div className="leading-snug">{resMsg.text}</div>
            </div>
          )}

          <form className="space-y-4 text-sm" onSubmit={handleResepsiyon}>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">E-posta</label>
              <div className="relative">
                <input
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm outline-none
                    ${isEmail(resEmail) ? "border-gray-300 focus:ring-2 focus:ring-cyan-500" : "border-amber-300 focus:ring-2 focus:ring-amber-500"} transition`}
                  value={resEmail}
                  onChange={(e) => setResEmail(e.target.value)}
                  placeholder="resepsiyon@..."
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Şifre</label>
              <div className="relative">
                <input
                  type={resShowPwd ? "text" : "password"}
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 pr-12 text-sm text-gray-900 shadow-sm outline-none
                    ${nonEmpty(resSifre) ? "border-gray-300 focus:ring-2 focus:ring-cyan-500" : "border-amber-300 focus:ring-2 focus:ring-amber-500"} transition`}
                  value={resSifre}
                  onChange={(e) => setResSifre(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setResShowPwd((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 active:scale-[0.98] transition"
                  aria-label={resShowPwd ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {resShowPwd ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
                <LockKeyhole className="w-4 h-4 text-gray-400 absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              disabled={!resValid || resLoading}
              className="w-full inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(8,145,178,0.45)] hover:bg-cyan-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Giriş yapılıyor</span> : "Giriş Yap"}
            </button>
          </form>
        </section>
      </div>

      {/* ALT NOT */}
      <div className="text-[11px] text-gray-400 leading-snug text-center">
        Bu sayfa yalnızca yetkili personele özeldir. Yetkisiz erişimler kayıt altına alınır ve idari birime rapor edilir.
      </div>
    </div>
  );
}
