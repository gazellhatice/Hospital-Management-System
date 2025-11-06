package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "ziyaretci_kayit")
public class ZiyaretciKayit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ziyaretci_id")
    private Integer ziyaretciId;

    @Column(name = "ad_soyad", nullable = false, length = 100)
    private String adSoyad;

    @Column(name = "ziyaret_sebebi", length = 200)
    private String ziyaretSebebi;

    @Column(name = "ziyaret_tarihi_saat", nullable = false)
    private Timestamp ziyaretTarihiSaat;

    @Column(name = "notlar")
    private String notlar;

    @ManyToOne
    @JoinColumn(name = "resepsiyonist_id", nullable = false)
    private Resepsiyonist resepsiyonist;

    // --- GETTER / SETTER ---

    public Integer getZiyaretciId() {
        return ziyaretciId;
    }

    public void setZiyaretciId(Integer ziyaretciId) {
        this.ziyaretciId = ziyaretciId;
    }

    public String getAdSoyad() {
        return adSoyad;
    }

    public void setAdSoyad(String adSoyad) {
        this.adSoyad = adSoyad;
    }

    public String getZiyaretSebebi() {
        return ziyaretSebebi;
    }

    public void setZiyaretSebebi(String ziyaretSebebi) {
        this.ziyaretSebebi = ziyaretSebebi;
    }

    public Timestamp getZiyaretTarihiSaat() {
        return ziyaretTarihiSaat;
    }

    public void setZiyaretTarihiSaat(Timestamp ziyaretTarihiSaat) {
        this.ziyaretTarihiSaat = ziyaretTarihiSaat;
    }

    public String getNotlar() {
        return notlar;
    }

    public void setNotlar(String notlar) {
        this.notlar = notlar;
    }

    public Resepsiyonist getResepsiyonist() {
        return resepsiyonist;
    }

    public void setResepsiyonist(Resepsiyonist resepsiyonist) {
        this.resepsiyonist = resepsiyonist;
    }
}
