package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "resepsiyonist")
public class Resepsiyonist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resepsiyonist_id")
    private Integer resepsiyonistId;

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

    // hangi müdür tarafından eklendi
    @ManyToOne
    @JoinColumn(name = "mudur_id", nullable = false)
    private Mudur muduru;

    // --- GETTER / SETTER ---

    public Integer getResepsiyonistId() {
        return resepsiyonistId;
    }

    public void setResepsiyonistId(Integer resepsiyonistId) {
        this.resepsiyonistId = resepsiyonistId;
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

    public Mudur getMuduru() {
        return muduru;
    }

    public void setMuduru(Mudur muduru) {
        this.muduru = muduru;
    }
}
