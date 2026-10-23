package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments", indexes = @Index(name = "idx_appointment_start", columnList = "starts_at"))
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "patient_id", nullable = false) private Patient patient;
    @Column(name = "starts_at", nullable = false) private OffsetDateTime startsAt;
    @Column(name = "ends_at", nullable = false) private OffsetDateTime endsAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 12) private AppointmentMode mode;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private AppointmentStatus status = AppointmentStatus.BOOKED;
    @Column(name = "video_link", length = 1000) private String videoLink;
    @Column(columnDefinition = "text") private String reason;
    protected Appointment() {}
    public Appointment(Patient patient, OffsetDateTime startsAt, OffsetDateTime endsAt, AppointmentMode mode, String videoLink, String reason) {
        this.patient = patient; this.startsAt = startsAt; this.endsAt = endsAt; this.mode = mode;
        this.videoLink = videoLink; this.reason = reason; this.status = AppointmentStatus.BOOKED;
    }
    public UUID getId() { return id; }
    public Patient getPatient() { return patient; }
    public OffsetDateTime getStartsAt() { return startsAt; }
    public OffsetDateTime getEndsAt() { return endsAt; }
    public AppointmentMode getMode() { return mode; }
    public AppointmentStatus getStatus() { return status; }
    public String getVideoLink() { return videoLink; }
    public String getReason() { return reason; }
    public void markInProgress() {
        if (status == AppointmentStatus.BOOKED || status == AppointmentStatus.CONFIRMED) status = AppointmentStatus.IN_PROGRESS;
    }
    public void markCompleted() { status = AppointmentStatus.COMPLETED; }
}