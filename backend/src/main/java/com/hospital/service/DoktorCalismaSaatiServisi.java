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
import java.util.ArrayList; 
import java.util.List;

@Service
public class DoktorCalismaSaatiServisi {

    private static final Logger log = LoggerFactory.getLogger(DoktorCalismaSaatiServisi.class);

    private final DoktorRepository doktorRepository;
    private final DoktorCalismaSaatiRepository doktorCalismaSaatiRepository;

    // =========================
    // PATTERN FIELDS
    // =========================
    /**
     * Strategy Pattern:
     * - slotStrategy: Slot üretim politikasını temsil eder.
     * - Şu an varsayılan olarak mevcut davranış (tek kayıt) uygulanır.
     */
    private final SlotStrategy slotStrategy = new StandardSlotStrategy();

    /**
     * 
     * Chain of Responsibility:
     * - slotRules: Slot açmadan önce çalışacak doğrulama zinciri.
     * - Sıra: Doktor aktif/onaylı mı? -> Saat aralığı mantıklı mı? -> Çakışma var
     * mı?
     */
    private final List<SlotRule> slotRules = new ArrayList<>();

    public DoktorCalismaSaatiServisi(DoktorRepository doktorRepository,
            DoktorCalismaSaatiRepository doktorCalismaSaatiRepository) {
        this.doktorRepository = doktorRepository;
        this.doktorCalismaSaatiRepository = doktorCalismaSaatiRepository;

        // Zincire kurallar eklendi
        slotRules.add(new DoctorActiveRule());
        slotRules.add(new RangeValidRule());
        slotRules.add(new NoOverlapRule());
    }

    /** Doktor panelinden yeni slot açma */
    @Transactional
    public DoktorCalismaSaati doktorSlotAc(Integer doktorId,
            LocalDate tarih,
            LocalTime baslangic,
            LocalTime bitis,
            String aciklama) {

        log.info("SlotCreate try: dr={}, tarih={}, {}-{}", doktorId, tarih, baslangic, bitis);

        // =========================
        // [CHANGED] Basit null/ordering kontrolleri zincire taşındı; CreateSlotCmd ile
        // tetikliyoruz.
        // =========================
        CreateSlotCmd cmd = new CreateSlotCmd(doktorId, tarih, baslangic, bitis);
        // 1) HANGİ KURAL PATLIYOR? LOG EKLE
        for (SlotRule rule : slotRules) {
            try {
                rule.check(cmd);
            } catch (Exception ex) {
                log.warn("Slot rule FAILED: {} -> {}", rule.getClass().getSimpleName(), ex.getMessage());
                throw ex; // Controller 400 + body=ex.getMessage()
            }
        }

        // Doktoru çek (Strategy için gerekli)
        Doktor doktor = doktorRepository.findById(doktorId)
                .orElseThrow(() -> new IllegalArgumentException("Doktor bulunamadı."));

        // =========================
        // [ADDED] Strategy ile slot(lar)ı üret
        // =========================
        List<DoktorCalismaSaati> uret = slotStrategy.createSlots(doktor, tarih, baslangic, bitis, aciklama);

        // [NOT] Mevcut API tek kayıt döndürüyor → ilk kaydı döndür.
        DoktorCalismaSaati saved = null;
        for (DoktorCalismaSaati s : uret) {
            s.setOlusturulmaZamani(LocalDateTime.now());
            saved = doktorCalismaSaatiRepository.save(s);
        }
        log.info("Slot created: id={}", saved != null ? saved.getSlotId() : null);
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
        // Alternatif (bugünden itibaren):
        // doktorCalismaSaatiRepository.findBySlotDurumuAndTarihGreaterThanEqual("MUSAIT",
        // LocalDate.now());
    }

    // =====================================================================
    // ==================== AŞAĞISI DESEN UYGULAMASI =====================
    // =====================================================================

    // ---------- Chain of Responsibility parçaları ----------

    /** Zincire taşınan veri transferi (komut) */
    private record CreateSlotCmd(Integer doktorId, LocalDate tarih, LocalTime baslangic, LocalTime bitis) {
    }

    /** Zincir halkası arayüzü */
    private interface SlotRule {
        void check(CreateSlotCmd cmd);
    }

