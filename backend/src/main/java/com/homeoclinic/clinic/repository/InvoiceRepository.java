package com.homeoclinic.clinic.repository;

import com.homeoclinic.clinic.domain.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    boolean existsByAppointmentId(UUID appointmentId);
    @Query("select coalesce(sum(i.amount), 0) from Invoice i where i.issuedAt >= :from and i.issuedAt < :to")
    BigDecimal revenueBetween(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);
}