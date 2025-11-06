package com.hospital.controller;

import com.hospital.dto.RandevuDto;
import com.hospital.mapper.RandevuMapper;
import com.hospital.model.Randevu;
import com.hospital.service.RandevuServisi;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/randevu")
// @CrossOrigin // gerekiyorsa aç
public class RandevuController {

    private final RandevuServisi randevuServisi;

    public RandevuController(RandevuServisi randevuServisi) {
        this.randevuServisi = randevuServisi;
    }

    // Resepsiyon randevu oluşturur -> DTO + 201
    @PostMapping("/olustur")
    public ResponseEntity<RandevuDto> randevuOlustur(@RequestBody RandevuOlusturIstegi body) {
        Randevu r = randevuServisi.randevuOlustur(
                body.getHastaId(),
                body.getSlotId(),
                body.getNotlar()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(RandevuMapper.toDto(r));
    }

    // Hasta paneli -> "Randevularım"
    @GetMapping("/hasta/{hastaId}")
    public ResponseEntity<List<RandevuDto>> hastaninRandevulari(@PathVariable Integer hastaId) {
        List<RandevuDto> list = randevuServisi.hastaninRandevulariniGetir(hastaId)
                .stream().map(RandevuMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Doktor paneli -> bugünkü randevularım
    @GetMapping("/doktor/{doktorId}/bugun")
    public ResponseEntity<List<RandevuDto>> doktorBugunkuRandevulari(@PathVariable Integer doktorId) {
        List<RandevuDto> list = randevuServisi
                .doktorBugunkuRandevulariniGetir(doktorId, LocalDate.now())
                .stream().map(RandevuMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/mudur/tum")
    public ResponseEntity<List<RandevuDto>> tumRandevularMudur() {
        List<RandevuDto> list = randevuServisi.tumRandevular()
                .stream().map(RandevuMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/doktor/{doktorId}")
    public ResponseEntity<List<RandevuDto>> doktorRandevulari(@PathVariable Integer doktorId) {
        List<RandevuDto> list = randevuServisi.doktorunTumRandevulari(doktorId)
                .stream().map(RandevuMapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Randevu durum güncelle (iptal vs.) -> DTO
    @PutMapping("/durum-guncelle")
    public ResponseEntity<RandevuDto> durumGuncelle(@RequestBody RandevuDurumIstegi body) {
        Randevu r = randevuServisi.randevuDurumuGuncelle(
                body.getRandevuId(),
                body.getYeniDurum()
        );
        return ResponseEntity.ok(RandevuMapper.toDto(r));
    }

    // ---- Request Body sınıfları ----

    public static class RandevuOlusturIstegi {
        private Integer hastaId;
        private Integer slotId;
        private String notlar;

        public Integer getHastaId() { return hastaId; }
        public void setHastaId(Integer hastaId) { this.hastaId = hastaId; }

        public Integer getSlotId() { return slotId; }
        public void setSlotId(Integer slotId) { this.slotId = slotId; }

        public String getNotlar() { return notlar; }
        public void setNotlar(String notlar) { this.notlar = notlar; }
    }

    public static class RandevuDurumIstegi {
        private Integer randevuId;
        private String yeniDurum;

        public Integer getRandevuId() { return randevuId; }
        public void setRandevuId(Integer randevuId) { this.randevuId = randevuId; }

        public String getYeniDurum() { return yeniDurum; }
        public void setYeniDurum(String yeniDurum) { this.yeniDurum = yeniDurum; }
    }
}
