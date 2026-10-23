package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.Consultation;
import com.homeoclinic.clinic.domain.ConsultationStatus;
import com.homeoclinic.clinic.domain.Patient;
import com.homeoclinic.clinic.repository.AppointmentRepository;
import com.homeoclinic.clinic.repository.ConsultationRepository;
import com.homeoclinic.clinic.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ConsultationService {
    private final ConsultationRepository consultations;
    private final AppointmentRepository appointments;
    private final PatientRepository patients;
    public ConsultationService(ConsultationRepository consultations, AppointmentRepository appointments, PatientRepository patients) {
        this.consultations = consultations; this.appointments = appointments; this.patients = patients;
    }
    public Consultation start(UUID appointmentId) {
        var existing = consultations.findByAppointmentId(appointmentId);
        if (existing.isPresent()) return existing.get();
        var appointment = appointments.findById(appointmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        appointment.markInProgress();
        return consultations.save(new Consultation(appointment));
    }
    public Consultation startForPatient(UUID patientId) {
        var existing = consultations.findFirstByPatientIdAndStatusOrderByStartedAtDesc(patientId, ConsultationStatus.IN_PROGRESS);
        if (existing.isPresent()) return existing.get();
        Patient patient = patients.findById(patientId).filter(Patient::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        return consultations.save(new Consultation(patient));
    }
    public Consultation updateNotes(UUID id, String notes, String heringNotes, OffsetDateTime followUpAt) {
        var consultation = consultations.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultation not found"));
        try {
            consultation.updateNotes(notes, heringNotes, followUpAt);
        } catch (IllegalStateException completed) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Completed consultations cannot be edited");
        }
        return consultations.save(consultation);
    }
    public Consultation close(UUID id) {
        var consultation = consultations.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultation not found"));
        consultation.complete();
        if (consultation.getAppointment() != null) consultation.getAppointment().markCompleted();
        return consultations.save(consultation);
    }
    @Transactional(readOnly = true)
    public List<Consultation> inProgress() { return consultations.findTop10ByStatusOrderByStartedAtDesc(ConsultationStatus.IN_PROGRESS); }
    @Transactional(readOnly = true)
    public List<Consultation> completedToday(OffsetDateTime from, OffsetDateTime to) {
        return consultations.findTop10ByStatusOrderByStartedAtDesc(ConsultationStatus.COMPLETED).stream()
                .filter(c -> c.getEndedAt() != null && !c.getEndedAt().isBefore(from) && c.getEndedAt().isBefore(to)).toList();
    }
    @Transactional(readOnly = true)
    public long countCompletedBetween(OffsetDateTime from, OffsetDateTime to) {
        return consultations.countByStatusAndEndedAtBetween(ConsultationStatus.COMPLETED, from, to);
    }
    @Transactional(readOnly = true)
    public List<Consultation> history(UUID patientId) {
        return consultations.findAllByPatientIdOrderByStartedAtDesc(patientId);
    }
}