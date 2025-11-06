// com.hospital.dto.SlotDto
package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SlotDto {
    public Integer slotId;
    public Integer doktorId;
    public LocalDate tarih;
    public LocalTime baslangicSaat;
    public LocalTime bitisSaat;
    public String slotDurumu;
    public String aciklama;

    public static SlotDto from(com.hospital.model.DoktorCalismaSaati s) {
        SlotDto d = new SlotDto();
        d.slotId = s.getSlotId();
        d.doktorId = s.getDoktor() != null ? s.getDoktor().getDoktorId() : null;
        d.tarih = s.getTarih();
        d.baslangicSaat = s.getBaslangicSaat();
        d.bitisSaat = s.getBitisSaat();
        d.slotDurumu = s.getSlotDurumu();
        d.aciklama = s.getAciklama();
        return d;
    }
}
