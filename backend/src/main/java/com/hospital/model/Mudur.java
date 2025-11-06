package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "mudur")
public class Mudur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mudur_id")
    private Integer mudurId;

    @Column(name = "ad_soyad", nullable = false, length = 100)
    private String adSoyad;

    @Column(name = "tc_kimlik_no", length = 11, unique = true, nullable = false)
    private String tcKimlikNo;

    @Column(name = "email", length = 120, unique = true, nullable = false)
    private String email;

    @Column(name = "sifre", length = 120, nullable = false)
    private String sifre;

    @Column(name = "aktif_mi", nullable = false)
    private Boolean aktifMi = true;

    @Column(name = "olusturulma_zamani", nullable = false)
    private Timestamp olusturulmaZamani;

    // --- GETTER / SETTER ---

    public Integer getMudurId() {
        return mudurId;
    }

    public void setMudurId(Integer mudurId) {
        this.mudurId = mudurId;
    }

    public String getAdSoyad() {
        return adSoyad;
    }

    public void setAdSoyad(String adSoyad) {
        this.adSoyad = adSoyad;
    }

    public String getTcKimlikNo() {
        return tcKimlikNo;
    }

    public void setTcKimlikNo(String tcKimlikNo) {
        this.tcKimlikNo = tcKimlikNo;
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

    public Timestamp getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(Timestamp olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }
}
