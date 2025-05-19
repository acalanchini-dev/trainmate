
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from '@/components/AppointmentForm';
import { Appointment, AppointmentFormData } from '@/hooks/use-appointments';

interface AppointmentDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  onUpdate: (data: AppointmentFormData & { id?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const AppointmentDetailsDialog: React.FC<AppointmentDetailsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedAppointment,
  isLoading,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettagli Appuntamento</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : selectedAppointment ? (
          <>
            <AppointmentForm 
              defaultValues={selectedAppointment}
              onSubmit={onUpdate}
              isSubmitting={isUpdating}
              onCancel={() => onOpenChange(false)}
            />
            <div className="mt-4 border-t pt-4">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminazione in corso...' : 'Elimina Appuntamento'}
              </Button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Appuntamento non trovato
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
