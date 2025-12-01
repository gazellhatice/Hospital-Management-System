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

    // Adapter: param -> entity dönüştürücü
    private final VisitorAdapter adapter = new DefaultVisitorAdapter();

    public ZiyaretciKayitServisi(ZiyaretciKayitRepository ziyaretciKayitRepository,
                                 ResepsiyonistRepository resepsiyonistRepository) {
        this.ziyaretciKayitRepository = ziyaretciKayitRepository;
        this.resepsiyonistRepository = resepsiyonistRepository;
    }

    // ---------------------------------------------------------------------
    // Template Method: oluşturma akışı (resepsiyonistin yeni girişi)
    // Algortimanın iskeletini burada, alt sınıflar/inner class'lar detayları sağlar
    // ---------------------------------------------------------------------
    @Transactional
    public final ZiyaretciKayit ziyaretciKaydiOlustur(Integer resepsiyonistId,
                                                      String adSoyad,
                                                      String ziyaretSebebi,
                                                      String notlar) {
        preValidate(resepsiyonistId, adSoyad, ziyaretSebebi);

        Resepsiyonist resepsiyonist = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));

        // Adapter ile entity kur
        ZiyaretciKayit kayit = adapter.toEntity(resepsiyonist, adSoyad, ziyaretSebebi, notlar);

        prePersistHook(kayit);
        ZiyaretciKayit saved = ziyaretciKayitRepository.save(kayit);
        postCreate(saved);
        return saved;
    }

    // Mevcut metod korunuyor; aynı template’i kullanır
    @Transactional
    public final ZiyaretciKayit ziyaretciEkle(Integer resepsiyonistId,
                                              String adSoyad,
                                              String ziyaretSebebi,
                                              String notlar) {
        return ziyaretciKaydiOlustur(resepsiyonistId, adSoyad, ziyaretSebebi, notlar);
    }

    // Resepsiyon kendi girdiklerini görmek ister
    public List<ZiyaretciKayit> resepsiyonistinKayitlariniListele(Integer resepsiyonistId) {
        Resepsiyonist r = resepsiyonistRepository.findById(resepsiyonistId)
                .orElseThrow(() -> new RuntimeException("Resepsiyonist bulunamadı"));
        return ziyaretciKayitRepository.findByResepsiyonistOrderByZiyaretTarihiSaatDesc(r);
    }

    // Müdür: tüm ziyaretçileri tarih aralığına göre görmek ister (Builder kullanımı)
    public List<ZiyaretciKayit> mudurZiyaretciListesi(Timestamp baslangic, Timestamp bitis) {
        // Builder ile güvenli aralık kur (null gelirse varsayılanlar)
        DateRange range = DateRange.builder()
                .start(baslangic != null ? baslangic : Timestamp.from(Instant.EPOCH))
                .end(bitis != null ? bitis : Timestamp.from(Instant.now()))
                .build();

        return ziyaretciKayitRepository
                .findByZiyaretTarihiSaatBetweenOrderByZiyaretTarihiSaatDesc(range.start(), range.end());
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

    // ===================== DESEN UYGULAMASI (dosya içi) =====================

    // --- Template Method hook'ları ---
    protected void preValidate(Integer resepsiyonistId, String adSoyad, String ziyaretSebebi) {
        if (resepsiyonistId == null) throw new IllegalArgumentException("ResepsiyonistId zorunlu");
        if (adSoyad == null || adSoyad.isBlank()) throw new IllegalArgumentException("Ad Soyad zorunlu");
        if (ziyaretSebebi == null || ziyaretSebebi.isBlank()) throw new IllegalArgumentException("Ziyaret sebebi zorunlu");
    }
    protected void prePersistHook(ZiyaretciKayit k) { /* audit/log vs. */ }
    protected void postCreate(ZiyaretciKayit saved) { /* bildirim/log vs. */ }

    // --- Adapter (param -> entity) ---
    private interface VisitorAdapter {
        ZiyaretciKayit toEntity(Resepsiyonist r, String adSoyad, String sebep, String notlar);
    }
    private static class DefaultVisitorAdapter implements VisitorAdapter {
        @Override public ZiyaretciKayit toEntity(Resepsiyonist r, String adSoyad, String sebep, String notlar) {
            ZiyaretciKayit z = new ZiyaretciKayit();
            z.setResepsiyonist(r);
            z.setAdSoyad(adSoyad);
            z.setZiyaretSebebi(sebep);
            z.setNotlar(notlar);
            z.setZiyaretTarihiSaat(Timestamp.from(Instant.now()));
            return z;
        }
    }

    // --- Builder (tarih aralığı değer nesnesi) ---
    static final class DateRange {
        private final Timestamp start;
        private final Timestamp end;
        private DateRange(Timestamp start, Timestamp end) {
            this.start = start; this.end = end;
        }
        public Timestamp start() { return start; }
        public Timestamp end() { return end; }

        static Builder builder() { return new Builder(); }
        static final class Builder {
            private Timestamp start;
            private Timestamp end;
            public Builder start(Timestamp s) { this.start = s; return this; }
            public Builder end(Timestamp e) { this.end = e; return this; }
            public DateRange build() {
                if (start == null) start = Timestamp.from(Instant.EPOCH);
                if (end == null) end = Timestamp.from(Instant.now());
                if (end.before(start)) throw new IllegalArgumentException("Bitiş, başlangıçtan önce olamaz");
                return new DateRange(start, end);
            }
        }
    }
}
        