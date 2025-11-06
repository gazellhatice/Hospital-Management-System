# 🏥 Hospital Sonn – Hastane Yönetim Sistemi

Bu proje, **Spring Boot + PostgreSQL** tabanlı bir **backend** ile  
**React + Tailwind CSS** tabanlı bir **frontend**’den oluşan tam kapsamlı bir hastane yönetim sistemidir.  
Yapı, **MVC (Model–View–Controller)** mimarisine ve **katmanlı mimari** prensiplerine uygun olarak geliştirilmiştir.

---

## 🎯 Genel Bakış

### 👥 Roller
- **Müdür (Admin / Manager)**
- **Doktor**
- **Resepsiyonist**
- **Hasta**

### 🎯 Amaç
Bu sistemde hastanenin **randevu**, **reçete**, **ziyaretçi kaydı** ve **şikâyet süreçleri** tek bir merkezi panel üzerinden yönetilir.  
Her kullanıcı rolü, yalnızca **kendi yetkili olduğu işlemleri** görüntüleyebilir veya gerçekleştirebilir.

### 🧩 Mimarinin Genel Yapısı

| Katman | Teknoloji | Açıklama |
|--------|------------|----------|
| **Backend** | Spring Boot, JPA, PostgreSQL | MVC + Katmanlı yapı, JWT tabanlı güvenlik, REST API |
| **Frontend** | React, Tailwind CSS | SPA yapısı, dinamik role-based menüler, Axios API bağlantısı |

Bu iki katman arasında iletişim **HTTP + JSON** üzerinden sağlanır.

---

## 🏗️ MVC Mimarisinin Genel Yerleşimi

“Client doğrudan modele erişmemeli, yalnızca controller ile konuşmalı” ilkesine göre:

React (Client)
↓ HTTP (JSON)
Controller (C)
↓
Service (iş kuralları)
↓
Repository (veri erişimi)
↓
Database (PostgreSQL)


### 🔹 Model (M)
- **Entity sınıfları (@Entity)**  
  `Kullanici`, `Doktor`, `Hasta`, `Randevu`, `Recete`, `Sikayet`, `ZiyaretciKayit`  
  → Her biri veritabanındaki tablolarla birebir eşleştirilmiştir.

- **DTO sınıfları**  
  Verinin dış dünyaya güvenli aktarımını sağlar (Entity doğrudan açılmaz).

### 🔹 Controller (C)
Spring Boot’ta `@RestController` sınıfları:
- `DoktorController`
- `ResepsiyonController`
- `MudurController`
- `ReceteController`
- `RandevuController`
- `SikayetController`
- `ZiyaretciKayitController`

Controller’lar:
- HTTP isteklerini karşılar,
- `Service` katmanını çağırır,
- JSON response döner.

### 🔹 View (V)
- Klasik JSP/Thymeleaf yerine **React componentleri** kullanılmıştır.
- Backend sadece JSON döner; tüm görselleştirme frontend tarafında yapılır.
- Böylece **View, tamamen frontend tarafına taşınmış** olur.

---

## ⚙️ Backend Mimarisi (Spring Boot)

### 🔸 Katmanlar

#### 1. Entity Katmanı
`@Entity`, `@Id`, `@ManyToOne`, `@OneToMany` gibi JPA anotasyonlarıyla PostgreSQL tablolarına bağlanır.

#### 2. Repository Katmanı
`JpaRepository` uzantılı sınıflar:
- `RandevuRepository`
- `ReceteRepository`
- `SikayetRepository`
- `ZiyaretciKayitRepository`
- `KullaniciRepository`

Görevi yalnızca **veri erişimi (CRUD)** sağlamaktır.

#### 3. Service Katmanı (Business Logic)
- `RandevuServisi`, `ReceteServisi`, `SikayetServisi`, `DoktorCalismaSaatiServisi`, `AuthServisi`
- İş kuralları, validasyonlar, DTO–Entity dönüşümleri bu katmanda yapılır.
- Repository katmanına doğrudan erişim sadece Service üzerinden olur.

#### 4. Controller Katmanı
- JSON formatında veri alışverişi sağlar.
- Servis metodlarını çağırır, sonuçları HTTP response olarak döner.

#### 5. Güvenlik Katmanı (JWT)
- `SecurityConfig` içinde:
  - `csrf().disable()`
  - `sessionCreationPolicy(STATELESS)`
  - `JwtAuthFilter` uygulanır.


## 💻 Frontend Mimarisi (React + Tailwind)

### 🔸 Layout & Role Bazlı Menü
`DashboardLayout` bileşeni:
- Sidebar, Header, içerik alanı ortak.
- Menü öğeleri kullanıcı rolüne göre dinamik oluşturulur.

```jsx
if (role === "RECEPTIONIST") {
  links.push(
    { label: "Randevu Oluştur", to: "/reception", icon: <Calendar /> },
    { label: "Ziyaretçi Kaydı", to: "/reception/visitors", icon: <ClipboardList /> },
  );
}

Frontend sadece:

Form input state’lerini tutar,

API çağrısı yapar,

Gelen JSON verisini UI’da gösterir.
Tüm iş kuralı backend’dedir.

🔁 Örnek Akışlar
🩺 Doktor Girişi

Doktor, PersonelGiris ekranında email/şifre girer.

POST /api/auth/login çağrısı yapılır.

Backend JWT döner.

React token’ı saklar, kullanıcıyı /doctor paneline yönlendirir.

💊 Reçete Yazma

Doktor DoktorReceteYazForm sayfasına girer.

Formdan hasta ve ilaç bilgilerini doldurur.

POST /api/recete/yaz çağrılır.

Backend doğrulayıp veritabanına kaydeder.

“Reçete başarıyla oluşturuldu” mesajı döner.

📅 Resepsiyon Randevu Oluşturma

/reception sayfası açılır → doktor ve hasta listesi API’den alınır.

Form doldurulup “Randevu Oluştur” butonuna basılır.

RandevuController istek alır → RandevuServisi çalışır.

Müsaitlik kontrolü yapılır → veritabanına kaydedilir.

Frontend’de başarı mesajı gösterilir.

🧾 Müdür Raporları

Müdür login olur → /admin/complaints sayfası.

GET /api/admin/complaints isteği yapılır.

Backend tüm şikayetleri SikayetServisi aracılığıyla döner.

React tablo olarak gösterir. 

🧩 Sonuç: Mimari Özeti
Katman	             Açıklama
Model (M)	           Entity + DTO
Controller (C)	     REST endpoint’leri
Service	             İş kuralları, DTO dönüşümleri
Repository	         Veri erişimi (JPA)
Security	           JWT + rol bazlı yetki
View (Frontend)	     React component’leri, role-based menü sistemi  

Bu yapı sayesinde:

Client doğrudan modele veya veritabanına erişmez.

View ve business logic birbirinden ayrılmıştır.

Her rolün yetki seviyesi ayrıdır (Müdür, Doktor, Resepsiyon, Hasta).

MVC mimarisi full-stack düzeyde uygulanmıştır.

