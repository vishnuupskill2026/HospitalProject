package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "consultations")
public class Consultation {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "appointment_id") private Appointment appointment;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "patient_id", nullable = false) private Patient patient;
    @Column(name = "running_notes", columnDefinition = "text") private String runningNotes;
    @Column(name = "hering_cure_notes", columnDefinition = "text") private String heringCureNotes;
    @Column(name = "follow_up_at") private OffsetDateTime followUpAt;
    @Column(name = "started_at", nullable = false) private OffsetDateTime startedAt;
    @Column(name = "ended_at") private OffsetDateTime endedAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private ConsultationStatus status = ConsultationStatus.IN_PROGRESS;
    protected Consultation() {}
    public Consultation(Appointment appointment) { this.appointment = appointment; this.patient = appointment.getPatient(); this.startedAt = OffsetDateTime.now(); }
    public Consultation(Patient patient) { this.patient = patient; this.startedAt = OffsetDateTime.now(); }
    public void updateNotes(String runningNotes, String heringCureNotes, OffsetDateTime followUpAt) {
        if (status == ConsultationStatus.COMPLETED) throw new IllegalStateException("Completed consultations cannot be edited");
        this.runningNotes = runningNotes; this.heringCureNotes = heringCureNotes; this.followUpAt = followUpAt;
    }
    public void complete() {
        if (status == ConsultationStatus.COMPLETED) return;
        status = ConsultationStatus.COMPLETED;
        endedAt = OffsetDateTime.now();
    }
    public UUID getId() { return id; }
    public Appointment getAppointment() { return appointment; }
    public Patient getPatient() { return patient; }
    public String getRunningNotes() { return runningNotes; }
    public String getHeringCureNotes() { return heringCureNotes; }
    public OffsetDateTime getFollowUpAt() { return followUpAt; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public OffsetDateTime getEndedAt() { return endedAt; }
    public ConsultationStatus getStatus() { return status; }
}