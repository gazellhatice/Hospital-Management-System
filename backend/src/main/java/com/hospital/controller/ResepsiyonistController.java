package com.hospital.controller;

import com.hospital.model.Hasta;
import com.hospital.model.Resepsiyonist;
import com.hospital.model.ZiyaretciKayit;
import com.hospital.service.ResepsiyonistServisi;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resepsiyon")
public class ResepsiyonistController {

    private final ResepsiyonistServisi resepsiyonistServisi;

    public ResepsiyonistController(ResepsiyonistServisi resepsiyonistServisi) {
        this.resepsiyonistServisi = resepsiyonistServisi;
    }

    // RESEPSİYON GİRİŞ
    @PostMapping("/giris")
    public Resepsiyonist girisYap(@RequestBody ResepsiyonGirisIstegi body) {
        return resepsiyonistServisi.resepsiyonistGiris(body.getEmail(), body.getSifre());
    }

    // RESEPSİYON PROFİL BİLGİLERİ (ör: panel header'da "Hoşgeldin Ayşe" yazmak için)
    @GetMapping("/{resepsiyonistId}")
    public Resepsiyonist profilGetir(@PathVariable Integer resepsiyonistId) {
        return resepsiyonistServisi.resepsiyonistGetir(resepsiyonistId);
    }

    // RESEPSİYON -> HASTA EKLER
    @PostMapping("/hasta-ekle")
    public Hasta hastaEkle(@RequestBody ResepsiyonHastaEkleIstegi body) {
        return resepsiyonistServisi.resepsiyonHastaEkle(
                body.getResepsiyonistId(),
                body.getHasta()
        );
    }

    // RESEPSİYON -> ZİYARETÇİ KAYDI EKLER
    @PostMapping("/ziyaretci-ekle")
    public ZiyaretciKayit ziyaretciEkle(@RequestBody ZiyaretciEkleIstegi body) {
        return resepsiyonistServisi.ziyaretciEkle(
                body.getResepsiyonistId(),
                body.getAdSoyad(),
                body.getZiyaretSebebi(),
                body.getNotlar()
        );
    }

    // RESEPSİYON -> KENDİ GİRDİĞİ ZİYARETÇİLERİ GÖRÜR
    @GetMapping("/ziyaretcilerim/{resepsiyonistId}")
    public List<ZiyaretciKayit> kendiZiyaretcilerim(@PathVariable Integer resepsiyonistId) {
        return resepsiyonistServisi.kendiZiyaretcileriniListele(resepsiyonistId);
    }

    // ---- Request Body sınıfları ----

    public static class ResepsiyonGirisIstegi {
        private String email;
        private String sifre;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getSifre() { return sifre; }
        public void setSifre(String sifre) { this.sifre = sifre; }
    }

    // resepsiyonistin hasta eklemesi için
    public static class ResepsiyonHastaEkleIstegi {
        private Integer resepsiyonistId;
        private Hasta hasta;

        public Integer getResepsiyonistId() { return resepsiyonistId; }
        public void setResepsiyonistId(Integer resepsiyonistId) { this.resepsiyonistId = resepsiyonistId; }

        public Hasta getHasta() { return hasta; }
        public void setHasta(Hasta hasta) { this.hasta = hasta; }
    }

    // resepsiyonistin ziyaretçi eklemesi için
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
}
