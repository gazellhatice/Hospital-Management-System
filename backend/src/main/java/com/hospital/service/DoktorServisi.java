package com.hospital.service;

import com.hospital.model.Doktor;
import com.hospital.model.Mudur;
import com.hospital.repository.DoktorRepository;
import com.hospital.repository.MudurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class DoktorServisi {

    private final DoktorRepository doktorRepository;
    private final MudurRepository mudurRepository;

    public DoktorServisi(DoktorRepository doktorRepository,
                         MudurRepository mudurRepository) {
        this.doktorRepository = doktorRepository;
        this.mudurRepository = mudurRepository;
    }

    public Doktor doktorGiris(String email, String sifre) {
        return doktorRepository.findByEmailAndSifre(email, sifre)
                .orElseThrow(() -> new RuntimeException("Giriş bilgileri hatalı"));
    }

    @Transactional
    public Doktor doktorEkle(Integer mudurId,
                             String adSoyad,
                             String uzmanlikAlani,
                             String email,
                             String sifre) {

        Mudur m = mudurRepository.findById(mudurId)
                .orElseThrow(() -> new RuntimeException("Müdür bulunamadı"));

        Doktor d = new Doktor();
        d.setAdSoyad(adSoyad);
        d.setUzmanlikAlani(uzmanlikAlani);
        d.setEmail(email);
        d.setSifre(sifre);
        d.setAktifMi(true);
        d.setOnayDurumu("BEKLIYOR");
        d.setOlusturulmaZamani(Timestamp.from(Instant.now()));
        d.setMuduru(m);

        return doktorRepository.save(d);
    }

    @Transactional
    public Doktor doktorOnayDurumuGuncelle(Integer doktorId, String yeniDurum) {
        Doktor d = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new RuntimeException("Doktor bulunamadı"));
        d.setOnayDurumu(yeniDurum); // "ONAYLANDI" / "REDDEDILDI"
        return doktorRepository.save(d);
    }

    @Transactional
    public Doktor doktorAktiflikGuncelle(Integer doktorId, boolean aktifMi) {
        Doktor d = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new RuntimeException("Doktor bulunamadı"));
        d.setAktifMi(aktifMi);
        return doktorRepository.save(d);
    }

    public List<Doktor> doktorlariListeleOnayli() {
        // resepsiyon/hasta panelinde doktora göre randevu açarken kullanılacak
        return doktorRepository.findByAktifMiTrueAndOnayDurumu("ONAYLANDI");
    }

    public List<Doktor> doktorlariBransaGore(String uzmanlikAlani) {
        return doktorRepository.findByUzmanlikAlaniIgnoreCaseAndAktifMiTrueAndOnayDurumu(
                uzmanlikAlani,
                "ONAYLANDI"
        );
    }
}
