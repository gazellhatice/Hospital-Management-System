import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public pages
import PublicHome from "./pages/public/PublicHome";
import HastaLogin from "./pages/public/HastaLogin";
import HastaRegister from "./pages/public/HastaRegister";
import PersonelLogin from "./pages/public/PersonelLogin";

// Hasta panel
import HastaDashboard from "./pages/hasta/HastaDashboard";
import Randevularim from "./pages/hasta/Randevularim";
import Recetelerim from "./pages/hasta/Recetelerim";
import Sikayetlerim from "./pages/hasta/Sikayetlerim";

// Resepsiyon panel
import ResepsiyonDashboard from "./pages/resepsiyon/ResepsiyonDashboard";
import HastaEkle from "./pages/resepsiyon/HastaEkle";
import RandevuOlustur from "./pages/resepsiyon/RandevuOlustur";
import ZiyaretciKaydi from "./pages/resepsiyon/ZiyaretciKaydi";

// Doktor panel
import DoktorDashboard from "./pages/doktor/DoktorDashboard";
import UygunSaatEkle from "./pages/doktor/UygunSaatEkle";
import RandevularimDoktor from "./pages/doktor/RandevularimDoktor";
import ReceteYaz from "./pages/doktor/ReceteYaz";

// Müdür panel
import MudurDashboard from "./pages/mudur/MudurDashboard";
import DoktorEkle from "./pages/mudur/DoktorEkle";
import SlotOnayla from "./pages/mudur/SlotOnayla";
import SikayetYonetimi from "./pages/mudur/SikayetYonetimi";
import GunlukZiyaretRaporu from "./pages/mudur/GunlukZiyaretRaporu";
import MudurHastalar from "./pages/mudur/MudurHastalar";
import DoktorDurumGuncelle from "./pages/mudur/DoktorDurumGuncelle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC SITE */}
        <Route path="/" element={<PublicHome />} />
        <Route path="/hasta/giris" element={<HastaLogin />} />
        <Route path="/hasta/kayit" element={<HastaRegister />} />
        <Route path="/personel/giris" element={<PersonelLogin />} />

        {/* HASTA PANELİ */}
        <Route path="/panel/hasta" element={<HastaDashboard />} />
        <Route path="/panel/hasta/randevularim" element={<Randevularim />} />
        <Route path="/panel/hasta/recetelerim" element={<Recetelerim />} />
        <Route path="/panel/hasta/sikayetlerim" element={<Sikayetlerim />} />

        {/* RESEPSİYON PANELİ */}
        <Route path="/panel/resepsiyon" element={<ResepsiyonDashboard />} />
        <Route path="/panel/resepsiyon/hasta-ekle" element={<HastaEkle />} />
        <Route path="/panel/resepsiyon/randevu-olustur" element={<RandevuOlustur />} />
        <Route path="/panel/resepsiyon/ziyaretci-kaydi" element={<ZiyaretciKaydi />} />

        {/* DOKTOR PANELİ */}
        <Route path="/panel/doktor" element={<DoktorDashboard />} />
        <Route path="/panel/doktor/uygun-saat-ekle" element={<UygunSaatEkle />} />
        <Route path="/panel/doktor/randevularim" element={<RandevularimDoktor />} />
        <Route path="/panel/doktor/recete-yaz" element={<ReceteYaz />} />

        {/* MÜDÜR PANELİ */}
        <Route path="/panel/mudur" element={<MudurDashboard />} />
        <Route path="/panel/mudur/doktor-ekle" element={<DoktorEkle />} />
        <Route path="/panel/mudur/doktor-durum" element={<DoktorDurumGuncelle />} />
        <Route path="/panel/mudur/slot-onayla" element={<SlotOnayla />} />
        <Route path="/panel/mudur/sikayetler" element={<SikayetYonetimi />} />
        <Route path="/panel/mudur/ziyaret-raporu" element={<GunlukZiyaretRaporu />} />
        <Route path="/panel/mudur/hastalar" element={<MudurHastalar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
