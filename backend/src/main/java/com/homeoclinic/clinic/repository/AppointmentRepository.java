package com.homeoclinic.clinic.repository;

import com.homeoclinic.clinic.domain.Appointment;
import com.homeoclinic.clinic.domain.AppointmentMode;
import com.homeoclinic.clinic.domain.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    @Override
    @EntityGraph(attributePaths = "patient")
    Optional<Appointment> findById(UUID id);
    @EntityGraph(attributePaths = "patient")
    List<Appointment> findAllByStartsAtBetweenOrderByStartsAt(OffsetDateTime from, OffsetDateTime to);
    long countByStartsAtBetween(OffsetDateTime from, OffsetDateTime to);
    long countByStartsAtBetweenAndModeAndStatusIn(OffsetDateTime from, OffsetDateTime to, AppointmentMode mode, List<AppointmentStatus> statuses);
    @Query("select count(a) > 0 from Appointment a where a.status <> com.homeoclinic.clinic.domain.AppointmentStatus.CANCELLED and a.startsAt < :to and a.endsAt > :from")
    boolean hasOverlap(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);
}