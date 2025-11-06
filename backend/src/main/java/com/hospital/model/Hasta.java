package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.time.LocalDate;

@Entity
@Table(name = "hasta")
public class Hasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hasta_id")
    private Integer hastaId;

    @Column(name = "ad_soyad", nullable = false, length = 100)
    private String adSoyad;

    @Column(name = "tc_kimlik_no", length = 11, unique = true)
    private String tcKimlikNo;

    @Column(name = "dogum_tarihi")
    private LocalDate dogumTarihi;

    @Column(name = "telefon", length = 20)
    private String telefon;

    @Column(name = "email", length = 120, unique = true)
    private String email;

    @Column(name = "sifre", length = 120)
    private String sifre;

    @Column(name = "adres")
    private String adres;

    @Column(name = "olusturulma_zamani", nullable = false)
    private Timestamp olusturulmaZamani;

    // Bu hastayı sisteme kim ekledi? null olabilir
    @ManyToOne
    @JoinColumn(name = "resepsiyonist_id")
    private Resepsiyonist resepsiyonuAcan;

    // --- GETTER / SETTER ---

    public Integer getHastaId() {
        return hastaId;
    }

    public void setHastaId(Integer hastaId) {
        this.hastaId = hastaId;
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

    public LocalDate getDogumTarihi() {
        return dogumTarihi;
    }

    public void setDogumTarihi(LocalDate dogumTarihi) {
        this.dogumTarihi = dogumTarihi;
    }

    public String getTelefon() {
        return telefon;
    }

    public void setTelefon(String telefon) {
        this.telefon = telefon;
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

    public String getAdres() {
        return adres;
    }

    public void setAdres(String adres) {
        this.adres = adres;
    }

    public Timestamp getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(Timestamp olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }

    public Resepsiyonist getResepsiyonuAcan() {
        return resepsiyonuAcan;
    }

    public void setResepsiyonuAcan(Resepsiyonist resepsiyonuAcan) {
        this.resepsiyonuAcan = resepsiyonuAcan;
    }
}
