import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Hospital,
  HeartPulse,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function PublicLayout() {
  const location = useLocation();

  // aktif link style helper
  function navClass(path) {
    const base =
      "text-[13px] font-medium px-2 py-1.5 rounded-lg transition hover:text-emerald-700 hover:bg-emerald-50";
    const active =
      "text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm";
    return location.pathname === path ? `${base} ${active}` : base;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/80 backdrop-blur-sm shadow-[0_16px_48px_-8px_rgba(0,0,0,0.08)]">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* SOL: Brand */}
          <div className="flex items-start gap-3">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
              <Hospital className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <Link
                to="/"
                className="text-xl font-semibold text-gray-900 leading-none hover:text-emerald-700 transition"
              >
                Hastane Sonn
              </Link>
              <span className="text-[11px] text-gray-500 leading-none flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>Modern Sağlık Hizmeti</span>
              </span>
            </div>
          </div>

          {/* ORTA: site navigasyonu */}
          <nav className="flex flex-wrap items-center gap-3 text-gray-700 text-[13px] font-medium">
            <a
              href="/#hakkimizda"
              className="px-2 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition"
            >
              Hakkımızda
            </a>
            <a
              href="/#bolumlerimiz"
              className="px-2 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition"
            >
              Bölümlerimiz
            </a>
            <a
              href="/#doktorlarimiz"
              className="px-2 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition"
            >
              Doktorlarımız
            </a>
            <a
              href="/#iletisim"
              className="px-2 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition"
            >
              İletişim
            </a>
          </nav>

          {/* SAĞ: Aksiyonlar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Hasta Giriş */}
            <Link
              to="/hasta-giris"
              className={navClass("/hasta-giris")}
              title="Randevu, reçete, şikayet takibi"
            >
              Hasta Giriş
            </Link>

            {/* Hasta Kayıt */}
            <Link
              to="/hasta-kayit"
              className={navClass("/hasta-kayit")}
              title="Hesap oluştur"
            >
              Hasta Kayıt
            </Link>

            {/* Personel Girişi */}
            <Link
              to="/personel-giris"
              className="text-[11px] font-semibold rounded-lg border border-slate-800 text-slate-800 bg-white px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:bg-slate-800 hover:text-white hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition"
              title="Sadece Müdür / Doktor / Resepsiyon"
            >
              Personel Girişi
            </Link>
          </div>
        </div>
      </header>

      {/* SAYFA İÇERİĞİ */}
      <main className="flex-1 relative">
        {/* soft medical gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30" />
        <div className="relative max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-300 text-sm mt-10">
        <div className="max-w-6xl mx-auto p-6 grid gap-8 sm:grid-cols-3">
          {/* Hakkımızda */}
          <div id="hakkimizda" className="space-y-2">
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hastane Sonn</span>
            </div>
            <p className="text-[13px] leading-relaxed text-gray-400">
              7/24 acil servis, uzman kadro, tamamen dijital kayıt akışı.
              Amacımız: hızlı, şeffaf ve güvenli hasta deneyimi.
            </p>
            <div className="text-[11px] text-gray-500 leading-snug">
              Tüm erişimler kayıt altına alınır. Gizliliğiniz önceliğimizdir.
            </div>
          </div>

          {/* İletişim */}
          <div className="space-y-2">
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>İletişim</span>
            </div>

            <div
              id="iletisim"
              className="text-[13px] leading-relaxed text-gray-400 space-y-2"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-[2px]" />
                <span>İstanbul / Türkiye</span>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-[2px]" />
                <span>+90 555 000 00 00</span>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-[2px]" />
                <span>info@hastanesonn.com</span>
              </div>

              <div className="text-[11px] text-gray-500 leading-snug">
                Acil servisimiz 7/24 açıktır.
              </div>
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="text-[13px] leading-relaxed text-gray-400">
            <div className="text-white font-semibold text-sm mb-2">
              Hızlı Erişim
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/hasta-giris"
                  className="hover:text-emerald-400 transition"
                >
                  Hasta Giriş
                </Link>
              </li>
              <li>
                <Link
                  to="/hasta-kayit"
                  className="hover:text-emerald-400 transition"
                >
                  Hasta Kayıt
                </Link>
              </li>
              <li>
                <Link
                  to="/personel-giris"
                  className="hover:text-emerald-400 transition"
                  title="Müdür / Doktor / Resepsiyon"
                >
                  Personel Girişi
                </Link>
              </li>
              <li>
                <a
                  href="/#doktorlarimiz"
                  className="hover:text-emerald-400 transition"
                >
                  Doktorlarımız
                </a>
              </li>
              <li>
                <a
                  href="/#bolumlerimiz"
                  className="hover:text-emerald-400 transition"
                >
                  Bölümlerimiz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer alt satır */}
        <div className="border-t border-gray-800 text-[11px] text-gray-600 text-center py-4">
          © 2025 Hastane Sonn · Tüm Hakları Saklıdır · Bu yazılım bir demo
          ürünüdür ve tıbbi tavsiye yerine geçmez.
        </div>
      </footer>
    </div>
  );
}
