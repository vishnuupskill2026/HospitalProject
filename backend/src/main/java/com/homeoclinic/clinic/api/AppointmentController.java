package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.domain.Appointment;
import com.homeoclinic.clinic.domain.AppointmentMode;
import com.homeoclinic.clinic.service.AppointmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {
        private final AppointmentService appointments;
        public AppointmentController(AppointmentService appointments) { this.appointments = appointments; }
        public record AppointmentRequest(@NotNull UUID patientId, @NotNull OffsetDateTime startsAt,
            @NotNull OffsetDateTime endsAt, @NotNull AppointmentMode mode, String videoLink, String reason) {}
    public record AppointmentView(UUID id, UUID patientId, String patientName, OffsetDateTime startsAt,
            OffsetDateTime endsAt, String mode, String status, String videoLink, String reason) {
        static AppointmentView from(Appointment appointment) {
            return new AppointmentView(appointment.getId(), appointment.getPatient().getId(),
                    appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName(),
                    appointment.getStartsAt(), appointment.getEndsAt(), appointment.getMode().name(),
                    appointment.getStatus().name(), appointment.getVideoLink(), appointment.getReason());
        }
    }
    @GetMapping @PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
    List<AppointmentView> list(@RequestParam OffsetDateTime from, @RequestParam OffsetDateTime to) {
        return appointments.list(from, to).stream().map(AppointmentView::from).toList();
    }
    @PostMapping @PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
    AppointmentView book(@Valid @RequestBody AppointmentRequest request) {
        return AppointmentView.from(appointments.book(request.patientId(), request.startsAt(), request.endsAt(),
                request.mode(), request.videoLink(), request.reason()));
    }
}