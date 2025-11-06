package com.hospital.controller;

import com.hospital.model.Doktor;
import com.hospital.service.DoktorServisi;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doktor")
public class DoktorController {

    private final DoktorServisi doktorServisi;

    public DoktorController(DoktorServisi doktorServisi) {
        this.doktorServisi = doktorServisi;
    }

    @PostMapping("/giris")
    public Doktor girisYap(@RequestBody DoktorGirisIstegi body) {
        return doktorServisi.doktorGiris(body.getEmail(), body.getSifre());
    }

    // Müdür yeni doktor ekler
    @PostMapping("/mudur/doktor-ekle")
    public Doktor doktorEkle(@RequestBody DoktorEkleIstegi body) {
        return doktorServisi.doktorEkle(
                body.getMudurId(),
                body.getAdSoyad(),
                body.getUzmanlikAlani(),
                body.getEmail(),
                body.getSifre()
        );
    }

    // Müdür doktor onay durumunu değiştirir
    @PutMapping("/mudur/onay-guncelle")
    public Doktor doktorOnayla(@RequestBody DoktorOnayGuncelleIstegi body) {
        return doktorServisi.doktorOnayDurumuGuncelle(
                body.getDoktorId(),
                body.getYeniDurum()
        );
    }

    // Müdür doktoru aktif/pasif yapar
    @PutMapping("/mudur/aktiflik-guncelle")
    public Doktor doktorAktiflik(@RequestBody DoktorAktiflikIstegi body) {
        return doktorServisi.doktorAktiflikGuncelle(
                body.getDoktorId(),
                body.isAktifMi()
        );
    }

    // Resepsiyon: onaylı doktorları listelesin
    @GetMapping("/liste/onayli")
    public List<Doktor> onayliDoktorlar() {
        return doktorServisi.doktorlariListeleOnayli();
    }

    // Resepsiyon: branşa göre doktorları getir (örn "Dahiliye")
    @GetMapping("/liste/brans")
    public List<Doktor> bransaGore(@RequestParam String uzmanlikAlani) {
        return doktorServisi.doktorlariBransaGore(uzmanlikAlani);
    }

    // ---- Request Body sınıfları ----

    public static class DoktorGirisIstegi {
        private String email;
        private String sifre;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getSifre() { return sifre; }
        public void setSifre(String sifre) { this.sifre = sifre; }
    }

    public static class DoktorEkleIstegi {
        private Integer mudurId;
        private String adSoyad;
        private String uzmanlikAlani;
        private String email;
        private String sifre;

        public Integer getMudurId() { return mudurId; }
        public void setMudurId(Integer mudurId) { this.mudurId = mudurId; }

        public String getAdSoyad() { return adSoyad; }
        public void setAdSoyad(String adSoyad) { this.adSoyad = adSoyad; }

        public String getUzmanlikAlani() { return uzmanlikAlani; }
        public void setUzmanlikAlani(String uzmanlikAlani) { this.uzmanlikAlani = uzmanlikAlani; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getSifre() { return sifre; }
        public void setSifre(String sifre) { this.sifre = sifre; }
    }

    public static class DoktorOnayGuncelleIstegi {
        private Integer doktorId;
        private String yeniDurum;

        public Integer getDoktorId() { return doktorId; }
        public void setDoktorId(Integer doktorId) { this.doktorId = doktorId; }

        public String getYeniDurum() { return yeniDurum; }
        public void setYeniDurum(String yeniDurum) { this.yeniDurum = yeniDurum; }
    }

    public static class DoktorAktiflikIstegi {
        private Integer doktorId;
        private boolean aktifMi;

        public Integer getDoktorId() { return doktorId; }
        public void setDoktorId(Integer doktorId) { this.doktorId = doktorId; }

        public boolean isAktifMi() { return aktifMi; }
        public void setAktifMi(boolean aktifMi) { this.aktifMi = aktifMi; }
    }
}
