
import React from 'react';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import { AppointmentForm } from '@/components/AppointmentForm';
import { AppointmentFormData } from '@/hooks/use-appointments';
import { it } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarDatePickerProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onCreateAppointment: (data: AppointmentFormData) => Promise<void>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isCreatingAppointment: boolean;
}

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  date,
  onDateSelect,
  onCreateAppointment,
  isDialogOpen,
  setIsDialogOpen,
  isCreatingAppointment
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="md:col-span-1">
      <CardHeader className="px-3 py-3 md:px-6 md:py-4">
        <CardTitle className="text-lg md:text-xl">Seleziona Data</CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-3 md:px-6 md:py-4">
        <div className="flex justify-center">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={onDateSelect}
            className="border rounded-md p-0 md:p-2 max-w-full pointer-events-auto"
            locale={it}
            classNames={{
              day: "h-8 w-8 md:h-9 md:w-9 p-0 font-normal aria-selected:opacity-100",
              months: "flex flex-col space-y-3",
              month: "space-y-3",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-xs md:text-sm font-medium",
              nav: "space-x-1 flex items-center",
              head_cell: "text-muted-foreground rounded-md text-[0.7rem] md:text-[0.8rem]",
            }}
          />
        </div>
        
        <div className="mt-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-1 text-sm">
                <Plus size={16} /> Nuovo Appuntamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-3 md:p-6">
              <DialogHeader>
                <DialogTitle>Crea Nuovo Appuntamento</DialogTitle>
              </DialogHeader>
              <AppointmentForm 
                onSubmit={onCreateAppointment} 
                isSubmitting={isCreatingAppointment} 
                selectedDate={date}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
