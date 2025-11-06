package com.hospital.service;

import com.hospital.model.Doktor;
import com.hospital.model.DoktorCalismaSaati;
import com.hospital.model.Hasta;
import com.hospital.model.Randevu;
import com.hospital.repository.DoktorCalismaSaatiRepository;
import com.hospital.repository.DoktorRepository;
import com.hospital.repository.HastaRepository;
import com.hospital.repository.RandevuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RandevuServisi {

    private final RandevuRepository randevuRepository;
    private final HastaRepository hastaRepository;
    private final DoktorRepository doktorRepository;
    private final DoktorCalismaSaatiRepository doktorCalismaSaatiRepository;

    public RandevuServisi(RandevuRepository randevuRepository,
                          HastaRepository hastaRepository,
                          DoktorRepository doktorRepository,
                          DoktorCalismaSaatiRepository doktorCalismaSaatiRepository) {
        this.randevuRepository = randevuRepository;
        this.hastaRepository = hastaRepository;
        this.doktorRepository = doktorRepository;
        this.doktorCalismaSaatiRepository = doktorCalismaSaatiRepository;
    }

    /** Resepsiyon -> randevu oluştur (müdür onayı yok) */
    @Transactional
    public Randevu randevuOlustur(Integer hastaId, Integer slotId, String notlar) {

        Hasta hasta = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));

        // Slot'u oku
        DoktorCalismaSaati slot = doktorCalismaSaatiRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot bulunamadı"));

        // Sadece MUSAIT slot'a randevu ver
        if (slot.getSlotDurumu() == null || !"MUSAIT".equalsIgnoreCase(slot.getSlotDurumu())) {
            throw new RuntimeException("Slot uygun değil (MUSAIT değil).");
        }

        Doktor doktor = slot.getDoktor();

        // Randevuyu oluştur
        Randevu r = new Randevu();
        r.setHasta(hasta);
        r.setDoktor(doktor);
        r.setSlot(slot);
        r.setRandevuDurumu("AKTIF");
        r.setNotlar(notlar);
        r.setOlusturulmaZamani(Timestamp.from(Instant.now()));
        Randevu kaydedilen = randevuRepository.save(r);

        // Slot'u DOLU yap (aynı transaction içinde)
        slot.setSlotDurumu("DOLU");
        doktorCalismaSaatiRepository.save(slot);

        return kaydedilen;
    }

    /** Hasta paneli -> hastanın randevuları */
    public List<Randevu> hastaninRandevulariniGetir(Integer hastaId) {
        Hasta hasta = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));
        return randevuRepository.findByHastaOrderByOlusturulmaZamaniDesc(hasta);
    }

    /** Doktor paneli -> doktorun tüm randevuları */
    public List<Randevu> doktorRandevulariniGetir(Integer doktorId) {
        Doktor doktor = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new RuntimeException("Doktor bulunamadı"));
        return randevuRepository.findByDoktor(doktor);
    }

    /** Doktorun tüm randevuları (id ile) */
    public List<Randevu> doktorunTumRandevulari(Integer doktorId) {
        return randevuRepository.findByDoktor_DoktorId(doktorId);
    }

    /** Tüm randevular (admin rapor vs.) */
    public List<Randevu> tumRandevular() {
        return randevuRepository.findAll();
    }

    /** Doktor bugünkü randevuları (slot tarihine göre) */
    public List<Randevu> doktorBugunkuRandevulariniGetir(Integer doktorId, LocalDate bugun) {
        Doktor doktor = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new RuntimeException("Doktor bulunamadı"));

        List<Randevu> hepsi = randevuRepository.findByDoktor(doktor);
        return hepsi.stream()
                .filter(r -> r.getSlot() != null && bugun.equals(r.getSlot().getTarih()))
                .collect(Collectors.toList());
    }

    /** Randevu durum güncelle (IPTAL, TAMAMLANDI, GELMEDI, ...) */
    @Transactional
    public Randevu randevuDurumuGuncelle(Integer randevuId, String yeniDurum) {
        Randevu r = randevuRepository.findById(randevuId)
                .orElseThrow(() -> new RuntimeException("Randevu bulunamadı"));

        r.setRandevuDurumu(yeniDurum);
        return randevuRepository.save(r);
    }
    
}
