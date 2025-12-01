import { useState } from "react";
import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import {
  Hospital,
  HeartPulse,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

export default function PublicLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Hakkımızda", href: "/#hakkimizda" },
    { label: "Bölümlerimiz", href: "/#bolumlerimiz" },
    { label: "Doktorlarımız", href: "/#doktorlarimiz" },
    { label: "İletişim", href: "/#iletisim" },
  ];

  function isActivePath(path) {
    return location.pathname === path;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 selection:bg-emerald-200/60">
      {/* Skip link for a11y */}
      <a
        href="#ana-icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:m-4 focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-white"
      >
        İçeriğe atla
      </a>

      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
          <p className="truncate">
            <span className="font-semibold">7/24 Acil Servis</span> · Dijital randevu ve e-reçete desteği
          </p>
          <a
            href="#iletisim"
            className="inline-flex items-center gap-1 rounded-md border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 transition"
          >
            İletişime geç <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-emerald-100/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="group inline-flex items-center gap-3"
                aria-label="Hastane Sonn ana sayfa"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm">
                  <Hospital className="h-5 w-5 transition-transform group-hover:scale-110" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    Hastane Sonn
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Modern Sağlık Hizmeti
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-gray-700">
              {navItems.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  className="px-3 py-2 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition"
                >
                  {it.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <NavLink
                to="/hasta-giris"
                className={({ isActive }) =>
                  `text-[13px] font-medium px-3 py-2 rounded-lg transition hover:text-emerald-700 hover:bg-emerald-50 ${
                    isActive ? "text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm" : ""
                  }`
                }
                title="Randevu, reçete, şikayet takibi"
              >
                Hasta Giriş
              </NavLink>
              <NavLink
                to="/hasta-kayit"
                className={({ isActive }) =>
                  `text-[13px] font-medium px-3 py-2 rounded-lg transition hover:text-emerald-700 hover:bg-emerald-50 ${
                    isActive ? "text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-sm" : ""
                  }`
                }
                title="Hesap oluştur"
              >
                Hasta Kayıt
              </NavLink>
              <NavLink
                to="/personel-giris"
                className={({ isActive }) =>
                  `text-[11px] font-semibold rounded-lg border ${
                    isActive
                      ? "border-slate-800 text-white bg-slate-800"
                      : "border-slate-800 text-slate-800 bg-white"
                  } px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:bg-slate-800 hover:text-white hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition`
                }
                title="Sadece Müdür / Doktor / Resepsiyon"
              >
                Personel Girişi
              </NavLink>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              aria-expanded={mobileOpen}
              aria-controls="mobil-menu"
              aria-label="Mobil menüyü aç/kapat"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          id="mobil-menu"
          className={`md:hidden border-t border-emerald-100/70 ${mobileOpen ? "block" : "hidden"}`}
        >
          <div className="px-4 sm:px-6 py-3 space-y-2 bg-white/90 backdrop-blur">
            {navItems.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700"
              >
                {it.label}
              </a>
            ))}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                to="/hasta-giris"
                onClick={() => setMobileOpen(false)}
                className={`text-[12px] rounded-lg px-3 py-2 text-center border ${
                  isActivePath("/hasta-giris")
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "border-emerald-200"
                }`}
              >
                Hasta Giriş
              </Link>
              <Link
                to="/hasta-kayit"
                onClick={() => setMobileOpen(false)}
                className={`text-[12px] rounded-lg px-3 py-2 text-center border ${
                  isActivePath("/hasta-kayit")
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "border-emerald-200"
                }`}
              >
                Hasta Kayıt
              </Link>
              <Link
                to="/personel-giris"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 text-[12px] font-semibold rounded-lg border border-slate-800 text-slate-800 bg-white px-3 py-2 text-center shadow hover:bg-slate-800 hover:text-white"
              >
                Personel Girişi
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main id="ana-icerik" className="flex-1 relative">
        {/* soft medical gradient & pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-200px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/40 via-transparent to-transparent blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-300 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid gap-10 md:grid-cols-3">
          {/* Hakkımızda */}
          <div id="hakkimizda" className="space-y-3">
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Hastane Sonn</span>
            </div>
            <p className="text-[13px] leading-relaxed text-gray-400">
              7/24 acil servis, uzman kadro, tamamen dijital kayıt akışı. Amacımız: hızlı, şeffaf ve güvenli hasta deneyimi.
            </p>
            <div className="text-[11px] text-gray-500 leading-snug">
              Tüm erişimler kayıt altına alınır. Gizliliğiniz önceliğimizdir.
            </div>
          </div>

          {/* İletişim */}
          <div className="space-y-3">
            <div className="text-white font-semibold text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>İletişim</span>
            </div>
            <div id="iletisim" className="text-[13px] leading-relaxed text-gray-400 space-y-2">
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
              <div className="text-[11px] text-gray-500 leading-snug">Acil servisimiz 7/24 açıktır.</div>
            </div>
          </div>

          {/* Hızlı Erişim + Bülten */}
          <div className="space-y-4">
            <div className="text-white font-semibold text-sm">Hızlı Erişim</div>
            <ul className="text-[13px] leading-relaxed text-gray-400 space-y-1">
              <li>
                <Link to="/hasta-giris" className="hover:text-emerald-400 transition">
                  Hasta Giriş
                </Link>
              </li>
              <li>
                <Link to="/hasta-kayit" className="hover:text-emerald-400 transition">
                  Hasta Kayıt
                </Link>
              </li>
              <li>
                <Link to="/personel-giris" className="hover:text-emerald-400 transition" title="Müdür / Doktor / Resepsiyon">
                  Personel Girişi
                </Link>
              </li>
              <li>
                <a href="/#doktorlarimiz" className="hover:text-emerald-400 transition">Doktorlarımız</a>
              </li>
              <li>
                <a href="/#bolumlerimiz" className="hover:text-emerald-400 transition">Bölümlerimiz</a>
              </li>
            </ul>

            {/* Basit bülten formu (mock) */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="pt-2 border-t border-white/10"
              aria-label="Bülten kaydı"
            >
              <label htmlFor="bulten" className="block text-xs text-gray-400 mb-1">
                Yeniliklerden haberdar olun
              </label>
              <div className="flex gap-2">
                <input
                  id="bulten"
                  type="email"
                  required
                  placeholder="E-posta adresiniz"
                  className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Kaydol
                </button>
              </div>
              <p className="mt-1 text-[11px] text-gray-500">Spam yok. İstediğiniz zaman ayrılabilirsiniz.</p>
            </form>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-gray-800 text-[11px] text-gray-500 text-center py-4">
          © 2025 Hastane Sonn · Tüm Hakları Saklıdır · Bu yazılım bir demo üründür ve tıbbi tavsiye yerine geçmez.
        </div>
      </footer>
    </div>
  );
}
