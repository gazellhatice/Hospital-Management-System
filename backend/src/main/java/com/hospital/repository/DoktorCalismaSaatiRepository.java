package com.hospital.repository;

import com.hospital.model.DoktorCalismaSaati;
import com.hospital.model.Doktor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoktorCalismaSaatiRepository extends JpaRepository<DoktorCalismaSaati, Integer> {

    // Doktor kendi slotlarını görsün/güncellesin
    List<DoktorCalismaSaati> findByDoktorOrderByTarihAscBaslangicSaatAsc(Doktor doktor);

    // Resepsiyon: bugün ve sonrası için MUSAIT slotlar
    List<DoktorCalismaSaati> findBySlotDurumuAndTarihGreaterThanEqual(String slotDurumu, LocalDate tarih);

    // Randevu oluştururken spesifik slotı çekebilmek için (yalnızca MUSAIT olan)
    Optional<DoktorCalismaSaati> findBySlotIdAndSlotDurumu(Integer slotId, String slotDurumu);

    // Genel: durumuna göre slotları getir
    List<DoktorCalismaSaati> findBySlotDurumu(String slotDurumu);

    // Çakışma kontrolü: [start1, end1) & [start2, end2) => start1 < end2 && start2 < end1
    @Query("""
        SELECT COUNT(s) > 0 FROM DoktorCalismaSaati s
        WHERE s.doktor.doktorId = :doktorId
          AND s.tarih = :tarih
          AND s.baslangicSaat < :bitis
          AND :baslangic < s.bitisSaat
    """)
    boolean existsOverlapping(@Param("doktorId") Integer doktorId,
                              @Param("tarih") LocalDate tarih,
                              @Param("baslangic") LocalTime baslangic,
                              @Param("bitis") LocalTime bitis);
}
