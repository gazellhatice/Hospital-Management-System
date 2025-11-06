package com.hospital.repository;

import com.hospital.model.ZiyaretciKayit;
import com.hospital.model.Resepsiyonist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface ZiyaretciKayitRepository extends JpaRepository<ZiyaretciKayit, Integer> {

    // Resepsiyonistin kendi girdikleri
    List<ZiyaretciKayit> findByResepsiyonistOrderByZiyaretTarihiSaatDesc(Resepsiyonist resepsiyonist);

    // Müdür paneli: tarih aralığında kimler gelmiş
    List<ZiyaretciKayit> findByZiyaretTarihiSaatBetweenOrderByZiyaretTarihiSaatDesc(
            Timestamp baslangic,
            Timestamp bitis
    );
}
