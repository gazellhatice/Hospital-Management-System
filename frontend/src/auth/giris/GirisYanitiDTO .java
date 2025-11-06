package auth.giris;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GirisYanitiDTO {
    private Long kullaniciId;
    private String adSoyad;
    private String rol; // "MUDUR", "DOKTOR", "RESEPSIYON", "HASTA"

    // rol spesifik id'ler:
    private Long doktorId;
    private Long hastaId;
}
