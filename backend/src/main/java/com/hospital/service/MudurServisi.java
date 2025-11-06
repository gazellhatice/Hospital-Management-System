package com.hospital.service;

import com.hospital.model.Mudur;
import com.hospital.model.Resepsiyonist;
import com.hospital.repository.MudurRepository;
import com.hospital.repository.ResepsiyonistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;

@Service
public class MudurServisi {

    private final MudurRepository mudurRepository;
    private final ResepsiyonistRepository resepsiyonistRepository;

    public MudurServisi(MudurRepository mudurRepository,
                        ResepsiyonistRepository resepsiyonistRepository) {
        this.mudurRepository = mudurRepository;
        this.resepsiyonistRepository = resepsiyonistRepository;
    }

    public Mudur mudurGiris(String email, String sifre) {
        return mudurRepository.findByEmailAndSifre(email, sifre)
                .orElseThrow(() -> new RuntimeException("Giriş bilgileri hatalı"));
    }

    public Mudur mudurGetir(Integer mudurId) {
        return mudurRepository.findById(mudurId)
                .orElseThrow(() -> new RuntimeException("Müdür bulunamadı"));
    }

    @Transactional
    public Resepsiyonist resepsiyonistEkle(Integer mudurId,
                                           String adSoyad,
                                           String tcKimlikNo,
                                           String email,
                                           String sifre) {

        Mudur m = mudurRepository.findById(mudurId)
                .orElseThrow(() -> new RuntimeException("Müdür bulunamadı"));

        Resepsiyonist r = new Resepsiyonist();
        r.setAdSoyad(adSoyad);
        r.setTcKimlikNo(tcKimlikNo);
        r.setEmail(email);
        r.setSifre(sifre);
        r.setAktifMi(true);
        r.setOlusturulmaZamani(Timestamp.from(Instant.now()));
        r.setMuduru(m);

        return resepsiyonistRepository.save(r);
    }

    @Transactional
    public Resepsiyonist resepsiyonistAktiflikGuncelle(Integer resepsiyonistId,
                                                       boolean aktifMi) {
        Resepsiyonist r = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));
        r.setAktifMi(aktifMi);
        return resepsiyonistRepository.save(r);
    }
}
