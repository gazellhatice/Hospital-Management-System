package com.hospital.repository;

import com.hospital.model.Doktor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoktorRepository extends JpaRepository<Doktor, Integer> {

    Optional<Doktor> findByEmailAndSifre(String email, String sifre);

    // Müdür için: onay bekleyen / onaylanan doktorları çek
    List<Doktor> findByOnayDurumu(String onayDurumu); // "BEKLIYOR", "ONAYLANDI", ...

    // Resepsiyon ekranında branşa göre doktor seçmek için
    List<Doktor> findByUzmanlikAlaniIgnoreCaseAndAktifMiTrueAndOnayDurumu(String uzmanlikAlani,
                                                                          String onayDurumu);

    // Resepsiyon / Hasta ekranında listede gösterebilmek için
    List<Doktor> findByAktifMiTrueAndOnayDurumu(String onayDurumu);

    // Doktoru isme göre bulmak (mesela resepsiyon seçti)
    Optional<Doktor> findByAdSoyadIgnoreCase(String adSoyad);
}
