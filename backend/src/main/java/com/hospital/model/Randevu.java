package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "randevu")
public class Randevu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "randevu_id")
    private Integer randevuId;

    @ManyToOne
    @JoinColumn(name = "hasta_id", nullable = false)
    private Hasta hasta;

    @ManyToOne
    @JoinColumn(name = "doktor_id", nullable = false)
    private Doktor doktor;

    // Bu randevu hangi slottan doğdu
    @OneToOne
    @JoinColumn(name = "slot_id", unique = true)
    private DoktorCalismaSaati slot;

    @Column(name = "randevu_durumu", nullable = false, length = 20)
    private String randevuDurumu = "AKTIF"; // AKTIF / GELMEDI / IPTAL / TAMAMLANDI

    @Column(name = "notlar")
    private String notlar;

    @Column(name = "olusturulma_zamani", nullable = false)
    private Timestamp olusturulmaZamani;
    

    // --- GETTER / SETTER ---

    public Integer getRandevuId() {
        return randevuId;
    }

    public void setRandevuId(Integer randevuId) {
        this.randevuId = randevuId;
    }

    public Hasta getHasta() {
        return hasta;
    }

    public void setHasta(Hasta hasta) {
        this.hasta = hasta;
    }

    public Doktor getDoktor() {
        return doktor;
    }

    public void setDoktor(Doktor doktor) {
        this.doktor = doktor;
    }

    public DoktorCalismaSaati getSlot() {
        return slot;
    }

    public void setSlot(DoktorCalismaSaati slot) {
        this.slot = slot;
    }

    public String getRandevuDurumu() {
        return randevuDurumu;
    }

    public void setRandevuDurumu(String randevuDurumu) {
        this.randevuDurumu = randevuDurumu;
    }

    public String getNotlar() {
        return notlar;
    }

    public void setNotlar(String notlar) {
        this.notlar = notlar;
    }

    public Timestamp getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(Timestamp olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }
}
