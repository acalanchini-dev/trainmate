
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AppointmentFormData } from "@/hooks/use-appointments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const FormSchema = z.object({
  client_id: z.string({
    required_error: "Seleziona un cliente",
  }),
  title: z.string({
    required_error: "Inserisci un titolo",
  }).min(1, "Inserisci un titolo"),
  start_time: z.string({
    required_error: "Seleziona l'ora di inizio",
  }),
  end_time: z.string({
    required_error: "Seleziona l'ora di fine",
  }),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled'], {
    required_error: "Seleziona uno stato",
  }).default('scheduled'),
}).refine(data => {
  return new Date(data.end_time) > new Date(data.start_time);
}, {
  message: "L'ora di fine deve essere successiva all'ora di inizio",
  path: ["end_time"],
});

interface AppointmentFormProps {
  defaultValues?: Partial<AppointmentFormData> & { id?: string };
  onSubmit: (data: AppointmentFormData & { id?: string }) => void;
  isSubmitting: boolean;
  selectedDate?: Date;
  onCancel?: () => void;
}

export function AppointmentForm({ defaultValues, onSubmit, isSubmitting, selectedDate, onCancel }: AppointmentFormProps) {
  const { user } = useAuth();
  const [date, setDate] = React.useState<Date | undefined>(
    defaultValues?.start_time 
      ? new Date(defaultValues.start_time) 
      : selectedDate || new Date()
  );

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      client_id: defaultValues?.client_id || "",
      title: defaultValues?.title || "",
      start_time: defaultValues?.start_time || "",
      end_time: defaultValues?.end_time || "",
      notes: defaultValues?.notes || "",
      status: (defaultValues?.status as 'scheduled' | 'completed' | 'cancelled') || 'scheduled',
    },
  });

  // Carica i clienti
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients-for-select'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  React.useEffect(() => {
    if (date) {
      const currentStartTime = form.getValues('start_time');
      const currentEndTime = form.getValues('end_time');
      
      const currentStartDate = currentStartTime ? new Date(currentStartTime) : null;
      const currentEndDate = currentEndTime ? new Date(currentEndTime) : null;
      
      // Se abbiamo già degli orari selezionati, preserviamo solo l'ora e aggiorniamo la data
      if (currentStartDate) {
        const newStartDate = new Date(date);
        newStartDate.setHours(
          currentStartDate.getHours(),
          currentStartDate.getMinutes(),
          0,
          0
        );
        form.setValue('start_time', newStartDate.toISOString());
      } else {
        // Altrimenti impostiamo un orario di default (9:00)
        const newStartDate = new Date(date);
        newStartDate.setHours(9, 0, 0, 0);
        form.setValue('start_time', newStartDate.toISOString());
      }
      
      if (currentEndDate) {
        const newEndDate = new Date(date);
        newEndDate.setHours(
          currentEndDate.getHours(),
          currentEndDate.getMinutes(),
          0,
          0
        );
        form.setValue('end_time', newEndDate.toISOString());
      } else {
        // Altrimenti impostiamo un orario di default (10:00)
        const newEndDate = new Date(date);
        newEndDate.setHours(10, 0, 0, 0);
        form.setValue('end_time', newEndDate.toISOString());
      }
    }
  }, [date, form]);

  const handleSubmit = (values: z.infer<typeof FormSchema>) => {
    // Ensure all required fields are present for AppointmentFormData
    const appointment: AppointmentFormData & { id?: string } = {
      client_id: values.client_id,
      title: values.title,
      start_time: values.start_time,
      end_time: values.end_time,
      notes: values.notes,
      status: values.status,
    };
    
    // Include the ID if it exists in defaultValues
    if (defaultValues?.id) {
      appointment.id = defaultValues.id;
    }

    onSubmit(appointment);
  };

  // Funzione per formattare gli orari
  const formatTimeInput = (timeString: string | undefined): string => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Funzioni per gestire il cambiamento degli orari
  const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    if (!date || !value) return;

    const [hours, minutes] = value.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    
    form.setValue(field, newDate.toISOString());
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting || isLoadingClients}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} placeholder="Es. Allenamento Forza" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {date ? (
                          format(date, "PPP", { locale: it })
                        ) : (
                          <span>Seleziona la data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ora inizio</FormLabel>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 opacity-50" />
                    <FormControl>
                      <Input
                        type="time"
                        value={formatTimeInput(field.value)}
                        onChange={(e) => handleTimeChange('start_time', e.target.value)}
                        disabled={isSubmitting || !date}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ora fine</FormLabel>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 opacity-50" />
                    <FormControl>
                      <Input
                        type="time"
                        value={formatTimeInput(field.value)}
                        onChange={(e) => handleTimeChange('end_time', e.target.value)}
                        disabled={isSubmitting || !date}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stato</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona lo stato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Programmato</SelectItem>
                  <SelectItem value="completed">Completato</SelectItem>
                  <SelectItem value="cancelled">Cancellato</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isSubmitting} placeholder="Note aggiuntive (opzionale)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annulla
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {defaultValues?.id ? "Aggiorna" : "Crea"} Appuntamento
          </Button>
        </div>
      </form>
    </Form>
  );
}
