package com.homeoclinic.clinic.repository;

import com.homeoclinic.clinic.domain.Prescription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    @EntityGraph(attributePaths = {"consultation", "consultation.patient", "items", "items.remedy"})
    List<Prescription> findAllByConsultationPatientIdOrderByPrescribedAtDesc(UUID patientId);
}