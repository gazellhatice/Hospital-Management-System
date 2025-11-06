package com.hospital.repository;

import com.hospital.model.Recete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceteRepository extends JpaRepository<Recete, Integer> {

    List<Recete> findByHasta_HastaIdOrderByOlusturulmaZamaniDesc(Integer hastaId);

    List<Recete> findByDoktor_DoktorIdOrderByOlusturulmaZamaniDesc(Integer doktorId);

}
