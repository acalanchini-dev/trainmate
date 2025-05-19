
import React from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { AppointmentForm } from './AppointmentForm';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClientAppointmentsProps {
  clientId: string;
  clientName: string;
}

const ClientAppointments = ({ clientId, clientName }: ClientAppointmentsProps) => {
  const { getClientAppointments, createAppointment } = useAppointments();
  const { data: appointments = [], isLoading } = getClientAppointments(clientId);
  
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = React.useState(false);
  
  const handleCreateAppointment = async (data: any) => {
    try {
      await createAppointment.mutateAsync({
        ...data,
        client_id: clientId,
      });
      setIsNewAppointmentDialogOpen(false);
    } catch (error) {
      console.error("Errore nella creazione dell'appuntamento:", error);
    }
  };
  
  // Dividi gli appuntamenti tra passati e futuri
  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (appointment) => isAfter(parseISO(appointment.start_time), now) && appointment.status !== 'cancelled'
  ).slice(0, 5); // Limita a 5 appuntamenti

  const pastAppointments = appointments.filter(
    (appointment) => isBefore(parseISO(appointment.start_time), now) || appointment.status === 'cancelled'
  ).slice(0, 5); // Limita a 5 appuntamenti

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'cancelled':
        return 'Cancellato';
      default:
        return 'Programmato';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Appuntamenti</h3>
        <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus size={16} /> Nuovo Appuntamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo Appuntamento per {clientName}</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              defaultValues={{ client_id: clientId }}
              onSubmit={handleCreateAppointment}
              isSubmitting={createAppointment.isPending}
              onCancel={() => setIsNewAppointmentDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center">
            <CalendarIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nessun appuntamento per questo cliente</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setIsNewAppointmentDialogOpen(true)}
            >
              <Plus size={16} className="mr-1" /> Aggiungi appuntamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {upcomingAppointments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Prossimi appuntamenti</h4>
              <div className="space-y-2">
                {upcomingAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="p-3 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{appointment.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <CalendarIcon size={14} />
                        {formatDate(appointment.start_time)}
                        <Clock size={14} className="ml-2" />
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </div>
                    </div>
                    <div className={cn("px-2 py-1 rounded text-xs font-medium", getStatusBadgeClasses(appointment.status))}>
                      {getStatusText(appointment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastAppointments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Appuntamenti passati</h4>
              <div className="space-y-2">
                {pastAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="p-3 border rounded-md flex justify-between items-center bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{appointment.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <CalendarIcon size={14} />
                        {formatDate(appointment.start_time)}
                        <Clock size={14} className="ml-2" />
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </div>
                    </div>
                    <div className={cn("px-2 py-1 rounded text-xs font-medium", getStatusBadgeClasses(appointment.status))}>
                      {getStatusText(appointment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <Button 
              variant="link" 
              size="sm" 
              asChild
            >
              <a href="/calendario">Visualizza tutti gli appuntamenti</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointments;
