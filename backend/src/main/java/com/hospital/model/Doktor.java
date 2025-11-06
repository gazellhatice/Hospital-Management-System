package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "doktor")
public class Doktor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doktor_id")
    private Integer doktorId;

    @Column(name = "ad_soyad", nullable = false, length = 100)
    private String adSoyad;

    @Column(name = "uzmanlik_alani", nullable = false, length = 100)
    private String uzmanlikAlani; // "Dahiliye", "Kardiyoloji" ...

    @Column(name = "email", length = 120, unique = true, nullable = false)
    private String email;

    @Column(name = "sifre", length = 120, nullable = false)
    private String sifre;

    @Column(name = "aktif_mi", nullable = false)
    private Boolean aktifMi = true;

    @Column(name = "onay_durumu", nullable = false, length = 20)
    private String onayDurumu = "BEKLIYOR"; // BEKLIYOR / ONAYLANDI / REDDEDILDI

    @Column(name = "olusturulma_zamani", nullable = false)
    private Timestamp olusturulmaZamani;

    // Hangi müdür ekledi?
    @ManyToOne
    @JoinColumn(name = "mudur_id", nullable = false)
    private Mudur muduru;

    // --- GETTER / SETTER ---

    public Integer getDoktorId() {
        return doktorId;
    }

    public void setDoktorId(Integer doktorId) {
        this.doktorId = doktorId;
    }

    public String getAdSoyad() {
        return adSoyad;
    }

    public void setAdSoyad(String adSoyad) {
        this.adSoyad = adSoyad;
    }

    public String getUzmanlikAlani() {
        return uzmanlikAlani;
    }

    public void setUzmanlikAlani(String uzmanlikAlani) {
        this.uzmanlikAlani = uzmanlikAlani;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSifre() {
        return sifre;
    }

    public void setSifre(String sifre) {
        this.sifre = sifre;
    }

    public Boolean getAktifMi() {
        return aktifMi;
    }

    public void setAktifMi(Boolean aktifMi) {
        this.aktifMi = aktifMi;
    }

    public String getOnayDurumu() {
        return onayDurumu;
    }

    public void setOnayDurumu(String onayDurumu) {
        this.onayDurumu = onayDurumu;
    }

    public Timestamp getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(Timestamp olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }

    public Mudur getMuduru() {
        return muduru;
    }

    public void setMuduru(Mudur muduru) {
        this.muduru = muduru;
    }
}
