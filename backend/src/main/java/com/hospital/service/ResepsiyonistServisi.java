package com.hospital.service;

import com.hospital.model.Hasta;
import com.hospital.model.Resepsiyonist;
import com.hospital.model.ZiyaretciKayit;
import com.hospital.repository.HastaRepository;
import com.hospital.repository.ResepsiyonistRepository;
import com.hospital.repository.ZiyaretciKayitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class ResepsiyonistServisi {

    private final ResepsiyonistRepository resepsiyonistRepository;
    private final HastaRepository hastaRepository;
    private final ZiyaretciKayitRepository ziyaretciKayitRepository;

    public ResepsiyonistServisi(ResepsiyonistRepository resepsiyonistRepository,
                                HastaRepository hastaRepository,
                                ZiyaretciKayitRepository ziyaretciKayitRepository) {
        this.resepsiyonistRepository = resepsiyonistRepository;
        this.hastaRepository = hastaRepository;
        this.ziyaretciKayitRepository = ziyaretciKayitRepository;
    }

    // resepsiyonist login
    public Resepsiyonist resepsiyonistGiris(String email, String sifre) {
        return resepsiyonistRepository.findByEmailAndSifre(email, sifre)
                .orElseThrow(() -> new RuntimeException("Giriş bilgileri hatalı"));
    }

    // profil bilgisi vs. görüntülemek için
    public Resepsiyonist resepsiyonistGetir(Integer resepsiyonistId) {
        return resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));
    }

    // resepsiyonist yeni hasta ekler
    @Transactional
    public Hasta resepsiyonHastaEkle(Integer resepsiyonistId, Hasta hastaBilgisi) {
        Resepsiyonist r = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));

        hastaBilgisi.setResepsiyonuAcan(r);
        hastaBilgisi.setOlusturulmaZamani(Timestamp.from(Instant.now()));

        return hastaRepository.save(hastaBilgisi);
    }

    // resepsiyonist ziyaretçi girişi yapar
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

    // resepsiyonist kendi girdiği ziyaretçileri listeler
    public List<ZiyaretciKayit> kendiZiyaretcileriniListele(Integer resepsiyonistId) {
        Resepsiyonist r = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));
        return ziyaretciKayitRepository.findByResepsiyonistOrderByZiyaretTarihiSaatDesc(r);
    }
}
