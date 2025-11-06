package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "sikayet")
public class Sikayet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sikayet_id")
    private Integer sikayetId;

    @ManyToOne
    @JoinColumn(name = "hasta_id", nullable = false)
    private Hasta hasta;

    @Column(name = "baslik", nullable = false, length = 150)
    private String baslik;

    @Column(name = "icerik", nullable = false)
    private String icerik;

    @Column(name = "olusturulma_zamani", nullable = false)
    private Timestamp olusturulmaZamani;

    @Column(name = "durum", nullable = false, length = 20)
    private String durum = "ACILDI"; // ACILDI / INCELEMEDE / COZUMLENDI / KAPATILDI

    @Column(name = "mudur_notu")
    private String mudurNotu;

    // --- GETTER / SETTER ---

    public Integer getSikayetId() {
        return sikayetId;
    }

    public void setSikayetId(Integer sikayetId) {
        this.sikayetId = sikayetId;
    }

    public Hasta getHasta() {
        return hasta;
    }

    public void setHasta(Hasta hasta) {
        this.hasta = hasta;
    }

    public String getBaslik() {
        return baslik;
    }

    public void setBaslik(String baslik) {
        this.baslik = baslik;
    }

    public String getIcerik() {
        return icerik;
    }

    public void setIcerik(String icerik) {
        this.icerik = icerik;
    }

    public Timestamp getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(Timestamp olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }

    public String getDurum() {
        return durum;
    }

    public void setDurum(String durum) {
        this.durum = durum;
    }

    public String getMudurNotu() {
        return mudurNotu;
    }

    public void setMudurNotu(String mudurNotu) {
        this.mudurNotu = mudurNotu;
    }
}
