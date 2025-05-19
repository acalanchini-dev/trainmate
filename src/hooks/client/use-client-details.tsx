
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Client } from "@/types/client";

export const useClientDetails = (clientId: string | undefined) => {
  const queryClient = useQueryClient();

  // Carica i dettagli del cliente
  const { data: client, isLoading, refetch: internalRefetchClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (!clientId) return null;

      console.log("[useClientDetails] Caricamento dati cliente:", clientId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (error) {
        console.error("[useClientDetails] Errore nel caricamento del cliente:", error);
        toast("Impossibile caricare il cliente: " + error.message);
        throw error;
      }

      console.log("[useClientDetails] Dati cliente caricati:", data);
      return data as Client;
    },
    enabled: !!clientId,
    staleTime: 1000, // Ridotto per testare il caricamento frequente
    refetchOnWindowFocus: true, // Aggiornamento quando la finestra ottiene focus
  });

  // Carica gli appuntamenti del cliente
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['client-appointments', clientId],
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error("[useClientDetails] Errore nel caricamento degli appuntamenti:", error);
        toast("Impossibile caricare gli appuntamenti: " + error.message);
        throw error;
      }

      return data || [];
    },
    enabled: !!clientId,
  });

  // Carica i piani di allenamento del cliente
  const { data: trainingPlans, isLoading: isLoadingTrainingPlans, refetch: refetchTrainingPlans } = useQuery({
    queryKey: ['client-training-plans', clientId],
    queryFn: async () => {
      if (!clientId) return [];

      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('client_id', clientId);

      if (error) {
        console.error("[useClientDetails] Errore nel caricamento dei piani:", error);
        toast("Impossibile caricare i piani di allenamento: " + error.message);
        throw error;
      }

      return data || [];
    },
    enabled: !!clientId,
  });

  // Funzione ottimizzata per ricaricare i dati del cliente, con debounce implicito
  // tramite flag per evitare refetch multipli ravvicinati
  let isRefetchInProgress = false;
  const refetchClient = async () => {
    if (isRefetchInProgress) {
      console.log("[useClientDetails] Refetch già in corso, saltando...");
      return true;
    }
    
    console.log("[useClientDetails] Ricaricamento dati cliente:", clientId);
    isRefetchInProgress = true;
    
    try {
      // Invalidiamo la query relativa al cliente specifico
      await queryClient.invalidateQueries({queryKey: ['client', clientId]});
      console.log("[useClientDetails] Cache invalidata con successo");
      
      // Forzare il refetch immediato
      const result = await internalRefetchClient();
      console.log("[useClientDetails] Risultato refetch:", result);
      
      setTimeout(() => {
        isRefetchInProgress = false;
      }, 500); // Blocca ulteriori refetch per 500ms
      
      return true;
    } catch (error) {
      console.error("[useClientDetails] Errore durante l'invalidazione della cache:", error);
      isRefetchInProgress = false;
      return false;
    }
  };

  return {
    client,
    isLoading,
    appointments,
    isLoadingAppointments,
    trainingPlans,
    isLoadingTrainingPlans,
    refetchTrainingPlans,
    refetchClient,
  };
};
