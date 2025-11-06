package com.hospital.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GirisYanitDto {

    private Long kullaniciId;
    private String adSoyad;
    private String email;
    private String rol;      // "MUDUR", "DOKTOR", "RESEPSIYON", "HASTA"
    private Boolean aktif;
}
