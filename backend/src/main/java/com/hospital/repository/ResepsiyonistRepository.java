package com.hospital.repository;

import com.hospital.model.Resepsiyonist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResepsiyonistRepository extends JpaRepository<Resepsiyonist, Integer> {

    Optional<Resepsiyonist> findByEmailAndSifre(String email, String sifre);

    Optional<Resepsiyonist> findByTcKimlikNo(String tcKimlikNo);

    List<Resepsiyonist> findByAktifMiTrue();
}
