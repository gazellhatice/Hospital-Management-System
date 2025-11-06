package com.hospital.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "doktor_calisma_saati")
public class DoktorCalismaSaati {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id")
    private Integer slotId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "doktor_id", nullable = false)
    private Doktor doktor;

    @Column(name = "tarih", nullable = false)
    private LocalDate tarih;

    @Column(name = "baslangic_saat", nullable = false)
    private LocalTime baslangicSaat;

    @Column(name = "bitis_saat", nullable = false)
    private LocalTime bitisSaat;

    @Column(name = "slot_durumu", length = 20, nullable = false)
    private String slotDurumu; // "MUSAIT", "DOLU", vb.

    @Column(name = "aciklama", length = 255)
    private String aciklama;

    @Column(name = "olusturulma_zamani", nullable = false)
    private LocalDateTime olusturulmaZamani;

    // --- GETTER / SETTER ---

    public Integer getSlotId() {
        return slotId;
    }

    public void setSlotId(Integer slotId) {
        this.slotId = slotId;
    }

    public Doktor getDoktor() {
        return doktor;
    }

    public void setDoktor(Doktor doktor) {
        this.doktor = doktor;
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

    public String getSlotDurumu() {
        return slotDurumu;
    }

    public void setSlotDurumu(String slotDurumu) {
        this.slotDurumu = slotDurumu;
    }

    public String getAciklama() {
        return aciklama;
    }

    public void setAciklama(String aciklama) {
        this.aciklama = aciklama;
    }

    public LocalDateTime getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(LocalDateTime olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }

}
