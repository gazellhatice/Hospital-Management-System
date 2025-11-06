package com.hospital.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "recete")
public class Recete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recete_id")
    private Integer receteId;

    @ManyToOne
    @JoinColumn(name = "hasta_id", nullable = false)
    private Hasta hasta;

    @ManyToOne
    @JoinColumn(name = "doktor_id", nullable = false)
    private Doktor doktor;

    @Column(name = "olusturulma_zamani", nullable = false)
    private Timestamp olusturulmaZamani;

    @Column(name = "ilac_listesi", nullable = false)
    private String ilacListesi; // "Parol 500mg günde 2x1\n..."

    @Column(name = "aciklama")
    private String aciklama;

    // --- GETTER / SETTER ---

    public Integer getReceteId() {
        return receteId;
    }

    public void setReceteId(Integer receteId) {
        this.receteId = receteId;
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

    public Timestamp getOlusturulmaZamani() {
        return olusturulmaZamani;
    }

    public void setOlusturulmaZamani(Timestamp olusturulmaZamani) {
        this.olusturulmaZamani = olusturulmaZamani;
    }

    public String getIlacListesi() {
        return ilacListesi;
    }

    public void setIlacListesi(String ilacListesi) {
        this.ilacListesi = ilacListesi;
    }

    public String getAciklama() {
        return aciklama;
    }

    public void setAciklama(String aciklama) {
        this.aciklama = aciklama;
    }
}
