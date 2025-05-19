
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Plus, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Appointment } from '@/hooks/use-appointments';
import { useIsMobile } from '@/hooks/use-mobile';

// Definizione dei tipi di allenamento
const trainingTypes: Record<string, { name: string, color: string }> = {
  "Allenamento Forza": { name: "Allenamento Forza", color: "bg-blue-100 text-blue-800" },
  "Fitness Funzionale": { name: "Fitness Funzionale", color: "bg-green-100 text-green-800" },
  "Cardio": { name: "Cardio", color: "bg-red-100 text-red-800" },
  "Flessibilità": { name: "Flessibilità", color: "bg-purple-100 text-purple-800" },
  "default": { name: "Altro", color: "bg-gray-100 text-gray-800" }
};

interface DailyAgendaProps {
  date: Date | undefined;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onDetailClick: (appointmentId: string) => void;
  appointments: Appointment[];
  isLoading: boolean;
  onAddClick: () => void;
}

export const DailyAgenda: React.FC<DailyAgendaProps> = ({
  date,
  onPreviousDay,
  onNextDay,
  onDetailClick,
  appointments,
  isLoading,
  onAddClick
}) => {
  const isMobile = useIsMobile();

  const formatDate = (dateObj?: Date) => {
    if (!dateObj) return '';
    return format(dateObj, isMobile ? "d MMM yyyy" : "EEEE d MMMM yyyy", { locale: it });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getEventTypeColor = (title: string) => {
    for (const key in trainingTypes) {
      if (title.includes(key)) {
        return trainingTypes[key].color;
      }
    }
    return trainingTypes.default.color;
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between px-3 py-3 md:px-6 md:py-4">
        <CardTitle className="text-lg md:text-xl">
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="outline" size="icon" onClick={onPreviousDay} className="h-7 w-7 md:h-8 md:w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="capitalize font-medium text-sm md:text-base truncate">
              {formatDate(date)}
            </span>
            <Button variant="outline" size="icon" onClick={onNextDay} className="h-7 w-7 md:h-8 md:w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 py-3 md:px-6 md:py-4">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">Caricamento appuntamenti...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground flex flex-col items-center">
            <CalendarIcon className="h-8 w-8 md:h-10 md:w-10 mb-2 opacity-30" />
            <p className="text-sm md:text-base">Nessun appuntamento per questa data</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 text-xs md:text-sm"
              onClick={onAddClick}
            >
              <Plus size={14} className="mr-1" /> Aggiungi appuntamento
            </Button>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="border rounded-md p-2 md:p-3 hover:shadow-sm transition-shadow flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Clock size={isMobile ? 12 : 14} className="text-muted-foreground" />
                      <span className="text-xs md:text-sm text-muted-foreground">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                      </span>
                    </div>
                    <h4 className="font-medium mt-1 text-sm md:text-base">{appointment.client?.name || "Cliente sconosciuto"}</h4>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs md:text-sm" onClick={() => onDetailClick(appointment.id)}>
                    Dettagli
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-1 md:gap-2">
                  <div className={cn('px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-xs font-medium', getEventTypeColor(appointment.title))}>
                    {appointment.title}
                  </div>
                  {appointment.status === 'cancelled' && (
                    <div className="bg-red-100 text-red-800 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md text-xs font-medium flex items-center">
                      <AlertCircle size={isMobile ? 10 : 12} className="mr-1" /> Cancellato
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
