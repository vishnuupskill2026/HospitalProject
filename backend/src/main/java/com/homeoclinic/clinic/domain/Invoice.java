package com.homeoclinic.clinic.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices", uniqueConstraints = {
    @UniqueConstraint(name = "uk_invoice_number", columnNames = "invoice_number"),
    @UniqueConstraint(name = "uk_invoice_appointment", columnNames = "appointment_id")
})
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "invoice_number", nullable = false, length = 40) private String invoiceNumber;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "patient_id", nullable = false) private Patient patient;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "appointment_id", nullable = false) private Appointment appointment;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal amount;
    @Column(name = "currency_code", nullable = false, length = 3) private String currencyCode;
    @Column(name = "payment_status", nullable = false, length = 16) private String paymentStatus;
    @Column(name = "issued_at", nullable = false) private OffsetDateTime issuedAt;
    protected Invoice() {}
    public Invoice(String invoiceNumber, Patient patient, Appointment appointment, BigDecimal amount, String currencyCode) {
        this.invoiceNumber = invoiceNumber; this.patient = patient; this.appointment = appointment;
        this.amount = amount; this.currencyCode = currencyCode; this.paymentStatus = "UNPAID";
        this.issuedAt = OffsetDateTime.now();
    }
    public UUID getId() { return id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public Patient getPatient() { return patient; }
    public Appointment getAppointment() { return appointment; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrencyCode() { return currencyCode; }
    public String getPaymentStatus() { return paymentStatus; }
    public OffsetDateTime getIssuedAt() { return issuedAt; }
}