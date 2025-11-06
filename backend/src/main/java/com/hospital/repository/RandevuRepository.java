package com.hospital.repository;

import com.hospital.model.Randevu;
import com.hospital.model.Doktor;
import com.hospital.model.Hasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RandevuRepository extends JpaRepository<Randevu, Integer> {

    // Hastanın kendi paneli için
    List<Randevu> findByHastaOrderByOlusturulmaZamaniDesc(Hasta hasta);

    // Doktor paneli: bugünkü randevular
    // Not: Slot tablosundaki tarih üzerinden filtrelemek service katmanında JOIN ile yapılacak.
    List<Randevu> findByDoktor(Doktor doktor);

    // Doktor geçmişini görmek isterse (servis tarafta tarih kıstası ile birleştiririz)
    List<Randevu> findByDoktorAndRandevuDurumu(Doktor doktor, String randevuDurumu);

    List<Randevu> findByDoktor_DoktorId(Integer doktorId);

}
