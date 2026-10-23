package com.homeoclinic.clinic.api;

import com.homeoclinic.clinic.domain.Invoice;
import com.homeoclinic.clinic.service.BillingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
@PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
public class BillingController {
    private final BillingService billing;
    public BillingController(BillingService billing) { this.billing = billing; }
    public record IssueRequest(@NotNull BigDecimal amount, @NotBlank String currencyCode) {}
    public record InvoiceView(UUID id, String invoiceNumber, UUID patientId, UUID appointmentId, BigDecimal amount,
            String currencyCode, String paymentStatus, OffsetDateTime issuedAt) {
        static InvoiceView from(Invoice i) { return new InvoiceView(i.getId(), i.getInvoiceNumber(), i.getPatient().getId(), i.getAppointment().getId(), i.getAmount(), i.getCurrencyCode(), i.getPaymentStatus(), i.getIssuedAt()); }
    }
    @PostMapping("/appointments/{appointmentId}")
    InvoiceView issue(@PathVariable UUID appointmentId, @Valid @RequestBody IssueRequest request) {
        return InvoiceView.from(billing.issue(appointmentId, request.amount(), request.currencyCode()));
    }
}