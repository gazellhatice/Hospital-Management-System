package com.hospital.controller;

import com.hospital.model.Hasta;
import com.hospital.service.HastaServisi;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hasta")
public class HastaController {

    private final HastaServisi hastaServisi;

    public HastaController(HastaServisi hastaServisi) {
        this.hastaServisi = hastaServisi;
    }

    // Hasta kendi kendine kayıt olur
    @PostMapping("/kayit")
    public Hasta kayitOl(@RequestBody Hasta yeni) {
        return hastaServisi.hastaKayitOl(yeni);
    }

    // Resepsiyonist hasta kaydı açar
    @PostMapping("/kayit-resepsiyon")
    public Hasta resepsiyonHastaEkle(@RequestBody ResepsiyonHastaEkleIstegi body) {
        return hastaServisi.resepsiyonHastaEkle(
                body.getResepsiyonistId(),
                body.getHasta());
    }
    
    @GetMapping("/ara")
    public Hasta hastaAra(@RequestParam String tcKimlikNo) {
        return hastaServisi.hastaAraTc(tcKimlikNo);
    }

    // Hasta giriş yapar
    @PostMapping("/giris")
    public Hasta girisYap(@RequestBody GirisIstegi body) {
        return hastaServisi.hastaGiris(body.getEmail(), body.getSifre());
    }

    // Hasta bilgilerini günceller (tel/adres gibi)
    @PutMapping("/{hastaId}/bilgi-guncelle")
    public Hasta bilgiGuncelle(@PathVariable Integer hastaId,
            @RequestBody HastaBilgiGuncelleIstegi body) {
        return hastaServisi.hastaBilgiGuncelle(
                hastaId,
                body.getTelefon(),
                body.getAdres());
    }

    // Hasta profilini getir
    @GetMapping("/{hastaId}")
    public Hasta hastaGetir(@PathVariable Integer hastaId) {
        return hastaServisi.hastaGetirById(hastaId);
    }

    // ---- Request Body sınıfları ----

    public static class GirisIstegi {
        private String email;
        private String sifre;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSifre() {
            return sifre;
        }

        public void setSifre(String sifre) {
            this.sifre = sifre;
        }
    }

    public static class HastaBilgiGuncelleIstegi {
        private String telefon;
        private String adres;

        public String getTelefon() {
            return telefon;
        }

        public void setTelefon(String telefon) {
            this.telefon = telefon;
        }

        public String getAdres() {
            return adres;
        }

        public void setAdres(String adres) {
            this.adres = adres;
        }
    }

    public static class ResepsiyonHastaEkleIstegi {
        private Integer resepsiyonistId;
        private Hasta hasta;

        public Integer getResepsiyonistId() {
            return resepsiyonistId;
        }

        public void setResepsiyonistId(Integer resepsiyonistId) {
            this.resepsiyonistId = resepsiyonistId;
        }

        public Hasta getHasta() {
            return hasta;
        }

        public void setHasta(Hasta hasta) {
            this.hasta = hasta;
        }
    }
}
