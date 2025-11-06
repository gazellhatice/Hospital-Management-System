package com.hospital.controller;

import com.hospital.dto.ReceteDto;
import com.hospital.model.Recete;
import com.hospital.service.ReceteServisi;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recete")
public class ReceteController {

    private final ReceteServisi receteServisi;

    public ReceteController(ReceteServisi receteServisi) {
        this.receteServisi = receteServisi;
    }

    // Doktor yeni reçete yazar
    @PostMapping("/yaz")
    public Recete receteYaz(@RequestBody ReceteYazIstegi body) {
        return receteServisi.receteYaz(
                body.getDoktorId(),
                body.getHastaId(),
                body.getIlacListesi(),
                body.getAciklama());
    }

    // Hasta paneli -> reçetelerim
    @GetMapping("/hasta/{hastaId}")
    public List<ReceteDto> hastaninReceteleri(@PathVariable Integer hastaId) {
        return receteServisi.hastaninReceteleriDto(hastaId);
    }

    // Doktor paneli -> yazdığım reçeteler
    @GetMapping("/doktor/{doktorId}")
    public List<Recete> doktorunReceteleri(@PathVariable Integer doktorId) {
        return receteServisi.doktorunReceteleri(doktorId);
    }

    // ---- Request Body sınıfları ----

    public static class ReceteYazIstegi {
        private Integer doktorId;
        private Integer hastaId;
        private String ilacListesi;
        private String aciklama;

        public Integer getDoktorId() {
            return doktorId;
        }

        public void setDoktorId(Integer doktorId) {
            this.doktorId = doktorId;
        }

        public Integer getHastaId() {
            return hastaId;
        }

        public void setHastaId(Integer hastaId) {
            this.hastaId = hastaId;
        }

        public String getIlacListesi() {
            return ilacListesi;
        }

        public void setIlacListesi(String ilacListesi) {
            this.ilacListesi = ilacListesi;
        }

        public String getAciklama() {
            return aciklama;
        }

        public void setAciklama(String aciklama) {
            this.aciklama = aciklama;
        }
    }
}
