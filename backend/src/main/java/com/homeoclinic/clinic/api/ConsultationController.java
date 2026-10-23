package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.domain.Consultation;
import com.homeoclinic.clinic.service.ConsultationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasRole('DOCTOR')")
public class ConsultationController {
    private final ConsultationService consultations;
    public ConsultationController(ConsultationService consultations) { this.consultations = consultations; }
    public record NotesRequest(String runningNotes, String heringCureNotes, OffsetDateTime followUpAt) {}
    public record DirectStartRequest(UUID patientId) {}
    public record ConsultationView(UUID id, UUID appointmentId, UUID patientId, String patientName, String mode,
            String runningNotes, String heringCureNotes, OffsetDateTime followUpAt, OffsetDateTime startedAt,
            OffsetDateTime endedAt, String status) {
        static ConsultationView from(Consultation c) {
            var appointment = c.getAppointment();
            return new ConsultationView(c.getId(), appointment == null ? null : appointment.getId(), c.getPatient().getId(),
                    c.getPatient().getFirstName() + " " + c.getPatient().getLastName(), appointment == null ? "WALK_IN" : appointment.getMode().name(),
                    c.getRunningNotes(), c.getHeringCureNotes(), c.getFollowUpAt(), c.getStartedAt(), c.getEndedAt(), c.getStatus().name());
        }
    }
    @PostMapping("/appointments/{appointmentId}/consultations")
    ConsultationView start(@PathVariable UUID appointmentId) { return ConsultationView.from(consultations.start(appointmentId)); }
    @PostMapping("/consultations")
    ConsultationView startDirect(@Valid @RequestBody DirectStartRequest request) {
        if (request.patientId() == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Patient is required");
        return ConsultationView.from(consultations.startForPatient(request.patientId()));
    }
    @PutMapping("/consultations/{id}/notes")
    ConsultationView update(@PathVariable UUID id, @Valid @RequestBody NotesRequest request) {
        return ConsultationView.from(consultations.updateNotes(id, request.runningNotes(), request.heringCureNotes(), request.followUpAt()));
    }
    @PostMapping("/consultations/{id}/close")
    ConsultationView close(@PathVariable UUID id) { return ConsultationView.from(consultations.close(id)); }
    @GetMapping("/patients/{patientId}/consultations")
    List<ConsultationView> history(@PathVariable UUID patientId) {
        return consultations.history(patientId).stream().map(ConsultationView::from).toList();
    }
}