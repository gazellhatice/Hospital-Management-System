package com.hospital.dto;

public class ZiyaretciKayitOlusturIstek {
    private Integer resepsiyonistId;
    private String adSoyad;
    private String ziyaretSebebi;
    private String notlar;

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

    public String getZiyaretSebebi() {
        return ziyaretSebebi;
    }
    public void setZiyaretSebebi(String ziyaretSebebi) {
        this.ziyaretSebebi = ziyaretSebebi;
    }

    public String getNotlar() {
        return notlar;
    }
    public void setNotlar(String notlar) {
        this.notlar = notlar;
    }
}

