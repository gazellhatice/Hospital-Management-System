package com.hospital.dto;

public class RandevuDto {
    private Integer randevuId;
    private String randevuDurumu; // "AKTIF" / "GELMEDI" / "IPTAL" / "TAMAMLANDI"
    private String notlar;
    private String olusturulmaZamani; // ISO string olarak
    private String randevuBaslangic; // "HH:mm"
    private String randevuBitis; // "HH:mm"

    private SlotDto slot;
    private DoktorDto doktor;
    private HastaDto hasta;

    // --- getters/setters ---
    public Integer getRandevuId() {
        return randevuId;
    }

    public void setRandevuId(Integer randevuId) {
        this.randevuId = randevuId;
    }

    public String getRandevuDurumu() {
        return randevuDurumu;
    }

    public void setRandevuDurumu(String randevuDurumu) {
        this.randevuDurumu = randevuDurumu;
    }

    public String getNotlar() {
        return notlar;
    }

    public void setNotlar(String notlar) {
        this.notlar = notlar;
    }

    public String getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(String olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }

    public SlotDto getSlot() {
        return slot;
    }

    public void setSlot(SlotDto slot) {
        this.slot = slot;
    }

    public DoktorDto getDoktor() {
        return doktor;
    }

    public void setDoktor(DoktorDto doktor) {
        this.doktor = doktor;
    }

    public HastaDto getHasta() {
        return hasta;
    }

    public void setHasta(HastaDto hasta) {
        this.hasta = hasta;
    }

    public String getRandevuBaslangic() {
        return randevuBaslangic;
    }

    public void setRandevuBaslangic(String v) {
        this.randevuBaslangic = v;
    }

    public String getRandevuBitis() {
        return randevuBitis;
    }

    public void setRandevuBitis(String v) {
        this.randevuBitis = v;
    }

    // --- nested DTOs ---
    public static class SlotDto {
        private Integer slotId;
        private String tarih; // "YYYY-MM-DD" (FE böyle bekliyor)
        private String baslangicSaat; // "HH:mm"
        private String bitisSaat; // "HH:mm"

        public Integer getSlotId() {
            return slotId;
        }

        public void setSlotId(Integer slotId) {
            this.slotId = slotId;
        }

        public String getTarih() {
            return tarih;
        }

        public void setTarih(String tarih) {
            this.tarih = tarih;
        }

        public String getBaslangicSaat() {
            return baslangicSaat;
        }

        public void setBaslangicSaat(String baslangicSaat) {
            this.baslangicSaat = baslangicSaat;
        }

        public String getBitisSaat() {
            return bitisSaat;
        }

        public void setBitisSaat(String bitisSaat) {
            this.bitisSaat = bitisSaat;
        }
    }

    public static class DoktorDto {
        private Integer doktorId;
        private String adSoyad;
        private String brans; // FE bunu bekliyor (entity'de uzmanlikAlani)

        public Integer getDoktorId() {
            return doktorId;
        }

        public void setDoktorId(Integer doktorId) {
            this.doktorId = doktorId;
        }

        public String getAdSoyad() {
            return adSoyad;
        }

        public void setAdSoyad(String adSoyad) {
            this.adSoyad = adSoyad;
        }

        public String getBrans() {
            return brans;
        }

        public void setBrans(String brans) {
            this.brans = brans;
        }
    }

    public static class HastaDto {
        private Integer hastaId;
        private String adSoyad;
        private String tcKimlikNo;

        public Integer getHastaId() {
            return hastaId;
        }

        public void setHastaId(Integer hastaId) {
            this.hastaId = hastaId;
        }

        public String getAdSoyad() {
            return adSoyad;
        }

        public void setAdSoyad(String adSoyad) {
            this.adSoyad = adSoyad;
        }

        public String getTcKimlikNo() {
            return tcKimlikNo;
        }

        public void setTcKimlikNo(String tcKimlikNo) {
            this.tcKimlikNo = tcKimlikNo;
        }
    }
}
