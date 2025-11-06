package com.hospital.controller;

import com.hospital.dto.ZiyaretciKayitOlusturIstek;
import com.hospital.model.ZiyaretciKayit;
import com.hospital.service.ZiyaretciKayitServisi;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api/ziyaretci")
public class ZiyaretciKayitController {

    private final ZiyaretciKayitServisi ziyaretciKayitServisi;

    public ZiyaretciKayitController(ZiyaretciKayitServisi ziyaretciKayitServisi) {
        this.ziyaretciKayitServisi = ziyaretciKayitServisi;
    }

    // Resepsiyon kendi kayıtlarını listeler
    @GetMapping("/resepsiyon/{resepsiyonistId}")
    public List<ZiyaretciKayit> resepsiyonKayitlari(@PathVariable Integer resepsiyonistId) {
        return ziyaretciKayitServisi.resepsiyonistinKayitlariniListele(resepsiyonistId);
    }

    // Müdür tarih aralığına göre tüm ziyaretçileri listeler
    @GetMapping("/mudur/liste")
    public List<ZiyaretciKayit> mudurListe(@RequestParam Timestamp baslangic,
                                           @RequestParam Timestamp bitis) {
        return ziyaretciKayitServisi.mudurZiyaretciListesi(baslangic, bitis);
    }

    // Müdür ziyaretçi kaydını günceller
    @PutMapping("/mudur/guncelle")
    public ZiyaretciKayit guncelle(@RequestBody ZiyaretciGuncelleIstegi body) {
        return ziyaretciKayitServisi.ziyaretciGuncelle(
                body.getZiyaretciId(),
                body.getAdSoyad(),
                body.getZiyaretSebebi(),
                body.getNotlar()
        );
    }

    // Resepsiyonistin yeni ziyaretçi eklemesi
    @PostMapping("/ekle")
    public ZiyaretciKayit yeniZiyaretci(@RequestBody ZiyaretciKayitOlusturIstek istek) {
        return ziyaretciKayitServisi.ziyaretciKaydiOlustur(
                istek.getResepsiyonistId(),
                istek.getAdSoyad(),
                istek.getZiyaretSebebi(),
                istek.getNotlar()
        );
    }

    // Müdür kaydı siler
    @DeleteMapping("/mudur/sil/{ziyaretciId}")
    public void sil(@PathVariable Integer ziyaretciId) {
        ziyaretciKayitServisi.ziyaretciSil(ziyaretciId);
    }

    // ---- Request Body sınıfları ----

    public static class ZiyaretciEkleIstegi {
        private Integer resepsiyonistId;
        private String adSoyad;
        private String ziyaretSebebi;
        private String notlar;

        public Integer getResepsiyonistId() { return resepsiyonistId; }
        public void setResepsiyonistId(Integer resepsiyonistId) { this.resepsiyonistId = resepsiyonistId; }

        public String getAdSoyad() { return adSoyad; }
        public void setAdSoyad(String adSoyad) { this.adSoyad = adSoyad; }

        public String getZiyaretSebebi() { return ziyaretSebebi; }
        public void setZiyaretSebebi(String ziyaretSebebi) { this.ziyaretSebebi = ziyaretSebebi; }

        public String getNotlar() { return notlar; }
        public void setNotlar(String notlar) { this.notlar = notlar; }
    }

    public static class ZiyaretciGuncelleIstegi {
        private Integer ziyaretciId;
        private String adSoyad;
        private String ziyaretSebebi;
        private String notlar;

        public Integer getZiyaretciId() { return ziyaretciId; }
        public void setZiyaretciId(Integer ziyaretciId) { this.ziyaretciId = ziyaretciId; }

        public String getAdSoyad() { return adSoyad; }
        public void setAdSoyad(String adSoyad) { this.adSoyad = adSoyad; }

        public String getZiyaretSebebi() { return ziyaretSebebi; }
        public void setZiyaretSebebi(String ziyaretSebebi) { this.ziyaretSebebi = ziyaretSebebi; }

        public String getNotlar() { return notlar; }
        public void setNotlar(String notlar) { this.notlar = notlar; }
    }
}
