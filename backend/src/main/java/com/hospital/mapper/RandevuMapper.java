package com.hospital.mapper;

import com.hospital.dto.RandevuDto;
import com.hospital.model.Doktor;
import com.hospital.model.DoktorCalismaSaati;
import com.hospital.model.Hasta;
import com.hospital.model.Randevu;

public class RandevuMapper {

    public static RandevuDto toDto(Randevu r) {
        if (r == null) return null;

        RandevuDto dto = new RandevuDto();
        dto.setRandevuId(r.getRandevuId());
        dto.setRandevuDurumu(r.getRandevuDurumu());
        dto.setNotlar(r.getNotlar());
        dto.setOlusturulmaZamani(
                r.getOlusturulmaZamani() != null
                        ? r.getOlusturulmaZamani().toString()
                        : null
        );

        // === Slot ===
        DoktorCalismaSaati slot = r.getSlot();
        if (slot != null) {
            RandevuDto.SlotDto s = new RandevuDto.SlotDto();
            s.setSlotId(slot.getSlotId());
            s.setTarih(slot.getTarih() != null ? slot.getTarih().toString() : null);
            s.setBaslangicSaat(slot.getBaslangicSaat() != null ? slot.getBaslangicSaat().toString() : null);
            s.setBitisSaat(slot.getBitisSaat() != null ? slot.getBitisSaat().toString() : null);
            dto.setSlot(s);
        }

        // === Doktor ===
        Doktor doktor = r.getDoktor();
        if (doktor != null) {
            RandevuDto.DoktorDto d = new RandevuDto.DoktorDto();
            d.setDoktorId(doktor.getDoktorId());
            d.setAdSoyad(doktor.getAdSoyad());
            // FE "brans" bekliyor, entity'de "uzmanlikAlani" var
            d.setBrans(doktor.getUzmanlikAlani());
            dto.setDoktor(d);
        }

        // === Hasta ===
        Hasta hasta = r.getHasta();
        if (hasta != null) {
            RandevuDto.HastaDto h = new RandevuDto.HastaDto();
            h.setHastaId(hasta.getHastaId());
            h.setAdSoyad(hasta.getAdSoyad());
            h.setTcKimlikNo(hasta.getTcKimlikNo());
            dto.setHasta(h);
        }

        return dto;
    }
}
