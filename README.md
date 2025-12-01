Hospital – Hastane Yönetim Sistemi 🏥

Bu proje, Yazılım Tasarımı ve Mimarisi dersi kapsamında geliştirilen,
çok rollü (Müdür / Doktor / Resepsiyonist / Hasta) bir Hastane Yönetim Sistemidir.
Amaç; randevu, reçete, şikâyet, ziyaretçi kaydı ve hasta yönetimi gibi süreçleri
Spring Boot + PostgreSQL tabanlı bir backend ve React + Tailwind tabanlı modern bir frontend ile tek bir sistemde toplamaktır.

🔹 Özellikler
Roller:
Müdür Paneli:
Personel (doktor, resepsiyonist) giriş hesabı oluşturma
Randevu / reçete / şikâyet kayıtlarını izleme
Ziyaretçi raporları

Doktor Paneli:
Günlük randevuları listeleme
Hastaya reçete yazma
Muayene çalışma saatlerini (slot) açma / kapatma

Resepsiyon Paneli:
Yeni hasta kaydı oluşturma
Doktorlara randevu atama
Kapıdan giren ziyaretçi kayıtlarını tutma

Hasta Paneli:
Hasta girişi
Kendi randevularını görüntüleme
Doktor / hastane hakkında şikâyet oluşturma

🧱 Teknolojiler

Backend:
Java 17+
Spring Boot (Web, Data JPA, Validation, Lombok vb.)
PostgreSQL
Maven
Katmanlı mimari: Controller → Service → Repository → Entity

Frontend:
React (Vite)
Tailwind CSS
Framer Motion (animasyonlar)
Lucide React (ikon seti)
localStorage ile oturum bilgisi yönetimi

🏗 Proje Mimarisi

Depo yapısı yaklaşık olarak şu şekildedir:
hospital/
├── backend/
│   ├── src/main/java/com/hospital/
│   │   ├── config/         # Security, CORS vb.
│   │   ├── controller/     # REST controller’lar
│   │   ├── service/        # İş mantığı (business logic)
│   │   ├── repository/     # Spring Data JPA repository’leri
│   │   └── model/          # Entity ve DTO sınıfları
│   └── src/main/resources/
│       └── application.properties
└── client/                 # React + Vite + Tailwind frontend
    ├── src/
    │   ├── api/            # apiGet, apiPost helper’ları
    │   ├── pages/          # Sayfalar (Anasayfa, Panel vs.)
    │   └── components/     # Panel kartları, formlar
    └── index.html

MVC Mantığı:

Model: model/ altındaki JPA entity’leri, DTO’lar ve domain sınıfları

View: React bileşenleri (client tarafı SPA)

Controller: Spring Boot REST Controller’ları (@RestController)

Sunucu tarafında klasik MVC + katmanlı mimari uygulanırken,
View katmanı ayrı bir React SPA olarak çalışmaktadır.

Gereksinimler:
Java 17+
Maven 3+
Node.js 18+
PostgreSQL 14+ (veya uyumlu sürüm)
Git

🔑 Giriş ve Roller

Personel girişi için rota genelde:
Personel Giriş Sayfası: /personel-giris
Müdür girişi → /panel/mudur
Doktor girişi → /panel/doktor
Resepsiyon girişi → /panel/resepsiyon
Hasta girişi için (route yapısına göre):
/hasta-giris veya benzeri bir sayfa
Başarılı giriş sonrası /panel/hasta vb.

Varsayılan kullanıcılar direkt veritabanına INSERT ile eklenir
(örn. mudur, doktor, resepsiyonist, hasta tabloları).

🧩 Başlıca Modüller

Müdür Paneli - 
Resepsiyonist kayıt formu (yeni hesap açma)
Doktor hesaplarını listeleme / aktif-pasif yapma
Ziyaretçi raporlarını tarih aralığına göre filtreleme

Doktor Paneli -
Bugünkü randevuları listeleme
Randevu üzerinden hastaya geçiş
Reçete yazma:
Hasta ID + ilaç listesi + açıklama
Çalışma saatleri (slot) oluşturma / silme

Resepsiyon Paneli -
Yeni hasta kaydı
Doktor & tarih seçerek randevu oluşturma
Ziyaretçi kayıt formu:
Ziyaretçi adı, sebebi, notlar, tarih-saat

Hasta / Şikâyet Sistemi - 
Hasta kendi hesabı ile giriş yapar
Doktor / hastane hakkında şikâyet formu doldurur
Şikâyetler müdür panelinden görüntülenir

🧠 Tasarım Kalıpları (Design Patterns)

Proje, Yazılım Tasarımı ve Mimarisi dersi kapsamında çeşitli tasarım kalıpları kullanılarak geliştirilmiştir. Örnekler:

Template Method - 
Örnek: SikayetServisi içinde şikâyet oluşturma akışı
Şikâyet oluşturma adımları sabit, alt adımlar hook metodlarla genişletilebilir.

Adapter - 
Örnek: ComplaintAdapter ve DefaultComplaintAdapter
Dışarıdan gelen şikâyet DTO’sunu domain entity’sine dönüştürmek için adaptör.

Strategy / Factory / Builder / Singleton vb. - 
Randevu oluşturma stratejileri
Doktor çalışma saatleri slot üretimi
Ortak servis ve helper sınıfları




