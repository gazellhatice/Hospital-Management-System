import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  Clock4,
  Building2,
  Phone,
  MapPin,
  Mail,
  UserRound,
  ChevronRight,
  Hospital,
  Megaphone,
  ChevronDown,
  Info,
  Star,
  CalendarDays,
  BadgeCheck,
} from "lucide-react";

/* ==========================================
   Tiny helpers
   ========================================== */
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* ---------- StatCard ---------- */
function StatCard({ icon: Icon, value, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-xl border border-cyan-100 bg-white p-3 text-[12px] text-gray-700 shadow-sm hover:shadow-md transition"
      role="group"
    >
      <div className="flex items-center gap-2 font-semibold text-gray-900">
        <Icon className="w-4 h-4" aria-hidden />
        <span>{value}</span>
      </div>
      <div className="mt-0.5 text-gray-500 leading-snug">{label}</div>
    </motion.div>
  );
}

/* ---------- DoctorCard ---------- */
function DoctorCard({ photoText, name, title, exp, rating, available, tags }) {
  return (
    <li className="group relative bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-cyan-200 transition overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-cyan-50/50 to-emerald-50/40" />
      <div className="relative z-10 flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 font-semibold grid place-items-center">
          {photoText}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <BadgeCheck className="w-4 h-4 text-emerald-600" aria-hidden />
          </div>
          <div className="text-[13px] text-gray-600">{title}</div>

          {/* meta */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-gray-600">
            <span className="inline-flex items-center gap-1">
              <Clock4 className="w-3.5 h-3.5 text-gray-500" />
              {exp} yıl deneyim
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              {Number(rating).toFixed(1)}
            </span>
            {available ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                <CalendarDays className="w-3.5 h-3.5" />
                Uygun slot var
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded-full">
                <CalendarDays className="w-3.5 h-3.5" />
                Yakında uygun
              </span>
            )}
          </div>

          {/* tags */}
          {Array.isArray(tags) && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] text-cyan-800 bg-cyan-50 border border-cyan-100 rounded-full px-2 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-4">
            <Link
              to="/hasta-giris"
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-800 rounded-lg px-3 py-2 shadow-sm active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60"
              aria-label={`${name} için randevu saatlerini gör`}
            >
              <CalendarDays className="w-4 h-4" />
              Randevu Saatlerini Gör
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ---------- FeatureCard ---------- */
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <li className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-cyan-50/60 to-emerald-50/60"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="font-semibold text-gray-900 flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-600" aria-hidden />
          <span>{title}</span>
        </div>
        <p className="text-[12px] text-gray-500 mt-1 leading-snug">{description}</p>
      </div>
    </li>
  );
}

/* ---------- Duyuru Şeridi ---------- */
function DuyuruSeridi() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <aside
      aria-label="Sistem duyurusu"
      className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3 shadow-sm flex items-start gap-3"
    >
      <Megaphone className="w-4 h-4 mt-[2px]" aria-hidden />
      <div className="text-sm leading-relaxed">
        <div className="font-medium">Duyuru:</div>
        <div className="text-[13px]">
          Sistem bakım çalışması <b>01 Kasım 2025, 02:00–04:00</b> arasında yapılacaktır. Bu saatlerde randevu
          işlemlerinde kesintiler olabilir.
        </div>
      </div>
      <button
        onClick={() => setHidden(true)}
        className="ml-auto text-amber-800/70 hover:text-amber-900 text-sm font-medium underline underline-offset-4"
        aria-label="Duyuruyu kapat"
      >
        Kapat
      </button>
    </aside>
  );
}

