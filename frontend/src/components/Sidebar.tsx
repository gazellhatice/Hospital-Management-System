import { Link } from "react-router-dom";

type SidebarProps = {
  role: "HASTA" | "RESEPSIYON" | "DOKTOR" | "MUDUR";
};

export default function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="text-xl font-semibold text-slate-800">
          {role === "HASTA" && "Hasta Paneli"}
          {role === "RESEPSIYON" && "Resepsiyon Paneli"}
          {role === "DOKTOR" && "Doktor Paneli"}
          {role === "MUDUR" && "Müdür Paneli"}
        </div>
        <div className="text-xs text-slate-500">Hastane Yönetim Sistemi</div>
      </div>

      <nav className="flex-1 p-4 text-sm text-slate-700 space-y-2">
        {role === "HASTA" && (
          <>
            <Item to="/panel/hasta">Genel Bakış</Item>
            <Item to="/panel/hasta/randevularim">Randevularım</Item>
            <Item to="/panel/hasta/recetelerim">Reçetelerim</Item>
            <Item to="/panel/hasta/sikayetlerim">Şikayetlerim</Item>
          </>
        )}

        {role === "RESEPSIYON" && (
          <>
            <Item to="/panel/resepsiyon">Genel Bakış</Item>
            <Item to="/panel/resepsiyon/hasta-ekle">Hasta Kaydı</Item>
            <Item to="/panel/resepsiyon/randevu-olustur">Randevu Oluştur</Item>
            <Item to="/panel/resepsiyon/ziyaretci-kaydi">Ziyaretçi Kaydı</Item>
          </>
        )}

        {role === "DOKTOR" && (
          <>
            <Item to="/panel/doktor">Genel Bakış</Item>
            <Item to="/panel/doktor/randevularim">Randevularım</Item>
            <Item to="/panel/doktor/uygun-saat-ekle">Uygun Saat Aç</Item>
            <Item to="/panel/doktor/recete-yaz">Reçete Yaz</Item>
          </>
        )}

        {role === "MUDUR" && (
          <>
            <Item to="/panel/mudur">Genel Bakış</Item>
            <Item to="/panel/mudur/doktor-ekle">Doktor Ekle / Yönet</Item>
            <Item to="/panel/mudur/doktor-durum">Doktor Durum Güncelle</Item>
            <Item to="/panel/mudur/slot-onayla">Slot Onayla</Item>
            <Item to="/panel/mudur/sikayetler">Şikayet Yönetimi</Item>
            <Item to="/panel/mudur/ziyaret-raporu">Günlük Ziyaret Raporu</Item>
            <Item to="/panel/mudur/hastalar">Hastalar</Item>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
        © 2025 Hastane Sistemi
      </div>
    </aside>
  );
}

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block w-full rounded-lg px-3 py-2 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium"
    >
      {children}
    </Link>
  );
}
