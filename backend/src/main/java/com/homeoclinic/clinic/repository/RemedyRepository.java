package com.homeoclinic.clinic.repository;

import com.homeoclinic.clinic.domain.Remedy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RemedyRepository extends JpaRepository<Remedy, UUID> {
    List<Remedy> findAllByActiveTrueOrderByNameAsc();
}