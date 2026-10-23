package com.homeoclinic.clinic.repository;

import com.homeoclinic.clinic.domain.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    java.util.Optional<Patient> findByEmailIgnoreCaseAndActiveTrue(String email);
    @Query("select p from Patient p where p.active = true and (lower(p.firstName) like lower(concat('%', :q, '%')) or lower(p.lastName) like lower(concat('%', :q, '%')) or p.phone like concat('%', :q, '%')) order by p.lastName, p.firstName")
    List<Patient> searchActive(@Param("q") String query);
}