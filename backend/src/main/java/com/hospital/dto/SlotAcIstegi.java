package com.hospital.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class SlotAcIstegi {
    private Integer doktorId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate tarih;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime baslangicSaat;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime bitisSaat;

    private String aciklama;

    public Integer getDoktorId() {
        return doktorId;
    }
    public void setDoktorId(Integer doktorId) {
        this.doktorId = doktorId;
    }

    public LocalDate getTarih() {
        return tarih;
    }
    public void setTarih(LocalDate tarih) {
        this.tarih = tarih;
    }

    public LocalTime getBaslangicSaat() {
        return baslangicSaat;
    }
    public void setBaslangicSaat(LocalTime baslangicSaat) {
        this.baslangicSaat = baslangicSaat;
    }

    public LocalTime getBitisSaat() {
        return bitisSaat;
    }
    public void setBitisSaat(LocalTime bitisSaat) {
        this.bitisSaat = bitisSaat;
    }

    public String getAciklama() {
        return aciklama;
    }
    public void setAciklama(String aciklama) {
        this.aciklama = aciklama;
    }
}
