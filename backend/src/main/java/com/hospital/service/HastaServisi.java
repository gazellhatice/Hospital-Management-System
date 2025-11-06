package com.hospital.service;

import com.hospital.model.Hasta;
import com.hospital.model.Resepsiyonist;
import com.hospital.repository.HastaRepository;
import com.hospital.repository.ResepsiyonistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;

@Service
public class HastaServisi {

    private final HastaRepository hastaRepository;
    private final ResepsiyonistRepository resepsiyonistRepository;

    public HastaServisi(HastaRepository hastaRepository,
                        ResepsiyonistRepository resepsiyonistRepository) {
        this.hastaRepository = hastaRepository;
        this.resepsiyonistRepository = resepsiyonistRepository;
    }

    @Transactional
    public Hasta hastaKayitOl(Hasta yeniHasta) {
        yeniHasta.setOlusturulmaZamani(Timestamp.from(Instant.now()));
        // kendi kaydı olduğu için resepsiyonist null kalabilir
        return hastaRepository.save(yeniHasta);
    }

    @Transactional
    public Hasta resepsiyonHastaEkle(Integer resepsiyonistId, Hasta yeniHasta) {
        Resepsiyonist resepsiyonist = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));

        yeniHasta.setResepsiyonuAcan(resepsiyonist);
        yeniHasta.setOlusturulmaZamani(Timestamp.from(Instant.now()));

        return hastaRepository.save(yeniHasta);
    }

    public Hasta hastaGiris(String email, String sifre) {
        return hastaRepository.findByEmailAndSifre(email, sifre)
                .orElseThrow(() -> new RuntimeException("Giriş bilgileri hatalı"));
    }

    public Hasta hastaGetirById(Integer hastaId) {
        return hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));
    }

    public Hasta hastaAraTc(String tcKimlikNo) {
    return hastaRepository.findByTcKimlikNo(tcKimlikNo)
            .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));
}

    @Transactional
    public Hasta hastaBilgiGuncelle(Integer hastaId,
                                    String yeniTelefon,
                                    String yeniAdres) {

        Hasta h = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));

        h.setTelefon(yeniTelefon);
        h.setAdres(yeniAdres);

        return hastaRepository.save(h);
    }
}
