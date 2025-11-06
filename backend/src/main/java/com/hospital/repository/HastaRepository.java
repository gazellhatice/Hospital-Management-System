package com.hospital.repository;

import com.hospital.model.Hasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HastaRepository extends JpaRepository<Hasta, Integer> {

    Optional<Hasta> findByEmailAndSifre(String email, String sifre);

    Optional<Hasta> findByTcKimlikNo(String tcKimlikNo);

    // Resepsiyonist ekrandan otomatik arama kutusu için
    List<Hasta> findByAdSoyadContainingIgnoreCase(String adSoyad);
}
