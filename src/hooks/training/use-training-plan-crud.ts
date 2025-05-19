import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrainingPlan } from "@/types/training";

export const useTrainingPlanCrud = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Crea un nuovo piano con esercizi
  const createTrainingPlan = async (newPlan: TrainingPlan) => {
    setIsLoading(true);
    try {
      // Controlla se l'utente è autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      // Estrai gli esercizi prima di inserire il piano
      const exercises = newPlan.exercises || [];
      
      // Crea un oggetto piano senza gli esercizi per l'inserimento
      const { exercises: _, ...planToInsert } = {
        ...newPlan,
        user_id: user.id,
      };
      
      console.log("Piano da inserire:", planToInsert);

      // Salva il piano nel database (senza esercizi)
      const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .insert([planToInsert])
        .select()
        .single();

      if (planError) {
        console.error("Errore nell'inserimento del piano:", planError);
        throw planError;
      }
      
      console.log("Piano creato con successo:", plan);

      // Se ci sono esercizi, salvali nel database
      if (exercises.length > 0) {
        const exercisesToInsert = exercises.map((exercise, index) => ({
          ...exercise,
          training_plan_id: plan.id,
          order: index + 1,
        }));

        console.log("Esercizi da inserire:", exercisesToInsert);

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          console.error("Errore nell'inserimento degli esercizi:", exercisesError);
          throw exercisesError;
        }
        
        console.log("Esercizi inseriti con successo");
      }

      // Aggiorna immediatamente la cache di React Query 
      // 1. Invalida la query esistente
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      
      // 2. Ottieni i dati correnti dalla cache (per aggiornamento ottimistico)
      const previousPlans = queryClient.getQueryData(['training-plans']) as TrainingPlan[] || [];
      
      // 3. Aggiorna la cache immediatamente con il nuovo piano
      const completePlan = {
        ...plan,
        exercises: exercises.map((exercise, index) => ({
          ...exercise,
          training_plan_id: plan.id,
          order: index + 1,
        }))
      };
      
      queryClient.setQueryData(['training-plans'], [completePlan, ...previousPlans]);

      return plan;
    } catch (error: any) {
      console.error("Errore nella creazione del piano:", error.message);
      toast({
        title: "Errore",
        description: `Impossibile creare il piano di allenamento: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Aggiorna un piano esistente e i suoi esercizi
  const updateTrainingPlan = async (updatedPlan: TrainingPlan) => {
    setIsLoading(true);
    try {
      if (!updatedPlan.id) throw new Error("ID piano mancante");

      // Estrai gli esercizi prima dell'aggiornamento del piano
      const exercises = updatedPlan.exercises || [];
      
      // Crea un oggetto piano senza gli esercizi per l'aggiornamento
      const { exercises: _, id, ...planToUpdate } = updatedPlan;

      // Aggiorna le informazioni del piano
      const { error: planError } = await supabase
        .from('training_plans')
        .update(planToUpdate)
        .eq('id', updatedPlan.id);

      if (planError) throw planError;

      // Se ci sono esercizi, gestisci le modifiche
      if (exercises.length > 0) {
        // Prima ottieni gli esercizi esistenti
        const { data: existingExercises } = await supabase
          .from('exercises')
          .select('id')
          .eq('training_plan_id', updatedPlan.id);

        const existingIds = new Set(existingExercises?.map(e => e.id) || []);
        
        // Identifica esercizi da aggiungere, aggiornare o eliminare
        const exercisesToUpdate = exercises.filter(e => e.id && existingIds.has(e.id));
        const exercisesToAdd = exercises.filter(e => !e.id);
        
        // Aggiorna esercizi esistenti
        for (const exercise of exercisesToUpdate) {
          const { error } = await supabase
            .from('exercises')
            .update({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              notes: exercise.notes,
              video_link: exercise.video_link,
              order: exercise.order,
              completed: exercise.completed,
            })
            .eq('id', exercise.id);
          
          if (error) throw error;
        }

        // Aggiungi nuovi esercizi
        if (exercisesToAdd.length > 0) {
          const newExercises = exercisesToAdd.map(exercise => ({
            ...exercise,
            training_plan_id: updatedPlan.id,
          }));

          const { error } = await supabase
            .from('exercises')
            .insert(newExercises);
          
          if (error) throw error;
        }

        // Controlla se ci sono esercizi da eliminare
        const updatedIds = new Set(exercises.filter(e => e.id).map(e => e.id));
        const exercisesToDelete = Array.from(existingIds).filter(id => !updatedIds.has(id as string));
        
        if (exercisesToDelete.length > 0) {
          const { error } = await supabase
            .from('exercises')
            .delete()
            .in('id', exercisesToDelete);
          
          if (error) throw error;
        }
      }

      // Aggiorna la cache
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      queryClient.invalidateQueries({ queryKey: ['training-plan', updatedPlan.id] });
      
      // Aggiornamento ottimistico della cache
      // 1. Ottieni i dati correnti dalla cache
      const previousPlans = queryClient.getQueryData(['training-plans']) as TrainingPlan[] || [];
      
      // 2. Aggiorna immediatamente la cache con il piano aggiornato
      const updatedPlanWithExercises = {
        ...updatedPlan,
        exercises: exercises.map((exercise) => ({
          ...exercise,
          training_plan_id: updatedPlan.id,
        }))
      };
      
      // 3. Sostituisci il piano aggiornato nella lista
      const updatedPlans = previousPlans.map(plan => 
        plan.id === updatedPlan.id ? updatedPlanWithExercises : plan
      );
      
      queryClient.setQueryData(['training-plans'], updatedPlans);
      
      // 4. Aggiorna anche la cache del piano singolo
      queryClient.setQueryData(['training-plan', updatedPlan.id], updatedPlanWithExercises);

      return updatedPlan;
    } catch (error: any) {
      console.error("Errore nell'aggiornamento del piano:", error.message);
      toast({
        title: "Errore",
        description: `Impossibile aggiornare il piano di allenamento: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Elimina un piano (gli esercizi verranno eliminati automaticamente grazie al CASCADE)
  const deleteTrainingPlan = async (planId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      // Aggiorna la cache
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      
      // Aggiornamento ottimistico della cache
      // 1. Ottieni i dati correnti dalla cache
      const previousPlans = queryClient.getQueryData(['training-plans']) as TrainingPlan[] || [];
      
      // 2. Rimuovi il piano eliminato dalla lista
      const updatedPlans = previousPlans.filter(plan => plan.id !== planId);
      
      // 3. Aggiorna immediatamente la cache
      queryClient.setQueryData(['training-plans'], updatedPlans);
      
      // 4. Rimuovi anche dalla cache del piano singolo
      queryClient.removeQueries({ queryKey: ['training-plan', planId] });
    } catch (error: any) {
      console.error("Errore nell'eliminazione del piano:", error.message);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il piano di allenamento",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Hook mutations per operazioni CRUD
  const createTrainingPlanMutation = useMutation({
    mutationFn: async (newPlan: TrainingPlan) => {
      setIsLoading(true);
      try {
        // Controlla se l'utente è autenticato
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Utente non autenticato");

        // Estrai gli esercizi prima di inserire il piano
        const exercises = newPlan.exercises || [];
        
        // Crea un oggetto piano senza gli esercizi per l'inserimento
        const { exercises: _, ...planToInsert } = {
          ...newPlan,
          user_id: user.id,
        };
        
        console.log("Piano da inserire:", planToInsert);

        // Salva il piano nel database (senza esercizi)
        const { data: plan, error: planError } = await supabase
          .from('training_plans')
          .insert([planToInsert])
          .select()
          .single();

        if (planError) {
          console.error("Errore nell'inserimento del piano:", planError);
          throw planError;
        }
        
        console.log("Piano creato con successo:", plan);

        // Se ci sono esercizi, salvali nel database
        if (exercises.length > 0) {
          const exercisesToInsert = exercises.map((exercise, index) => ({
            ...exercise,
            training_plan_id: plan.id,
            order: index + 1,
          }));

          console.log("Esercizi da inserire:", exercisesToInsert);

          const { error: exercisesError } = await supabase
            .from('exercises')
            .insert(exercisesToInsert);

          if (exercisesError) {
            console.error("Errore nell'inserimento degli esercizi:", exercisesError);
            throw exercisesError;
          }
          
          console.log("Esercizi inseriti con successo");
        }
        
        const completePlan = {
          ...plan,
          exercises: exercises.map((exercise, index) => ({
            ...exercise,
            training_plan_id: plan.id,
            order: index + 1,
          }))
        };

        setIsLoading(false);
        return completePlan;
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    onSuccess: (newPlan) => {
      // 1. Invalida tutte le query correlate
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      if (newPlan.client_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['client-training-plans', newPlan.client_id] 
        });
      }
      
      // 2. Aggiornamento ottimistico della cache per entrambe le viste
      // Vista generale dei piani
      const previousPlans = queryClient.getQueryData(['training-plans']) as TrainingPlan[] || [];
      queryClient.setQueryData(['training-plans'], [newPlan, ...previousPlans]);
      
      // Vista dei piani del cliente
      if (newPlan.client_id) {
        const previousClientPlans = queryClient.getQueryData(
          ['client-training-plans', newPlan.client_id]
        ) as TrainingPlan[] || [];
        queryClient.setQueryData(
          ['client-training-plans', newPlan.client_id], 
          [newPlan, ...previousClientPlans]
        );
      }
      
      toast({
        title: "Piano creato",
        description: "Il piano di allenamento è stato creato con successo",
        variant: "success"
      });
    },
    onError: (error: any) => {
      console.error("Errore nella creazione del piano:", error.message);
      toast({
        title: "Errore",
        description: `Impossibile creare il piano di allenamento: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateTrainingPlanMutation = useMutation({
    mutationFn: updateTrainingPlan,
    onSuccess: (updatedPlan) => {
      // 1. Invalida tutte le query correlate
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      if (updatedPlan.client_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['client-training-plans', updatedPlan.client_id] 
        });
      }
      if (updatedPlan.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['training-plan', updatedPlan.id] 
        });
      }
      
      // 2. Aggiornamento ottimistico per entrambe le viste
      // Vista generale dei piani
      const previousPlans = queryClient.getQueryData(['training-plans']) as TrainingPlan[] || [];
      const updatedPlans = previousPlans.map(plan => 
        plan.id === updatedPlan.id ? updatedPlan : plan
      );
      queryClient.setQueryData(['training-plans'], updatedPlans);
      
      // Vista dei piani del cliente
      if (updatedPlan.client_id) {
        const previousClientPlans = queryClient.getQueryData(
          ['client-training-plans', updatedPlan.client_id]
        ) as TrainingPlan[] || [];
        const updatedClientPlans = previousClientPlans.map(plan =>
          plan.id === updatedPlan.id ? updatedPlan : plan
        );
        queryClient.setQueryData(
          ['client-training-plans', updatedPlan.client_id],
          updatedClientPlans
        );
      }
      
      // 3. Aggiorna la cache del piano singolo
      if (updatedPlan.id) {
        queryClient.setQueryData(['training-plan', updatedPlan.id], updatedPlan);
      }
      
      toast({
        title: "Piano aggiornato",
        description: "Il piano di allenamento è stato aggiornato con successo",
        variant: "success"
      });
    },
    onError: (error: any) => {
      console.error("Errore nell'aggiornamento del piano:", error.message);
      toast({
        title: "Errore",
        description: `Impossibile aggiornare il piano di allenamento: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteTrainingPlanMutation = useMutation({
    mutationFn: deleteTrainingPlan,
    onSuccess: (_, planId) => {
      // Prima ottieni il piano dalla cache per avere l'ID del cliente
      const plan = queryClient.getQueryData(['training-plan', planId]) as TrainingPlan;
      const clientId = plan?.client_id;
      
      // 1. Invalida tutte le query correlate
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      if (clientId) {
        queryClient.invalidateQueries({ 
          queryKey: ['client-training-plans', clientId] 
        });
      }
      
      // 2. Aggiornamento ottimistico per entrambe le viste
      // Vista generale dei piani
      const previousPlans = queryClient.getQueryData(['training-plans']) as TrainingPlan[] || [];
      const updatedPlans = previousPlans.filter(plan => plan.id !== planId);
      queryClient.setQueryData(['training-plans'], updatedPlans);
      
      // Vista dei piani del cliente
      if (clientId) {
        const previousClientPlans = queryClient.getQueryData(
          ['client-training-plans', clientId]
        ) as TrainingPlan[] || [];
        const updatedClientPlans = previousClientPlans.filter(plan => plan.id !== planId);
        queryClient.setQueryData(
          ['client-training-plans', clientId],
          updatedClientPlans
        );
      }
      
      // 3. Rimuovi dalla cache del piano singolo
      queryClient.removeQueries({ queryKey: ['training-plan', planId] });
      
      // Utilizziamo un ID univoco basato sul planId per evitare duplicazioni
      toast({
        title: "Piano eliminato",
        description: "Il piano di allenamento è stato eliminato con successo",
        variant: "success",
        id: `delete-training-plan-${planId}`
      });
    },
    onError: (error: any) => {
      console.error("Errore nell'eliminazione del piano:", error.message);
      toast({
        title: "Errore",
        description: `Impossibile eliminare il piano di allenamento: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    isLoading,
    createTrainingPlan: createTrainingPlanMutation.mutate,
    updateTrainingPlan: updateTrainingPlanMutation.mutate,
    deleteTrainingPlan: deleteTrainingPlanMutation.mutate,
  };
};
