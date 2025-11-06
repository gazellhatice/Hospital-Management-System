export type KullaniciRol = "MUDUR" | "DOKTOR" | "RESEPSIYON" | "HASTA";

export interface GirisYaniti {
  kullaniciId: number;
  adSoyad: string;
  email: string;
  rol: KullaniciRol;
  aktif: boolean;
}

export interface ApiHataResponse {
  message?: string;
}

export interface RandevuOlusturIstek {
  notlar?: string;
}

export interface YeniHastaIstek {
  kullanici: {
    adSoyad: string;
    email: string;
    sifre: string;
    telefon: string;
  };
  tcKimlikNo: string;
  adres: string;
  kayitKaynagi: "RESEPSIYON" | "HASTA";
}

export interface ZiyaretciIstek {
  adSoyad: string;
  telefon: string;
  notlar?: string;
  // eklenecek hedefDoktorId?: number; hedefHastaId?: number;
}
export interface SikayetIstek {
  baslik: string;
  aciklama: string;
}
export interface HastaListeItem {
  id: number;
  adSoyad: string;
  tcKimlikNo: string;
  telefon?: string;
  adres?: string;
}

export interface BackendHastaHam {
  id: number;
  tcKimlikNo?: string;
  adres?: string;
  telefon?: string;
  kullanici?: {
    adSoyad?: string;
    telefon?: string;
  };
  adSoyad?: string;
}
export interface BackendDoktorHam {
  id: number;
  uzmanlikAlani?: string;
  kullanici?: {
    adSoyad?: string;
    telefon?: string;
  };
  adSoyad?: string;
}
