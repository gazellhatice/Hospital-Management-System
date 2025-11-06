package com.hospital.service;

import com.hospital.model.Doktor;
import com.hospital.model.DoktorCalismaSaati;
import com.hospital.repository.DoktorCalismaSaatiRepository;
import com.hospital.repository.DoktorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class DoktorCalismaSaatiServisi {

    private static final Logger log = LoggerFactory.getLogger(DoktorCalismaSaatiServisi.class);

    private final DoktorRepository doktorRepository;
    private final DoktorCalismaSaatiRepository doktorCalismaSaatiRepository;

    public DoktorCalismaSaatiServisi(DoktorRepository doktorRepository,
                                     DoktorCalismaSaatiRepository doktorCalismaSaatiRepository) {
        this.doktorRepository = doktorRepository;
        this.doktorCalismaSaatiRepository = doktorCalismaSaatiRepository;
    }

    /** Doktor panelinden yeni slot açma (MÜDÜR ONAYI YOK) */
    @Transactional
    public DoktorCalismaSaati doktorSlotAc(Integer doktorId,
                                           LocalDate tarih,
                                           LocalTime baslangic,
                                           LocalTime bitis,
                                           String aciklama) {

        log.info("SlotCreate try: dr={}, tarih={}, {}-{}", doktorId, tarih, baslangic, bitis);

        if (doktorId == null || tarih == null || baslangic == null || bitis == null) {
            throw new IllegalArgumentException("Tarih ve saat alanları zorunludur.");
        }
        if (!baslangic.isBefore(bitis)) {
            throw new IllegalArgumentException("Başlangıç saati, bitiş saatinden küçük olmalıdır.");
        }

        Doktor doktor = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new IllegalArgumentException("Doktor bulunamadı."));

        // Çakışma kontrolü (repo'da existsOverlapping varsa aktif tut)
        if (doktorCalismaSaatiRepository.existsOverlapping(doktorId, tarih, baslangic, bitis)) {
            throw new IllegalArgumentException("Seçilen aralık mevcut slotlarla çakışıyor.");
        }

        DoktorCalismaSaati s = new DoktorCalismaSaati();
        s.setDoktor(doktor);
        s.setTarih(tarih);
        s.setBaslangicSaat(baslangic);
        s.setBitisSaat(bitis);
        s.setAciklama(aciklama);
        s.setSlotDurumu("MUSAIT");            // sadece slot durumu kullanılacak
        s.setOlusturulmaZamani(LocalDateTime.now());

        DoktorCalismaSaati saved = doktorCalismaSaatiRepository.save(s);
        log.info("Slot created: id={}", saved.getSlotId());
        return saved;
    }

    /** Doktor kendi slotlarını listelesin */
    public List<DoktorCalismaSaati> doktorSlotlariniListele(Integer doktorId) {
        Doktor d = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new RuntimeException("Doktor bulunamadı"));
        return doktorCalismaSaatiRepository.findByDoktorOrderByTarihAscBaslangicSaatAsc(d);
    }

    /** Resepsiyon ekranı: uygun slotlar */
    public List<DoktorCalismaSaati> musaitSlotlariListele() {
        return doktorCalismaSaatiRepository.findBySlotDurumu("MUSAIT");
    }
}
