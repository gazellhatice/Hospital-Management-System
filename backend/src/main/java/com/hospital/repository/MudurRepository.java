package com.hospital.repository;

import com.hospital.model.Mudur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MudurRepository extends JpaRepository<Mudur, Integer> {

    Optional<Mudur> findByEmailAndSifre(String email, String sifre);

    Optional<Mudur> findByTcKimlikNo(String tcKimlikNo);

    Optional<Mudur> findByEmail(String email);
}
