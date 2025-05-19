import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Client, ClientFormData } from "@/types/client";

export function useClients() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Carica tutti i clienti
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) {
        toast("Impossibile caricare i clienti: " + error.message);
        throw error;
      }

      return data as Client[];
    },
    enabled: !!user,
  });

  // Carica un singolo cliente con i dettagli
  const getClient = async (id: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      toast("Impossibile caricare il cliente: " + error.message);
      throw error;
    }

    return data as Client;
  };

  // Verifica se esiste già un cliente con la stessa email
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error("[useClients] Errore nella verifica dell'email:", error);
      return false;
    }
    
    return !!data;
  };

  // Aggiungi un nuovo cliente - Aggiornata con controllo email
  const addClient = useMutation({
    mutationFn: async (newClient: ClientFormData) => {
      // Verifica se l'email esiste già
      const emailExists = await checkEmailExists(newClient.email);
      if (emailExists) {
        throw new Error("Un cliente con questa email esiste già");
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .insert({
            name: newClient.name,
            email: newClient.email,
            birth_date: newClient.birth_date || null,
            phone: newClient.phone || null,
            objective: newClient.objective || null,
            notes: newClient.notes || null,
            sessions_remaining: newClient.sessions_remaining,
            status: newClient.status,
            profile_picture_url: newClient.profile_picture_url || null,
            user_id: user!.id,
          })
          .select()
          .maybeSingle();

        if (error) {
          // Gestisci l'errore di violazione del vincolo di unicità
          if (error.code === '23505') { // Codice PostgreSQL per violazione vincolo di unicità
            throw new Error("Un cliente con questa email esiste già");
          }
          throw error;
        }

        return data as Client;
      } catch (error: any) {
        console.error("[useClients] Errore durante l'aggiunta del cliente:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        description: "Cliente aggiunto con successo",
        variant: "success"
      });
    },
    onError: (error: any) => {
      console.error("[useClients] Errore nell'aggiunta del cliente:", error);
      toast({
        description: error.message || "Impossibile aggiungere il cliente",
        variant: "destructive"
      });
    }
  });

  // Aggiorna un cliente esistente - MODIFICATA per rimuovere toast duplicato
  const updateClient = useMutation({
    mutationFn: async ({ id, ...clientData }: Partial<Client> & { id: string }) => {
      console.log("[useClients] Aggiornamento cliente con ID:", id);
      console.log("[useClients] Dati inviati al server:", clientData);
      
      // Prepara il payload assicurandosi che i campi stringhe vuote siano null
      const payload = { 
        ...clientData, 
        birth_date: clientData.birth_date || null,
        phone: clientData.phone || null,
        objective: clientData.objective || null,
        notes: clientData.notes || null,
        profile_picture_url: clientData.profile_picture_url || null,
        updated_at: new Date().toISOString() 
      };
      
      console.log("[useClients] Payload completo:", payload);
      
      const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("[useClients] Errore durante l'aggiornamento del cliente:", error);
        throw error;
      }

      console.log("[useClients] Risposta dal server per aggiornamento cliente:", data);
      return data as Client;
    },
    onSuccess: (data) => {
      console.log("[useClients] Aggiornamento cliente completato con successo, ID:", data.id);
      
      // Invalidiamo tutte le query relative al cliente
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', data.id] });
      queryClient.invalidateQueries({ queryKey: ['client-appointments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['client-training-plans', data.id] });
      
      console.log("[useClients] Cache invalidata con successo");
      toast({
        description: "Cliente aggiornato con successo",
        variant: "success",
        id: `client-updated-${data.id}-${Date.now()}`
      });
    },
    onError: (error: any) => {
      console.error("[useClients] Errore nella mutation di aggiornamento cliente:", error);
      toast(`Impossibile aggiornare il cliente: ${error.message || 'Si è verificato un errore'}`);
    }
  });

  // Elimina un cliente
  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      console.log("[useClients] Tentativo di eliminare cliente con ID:", id);
      
      try {
        // 1. Prima eliminiamo gli avvisi associati al cliente
        const { error: alertsError } = await supabase
          .from('alerts')
          .delete()
          .eq('related_client_id', id);

        if (alertsError) {
          console.error("[useClients] Errore nell'eliminazione degli avvisi:", alertsError);
          toast({
            description: "Impossibile eliminare gli avvisi associati: " + alertsError.message,
            variant: "destructive"
          });
          throw alertsError;
        }
        
        // 2. Poi verifichiamo se ci sono appuntamenti associati e li eliminiamo
        const { error: appointmentsError } = await supabase
          .from('appointments')
          .delete()
          .eq('client_id', id);
          
        if (appointmentsError) {
          console.error("[useClients] Errore nell'eliminazione degli appuntamenti:", appointmentsError);
          toast({
            description: "Impossibile eliminare gli appuntamenti associati: " + appointmentsError.message,
            variant: "destructive"
          });
          throw appointmentsError;
        }
        
        // 3. Eliminiamo i piani di allenamento e gli esercizi associati
        // 3.1 Otteniamo prima tutti i piani di allenamento del cliente
        const { data: trainingPlans, error: trainingPlansError } = await supabase
          .from('training_plans')
          .select('id')
          .eq('client_id', id);
          
        if (trainingPlansError) {
          console.error("[useClients] Errore nel recupero dei piani di allenamento:", trainingPlansError);
          toast({
            description: "Impossibile recuperare i piani di allenamento: " + trainingPlansError.message,
            variant: "destructive"
          });
          throw trainingPlansError;
        }
        
        // 3.2 Eliminiamo gli esercizi per ogni piano di allenamento
        if (trainingPlans && trainingPlans.length > 0) {
          const planIds = trainingPlans.map(plan => plan.id);
          
          const { error: exercisesError } = await supabase
            .from('exercises')
            .delete()
            .in('training_plan_id', planIds);
            
          if (exercisesError) {
            console.error("[useClients] Errore nell'eliminazione degli esercizi:", exercisesError);
            toast({
              description: "Impossibile eliminare gli esercizi associati: " + exercisesError.message,
              variant: "destructive"
            });
            throw exercisesError;
          }
          
          // 3.3 Ora eliminiamo i piani di allenamento
          const { error: deleteTrainingPlansError } = await supabase
            .from('training_plans')
            .delete()
            .eq('client_id', id);
            
          if (deleteTrainingPlansError) {
            console.error("[useClients] Errore nell'eliminazione dei piani di allenamento:", deleteTrainingPlansError);
            toast({
              description: "Impossibile eliminare i piani di allenamento: " + deleteTrainingPlansError.message,
              variant: "destructive"
            });
            throw deleteTrainingPlansError;
          }
        }
        
        // 4. Eliminiamo i dati antropometrici
        const { error: anthropometricError } = await supabase
          .from('anthropometric_data')
          .delete()
          .eq('client_id', id);
          
        if (anthropometricError) {
          console.error("[useClients] Errore nell'eliminazione dei dati antropometrici:", anthropometricError);
          toast({
            description: "Impossibile eliminare i dati antropometrici: " + anthropometricError.message,
            variant: "destructive"
          });
          throw anthropometricError;
        }
        
        // 5. Eliminiamo i documenti del cliente
        const { error: documentsError } = await supabase
          .from('client_documents')
          .delete()
          .eq('client_id', id);
          
        if (documentsError) {
          console.error("[useClients] Errore nell'eliminazione dei documenti:", documentsError);
          toast({
            description: "Impossibile eliminare i documenti associati: " + documentsError.message,
            variant: "destructive"
          });
          throw documentsError;
        }
        
        // 6. Finalmente eliminiamo il cliente
        const { error: clientError } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);

        if (clientError) {
          console.error("[useClients] Errore nell'eliminazione del cliente:", clientError);
          toast({
            description: "Impossibile eliminare il cliente: " + clientError.message,
            variant: "destructive"
          });
          throw clientError;
        }

        console.log("[useClients] Cliente e tutti i dati associati eliminati con successo");
        return id;
      } catch (error: any) {
        console.error("[useClients] Errore durante il processo di eliminazione:", error);
        throw error;
      }
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
      toast({
        description: "Cliente eliminato con successo",
        variant: "success"
      });
    },
    onError: (error: any) => {
      console.error("[useClients] Gestione errore nella mutation:", error);
      toast({
        description: `Errore nell'eliminazione del cliente: ${error.message || 'Si è verificato un errore'}`,
        variant: "destructive"
      });
    }
  });

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    checkEmailExists
  };
}
