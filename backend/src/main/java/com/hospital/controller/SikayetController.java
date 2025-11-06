package com.hospital.controller;

import com.hospital.model.Sikayet;
import com.hospital.service.SikayetServisi;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sikayet")
public class SikayetController {

    private final SikayetServisi sikayetServisi;

    public SikayetController(SikayetServisi sikayetServisi) {
        this.sikayetServisi = sikayetServisi;
    }

    // Hasta yeni şikayet açar
    @PostMapping("/olustur")
    public Sikayet sikayetOlustur(@RequestBody SikayetOlusturIstegi body) {
        return sikayetServisi.hastaSikayetOlustur(
                body.getHastaId(),
                body.getBaslik(),
                body.getIcerik()
        );
    }

    // Hasta kendi şikayetlerini görür
    @GetMapping("/hasta/{hastaId}")
    public List<Sikayet> hastaninSikayetleri(@PathVariable Integer hastaId) {
        return sikayetServisi.hastaninSikayetleriniListele(hastaId);
    }

    // Müdür paneli: tüm şikayetler / belli durumdakiler
    @GetMapping("/mudur/liste")
    public List<Sikayet> mudurListe(@RequestParam(required = false) String durum) {
        return sikayetServisi.mudurSikayetListeleDurumaGore(durum);
    }

    // Müdür şikayet durumunu günceller + not ekler
    @PutMapping("/mudur/guncelle")
    public Sikayet mudurSikayetGuncelle(@RequestBody SikayetGuncelleIstegi body) {
        return sikayetServisi.mudurSikayetDurumGuncelle(
                body.getSikayetId(),
                body.getYeniDurum(),
                body.getMudurNotu()
        );
    }

    // ---- Request Body sınıfları ----

    public static class SikayetOlusturIstegi {
        private Integer hastaId;
        private String baslik;
        private String icerik;

        public Integer getHastaId() { return hastaId; }
        public void setHastaId(Integer hastaId) { this.hastaId = hastaId; }

        public String getBaslik() { return baslik; }
        public void setBaslik(String baslik) { this.baslik = baslik; }

        public String getIcerik() { return icerik; }
        public void setIcerik(String icerik) { this.icerik = icerik; }
    }

    public static class SikayetGuncelleIstegi {
        private Integer sikayetId;
        private String yeniDurum;
        private String mudurNotu;

        public Integer getSikayetId() { return sikayetId; }
        public void setSikayetId(Integer sikayetId) { this.sikayetId = sikayetId; }

        public String getYeniDurum() { return yeniDurum; }
        public void setYeniDurum(String yeniDurum) { this.yeniDurum = yeniDurum; }

        public String getMudurNotu() { return mudurNotu; }
        public void setMudurNotu(String mudurNotu) { this.mudurNotu = mudurNotu; }
    }
}
