package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.Appointment;
import com.homeoclinic.clinic.domain.AppointmentMode;
import com.homeoclinic.clinic.repository.AppointmentRepository;
import com.homeoclinic.clinic.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.net.URI;

@Service
@Transactional
public class AppointmentService {
    private final AppointmentRepository appointments;
    private final PatientRepository patients;
    public AppointmentService(AppointmentRepository appointments, PatientRepository patients) {
        this.appointments = appointments; this.patients = patients;
    }
    @Transactional(readOnly = true)
    public List<Appointment> list(OffsetDateTime from, OffsetDateTime to) {
        if (from == null || to == null || !to.isAfter(from) || to.isAfter(from.plusDays(93)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date range must be positive and at most 93 days");
        return appointments.findAllByStartsAtBetweenOrderByStartsAt(from, to);
    }
    public Appointment book(UUID patientId, OffsetDateTime startsAt, OffsetDateTime endsAt,
                            AppointmentMode mode, String videoLink, String reason) {
        if (startsAt == null || endsAt == null || !endsAt.isAfter(startsAt) || endsAt.isAfter(startsAt.plusHours(4)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment duration must be between 0 and 4 hours");
        if (startsAt.isBefore(OffsetDateTime.now().minusMinutes(5)))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment cannot be scheduled in the past");
        if (appointments.hasOverlap(startsAt, endsAt))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment time is unavailable");
        var patient = patients.findById(patientId).filter(com.homeoclinic.clinic.domain.Patient::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        if (mode == AppointmentMode.ONLINE) {
            try {
                URI link = URI.create(videoLink == null ? "" : videoLink.trim());
                if (!"https".equalsIgnoreCase(link.getScheme()) || link.getHost() == null || link.getUserInfo() != null)
                    throw new IllegalArgumentException();
            } catch (IllegalArgumentException invalidLink) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Online appointments require a valid HTTPS video link");
            }
        }
        try {
            return appointments.saveAndFlush(new Appointment(patient, startsAt, endsAt, mode, videoLink, reason));
        } catch (DataIntegrityViolationException conflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This appointment time is unavailable", conflict);
        }
    }
}