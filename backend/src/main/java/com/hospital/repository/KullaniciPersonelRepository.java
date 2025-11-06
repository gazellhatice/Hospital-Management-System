package com.hospital.repository;

import com.hospital.model.KullaniciPersonel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KullaniciPersonelRepository extends JpaRepository<KullaniciPersonel, Integer> {

    // Personel giriş ekranı için
    KullaniciPersonel findByKullaniciAdiAndSifreAndAktifTrue(String kullaniciAdi, String sifre);

    // Doktor eklerken aynı kullanıcı adını ikinci kez açmamak için kontrol edebiliriz
    boolean existsByKullaniciAdi(String kullaniciAdi);
}
