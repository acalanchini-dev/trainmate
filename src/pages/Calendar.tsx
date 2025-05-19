
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { useAppointments, AppointmentFormData } from '@/hooks/use-appointments';
import { CalendarDatePicker } from '@/components/calendar/CalendarDatePicker';
import { DailyAgenda } from '@/components/calendar/DailyAgenda';
import { AppointmentDetailsDialog } from '@/components/calendar/AppointmentDetailsDialog';
import { useIsMobile } from '@/hooks/use-mobile';

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { getAppointments, createAppointment, updateAppointment, deleteAppointment, getAppointment } = useAppointments();
  
  // Ottieni gli appuntamenti per la data selezionata
  const { data: appointments = [], isLoading: isLoadingAppointments } = getAppointments(date);
  
  // Ottieni i dettagli di un appuntamento specifico quando selezionato
  const { data: selectedAppointment, isLoading: isLoadingSelectedAppointment } = getAppointment(selectedAppointmentId || '');
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handlePreviousDay = () => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() - 1);
      setDate(newDate);
    }
  };

  const handleNextDay = () => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      setDate(newDate);
    }
  };

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    try {
      await createAppointment.mutateAsync(data);
      setIsNewEventDialogOpen(false);
    } catch (error) {
      console.error("Errore nella creazione dell'appuntamento:", error);
    }
  };

  const handleUpdateAppointment = async (data: AppointmentFormData & { id?: string }) => {
    if (!data.id) return;

    try {
      await updateAppointment.mutateAsync(data as AppointmentFormData & { id: string });
      setIsDetailDialogOpen(false);
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'appuntamento:", error);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointmentId) return;

    try {
      await deleteAppointment.mutateAsync(selectedAppointmentId);
      setIsDetailDialogOpen(false);
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error("Errore nell'eliminazione dell'appuntamento:", error);
    }
  };

  const handleDetailClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight flex items-center gap-2">
          <CalendarIcon size={isMobile ? 24 : 28} /> Calendario
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">Gestisci gli appuntamenti con i tuoi clienti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <CalendarDatePicker 
          date={date}
          onDateSelect={handleDateSelect}
          onCreateAppointment={handleCreateAppointment}
          isDialogOpen={isNewEventDialogOpen}
          setIsDialogOpen={setIsNewEventDialogOpen}
          isCreatingAppointment={createAppointment.isPending}
        />

        <DailyAgenda 
          date={date}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          onDetailClick={handleDetailClick}
          appointments={appointments}
          isLoading={isLoadingAppointments}
          onAddClick={() => setIsNewEventDialogOpen(true)}
        />
      </div>

      <AppointmentDetailsDialog
        isOpen={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) setSelectedAppointmentId(null);
        }}
        selectedAppointment={selectedAppointment || null}
        isLoading={isLoadingSelectedAppointment}
        onUpdate={handleUpdateAppointment}
        onDelete={handleDeleteAppointment}
        isUpdating={updateAppointment.isPending}
        isDeleting={deleteAppointment.isPending}
      />
    </div>
  );
};

export default Calendar;
