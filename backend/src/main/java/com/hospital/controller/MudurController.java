package com.hospital.controller;

import com.hospital.model.Mudur;
import com.hospital.model.Resepsiyonist;
import com.hospital.service.MudurServisi;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mudur")
public class MudurController {

    private final MudurServisi mudurServisi;

    public MudurController(MudurServisi mudurServisi) {
        this.mudurServisi = mudurServisi;
    }

    @PostMapping("/giris")
    public Mudur girisYap(@RequestBody MudurGirisIstegi body) {
        return mudurServisi.mudurGiris(body.getEmail(), body.getSifre());
    }

    @GetMapping("/{mudurId}")
    public Mudur mudurBilgi(@PathVariable Integer mudurId) {
        return mudurServisi.mudurGetir(mudurId);
    }

    // Müdür yeni resepsiyonist ekler
    @PostMapping("/resepsiyonist-ekle")
    public Resepsiyonist resepsiyonistEkle(@RequestBody ResepsiyonistEkleIstegi body) {
        return mudurServisi.resepsiyonistEkle(
                body.getMudurId(),
                body.getAdSoyad(),
                body.getTcKimlikNo(),
                body.getEmail(),
                body.getSifre()
        );
    }

    // Müdür resepsiyonist aktif/pasif yapar
    @PutMapping("/resepsiyonist-aktiflik")
    public Resepsiyonist resepsiyonistAktiflik(@RequestBody ResepsiyonistAktiflikIstegi body) {
        return mudurServisi.resepsiyonistAktiflikGuncelle(
                body.getResepsiyonistId(),
                body.isAktifMi()
        );
    }

    // ---- Request Body sınıfları ----

    public static class MudurGirisIstegi {
        private String email;
        private String sifre;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getSifre() { return sifre; }
        public void setSifre(String sifre) { this.sifre = sifre; }
    }

    public static class ResepsiyonistEkleIstegi {
        private Integer mudurId;
        private String adSoyad;
        private String tcKimlikNo;
        private String email;
        private String sifre;

        public Integer getMudurId() { return mudurId; }
        public void setMudurId(Integer mudurId) { this.mudurId = mudurId; }

        public String getAdSoyad() { return adSoyad; }
        public void setAdSoyad(String adSoyad) { this.adSoyad = adSoyad; }

        public String getTcKimlikNo() { return tcKimlikNo; }
        public void setTcKimlikNo(String tcKimlikNo) { this.tcKimlikNo = tcKimlikNo; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getSifre() { return sifre; }
        public void setSifre(String sifre) { this.sifre = sifre; }
    }

    public static class ResepsiyonistAktiflikIstegi {
        private Integer resepsiyonistId;
        private boolean aktifMi;

        public Integer getResepsiyonistId() { return resepsiyonistId; }
        public void setResepsiyonistId(Integer resepsiyonistId) { this.resepsiyonistId = resepsiyonistId; }

        public boolean isAktifMi() { return aktifMi; }
        public void setAktifMi(boolean aktifMi) { this.aktifMi = aktifMi; }
    }
}
