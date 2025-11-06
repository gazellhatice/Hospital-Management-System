package com.hospital.repository;

import com.hospital.model.Sikayet;
import com.hospital.model.Hasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SikayetRepository extends JpaRepository<Sikayet, Integer> {

    // Hasta paneli: kendi şikayetlerini listelesin, durumlarını takip etsin
    List<Sikayet> findByHastaOrderByOlusturulmaZamaniDesc(Hasta hasta);

    // Müdür paneli: duruma göre filtrelemek isterse
    List<Sikayet> findByDurum(String durum);

    Optional<Sikayet> findById(Integer sikayetId);
}
