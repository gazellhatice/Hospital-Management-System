package com.hospital.dto;

import java.sql.Timestamp;

public class ReceteDto {
    public Integer receteId;
    public Integer hastaId;
    public String  hastaAdSoyad;
    public Integer doktorId;
    public String  doktorAdSoyad;
    public Timestamp olusturulmaZamani;
    public String ilacListesi;
    public String aciklama;
}
