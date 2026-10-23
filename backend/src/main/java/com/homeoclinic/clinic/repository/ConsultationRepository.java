package com.homeoclinic.clinic.repository;

import com.homeoclinic.clinic.domain.Consultation;
import com.homeoclinic.clinic.domain.ConsultationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient"})
    java.util.Optional<Consultation> findByAppointmentId(UUID appointmentId);
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient"})
    Optional<Consultation> findFirstByPatientIdAndStatusOrderByStartedAtDesc(UUID patientId, ConsultationStatus status);
    @Override
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient"})
    Optional<Consultation> findById(UUID id);
    boolean existsByAppointmentId(UUID appointmentId);
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient"})
    List<Consultation> findAllByPatientIdOrderByStartedAtDesc(UUID patientId);
    @EntityGraph(attributePaths = {"patient", "appointment", "appointment.patient"})
    List<Consultation> findTop10ByStatusOrderByStartedAtDesc(ConsultationStatus status);
    long countByStatusAndEndedAtBetween(ConsultationStatus status, java.time.OffsetDateTime from, java.time.OffsetDateTime to);
}