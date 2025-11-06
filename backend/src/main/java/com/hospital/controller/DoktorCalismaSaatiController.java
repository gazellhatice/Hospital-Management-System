package com.hospital.controller;

import com.hospital.dto.SlotAcIstegi;
import com.hospital.dto.SlotDto;
import com.hospital.model.DoktorCalismaSaati;
import com.hospital.service.DoktorCalismaSaatiServisi;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slot")
public class DoktorCalismaSaatiController {

    private final DoktorCalismaSaatiServisi doktorCalismaSaatiServisi;

    public DoktorCalismaSaatiController(DoktorCalismaSaatiServisi doktorCalismaSaatiServisi) {
        this.doktorCalismaSaatiServisi = doktorCalismaSaatiServisi;
    }

    /** Doktor yeni slot açar (müdür onayı yok) */
    @PostMapping("/doktor/slot-ac")
    public ResponseEntity<?> slotAc(@RequestBody SlotAcIstegi body) {
        try {
            DoktorCalismaSaati saved = doktorCalismaSaatiServisi.doktorSlotAc(
                    body.getDoktorId(),
                    body.getTarih(),
                    body.getBaslangicSaat(),
                    body.getBitisSaat(),
                    body.getAciklama());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Beklenmeyen hata: " + ex.getMessage());
        }
    }

    @GetMapping("/doktor/{doktorId}")
    public List<SlotDto> doktorSlotlari(@PathVariable Integer doktorId) {
        return doktorCalismaSaatiServisi.doktorSlotlariniListele(doktorId)
                .stream().map(SlotDto::from).toList();
    }

    @GetMapping("/resepsiyon/musait")
    public List<SlotDto> resepsiyonMusaitSlotlar() {
        return doktorCalismaSaatiServisi.musaitSlotlariListele()
                .stream().map(SlotDto::from).toList();
    }
}
