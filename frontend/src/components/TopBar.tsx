export default function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="text-sm font-medium text-slate-700">
        Hastane Yönetim Sistemi
      </div>
      <button className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1 rounded-lg">
        Çıkış Yap
      </button>
    </header>
  );
}