    /** Doktor aktif ve onaylı mı? */
    private class DoctorActiveRule implements SlotRule {
        @Override
        public void check(CreateSlotCmd cmd) {
            if (cmd.doktorId() == null || cmd.tarih() == null || cmd.baslangic() == null || cmd.bitis() == null) {
                throw new IllegalArgumentException("Tarih ve saat alanları zorunludur.");
            }
            Doktor d = doktorRepository.findById(cmd.doktorId())
                    .orElseThrow(() -> new IllegalArgumentException("Doktor bulunamadı."));

            boolean aktif = Boolean.TRUE.equals(d.getAktifMi());
            String onay = d.getOnayDurumu() == null ? "" : d.getOnayDurumu().trim().toUpperCase();

            // DB uyumluluğu: hem ONAYLI hem ONAYLANDI (hatta APPROVED) kabul
            boolean approved = onay.equals("ONAYLI") || onay.equals("ONAYLANDI") || onay.equals("APPROVED");

            if (!aktif || !approved) {
                // Teşhis için mevcut değerleri da log’la
                log.warn("DoctorActiveRule reject -> aktif={}, onay='{}' (doktorId={})", aktif, onay, d.getDoktorId());
                throw new IllegalArgumentException("Doktor pasif veya onaysız: slot açılamaz.");
            }
        }
    }

    /** Saat aralığı mantıklı mı? geçmiş zamana mı? */
    private static class RangeValidRule implements SlotRule {
        @Override
        public void check(CreateSlotCmd cmd) {
            if (!cmd.baslangic().isBefore(cmd.bitis())) {
                throw new IllegalArgumentException("Başlangıç saati, bitiş saatinden küçük olmalıdır.");
            }

            // BUGÜN/GEÇMİŞ ESNETME: sadece geçmiş güne izin verme; bugünse 'şimdiden
            // sonrası' koşulu
            LocalDate today = LocalDate.now();
            if (cmd.tarih().isBefore(today)) {
                throw new IllegalArgumentException("Geçmiş güne slot açılamaz.");
            }
            if (cmd.tarih().isEqual(today) && !cmd.baslangic().isAfter(LocalTime.now())) {
                throw new IllegalArgumentException("Bugün için başlangıç şu andan sonra olmalıdır.");
            }
        }
    }

    /** Aynı doktorda aynı zaman aralığında çakışma var mı? */
    private class NoOverlapRule implements SlotRule {
        @Override
        public void check(CreateSlotCmd cmd) {
            boolean cakisma = doktorCalismaSaatiRepository.existsOverlapping(
                    cmd.doktorId(), cmd.tarih(), cmd.baslangic(), cmd.bitis());
            if (cakisma) {
                throw new IllegalArgumentException("Seçilen aralık mevcut slotlarla çakışıyor.");
            }
        }
    }

    // ---------- Strategy parçaları ----------

    /** Slot üretim politikasının arayüzü */
    private interface SlotStrategy {
        List<DoktorCalismaSaati> createSlots(Doktor doktor, LocalDate day, LocalTime start, LocalTime end,
                String aciklama);
    }

    /** Varsayılan strateji: tek kayıt (mevcut mantığın birebir karşılığı) */
    private static class StandardSlotStrategy implements SlotStrategy {
        @Override
        public List<DoktorCalismaSaati> createSlots(Doktor doktor, LocalDate day, LocalTime start, LocalTime end,
                String aciklama) {
            List<DoktorCalismaSaati> out = new ArrayList<>();
            DoktorCalismaSaati s = new DoktorCalismaSaati();
            s.setDoktor(doktor);
            s.setTarih(day);
            s.setBaslangicSaat(start);
            s.setBitisSaat(end);
            s.setAciklama(aciklama);
            s.setSlotDurumu("MUSAIT");
            out.add(s);
            return out;
        }
    }

    /**
     * Alternatif örnek (kullanımda değil): 15 dakikalık parçalara bölmek istersen
     * hazır.
     */
    @SuppressWarnings("unused")
    private static class Strict15SlotStrategy implements SlotStrategy {
        @Override
        public List<DoktorCalismaSaati> createSlots(Doktor doktor, LocalDate day, LocalTime start, LocalTime end,
                String aciklama) {
            List<DoktorCalismaSaati> out = new ArrayList<>();
            LocalTime t = start;
            while (!t.plusMinutes(15).isAfter(end)) {
                DoktorCalismaSaati s = new DoktorCalismaSaati();
                s.setDoktor(doktor);
                s.setTarih(day);
                s.setBaslangicSaat(t);
                s.setBitisSaat(t.plusMinutes(15));
                s.setAciklama(aciklama);
                s.setSlotDurumu("MUSAIT");
                out.add(s);
                t = t.plusMinutes(15);
            }
            return out;
        }
    }
}
