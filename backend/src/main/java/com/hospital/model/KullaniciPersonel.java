package com.hospital.model;

import jakarta.persistence.*;

@Entity
@Table(name = "kullanici_personel")
public class KullaniciPersonel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id; // otomatik

    @Column(name = "ad_soyad", nullable = false)
    private String adSoyad;

    @Column(name = "rol", nullable = false)
    private String rol; // "MUDUR" | "DOKTOR" | "RESEPSIYON"

    @Column(name = "kullanici_adi", nullable = false, unique = true)
    private String kullaniciAdi;

    @Column(name = "sifre", nullable = false)
    private String sifre; // düz şifre

    @Column(name = "aktif", nullable = false)
    private Boolean aktif = true;

    // GETTER-SETTER
    public Integer getId() {
        return id;
    }

    public String getAdSoyad() {
        return adSoyad;
    }

    public void setAdSoyad(String adSoyad) {
        this.adSoyad = adSoyad;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getKullaniciAdi() {
        return kullaniciAdi;
    }

    public void setKullaniciAdi(String kullaniciAdi) {
        this.kullaniciAdi = kullaniciAdi;
    }

    public String getSifre() {
        return sifre;
    }

    public void setSifre(String sifre) {
        this.sifre = sifre;
    }

    public Boolean getAktif() {
        return aktif;
    }

    public void setAktif(Boolean aktif) {
        this.aktif = aktif;
    }
}
