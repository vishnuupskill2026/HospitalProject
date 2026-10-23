package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.domain.AppointmentMode;
import com.homeoclinic.clinic.domain.AppointmentStatus;
import com.homeoclinic.clinic.repository.AppointmentRepository;
import com.homeoclinic.clinic.service.BillingService;
import com.homeoclinic.clinic.domain.Consultation;
import com.homeoclinic.clinic.service.ConsultationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
public class DashboardController {
    private final AppointmentRepository appointments;
    private final BillingService billing;
    private final ConsultationService consultations;
    public DashboardController(AppointmentRepository appointments, BillingService billing, ConsultationService consultations) {
        this.appointments = appointments; this.billing = billing; this.consultations = consultations;
    }
    public record ConsultationSummary(java.util.UUID id, java.util.UUID appointmentId, java.util.UUID patientId, String patientName,
            String reason, String mode, OffsetDateTime startedAt, String status) {
        static ConsultationSummary from(Consultation c) {
            var appointment = c.getAppointment();
            var patient = c.getPatient();
            return new ConsultationSummary(c.getId(), appointment == null ? null : appointment.getId(), patient.getId(), patient.getFirstName() + " " + patient.getLastName(),
                appointment == null ? "Walk-in consultation" : appointment.getReason(), appointment == null ? "WALK_IN" : appointment.getMode().name(),
                c.getStartedAt(), c.getStatus().name());
        }
    }
    public record DashboardStats(long patientsToday, long pendingOnlineConsultations, BigDecimal revenueToday,
            long completedConsultationsToday, List<ConsultationSummary> consultationsInProgress) {}
    @GetMapping
    DashboardStats stats() {
        var today = OffsetDateTime.now(ZoneOffset.UTC).toLocalDate();
        OffsetDateTime from = today.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime to = from.plusDays(1);
        long scheduled = appointments.countByStartsAtBetween(from, to);
        long online = appointments.countByStartsAtBetweenAndModeAndStatusIn(from, to, AppointmentMode.ONLINE,
                List.of(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED));
        var activeConsultations = consultations.inProgress().stream().map(ConsultationSummary::from).toList();
        return new DashboardStats(scheduled, online, billing.revenue(from, to),
            consultations.countCompletedBetween(from, to), activeConsultations);
    }
}