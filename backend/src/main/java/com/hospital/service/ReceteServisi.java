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
import org.springframework.context.event.EventListener;                  
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

    // =========================
    // FACTORY: Bildirim kanalı seçici
    // =========================
    private final NotificationFactory notificationFactory = new NotificationFactory();

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

        // =========================
        // OBSERVER tetikleme
        //  - Event göndermek yerine, basitçe aynı bean içindeki @EventListener benzeri 
        // PrescriptionCreatedEvent
        //    mantığı çağırıyoruz (Spring event zinciri kurmadan, imzayı bozmadan).
        // =========================
        onPrescriptionCreated(new PrescriptionCreatedEvent(saved.getReceteId(), hasta.getHastaId(), doktor.getDoktorId()));

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

    // =========================================================================
    // ====================  DESEN UYGULAMASI  =========================
    // =========================================================================

    // ---------- OBSERVER: Basit event + dinleyici ----------

    /** Reçete oluşturulunca yayılan basit olay verisi */
    private record PrescriptionCreatedEvent(Integer receteId, Integer hastaId, Integer doktorId) {}

    /**
     * @EventListener benzeri davranış:
     * Reçete oluşturulunca çağrılıyor; NotificationFactory ile uygun bildirimi gönderiyor.
     * NOT: Şu an "email" kanalı varsayılan; ileride ayardan "sms" vb. seçebilirsin.
     */
    @EventListener // açıklayıcıdır; gerçek Spring event zinciri olmadan da çağrıyoruz.
    public void onPrescriptionCreated(PrescriptionCreatedEvent e) {
        try {
            String kanal = "email"; // TODO: config/tercihe göre seçilebilir
            Notifier notifier = notificationFactory.get(kanal);
            String mesaj = "Yeni reçeteniz oluşturuldu. Reçete No: " + e.receteId();
            // Burada hastanın e-postası/SMS numarası yerine sadece log atıyoruz.
            notifier.send("hasta:" + e.hastaId(), mesaj);
        } catch (Exception ex) {
            log.warn("Reçete bildirimi gönderilemedi (receteId={}): {}", e.receteId(), ex.getMessage());
        }
    }

    // ---------- FACTORY: Bildirim kanalı seçimi ----------

    /** Bildirim gönderici arayüzü */
    private interface Notifier { void send(String to, String msg); }

    /** E-posta bildirimcisi */
    private static class EmailNotifier implements Notifier {
        private static final Logger NLOG = LoggerFactory.getLogger(EmailNotifier.class);
        @Override public void send(String to, String msg) { NLOG.info("[EMAIL] to={} msg={}", to, msg); }
    }

    /** SMS bildirimcisi (şimdilik log) */
    @SuppressWarnings("unused")
    private static class SmsNotifier implements Notifier {
        private static final Logger NLOG = LoggerFactory.getLogger(SmsNotifier.class);
        @Override public void send(String to, String msg) { NLOG.info("[SMS] to={} msg={}", to, msg); }
    }

    /** Basit fabrika: kanal adına göre Notifier döndürür */
    private static class NotificationFactory {
        Notifier get(String channel) {
            if ("sms".equalsIgnoreCase(channel)) return new SmsNotifier();
            return new EmailNotifier(); // varsayılan
        }
    }
}
