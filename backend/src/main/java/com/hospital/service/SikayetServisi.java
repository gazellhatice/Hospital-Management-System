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

    // Adapter: param -> entity dönüştürücü
    private final ComplaintAdapter adapter = new DefaultComplaintAdapter();

    public SikayetServisi(SikayetRepository sikayetRepository,
                          HastaRepository hastaRepository) {
        this.sikayetRepository = sikayetRepository;
        this.hastaRepository = hastaRepository;
    }

    // ---------------------------------------------------------------------
    // Template Method: Oluşturma akışını tek yerde kilitle, hooklarla genişlet
    // Algortimanın iskeletini burada, alt sınıflar/inner class'lar detayları sağlar
    // ---------------------------------------------------------------------
    @Transactional
    public final Sikayet hastaSikayetOlustur(Integer hastaId,
                                             String baslik,
                                             String icerik) {
        preValidate(hastaId, baslik, icerik);                 // [HOOK] Ön kontrol

        Hasta hasta = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));

        // Adapter kullanarak entity oluştur
        Sikayet s = adapter.toEntity(hasta, baslik, icerik);

        prePersistHook(s);                                     // [HOOK] Kaydetmeden önce
        Sikayet saved = sikayetRepository.save(s);
        postCreate(saved);                                     // [HOOK] Kaydettikten sonra (log/notify/event)

        return saved;                                          // İMZA DEĞİŞMEDİ
    }

    public List<Sikayet> hastaninSikayetleriniListele(Integer hastaId) {
        Hasta hasta = hastaRepository.findById(hastaId)
                .orElseThrow(() -> new RuntimeException("Hasta bulunamadı"));

        return sikayetRepository.findByHastaOrderByOlusturulmaZamaniDesc(hasta);
    }

    public List<Sikayet> mudurSikayetListeleDurumaGore(String durum) {
        if (durum == null || durum.isBlank()) {
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

    // ===================== DESEN UYGULAMASI (dosya içi) =====================

    // --- Template Method hook'ları ---
    protected void preValidate(Integer hastaId, String baslik, String icerik) {
        if (hastaId == null) throw new IllegalArgumentException("HastaId zorunlu");
        if (baslik == null || baslik.isBlank()) throw new IllegalArgumentException("Başlık zorunlu");
        if (icerik == null || icerik.isBlank()) throw new IllegalArgumentException("İçerik zorunlu");
    }
    protected void prePersistHook(Sikayet s) {
    }
    protected void postCreate(Sikayet saved) {
    }

    // --- Adapter (param -> entity) ---
    private interface ComplaintAdapter {
        Sikayet toEntity(Hasta hasta, String baslik, String icerik);
    }
    private static class DefaultComplaintAdapter implements ComplaintAdapter {
        @Override public Sikayet toEntity(Hasta hasta, String baslik, String icerik) {
            Sikayet s = new Sikayet();
            s.setHasta(hasta);
            s.setBaslik(baslik);
            s.setIcerik(icerik);
            s.setOlusturulmaZamani(Timestamp.from(Instant.now()));
            s.setDurum("ACILDI");
            s.setMudurNotu(null);
            return s;
        }
    }
}
