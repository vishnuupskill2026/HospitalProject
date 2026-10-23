package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.Invoice;
import com.homeoclinic.clinic.repository.AppointmentRepository;
import com.homeoclinic.clinic.repository.InvoiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class BillingService {
    private final InvoiceRepository invoices;
    private final AppointmentRepository appointments;
    public BillingService(InvoiceRepository invoices, AppointmentRepository appointments) { this.invoices = invoices; this.appointments = appointments; }
    public Invoice issue(UUID appointmentId, BigDecimal amount, String currencyCode) {
        if (amount == null || amount.signum() < 0 || amount.precision() > 10 || amount.scale() > 2)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount must be non-negative with at most two decimals");
        String currency = currencyCode == null ? "" : currencyCode.toUpperCase(Locale.ROOT);
        if (!currency.matches("[A-Z]{3}")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Currency must be a three-letter code");
        if (invoices.existsByAppointmentId(appointmentId)) throw new ResponseStatusException(HttpStatus.CONFLICT, "An invoice already exists for this appointment");
        var appointment = appointments.findById(appointmentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        String number = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return invoices.save(new Invoice(number, appointment.getPatient(), appointment, amount, currency));
    }
    @Transactional(readOnly = true)
    public BigDecimal revenue(OffsetDateTime from, OffsetDateTime to) { return invoices.revenueBetween(from, to); }
}