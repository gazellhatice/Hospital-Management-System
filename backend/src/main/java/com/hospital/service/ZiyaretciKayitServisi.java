package com.hospital.service;

import com.hospital.model.Resepsiyonist;
import com.hospital.model.ZiyaretciKayit;
import com.hospital.repository.ResepsiyonistRepository;
import com.hospital.repository.ZiyaretciKayitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class ZiyaretciKayitServisi {

    private final ZiyaretciKayitRepository ziyaretciKayitRepository;
    private final ResepsiyonistRepository resepsiyonistRepository;

    public ZiyaretciKayitServisi(ZiyaretciKayitRepository ziyaretciKayitRepository,
                                 ResepsiyonistRepository resepsiyonistRepository) {
        this.ziyaretciKayitRepository = ziyaretciKayitRepository;
        this.resepsiyonistRepository = resepsiyonistRepository;
    }

    @Transactional
    public ZiyaretciKayit ziyaretciEkle(Integer resepsiyonistId,
                                        String adSoyad,
                                        String ziyaretSebebi,
                                        String notlar) {

        Resepsiyonist r = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));

        ZiyaretciKayit z = new ZiyaretciKayit();
        z.setAdSoyad(adSoyad);
        z.setZiyaretSebebi(ziyaretSebebi);
        z.setNotlar(notlar);
        z.setZiyaretTarihiSaat(Timestamp.from(Instant.now()));
        z.setResepsiyonist(r);

        return ziyaretciKayitRepository.save(z);
    }

    // Resepsiyon kendi girdiklerini görmek ister
    public List<ZiyaretciKayit> resepsiyonistinKayitlariniListele(Integer resepsiyonistId) {
        Resepsiyonist r = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));
        return ziyaretciKayitRepository.findByResepsiyonistOrderByZiyaretTarihiSaatDesc(r);
    }

    // Müdür: tüm ziyaretçileri tarih aralığına göre görmek ister
    public List<ZiyaretciKayit> mudurZiyaretciListesi(Timestamp baslangic, Timestamp bitis) {
        return ziyaretciKayitRepository
                .findByZiyaretTarihiSaatBetweenOrderByZiyaretTarihiSaatDesc(baslangic, bitis);
    }

    @Transactional
    public ZiyaretciKayit ziyaretciGuncelle(Integer ziyaretciId,
                                            String yeniAdSoyad,
                                            String yeniSebep,
                                            String yeniNot) {
        ZiyaretciKayit z = ziyaretciKayitRepository.findById(ziyaretciId)
                .orElseThrow(() -> new RuntimeException("Ziyaretçi kaydı bulunamadı"));
        z.setAdSoyad(yeniAdSoyad);
        z.setZiyaretSebebi(yeniSebep);
        z.setNotlar(yeniNot);
        return ziyaretciKayitRepository.save(z);
    }

    @Transactional
    public void ziyaretciSil(Integer ziyaretciId) {
        ziyaretciKayitRepository.deleteById(ziyaretciId);
    }

     // resepsiyonistin yeni ziyaretçi girişi açması
    public ZiyaretciKayit ziyaretciKaydiOlustur(Integer resepsiyonistId,
                                                String adSoyad,
                                                String ziyaretSebebi,
                                                String notlar) {

        Resepsiyonist resepsiyonist = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));

        ZiyaretciKayit kayit = new ZiyaretciKayit();
        kayit.setResepsiyonist(resepsiyonist);
        kayit.setAdSoyad(adSoyad);
        kayit.setZiyaretSebebi(ziyaretSebebi);
        kayit.setNotlar(notlar);
        kayit.setZiyaretTarihiSaat(Timestamp.from(Instant.now())); // şu anki zaman

        return ziyaretciKayitRepository.save(kayit);
    }
}
