
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export interface Appointment {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string | null;
  updated_at: string | null;
  client?: {
    name: string;
    email: string;
  };
}

export interface AppointmentFormData {
  client_id: string;
  title: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export function useAppointments() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Carica tutti gli appuntamenti dell'utente corrente
  const getAppointments = (date?: Date) => {
    return useQuery({
      queryKey: ['appointments', date?.toISOString().split('T')[0]],
      queryFn: async () => {
        if (!user) return [];

        let query = supabase
          .from('appointments')
          .select(`
            *,
            client:clients(name, email)
          `)
          .eq('user_id', user.id)
          .order('start_time', { ascending: true });

        // Filtro per data se specificata
        if (date) {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          query = query
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          toast({
            variant: "destructive",
            title: "Errore",
            description: "Impossibile caricare gli appuntamenti: " + error.message,
          });
          throw error;
        }

        return data as Appointment[];
      },
      enabled: !!user,
    });
  };

  // Carica gli appuntamenti per un cliente specifico
  const getClientAppointments = (clientId: string) => {
    return useQuery({
      queryKey: ['client-appointments', clientId],
      queryFn: async () => {
        if (!user || !clientId) return [];

        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .eq('client_id', clientId)
          .order('start_time', { ascending: false });

        if (error) {
          toast({
            variant: "destructive",
            title: "Errore",
            description: "Impossibile caricare gli appuntamenti: " + error.message,
          });
          throw error;
        }

        return data as Appointment[];
      },
      enabled: !!user && !!clientId,
    });
  };

  // Carica un singolo appuntamento
  const getAppointment = (appointmentId: string) => {
    return useQuery({
      queryKey: ['appointment', appointmentId],
      queryFn: async () => {
        if (!user || !appointmentId) return null;

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            client:clients(name, email)
          `)
          .eq('id', appointmentId)
          .maybeSingle();

        if (error) {
          toast({
            variant: "destructive",
            title: "Errore",
            description: "Impossibile caricare l'appuntamento: " + error.message,
          });
          throw error;
        }

        return data as Appointment | null;
      },
      enabled: !!user && !!appointmentId,
    });
  };

  // Aggiunge un nuovo appuntamento
  const createAppointment = useMutation({
    mutationFn: async (appointment: AppointmentFormData) => {
      if (!user) throw new Error("L'utente non è autenticato");

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointment,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile creare l'appuntamento: " + error.message,
        });
        throw error;
      }

      return data as Appointment;
    },
    onSuccess: (data) => {
      // Invalidiamo tutte le query relative agli appuntamenti
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['client-appointments', data.client_id] });
      
      toast({
        title: "Appuntamento creato",
        description: "L'appuntamento è stato creato con successo.",
      });
    },
  });

  // Aggiorna un appuntamento esistente
  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...appointment }: AppointmentFormData & { id: string }) => {
      if (!user) throw new Error("L'utente non è autenticato");

      const { data, error } = await supabase
        .from('appointments')
        .update(appointment)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile aggiornare l'appuntamento: " + error.message,
        });
        throw error;
      }

      return data as Appointment;
    },
    onSuccess: (data) => {
      // Invalidiamo tutte le query relative agli appuntamenti
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['client-appointments', data.client_id] });
      
      toast({
        title: "Appuntamento aggiornato",
        description: "L'appuntamento è stato aggiornato con successo.",
      });
    },
  });

  // Elimina un appuntamento
  const deleteAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!user) throw new Error("L'utente non è autenticato");

      // Prima recuperiamo l'appuntamento per avere client_id
      const { data: appointment } = await supabase
        .from('appointments')
        .select('client_id')
        .eq('id', appointmentId)
        .maybeSingle();

      const clientId = appointment?.client_id;

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile eliminare l'appuntamento: " + error.message,
        });
        throw error;
      }

      return { id: appointmentId, clientId };
    },
    onSuccess: ({ id, clientId }) => {
      // Invalidiamo tutte le query relative agli appuntamenti
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ['client-appointments', clientId] });
      }
      
      toast({
        title: "Appuntamento eliminato",
        description: "L'appuntamento è stato eliminato con successo.",
      });
    },
  });

  return {
    getAppointments,
    getClientAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
}
