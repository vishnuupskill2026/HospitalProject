package com.homeoclinic.clinic.service;

import com.homeoclinic.clinic.domain.AppointmentMode;
import com.homeoclinic.clinic.repository.AppointmentRepository;
import com.homeoclinic.clinic.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {
    private AppointmentRepository appointments;
    private PatientRepository patients;
    private AppointmentService service;

    @BeforeEach void setUp() {
        appointments = mock(AppointmentRepository.class);
        patients = mock(PatientRepository.class);
        service = new AppointmentService(appointments, patients);
    }

    @Test void rejectsNonPositiveAppointmentDuration() {
        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        assertThatThrownBy(() -> service.book(UUID.randomUUID(), start, start, AppointmentMode.OFFLINE, null, null))
                .isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(appointments, patients);
    }

    @Test void rejectsAnOccupiedSlotBeforeLoadingPatient() {
        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        when(appointments.hasOverlap(start, start.plusMinutes(30))).thenReturn(true);
        assertThatThrownBy(() -> service.book(UUID.randomUUID(), start, start.plusMinutes(30), AppointmentMode.OFFLINE, null, null))
                .isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(patients);
    }

    @Test void requiresVideoLinkForOnlineVisit() {
        OffsetDateTime start = OffsetDateTime.now().plusDays(1);
        when(appointments.hasOverlap(start, start.plusMinutes(30))).thenReturn(false);
        UUID patientId = UUID.randomUUID();
        when(patients.findById(patientId)).thenReturn(java.util.Optional.of(mock(com.homeoclinic.clinic.domain.Patient.class)));
        assertThatThrownBy(() -> service.book(patientId, start, start.plusMinutes(30), AppointmentMode.ONLINE, " ", null))
                .isInstanceOf(ResponseStatusException.class);
        verify(appointments, never()).save(any());
    }
}