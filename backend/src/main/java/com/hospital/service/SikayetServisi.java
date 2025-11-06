package com.hospital.service;

import com.hospital.model.Hasta;
import com.hospital.model.Sikayet;
import com.hospital.repository.HastaRepository;
import com.hospital.repository.SikayetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class SikayetServisi {

    private final SikayetRepository sikayetRepository;
    private final HastaRepository hastaRepository;

    public SikayetServisi(SikayetRepository sikayetRepository,
                          HastaRepository hastaRepository) {
        this.sikayetRepository = sikayetRepository;
        this.hastaRepository = hastaRepository;
    }

    @Transactional
    public Sikayet hastaSikayetOlustur(Integer hastaId,
                                       String baslik,
                                       String icerik) {

        Hasta hasta = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));

        Sikayet s = new Sikayet();
        s.setHasta(hasta);
        s.setBaslik(baslik);
        s.setIcerik(icerik);
        s.setOlusturulmaZamani(Timestamp.from(Instant.now()));
        s.setDurum("ACILDI");
        s.setMudurNotu(null);

        return sikayetRepository.save(s);
    }

    public List<Sikayet> hastaninSikayetleriniListele(Integer hastaId) {
        Hasta hasta = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));

        return sikayetRepository.findByHastaOrderByOlusturulmaZamaniDesc(hasta);
    }

    public List<Sikayet> mudurSikayetListeleDurumaGore(String durum) {
        if (durum == null || durum.isBlank()) {
            // durum boşsa hepsini verelim
            return sikayetRepository.findAll();
        }
        return sikayetRepository.findByDurum(durum);
    }

    @Transactional
    public Sikayet mudurSikayetDurumGuncelle(Integer sikayetId,
                                             String yeniDurum,
                                             String mudurNotu) {

        Sikayet s = sikayetRepository.findById(sikayetId)
                .orElseThrow(() -> new RuntimeException("Şikayet bulunamadı"));

        s.setDurum(yeniDurum);
        s.setMudurNotu(mudurNotu);

        return sikayetRepository.save(s);
    }
}