/* ---------- FAQ / Akordeon ---------- */
function FAQItem({ q, a, open, onToggle, idx }) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-panel-${idx}`}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 rounded-xl"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-600" aria-hidden />
          <span className="font-medium text-gray-900">{q}</span>
        </div>
        <ChevronDown
          className={classNames("w-4 h-4 text-gray-500 transition-transform", open ? "rotate-180" : "")}
          aria-hidden
        />
      </button>
      <div
        id={`faq-panel-${idx}`}
        className={classNames(
          "grid transition-all duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-[13px] text-gray-600 leading-relaxed">{a}</div>
        </div>
      </div>
    </div>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const items = [
    {
      q: "Randevu nasıl oluşturulur?",
      a: "Hasta girişi yaptıktan sonra 'Randevu Oluştur' adımlarını izleyin. Uygun hekim ve saat seçildikten sonra onaylayın. SMS/e-posta ile bilgilendirme yapılır.",
    },
    {
      q: "Reçetelerimi nereden görebilirim?",
      a: "Hasta panelindeki 'Reçetelerim' sayfasında geçmiş reçetelerinizi hekim ve tarih bazında görüntüleyebilirsiniz.",
    },
    {
      q: "Geri bildirim/şikayet nasıl iletilir?",
      a: "Hasta panelinde 'Şikayetlerim' bölümünden yeni kayıt oluşturabilirsiniz. İlgili birimler en kısa sürede dönüş yapacaktır.",
    },
    {
      q: "Randevu iptal koşulları nelerdir?",
      a: "Randevularınızı muayene saatinden en az 6 saat önce ücretsiz iptal edebilirsiniz. 6 saatten az kala iptaller yoğunluk yönetimi nedeniyle kısıtlanabilir. Geç bildirilen iptaller, tekrar randevu alımında öncelik durumunuzu etkileyebilir.",
    },
    {
      q: "Geç kalma politikası nedir?",
      a: "Randevu saatine 10 dakikadan fazla gecikme durumunda randevunuz iptal edilebilir veya en uygun bir sonraki boş slota taşınır. Lütfen bekleme sürelerini azaltmak için birkaç dakika erken geliniz.",
    },
    {
      q: "Randevuyu kimler görebilir? (Yetki & Güvenlik)",
      a: "Randevular yalnızca ilgili hasta, yetkili hekim, resepsiyon ve gerekli hallerde yönetim tarafından görüntülenebilir. Tüm erişimler denetim kayıtlarına işlenir.",
    },
    {
      q: "Kişisel verilerimi silebilir miyim?",
      a: "KVKK kapsamında silme/anonimleştirme talebi oluşturabilirsiniz. Yasal saklama süreleri dolmuş kayıtlar güvenli biçimde silinir veya anonim hale getirilir.",
    },
  ];

  return (
    <section
      id="sss"
      className="bg-white border border-gray-200 rounded-2xl shadow-[0_16px_40px_-6px_rgba(0,0,0,0.08)] p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-gray-700" aria-hidden />
        <span>Sıkça Sorulan Sorular</span>
      </h2>
      <p className="text-[13px] text-gray-500 leading-relaxed mb-4">
        Hasta ve personel süreçlerinde en çok merak edilen başlıklar.
      </p>

      <div className="space-y-3">
        {items.map((it, i) => (
          <FAQItem
            key={it.q}
            idx={i}
            q={it.q}
            a={it.a}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}

/* ==========================================
   ANA SAYFA
   ========================================== */
export default function Anasayfa() {
  const stats = useMemo(
    () => [
      { icon: Stethoscope, value: "24", label: "Aktif Hekim" },
      { icon: Clock4, value: "480+", label: "Günlük Randevu Kapasitesi" },
      { icon: ShieldCheck, value: "%97", label: "Hasta Memnuniyeti" },
    ],
    []
  );

  const bolumler = useMemo(
    () => [
      { icon: Stethoscope, title: "Dahiliye", description: "İç hastalıkları tanı & takip" },
      { icon: HeartPulse, title: "Kardiyoloji", description: "Kalp sağlığı ve ritim izleme" },
      { icon: ShieldCheck, title: "Ortopedi", description: "Kas-iskelet sistemi tedavileri" },
      { icon: Stethoscope, title: "Nöroloji", description: "Sinir sistemi muayenesi" },
      { icon: ShieldCheck, title: "Radyoloji", description: "Görüntüleme ve raporlama" },
      { icon: HeartPulse, title: "Çocuk Sağlığı", description: "Pediatrik muayene ve takip" },
    ],
    []
  );

  const doctors = useMemo(
    () => [
      {
        photoText: "EK",
        name: "Uzm. Dr. Elif Kaya",
        title: "Kardiyoloji",
        exp: 12,
        rating: 4.8,
        available: true,
        tags: ["EKO", "Holter", "Hipertansiyon"],
      },
      {
        photoText: "MA",
        name: "Op. Dr. Murat Aksoy",
        title: "Ortopedi ve Travmatoloji",
        exp: 9,
        rating: 4.7,
        available: false,
        tags: ["Artroskopi", "Spor Yaralanmaları", "Omuz"],
      },
      {
        photoText: "SN",
        name: "Doç. Dr. Selin Nur",
        title: "Nöroloji",
        exp: 11,
        rating: 4.9,
        available: true,
        tags: ["Migren", "Epilepsi", "EMG"],
      },
      {
        photoText: "AH",
        name: "Uzm. Dr. Ahmet Hakan",
        title: "Dahiliye",
        exp: 7,
        rating: 4.6,
        available: true,
        tags: ["Diyabet", "Tiroid", "Check-up"],
      },
    ],
    []
  );

  return (
    <div className="space-y-12 relative">
      {/* BG Decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-100 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-100 blur-3xl opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.08),_transparent_60%)]" />
      </div>

      {/* Duyuru */}
      <DuyuruSeridi />

      {/* HERO */}
      <section
        className="bg-white border border-cyan-200 rounded-2xl shadow-[0_24px_64px_-8px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col lg:flex-row lg:items-stretch"
        aria-labelledby="hero-title"
      >
        {/* Left: text + cta */}
        <div className="flex-1 p-6 sm:p-8 bg-gradient-to-br from-cyan-50 via-white to-white">
          <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-cyan-700 bg-cyan-100/70 border border-cyan-200 rounded-full px-3 py-1 shadow-sm mb-4 w-fit">
            <Hospital className="w-3.5 h-3.5" aria-hidden />
            <span>Hastane Sonn</span>
          </div>

          <h1
            id="hero-title"
            className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight tracking-tight"
          >
            Modern sağlık hizmeti.
            <br className="hidden sm:block" />
            Güvenilir kayıt sistemi.
          </h1>

          <p className="text-gray-600 mt-3 text-base leading-relaxed max-w-xl">
            Randevularınızı yönetin, reçetelerinizi görüntüleyin, gerektiğinde yönetime anında geri bildirim verin.
            Doktorlarımız ve resepsiyon ekibimiz tek bir sistem üzerinde çalışır.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 mt-6 text-sm">
            <Link
              to="/hasta-giris"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white shadow-[0_12px_32px_rgba(16,185,129,0.35)] hover:bg-emerald-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 transition"
              aria-label="Hasta girişi yap"
            >
              <UserRound className="w-4 h-4 mr-2" aria-hidden />
              Hasta Giriş
            </Link>

            <Link
              to="/hasta-kayit"
              className="inline-flex items-center justify-center rounded-lg border border-emerald-600 text-emerald-700 bg-white px-4 py-2.5 font-medium shadow-[0_4px_16px_rgba(16,185,129,0.15)] hover:bg-emerald-50 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 transition"
              aria-label="Yeni hasta kaydı oluştur"
            >
              <ChevronRight className="w-4 h-4 mr-2 text-emerald-600" aria-hidden />
              Yeni Hasta Kaydı
            </Link>

            <Link
              to="/personel-giris"
              className="inline-flex items-center justify-center text-gray-700 hover:text-cyan-700 hover:underline underline-offset-4 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600/30 rounded-md px-1 transition"
              aria-label="Personel girişi sayfası"
            >
              Personel Girişi
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-7 grid grid-cols-3 gap-3 max-w-xl">
            {stats.map((s) => (
              <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </div>
        </div>

        {/* Right: working hours / emergency */}
        <div className="flex-1 min-w-[280px] border-t lg:border-l lg:border-t-0 border-cyan-100 bg-white p-6 sm:p-8 flex flex-col justify-between">
          <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 shadow-inner text-sm text-gray-700 p-4">
            <div className="font-semibold text-gray-900 text-[14px] flex items-center gap-2 mb-2">
              <Clock4 className="w-4 h-4 text-cyan-700" aria-hidden />
              <span>Çalışma Saatlerimiz</span>
            </div>
            <div className="text-[13px] leading-relaxed text-gray-700">
              Hafta içi: <b>09:00 – 18:00</b>
              <br />
              Poliklinik randevu ile
              <br />
              <span className="text-gray-500 text-[12px] block mt-2 leading-snug">
                (*) İşlem yoğunluğuna göre saatler değişebilir.
              </span>
            </div>

            <div className="mt-4 text-[13px] rounded-lg bg-white border border-rose-200/60 text-rose-700 px-3 py-2 shadow-sm flex flex-col">
              <span className="font-semibold flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" aria-hidden />
                <span>Acil Servis</span>
              </span>
              <span className="text-[12px] leading-snug text-rose-700/90">7 / 24 hizmet veriyoruz</span>
            </div>
          </div>

          <p className="hidden lg:block text-[11px] text-gray-400 leading-snug mt-6">
            Bu sistemdeki tüm işlemler denetim amaçlı kaydedilir. İzinsiz erişim güvenlik politikalarımız gereği
            raporlanır.
          </p>
        </div>
      </section>

      {/* BÖLÜMLER */}
      <section
        id="bolumlerimiz"
        className="bg-white border border-gray-200 rounded-2xl shadow-[0_16px_40px_-6px_rgba(0,0,0,0.08)] p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-700" aria-hidden />
              <span>Bölümlerimiz</span>
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Her bölüm alanında uzman hekimler ve gelişmiş cihaz altyapısıyla hizmet verir.
            </p>
          </div>
          <Link
            to="#doktorlarimiz"
            className="hidden sm:inline-flex items-center gap-1 text-[12px] font-medium text-cyan-700 hover:underline underline-offset-4"
            aria-label="Doktorlar bölümüne git"
          >
            Doktorlarımızı Gör <ChevronDown className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
          {bolumler.map((b) => (
            <FeatureCard key={b.title} icon={b.icon} title={b.title} description={b.description} />
          ))}
        </ul>
      </section>

      {/* DOKTORLAR */}
      <section
        id="doktorlarimiz"
        className="bg-white border border-gray-200 rounded-2xl shadow-[0_16px_40px_-6px_rgba(0,0,0,0.08)] p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-cyan-600" aria-hidden />
            <span>Doktorlarımız</span>
          </h2>
          <Link
            to="/hasta-giris"
            className="text-[12px] font-medium text-cyan-700 hover:underline underline-offset-4"
          >
            Tüm randevu saatlerini gör
          </Link>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Müdür onaylı uzman kadro. Randevu slotları sistem tarafından denetlenir.
        </p>

        <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <DoctorCard key={d.name} {...d} />
          ))}
        </ul>

        <div className="mt-4 text-[12px] text-gray-500 border border-gray-200 bg-gray-50 rounded-lg p-3">
          İpucu: “Randevu Saatlerini Gör” butonu hasta girişi sonrasında hekimin açık slotlarını listeler.
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* İLETİŞİM */}
      <section
        id="iletisim"
        className="bg-white border border-gray-200 rounded-2xl shadow-[0_16px_40px_-6px_rgba(0,0,0,0.08)] p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-700" aria-hidden />
          <span>İletişim</span>
        </h2>

        <div className="grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-[2px]" aria-hidden />
            <div className="leading-relaxed text-[13px] text-gray-600">
              <div className="text-gray-900 font-medium text-sm mb-1">Adres</div>
              İstanbul / Türkiye
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex items-start gap-3">
            <Phone className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-[2px]" aria-hidden />
            <div className="leading-relaxed text-[13px] text-gray-600">
              <div className="text-gray-900 font-medium text-sm mb-1">Telefon</div>
              +90 555 000 00 00
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 flex items-start gap-3 sm:col-span-2 lg:col-span-1">
            <Mail className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-[2px]" aria-hidden />
            <div className="leading-relaxed text-[13px] text-gray-600">
              <div className="text-gray-900 font-medium text-sm mb-1">E-posta</div>
              info@hastanesonn.com
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 leading-snug mt-6">
          Bu bir demo yazılımıdır. Gerçek randevu, reçete ya da tıbbi yönlendirme niteliği taşımaz ve sağlık
          profesyoneli tavsiyesi yerine geçmez.
        </p>
      </section>
    </div>
  );
}
