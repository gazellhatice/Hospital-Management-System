package com.hospital.service;

import com.hospital.dto.ReceteDto;
import com.hospital.model.Doktor;
import com.hospital.model.Hasta;
import com.hospital.model.Recete;
import com.hospital.repository.DoktorRepository;
import com.hospital.repository.HastaRepository;
import com.hospital.repository.ReceteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class ReceteServisi {

    private static final Logger log = LoggerFactory.getLogger(ReceteServisi.class);

    private final ReceteRepository receteRepository;
    private final DoktorRepository doktorRepository;
    private final HastaRepository hastaRepository;

    public ReceteServisi(ReceteRepository receteRepository,
                         DoktorRepository doktorRepository,
                         HastaRepository hastaRepository) {
        this.receteRepository = receteRepository;
        this.doktorRepository = doktorRepository;
        this.hastaRepository = hastaRepository;
    }

    /** Doktor reçete yazar */
    @Transactional
    public Recete receteYaz(Integer doktorId,
                            Integer hastaId,
                            String ilacListesi,
                            String aciklama) {

        if (doktorId == null || hastaId == null || ilacListesi == null || ilacListesi.isBlank()) {
            throw new IllegalArgumentException("Doktor, hasta ve ilaç listesi zorunludur.");
        }

        Doktor doktor = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new RuntimeException("Doktor bulunamadı"));

        Hasta hasta = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));

        Recete recete = new Recete();
        recete.setDoktor(doktor);
        recete.setHasta(hasta);
        recete.setIlacListesi(ilacListesi);
        recete.setAciklama(aciklama);
        recete.setOlusturulmaZamani(Timestamp.from(Instant.now()));

        Recete saved = receteRepository.save(recete);
        log.info("Reçete oluşturuldu: receteId={} (doktorId={}, hastaId={})",
                saved.getReceteId(), doktorId, hastaId);
        return saved;
    }

    /** Hasta paneli -> Reçetelerim (DTO döner) */
    public List<ReceteDto> hastaninReceteleriDto(Integer hastaId) {
        List<Recete> list = receteRepository
                .findByHasta_HastaIdOrderByOlusturulmaZamaniDesc(hastaId);
        log.info("Hasta reçete sayısı (hastaId={}): {}", hastaId, list.size());

        return list.stream().map(r -> {
            ReceteDto d = new ReceteDto();
            d.receteId = r.getReceteId();
            d.hastaId = r.getHasta().getHastaId();
            d.hastaAdSoyad = r.getHasta().getAdSoyad();
            d.doktorId = r.getDoktor().getDoktorId();
            d.doktorAdSoyad = r.getDoktor().getAdSoyad();
            d.olusturulmaZamani = r.getOlusturulmaZamani();
            d.ilacListesi = r.getIlacListesi();
            d.aciklama = r.getAciklama();
            return d;
        }).toList();
    }

    /** Doktor paneli -> Yazdığım reçeteler (entity döner) */
    public List<Recete> doktorunReceteleri(Integer doktorId) {
        return receteRepository.findByDoktor_DoktorIdOrderByOlusturulmaZamaniDesc(doktorId);
    }
}
