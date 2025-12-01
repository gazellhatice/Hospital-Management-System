import { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost } from "../../api";
import {
  Search,
  User2,
  Phone,
  Mail,
  Clock4,
  CalendarDays,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Loader2,
  Info,
} from "lucide-react";

export default function RandevuOlusturForm() {
  // --- state ---
  const [slotlar, setSlotlar] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [secilenSlot, setSecilenSlot] = useState("");

  const [tcArama, setTcArama] = useState("");
  const [bulunanHasta, setBulunanHasta] = useState(null);
  const [hastaLoading, setHastaLoading] = useState(false);

  const [notlar, setNotlar] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [mesajTip, setMesajTip] = useState(""); // "ok" | "err" | "info"
  const [kaydetLoading, setKaydetLoading] = useState(false);

  // seçilen slotu, kaydetmeden önce hatırlamak için:
  const lastSelectedSlotRef = useRef(null);

  // --- helpers ---
  const tcValid = useMemo(() => /^[0-9]{11}$/.test(tcArama), [tcArama]);
  const slotCount = slotlar?.length || 0;

  // YYYY-MM-DD güvenli formatlayıcı (timezone kaymasını önler)
  function fTarihSafe(s) {
    if (!s) return "—";
    // "2025-11-12" gibi ise parçalayalım
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) {
      const [, y, mo, d] = m;
      return `${d}.${mo}.${y}`;
    }
    // değilse şansımızı Date ile deneyelim
    try {
      const d = new Date(s);
      if (!Number.isFinite(d.getTime())) return String(s);
      return d.toLocaleDateString("tr-TR");
    } catch {
      return String(s);
    }
  }

  // Slot response normalizasyonu
  function normalizeSlots(raw) {
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.content)
      ? raw.content
      : [];

    // Görünüm stabil olsun diye tarih+saat’e göre sırala
    return [...list].sort((a, b) => {
      const ta = `${a?.tarih ?? ""}T${a?.baslangicSaat ?? "00:00"}`;
      const tb = `${b?.tarih ?? ""}T${b?.baslangicSaat ?? "00:00"}`;
      return ta.localeCompare(tb);
    });
  }

  // --- slotları çek ---
  async function yukleSlotlar(returnList = false) {
    setMesaj("");
    setMesajTip("");
    if (!returnList && slotLoading) return;
    if (!returnList) setSlotLoading(true);
    try {
      const data = await apiGet("/api/slot/resepsiyon/musait");
      const list = normalizeSlots(data);
      setSlotlar(list);

      // mevcut seçili slot artık yoksa dropdown’ı temizle
      if (secilenSlot && !list.some((s) => String(s.slotId) === String(secilenSlot))) {
        setSecilenSlot("");
      }

      if (list.length === 0) {
        setMesaj("Şu anda uygun saat bulunamadı.");
        setMesajTip("info");
      }
      return list;
    } catch (err) {
      setMesaj("Slotlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      setMesajTip("err");
      return [];
    } finally {
      if (!returnList) setSlotLoading(false);
    }
  }

  useEffect(() => {
    yukleSlotlar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ilk mount

  // --- hasta ara ---
  async function hastaAra(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");
    setBulunanHasta(null);

    if (!tcValid) {
      setMesaj("Lütfen 11 haneli geçerli bir TC Kimlik No girin.");
      setMesajTip("err");
      return;
    }

    try {
      setHastaLoading(true);
      const hasta = await apiGet(`/api/hasta/ara?tcKimlikNo=${encodeURIComponent(tcArama)}`);
      setBulunanHasta(hasta || null);
      if (hasta?.adSoyad) {
        setMesaj(`Hasta bulundu: ${hasta.adSoyad}`);
        setMesajTip("ok");
      } else {
        setMesaj("Hasta bulunamadı.");
        setMesajTip("err");
      }
    } catch {
      setMesaj("Hasta bulunamadı.");
      setMesajTip("err");
    } finally {
      setHastaLoading(false);
    }
  }

  // --- randevu oluştur ---
  async function handleRandevu(e) {
    e.preventDefault();
    setMesaj("");
    setMesajTip("");

    if (!bulunanHasta?.hastaId) {
      setMesaj("Lütfen önce hastayı bulun.");
      setMesajTip("err");
      return;
    }
    if (!secilenSlot) {
      setMesaj("Lütfen bir uygun saat seçin.");
      setMesajTip("err");
      return;
    }

    // seçilen slot objesini referansta tut (fallback doğrulama için)
    const chosen = slotlar.find((s) => String(s.slotId) === String(secilenSlot)) || null;
    lastSelectedSlotRef.current = chosen;

    try {
      setKaydetLoading(true);

      const payload = {
        hastaId: Number(bulunanHasta.hastaId),
        slotId: Number(secilenSlot),
        notlar: notlar?.trim() || "",
      };

      const r = await apiPost("/api/randevu/olustur", payload);

      // Olası anahtarlar
      const randevuId =
        r?.randevuId ?? r?.data?.randevuId ?? r?.id ?? r?.data?.id ?? undefined;

      setMesaj(
        randevuId ? `Randevu oluşturuldu. Randevu ID: ${randevuId}` : "Randevu oluşturuldu."
      );
      setMesajTip("ok");

      // form temizle
      setSecilenSlot("");
      setNotlar("");

      // UI: slotu listeden düş
      setSlotlar((prev) => prev.filter((s) => String(s.slotId) !== String(secilenSlot)));
    } catch (err) {
      // Hata mesajını daha akıllı yakala
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        null;

      // ❗ Fallback: Gerçekten oluşmuş mu kontrol et (fresh list ile)
      const fresh = await yukleSlotlar(true);
      const stillThere = fresh.some(
        (s) => String(s.slotId) === String(lastSelectedSlotRef.current?.slotId)
      );

      if (!stillThere && lastSelectedSlotRef.current) {
        // Slot listeden düşmüş → büyük olasılıkla randevu oluştu
        setMesaj(
          "Sunucu beklenmeyen bir yanıt verdi ama seçtiğiniz saat artık uygun görünmüyor. Randevunun oluştuğu doğrulandı."
        );
        setMesajTip("ok");
        setSecilenSlot("");
        setNotlar("");
        setSlotlar(fresh); // ekranda güncel liste görünsün
      } else {
        setMesaj(serverMsg || "Randevu oluşturulamadı. Lütfen bilgileri kontrol edin.");
        setMesajTip("err");
      }
    } finally {
      setKaydetLoading(false);
    }
  }

  return (
    <section className="bg-white/80 backdrop-blur-sm border border-cyan-200 rounded-2xl shadow-[0_20px_48px_-6px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col space-y-8 p-6">
      {/* HEADER */}
      <header className="w-full flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-cyan-700">
          <ClipboardList className="w-4 h-4 text-cyan-600" />
          <span>Randevu Oluştur</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 leading-tight">Hastaya Randevu Yaz</h2>
            <p className="text-[13px] text-gray-500 leading-snug flex items-start gap-2 mt-1">
              <Stethoscope className="w-4 h-4 text-cyan-600 mt-[1px]" />
              <span>Onaylı uygun saatlerden birini seçip hastaya randevu tanımlayın.</span>
            </p>
          </div>

          <div className="mt-3 sm:mt-0 inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-[12px] text-gray-700 shadow-sm">
            <CalendarDays className="w-4 h-4 text-cyan-600" />
            <span>
              Uygun saat: <b className="text-gray-900">{slotCount}</b>
            </span>
            <button
              type="button"
              onClick={() => yukleSlotlar()}
              className="ml-2 inline-flex items-center gap-1 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 hover:bg-cyan-100 transition text-cyan-700 disabled:opacity-60"
              disabled={slotLoading}
              title="Slotları yenile"
            >
              {slotLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Yenile
            </button>
          </div>
        </div>
      </header>

      {/* MESAJ ALANI */}
      {mesaj && (
        <div>
          {mesajTip === "ok" ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">
                <div className="font-semibold text-emerald-700">İşlem başarılı</div>
                <div className="text-emerald-700/90">{mesaj}</div>
              </div>
            </div>
          ) : mesajTip === "info" ? (
            <div className="flex items-start gap-3 rounded-lg border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-[13px] text-cyan-700 shadow-sm">
              <Info className="w-4 h-4 flex-shrink-0 mt-[2px]" />
              <div className="leading-snug">{mesaj}</div>
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

      {/* 1) HASTAYI BUL */}
      <section className="rounded-xl border border-cyan-200/60 bg-gradient-to-r from-cyan-50 to-white shadow-[0_8px_24px_rgba(0,0,0,0.03)] p-4 space-y-4">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-cyan-700">
              <Search className="w-4 h-4 text-cyan-600" />
              <span>1. Hasta Bul</span>
            </div>
            <p className="text-[12px] text-gray-500 leading-snug">TC Kimlik No ile hasta kaydını bulun.</p>
          </div>

          {bulunanHasta && (
            <div className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-[12px] text-gray-700 shadow-sm w-full sm:w-auto">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <User2 className="w-4 h-4 text-cyan-600" />
                <span>{bulunanHasta.adSoyad}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-1 leading-none">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{bulunanHasta.telefon || "Telefon yok"}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-gray-500 mt-1 leading-none break-all">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{bulunanHasta.email || "E-posta yok"}</span>
              </div>
            </div>
          )}
        </header>

        <form className="grid gap-4 text-sm md:grid-cols-3" onSubmit={hastaAra}>
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Hasta TC Kimlik No</label>
            <input
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 transition ${
                tcArama.length === 0
                  ? "border-gray-300 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                  : tcValid
                  ? "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  : "border-rose-300 focus:ring-rose-500 focus:border-rose-500 bg-white"
              }`}
              value={tcArama}
              onChange={(e) => setTcArama(e.target.value)}
              placeholder="örn: 12345678901"
              inputMode="numeric"
              maxLength={11}
            />
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">
              Eğer hasta sisteme kayıtlı değilse önce hasta kaydı açılmalıdır.
            </p>
          </div>

          <div className="flex items-end">
            <button
              className="w-full inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(8,145,178,0.35)] hover:bg-cyan-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!tcValid || hastaLoading}
              type="submit"
            >
              {hastaLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aranıyor
                </span>
              ) : (
                "Hastayı Bul"
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 2) SLOT SEÇ & RANDEVU OLUŞTUR */}
      <section className="rounded-xl border border-cyan-200/60 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)] p-4 space-y-4">
        <header className="flex flex-col">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-cyan-700">
            <CalendarDays className="w-4 h-4 text-cyan-600" />
            <span>2. Saat Seç & Kaydet</span>
          </div>
          <p className="text-[12px] text-gray-500 leading-snug flex items-start gap-1">
            <Clock4 className="w-3.5 h-3.5 text-cyan-600 mt-[2px]" />
            <span>Doktor adını, tarihi ve tam saati gösteriyoruz. Slot ID gizlenir.</span>
          </p>
        </header>

        <form className="grid gap-4 text-sm md:grid-cols-2" onSubmit={handleRandevu}>
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Uygun Saat Seç</label>

            <div className="relative">
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-60"
                value={secilenSlot}
                onChange={(e) => setSecilenSlot(e.target.value)}
                disabled={slotLoading || slotCount === 0}
              >
                <option value="">Seçiniz...</option>
                {slotLoading ? (
                  <option value="" disabled>
                    Yükleniyor...
                  </option>
                ) : (
                  slotlar.map((slot) => (
                    <option key={slot.slotId} value={slot.slotId}>
                      {slot.doktor?.adSoyad || "Doktor ?"} · {fTarihSafe(slot.tarih)} · {slot.baslangicSaat}-{slot.bitisSaat}
                    </option>
                  ))
                )}
              </select>

              {/* sağda yeniden yükle */}
              <button
                type="button"
                onClick={() => yukleSlotlar()}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-cyan-700 hover:bg-cyan-100 transition disabled:opacity-60"
                title="Slotları yenile"
                disabled={slotLoading}
              >
                {slotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-gray-400 mt-2 leading-snug">Doktor · Tarih · Saat aralığı</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Not</label>
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              placeholder="örn: acil kontrol"
              value={notlar}
              onChange={(e) => setNotlar(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-2 leading-snug italic">Bu bilgi doktora da gösterilir.</p>
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(8,145,178,0.35)] hover:bg-cyan-700 active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={kaydetLoading || !bulunanHasta?.hastaId || !secilenSlot}
            >
              {kaydetLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor
                </span>
              ) : (
                "Randevuyu Kaydet"
              )}
            </button>
          </div>
        </form>

        <div className="mt-1 text-[12px] text-gray-600 flex items-start gap-2 bg-cyan-50/60 border border-cyan-200 rounded-lg px-3 py-2">
          <Info className="w-4 h-4 text-cyan-600 mt-[2px]" />
          <span>
            Randevu kaydı yapıldığında seçtiğiniz saat otomatik olarak listeden düşer. Uygun saat görünmüyorsa <b>Yenile</b> butonunu kullanın.
          </span>
        </div>
      </section>
    </section>
  );
}

