import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- (Public) Layout ---
import PublicLayout from "./layouts/PublicLayout.jsx"; // bunu istersen tutabiliriz

// --- Public Sayfalar ---
import Anasayfa from "./pages/public/Anasayfa.jsx";
import HastaGiris from "./pages/public/HastaGiris.jsx";
import HastaKayit from "./pages/public/HastaKayit.jsx";
import PersonelGiris from "./pages/public/PersonelGiris.jsx";

// --- Dashboard Sayfaları (artık panel route'ları direkt bunlara gidiyor) ---
import HastaDashboard from "./pages/hasta/HastaDashboard.jsx";
import DoktorDashboard from "./pages/doktor/DoktorDashboard.jsx";
import ResepsiyonDashboard from "./pages/resepsiyon/ResepsiyonDashboard.jsx";
import MudurDashboard from "./pages/mudur/MudurDashboard.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC SITE (istersen PublicLayout kalsın) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Anasayfa />} />
          <Route path="/hasta-giris" element={<HastaGiris />} />
          <Route path="/hasta-kayit" element={<HastaKayit />} />
          <Route path="/personel-giris" element={<PersonelGiris />} />
        </Route>

        {/* PANEL SAYFALARI: artık layout yok, direkt dashboard */}
        <Route path="/panel/hasta" element={<HastaDashboard />} />
        <Route path="/panel/doktor" element={<DoktorDashboard />} />
        <Route path="/panel/resepsiyon" element={<ResepsiyonDashboard />} />
        <Route path="/panel/mudur" element={<MudurDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}
