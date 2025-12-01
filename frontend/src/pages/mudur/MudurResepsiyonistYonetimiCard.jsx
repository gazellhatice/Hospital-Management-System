import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  UserSquare2,
  LockKeyhole,
  UserCheck,
  UserX,
  Loader2,
  Mail,
  IdCard,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Wand2,
} from "lucide-react";
import { apiPost, apiPut } from "../../api";

export default function MudurResepsiyonistYonetimiCard() {
  // --- form 1: yeni resepsiyonist ---
  const [adSoyad, setAdSoyad] = useState("");
  const [tcKimlikNo, setTcKimlikNo] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [mesajEkle, setMesajEkle] = useState("");
  const [mesajTipEkle, setMesajTipEkle] = useState(""); // "ok" | "err" | ""
  const [loadingEkle, setLoadingEkle] = useState(false);
  const [errEkle, setErrEkle] = useState({}); // {adSoyad?, tcKimlikNo?, email?, sifre?}

  // --- form 2: aktif/pasif ---
  const [resepsiyonistId, setResepsiyonistId] = useState("");
  const [aktifMi, setAktifMi] = useState(true);
  const [mesajAktiflik, setMesajAktiflik] = useState("");
  const [mesajTipAktiflik, setMesajTipAktiflik] = useState(""); // "ok" | "err" | ""
  const [loadingAktiflik, setLoadingAktiflik] = useState(false);
  const [errAktiflik, setErrAktiflik] = useState({}); // {resepsiyonistId?}

  // --- (isteğe bağlı) mevcut resepsiyonist isimleri (ID tahmini için ipucu)
  const [rehber, setRehber] = useState([]); // [{id, adSoyad, email}]

  const aktifMudur = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifMudur") || "null");
    } catch {
      return null;
    }
  }, []);

  const disabledAll = !aktifMudur || !aktifMudur.mudurId;

  // --- helpers ---
  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  const isTC = (v) => /^\d{11}$/.test(String(v || "").trim()); // basit 11 hane kontrolü

  function genPass(len = 10) {
    const U = "ABCDEFGHJKMNPQRSTUVWXYZÇĞİÖŞÜ";
    const L = "abcdefghjkmnpqrstuvwxyzçğıöşü";
    const D = "23456789";
    const S = "!@#$%&*?";
    const all = U + L + D + S;
    let out = U[Math.floor(Math.random() * U.length)] + L[Math.floor(Math.random() * L.length)] + D[Math.floor(Math.random() * D.length)] + S[Math.floor(Math.random() * S.length)];
    for (let i = out.length; i < len; i++) out += all[Math.floor(Math.random() * all.length)];
    return out.split("").sort(() => Math.random() - 0.5).join("");
  }

  const passwordStrength = (v) => {
    const s = String(v || "");
    let score = 0;
    if (s.length >= 8) score++;
    if (/[A-ZĞÜŞİÖÇ]/.test(s)) score++;
    if (/[a-zğüşiöç]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9ğüşiöçĞÜŞİÖÇ]/.test(s)) score++;
    return Math.min(score, 4); // 0..4
  };
  const strengthLabel = ["Zayıf", "Orta-", "Orta", "İyi", "Çok İyi"];
  const pwScore = passwordStrength(sifre);

  function validateEkle() {
    const next = {};
    if (!adSoyad.trim()) next.adSoyad = "Ad Soyad boş olamaz.";
    if (!isTC(tcKimlikNo)) next.tcKimlikNo = "TC Kimlik No 11 hane olmalı.";
    if (!isEmail(email)) next.email = "Geçerli bir e-posta girin.";
    if ((sifre || "").length < 6) next.sifre = "Şifre en az 6 karakter olmalı.";
    setErrEkle(next);
    return Object.keys(next).length === 0;
  }

  function validateAktiflik() {
    const next = {};
    if (!resepsiyonistId || isNaN(Number(resepsiyonistId))) {
      next.resepsiyonistId = "Geçerli sayısal bir ID girin.";
    }
    setErrAktiflik(next);
    return Object.keys(next).length === 0;
  }

  async function handleEkle(e) {
    e.preventDefault();
    setMesajEkle("");
    setMesajTipEkle("");
    setErrEkle({});

    if (disabledAll) {
      setMesajEkle("Önce müdür olarak giriş yapmalısınız.");
      setMesajTipEkle("err");
      return;
    }
    if (!validateEkle()) return;

    try {
      setLoadingEkle(true);
      const yeniRes = await apiPost("/api/mudur/resepsiyonist-ekle", {
        mudurId: aktifMudur.mudurId,
        adSoyad: adSoyad.trim(),
        tcKimlikNo: tcKimlikNo.trim(),
        email: email.trim(),
        sifre: sifre,
      });
      setMesajEkle("Resepsiyonist eklendi: " + (yeniRes?.adSoyad || adSoyad));
      setMesajTipEkle("ok");
      setAdSoyad("");
      setTcKimlikNo("");
      setEmail("");
      setSifre("");
      // rehberi soft refresh (mock)
      setRehber((r) => [{ id: yeniRes?.resepsiyonistId || Math.floor(Math.random() * 1000), adSoyad: yeniRes?.adSoyad || adSoyad, email }, ...r].slice(0, 6));
    } catch (err) {
      setMesajEkle(err?.response?.data?.message || "Resepsiyonist eklenemedi. Lütfen bilgileri kontrol edin.");
      setMesajTipEkle("err");
    } finally {
      setLoadingEkle(false);
    }
  }

  async function handleAktiflik(e) {
    e.preventDefault();
    setMesajAktiflik("");
    setMesajTipAktiflik("");
    setErrAktiflik({});

    if (disabledAll) {
      setMesajAktiflik("Önce müdür olarak giriş yapmalısınız.");
      setMesajTipAktiflik("err");
      return;
    }
    if (!validateAktiflik()) return;

    try {
      setLoadingAktiflik(true);
      const guncellenmis = await apiPut("/api/mudur/resepsiyonist-aktiflik", {
        resepsiyonistId: Number(resepsiyonistId),
        aktifMi: !!aktifMi,
      });

      setMesajAktiflik(
        "Güncellendi: " +
          (guncellenmis?.adSoyad || `ID ${resepsiyonistId}`) +
          " | Durum = " +
          ((guncellenmis?.aktifMi ?? aktifMi) ? "AKTİF" : "PASİF")
      );
      setMesajTipAktiflik("ok");
      setResepsiyonistId("");
      setAktifMi(true);
    } catch (err) {
      setMesajAktiflik(err?.response?.data?.message || "Aktiflik güncellenemedi. Lütfen tekrar deneyin.");
      setMesajTipAktiflik("err");
    } finally {
      setLoadingAktiflik(false);
    }
  }

  // mock rehber yükleme (ilk render)
  useEffect(() => {
    setRehber([
      { id: 1, adSoyad: "Seda Uysal", email: "seda.uysal@hastane.com" },
      { id: 2, adSoyad: "Burak Kaan", email: "burak.kaan@hastane.com" },
      { id: 3, adSoyad: "Ece Demir", email: "ece.demir@hastane.com" },
    ]);
  }, []);

  function copyPwd() {
    if (!sifre) return;
    try {
      navigator.clipboard.writeText(sifre);
    } catch {}
  }

  return (
    <section className="w-full h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_16px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 lg:col-span-3">
      {/* === BLOK 1: RESEPSİYONİST EKLE === */}
      <div className="px-6 py-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
            <UserPlus className="w-4 h-4" />
            <span>Resepsiyonist Ekle</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Yetki: Müdür
            </span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-tight">Yeni Hesap Oluştur</h2>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-[1px]" />
            <span>
              Şifreler şu an <b>düz metin</b> olarak kaydediliyor. Bir sonraki sürümde otomatik olarak hash’lenecek.
            </span>
          </p>
        </div>

        {/* mesaj */}
        {mesajEkle && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            {mesajTipEkle === "ok" ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-700 dark:text-emerald-300 shadow-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">İşlem başarılı</div>
                  <div className="opacity-90">{mesajEkle}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-500/10 px-4 py-3 text-[13px] text-rose-700 dark:text-rose-300 shadow-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">İşlem başarısız</div>
                  <div className="opacity-90">{mesajEkle}</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* form */}
        <form className="grid gap-6 text-sm md:grid-cols-2" onSubmit={handleEkle} noValidate>
          {/* Ad Soyad */}
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">Ad Soyad</label>
            <div className="relative">
              <input
                className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                  errEkle.adSoyad ? "border-rose-300 ring-rose-200 dark:border-rose-900 dark:ring-rose-900" : "border-slate-300 dark:border-slate-700"
                }`}
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                placeholder="Örn: Ayşe Korkmaz"
                disabled={disabledAll || loadingEkle}
                autoComplete="name"
              />
              <UserSquare2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errEkle.adSoyad ? <p className="text-[12px] text-rose-600 mt-1">{errEkle.adSoyad}</p> : null}
          </div>

          {/* TC */}
          <div className="md:col-span-1">
            <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">TC Kimlik No</label>
            <div className="relative">
              <input
                inputMode="numeric"
                className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                  errEkle.tcKimlikNo ? "border-rose-300 ring-rose-200 dark:border-rose-900 dark:ring-rose-900" : "border-slate-300 dark:border-slate-700"
                }`}
                value={tcKimlikNo}
                onChange={(e) => setTcKimlikNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="11 haneli TC"
                disabled={disabledAll || loadingEkle}
                autoComplete="off"
              />
              <IdCard className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errEkle.tcKimlikNo ? <p className="text-[12px] text-rose-600 mt-1">{errEkle.tcKimlikNo}</p> : null}
          </div>

          {/* E-posta */}
          <div className="md:col-span-1">
            <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">E-posta</label>
            <div className="relative">
              <input
                type="email"
                className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                  errEkle.email ? "border-rose-300 ring-rose-200 dark:border-rose-900 dark:ring-rose-900" : "border-slate-300 dark:border-slate-700"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@hastane.com"
                disabled={disabledAll || loadingEkle}
                autoComplete="email"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errEkle.email ? <p className="text-[12px] text-rose-600 mt-1">{errEkle.email}</p> : null}
          </div>

          {/* Şifre */}
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">Şifre</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPwd ? "text" : "password"}
                  className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2.5 pr-20 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                    errEkle.sifre ? "border-rose-300 ring-rose-200 dark:border-rose-900 dark:ring-rose-900" : "border-slate-300 dark:border-slate-700"
                  }`}
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="Geçici giriş şifresi"
                  disabled={disabledAll || loadingEkle}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition"
                  aria-label={showPwd ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPwd ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
                <LockKeyhole className="w-4 h-4 text-slate-400 absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSifre(genPass())}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 hover:shadow-sm"
                  title="Güçlü şifre üret"
                >
                  <Wand2 className="w-4 h-4" /> Üret
                </button>
                <button
                  type="button"
                  onClick={copyPwd}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 hover:shadow-sm"
                  title="Şifreyi kopyala"
                >
                  <Copy className="w-4 h-4" /> Kopyala
                </button>
              </div>
            </div>
            {errEkle.sifre ? (
              <p className="text-[12px] text-rose-600 mt-1">{errEkle.sifre}</p>
            ) : (
              <p className="text-[11px] text-amber-600 mt-2 leading-snug">
                Güvenlik notu: Bu şifre şu an <b>düz metin</b> olarak kaydediliyor. Bir sonraki sürümde şifrelenmiş olacak.
              </p>
            )}

            {/* şifre gücü */}
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-2 transition-all duration-300 ${
                    pwScore <= 1
                      ? "bg-rose-400"
                      : pwScore === 2
                      ? "bg-amber-400"
                      : pwScore === 3
                      ? "bg-emerald-400"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${(pwScore + 1) * 20}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Güç: {strengthLabel[pwScore]}</div>
            </div>
          </div>

          {/* Kaydet */}
          <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:bg-black active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={disabledAll || loadingEkle}
            >
              {loadingEkle ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Kaydet
            </button>
          </div>
        </form>

        {/* Küçük rehber (mock) */}
        {rehber?.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">Kayıtlı resepsiyonistler (örnek)</div>
            <ul className="text-[12px] text-slate-700 dark:text-slate-200 grid gap-1 sm:grid-cols-2">
              {rehber.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">#{r.id} • {r.adSoyad}</span>
                  <span className="truncate text-slate-500">{r.email}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* === BLOK 2: AKTİF / PASİF === */}
      <div className="px-6 py-6 bg-white dark:bg-slate-900">
        {/* header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
            {aktifMi ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserX className="w-4 h-4 text-rose-600" />}
            <span>Resepsiyonist Aktif / Pasif</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-tight">Yetki Durumu</h2>
          <p className="text-[12px] text-slate-600 dark:text-slate-400">Gerekirse bir resepsiyonistin hesabını geçici olarak durdurun.</p>
        </div>

        {/* mesaj */}
        {mesajAktiflik && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            {mesajTipAktiflik === "ok" ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-700 dark:text-emerald-300 shadow-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">Güncellendi</div>
                  <div className="opacity-90">{mesajAktiflik}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-500/10 px-4 py-3 text-[13px] text-rose-700 dark:text-rose-300 shadow-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">Güncelleme başarısız</div>
                  <div className="opacity-90">{mesajAktiflik}</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* form */}
        <form className="grid gap-6 text-sm md:grid-cols-2" onSubmit={handleAktiflik} noValidate>
          {/* Resepsiyonist ID */}
          <div className="md:col-span-1">
            <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">Resepsiyonist ID</label>
            <input
              className={`w-full rounded-lg border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition ${
                errAktiflik.resepsiyonistId ? "border-rose-300 ring-rose-200 dark:border-rose-900 dark:ring-rose-900" : "border-slate-300 dark:border-slate-700"
              }`}
              placeholder="örn: 5"
              value={resepsiyonistId}
              onChange={(e) => setResepsiyonistId(e.target.value.replace(/\D/g, ""))}
              disabled={disabledAll || loadingAktiflik}
              list="resepsiyonist-rehber"
              autoComplete="off"
            />
            <datalist id="resepsiyonist-rehber">
              {rehber.map((r) => (
                <option key={r.id} value={r.id} label={`${r.adSoyad} (${r.email})`} />
              ))}
            </datalist>
            {errAktiflik.resepsiyonistId ? (
              <p className="text-[12px] text-rose-600 mt-1">{errAktiflik.resepsiyonistId}</p>
            ) : (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-snug">
                Bir sonraki sürümde bu alan otomatik seçmeli liste olacak.
              </div>
            )}
          </div>

          {/* Durum */}
          <div className="md:col-span-1">
            <label className="block text-[12px] font-medium text-slate-700 dark:text-slate-300 mb-1">Durum</label>
            <select
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
              value={aktifMi ? "AKTIF" : "PASIF"}
              onChange={(e) => setAktifMi(e.target.value === "AKTIF")}
              disabled={disabledAll || loadingAktiflik}
            >
              <option value="AKTIF">AKTİF</option>
              <option value="PASIF">PASİF</option>
            </select>
          </div>

          {/* Güncelle */}
          <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:bg-slate-900 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={disabledAll || loadingAktiflik}
            >
              {loadingAktiflik ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Güncelle
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
