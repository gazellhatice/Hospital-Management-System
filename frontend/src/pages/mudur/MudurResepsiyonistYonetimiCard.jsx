import { useMemo, useState } from "react";
import { apiPost, apiPut } from "../../api";
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
} from "lucide-react";

export default function MudurResepsiyonistYonetimiCard() {
  // --- form 1: yeni resepsiyonist ---
  const [adSoyad, setAdSoyad] = useState("");
  const [tcKimlikNo, setTcKimlikNo] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
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

  const aktifMudur = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aktifMudur") || "null");
    } catch {
      return null;
    }
  }, []);

  const disabledAll = !aktifMudur || !aktifMudur.mudurId;

  // --- helpers ---
  const isEmail = (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

  const isTC = (v) => /^\d{11}$/.test(String(v || "").trim()); // basit 11 hane kontrolü

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
    } catch (err) {
      setMesajEkle("Resepsiyonist eklenemedi. Lütfen bilgileri kontrol edin.");
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
      setMesajAktiflik("Aktiflik güncellenemedi. Lütfen tekrar deneyin.");
      setMesajTipAktiflik("err");
    } finally {
      setLoadingAktiflik(false);
    }
  }

  const pwScore = passwordStrength(sifre);

  return (
    <section className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-3xl shadow-[0_10px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden divide-y divide-gray-100">
      {/* === BLOK 1: RESEPSİYONİST EKLE === */}
      <div className="px-6 py-6 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        {/* header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-900">
            <UserPlus className="w-4 h-4 text-gray-700" />
            <span>Resepsiyonist Ekle</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 leading-tight">Yeni Hesap Oluştur</h2>
          <p className="text-[13px] text-gray-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-[1px]" />
            <span>
              Şifreler şu an <b>düz metin</b> olarak kaydediliyor. Bir sonraki sürümde otomatik olarak hash’lenecek.
            </span>
          </p>
        </div>

        {/* mesaj */}
        {mesajEkle && (
          <div className="mb-4">
            {mesajTipEkle === "ok" ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">İşlem başarılı</div>
                  <div className="opacity-90">{mesajEkle}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">İşlem başarısız</div>
                  <div className="opacity-90">{mesajEkle}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* form */}
        <form className="grid gap-6 text-sm md:grid-cols-2" onSubmit={handleEkle}>
          {/* Ad Soyad */}
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Ad Soyad</label>
            <div className="relative">
              <input
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition ${
                  errEkle.adSoyad ? "border-rose-300 ring-rose-200" : "border-gray-300"
                }`}
                value={adSoyad}
                onChange={(e) => setAdSoyad(e.target.value)}
                placeholder="Örn: Ayşe Korkmaz"
                disabled={disabledAll || loadingEkle}
              />
              <UserSquare2 className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errEkle.adSoyad ? (
              <p className="text-[12px] text-rose-600 mt-1">{errEkle.adSoyad}</p>
            ) : null}
          </div>

          {/* TC */}
          <div className="md:col-span-1">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">TC Kimlik No</label>
            <div className="relative">
              <input
                inputMode="numeric"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition ${
                  errEkle.tcKimlikNo ? "border-rose-300 ring-rose-200" : "border-gray-300"
                }`}
                value={tcKimlikNo}
                onChange={(e) => setTcKimlikNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="11 haneli TC"
                disabled={disabledAll || loadingEkle}
              />
              <IdCard className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errEkle.tcKimlikNo ? (
              <p className="text-[12px] text-rose-600 mt-1">{errEkle.tcKimlikNo}</p>
            ) : null}
          </div>

          {/* E-posta */}
          <div className="md:col-span-1">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">E-posta</label>
            <div className="relative">
              <input
                type="email"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition ${
                  errEkle.email ? "border-rose-300 ring-rose-200" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@hastane.com"
                disabled={disabledAll || loadingEkle}
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errEkle.email ? (
              <p className="text-[12px] text-rose-600 mt-1">{errEkle.email}</p>
            ) : null}
          </div>

          {/* Şifre */}
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Şifre</label>
            <div className="relative">
              <input
                type="password"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition ${
                  errEkle.sifre ? "border-rose-300 ring-rose-200" : "border-gray-300"
                }`}
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="Geçici giriş şifresi"
                disabled={disabledAll || loadingEkle}
              />
              <LockKeyhole className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
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
              <div className="mt-1 text-[11px] text-gray-500">
                Güç: {strengthLabel[pwScore]}
              </div>
            </div>
          </div>

          {/* Kaydet */}
          <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:bg-black active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={disabledAll || loadingEkle}
            >
              {loadingEkle ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* === BLOK 2: AKTİF / PASİF === */}
      <div className="px-6 py-6 bg-white">
        {/* header */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-900">
            {aktifMi ? (
              <>
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Resepsiyonist Aktif / Pasif</span>
              </>
            ) : (
              <>
                <UserX className="w-4 h-4 text-rose-600" />
                <span>Resepsiyonist Aktif / Pasif</span>
              </>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 leading-tight">Yetki Durumu</h2>
          <p className="text-[13px] text-gray-600">Gerekirse bir resepsiyonistin hesabını geçici olarak durdurun.</p>
        </div>

        {/* mesaj */}
        {mesajAktiflik && (
          <div className="mb-4">
            {mesajTipAktiflik === "ok" ? (
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">Güncellendi</div>
                  <div className="opacity-90">{mesajAktiflik}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-3 text-[13px] text-rose-700 shadow-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-[2px]" />
                <div className="leading-snug">
                  <div className="font-semibold">Güncelleme başarısız</div>
                  <div className="opacity-90">{mesajAktiflik}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* form */}
        <form className="grid gap-6 text-sm md:grid-cols-2" onSubmit={handleAktiflik}>
          {/* Resepsiyonist ID */}
          <div className="md:col-span-1">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Resepsiyonist ID</label>
            <input
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition ${
                errAktiflik.resepsiyonistId ? "border-rose-300 ring-rose-200" : "border-gray-300"
              }`}
              placeholder="örn: 5"
              value={resepsiyonistId}
              onChange={(e) => setResepsiyonistId(e.target.value.replace(/\D/g, ""))}
              disabled={disabledAll || loadingAktiflik}
            />
            {errAktiflik.resepsiyonistId ? (
              <p className="text-[12px] text-rose-600 mt-1">{errAktiflik.resepsiyonistId}</p>
            ) : (
              <div className="text-[11px] text-gray-500 mt-2 leading-snug">
                Bir sonraki sürümde bu alan otomatik seçmeli liste olacak.
              </div>
            )}
          </div>

          {/* Durum */}
          <div className="md:col-span-1">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Durum</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition"
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:bg-gray-900 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
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
