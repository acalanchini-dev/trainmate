import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/AppointmentForm";
import { useAppointments } from "@/hooks/use-appointments";
import { Plus, Edit, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  title: string;
  status: "scheduled" | "completed" | "cancelled";
  start_time: string;
  end_time: string;
  notes?: string;
  client_id: string;
}

interface ClientAppointmentsListProps {
  appointments: Appointment[];
  isLoading: boolean;
  clientId: string;
  clientName: string;
}

export function ClientAppointmentsList({ 
  appointments, 
  isLoading, 
  clientId,
  clientName 
}: ClientAppointmentsListProps) {
  const { createAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleCreateAppointment = async (data: any) => {
    try {
      await createAppointment.mutateAsync({
        ...data,
        client_id: clientId,
      });
      setIsNewAppointmentDialogOpen(false);
      toast("Appuntamento creato", {
        description: "L'appuntamento è stato creato con successo",
      });
    } catch (error) {
      console.error("Errore nella creazione dell'appuntamento:", error);
      toast("Errore", {
        description: "Impossibile creare l'appuntamento",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAppointment = async (data: any) => {
    if (!editingAppointment) return;
    
    try {
      await updateAppointment.mutateAsync({
        id: editingAppointment.id,
        ...data
      });
      setEditingAppointment(null);
      toast("Appuntamento aggiornato", {
        description: "L'appuntamento è stato aggiornato con successo",
      });
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'appuntamento:", error);
      toast("Errore", {
        description: "Impossibile aggiornare l'appuntamento",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment.mutateAsync(appointmentId);
      toast("Appuntamento eliminato", {
        description: "L'appuntamento è stato eliminato con successo",
      });
    } catch (error) {
      console.error("Errore nell'eliminazione dell'appuntamento:", error);
      toast("Errore", {
        description: "Impossibile eliminare l'appuntamento",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "Programmato";
      case "completed": return "Completato";
      case "cancelled": return "Cancellato";
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Appuntamenti</CardTitle>
        <Button size="sm" onClick={() => setIsNewAppointmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuovo Appuntamento
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <div key={appointment.id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="font-medium">{appointment.title}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    getStatusBadgeClasses(appointment.status)
                  }`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(appointment.start_time).toLocaleDateString('it-IT', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {appointment.notes && (
                  <p className="text-sm mt-2">{appointment.notes}</p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingAppointment(appointment)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Modifica
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4 mr-1" /> Elimina
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro di voler eliminare questo appuntamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Questa azione non può essere annullata. L'appuntamento sarà eliminato definitivamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteAppointment(appointment.id)}>Elimina</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nessun appuntamento programmato
          </div>
        )}
      </CardContent>

      {/* Dialog per creare un nuovo appuntamento */}
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo appuntamento per {clientName}</DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            defaultValues={{ client_id: clientId }}
            onSubmit={handleCreateAppointment}
            isSubmitting={createAppointment.isPending}
            onCancel={() => setIsNewAppointmentDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog per modificare un appuntamento esistente */}
      <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && setEditingAppointment(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica appuntamento</DialogTitle>
          </DialogHeader>
          {editingAppointment && (
            <AppointmentForm 
              defaultValues={{
                ...editingAppointment,
                status: editingAppointment.status as "completed" | "scheduled" | "cancelled"
              }}
              onSubmit={handleUpdateAppointment}
              isSubmitting={updateAppointment.isPending}
              onCancel={() => setEditingAppointment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
