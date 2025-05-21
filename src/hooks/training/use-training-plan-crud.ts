import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrainingPlan, ExerciseGroup } from "@/types/training";

export const useTrainingPlanCrud = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Crea un nuovo piano con esercizi e gruppi
  const createTrainingPlan = async (newPlan: TrainingPlan) => {
    setIsLoading(true);
    try {
      // Controlla se l'utente è autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      // Estrai i gruppi e gli esercizi prima di inserire il piano
      const exercise_groups = newPlan.exercise_groups || [];
      
      // Supporto retrocompatibile per i piani senza gruppi
      const exercises = newPlan.exercises || [];
      
      // Crea un oggetto piano senza gli esercizi e gruppi per l'inserimento
      const planToInsert = {
        name: newPlan.name,
        description: newPlan.description,
        client_id: newPlan.client_id,
        user_id: user.id,
      };
      
      console.log("Piano da inserire:", planToInsert);

      // Salva il piano nel database (senza esercizi e gruppi)
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

      // Se abbiamo gruppi, gestiamo quelli
      if (exercise_groups.length > 0) {
        // Prima inseriamo i gruppi
        const groupsToInsert = exercise_groups.map((group, index) => ({
          training_plan_id: plan.id,
          title: group.title,
          order: index + 1,
        }));

        const { data: insertedGroups, error: groupsError } = await supabase
          .from('exercise_groups')
          .insert(groupsToInsert)
          .select();

        if (groupsError) {
          console.error("Errore nell'inserimento dei gruppi:", groupsError);
          throw groupsError;
        }
        
        console.log("Gruppi inseriti con successo");
        
        // Ora inseriamo gli esercizi associandoli ai gruppi
        for (let i = 0; i < exercise_groups.length; i++) {
          const group = exercise_groups[i];
          const insertedGroup = insertedGroups[i];
          
          if (group.exercises && group.exercises.length > 0) {
            const exercisesToInsert = group.exercises.map((exercise, exIndex) => ({
              ...exercise,
              training_plan_id: plan.id,
              group_id: insertedGroup.id,
              order: exIndex + 1,
            }));

            const { error: exercisesError } = await supabase
              .from('exercises')
              .insert(exercisesToInsert);

            if (exercisesError) {
              console.error("Errore nell'inserimento degli esercizi:", exercisesError);
              throw exercisesError;
            }
          }
        }
        
        console.log("Esercizi inseriti con successo");
      } 
      // Supporto retrocompatibile per i piani con esercizi ma senza gruppi
      else if (exercises.length > 0) {
        // Creiamo automaticamente un gruppo predefinito
        const { data: defaultGroup, error: defaultGroupError } = await supabase
          .from('exercise_groups')
          .insert({
            training_plan_id: plan.id,
            title: "Gruppo 1",
            order: 1,
          })
          .select()
          .single();
          
        if (defaultGroupError) {
          console.error("Errore nella creazione del gruppo predefinito:", defaultGroupError);
          throw defaultGroupError;
        }
        
        // Associamo tutti gli esercizi a questo gruppo
        const exercisesToInsert = exercises.map((exercise, index) => ({
          ...exercise,
          training_plan_id: plan.id,
          group_id: defaultGroup.id,
          order: index + 1,
        }));

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert);

        if (exercisesError) {
          console.error("Errore nell'inserimento degli esercizi:", exercisesError);
          throw exercisesError;
        }
      }

      // Aggiorna immediatamente la cache di React Query 
      // 1. Invalida la query esistente
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });

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

  // Aggiorna un piano esistente e i suoi esercizi e gruppi
  const updateTrainingPlan = async (updatedPlan: TrainingPlan) => {
    setIsLoading(true);
    try {
      if (!updatedPlan.id) throw new Error("ID piano mancante");

      // Estrai i gruppi e gli esercizi prima dell'aggiornamento del piano
      const exercise_groups = updatedPlan.exercise_groups || [];
      const exercises = updatedPlan.exercises || [];
      
      // Crea un oggetto piano senza gli esercizi e gruppi per l'aggiornamento
      const { exercises: _, exercise_groups: __, id, ...planToUpdate } = updatedPlan;

      // Aggiorna le informazioni del piano
      const { error: planError } = await supabase
        .from('training_plans')
        .update(planToUpdate)
        .eq('id', updatedPlan.id);

      if (planError) throw planError;

      // Gestione dei gruppi (supporto nuovo formato)
      if (exercise_groups.length > 0) {
        // Prima ottieni i gruppi esistenti
        const { data: existingGroups } = await supabase
          .from('exercise_groups')
          .select('id')
          .eq('training_plan_id', updatedPlan.id);

        const existingGroupIds = new Set(existingGroups?.map(g => g.id) || []);
        
        // Per ogni gruppo nel piano aggiornato
        for (let groupIndex = 0; groupIndex < exercise_groups.length; groupIndex++) {
          const group = exercise_groups[groupIndex];
          
          // Il gruppo esiste già? Aggiornalo
          if (group.id && existingGroupIds.has(group.id)) {
            // Aggiorna le informazioni del gruppo
            await supabase
              .from('exercise_groups')
              .update({
                title: group.title,
                order: groupIndex + 1
              })
              .eq('id', group.id);
            
            // Ottieni gli esercizi esistenti di questo gruppo
            const { data: existingExercises } = await supabase
              .from('exercises')
              .select('id')
              .eq('group_id', group.id);
            
            const existingExerciseIds = new Set(existingExercises?.map(e => e.id) || []);
            
            // Aggiorna, aggiungi o rimuovi esercizi del gruppo
            if (group.exercises && group.exercises.length > 0) {
              // Aggiorna esercizi esistenti
              const exercisesToUpdate = group.exercises.filter(e => e.id && existingExerciseIds.has(e.id));
              for (const exercise of exercisesToUpdate) {
                await supabase
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
              }
              
              // Aggiungi nuovi esercizi
              const exercisesToAdd = group.exercises.filter(e => !e.id);
              if (exercisesToAdd.length > 0) {
                const newExercises = exercisesToAdd.map((ex, idx) => ({
                  ...ex,
                  training_plan_id: updatedPlan.id,
                  group_id: group.id,
                  order: (exercisesToUpdate.length + idx + 1)
                }));
                
                await supabase
                  .from('exercises')
                  .insert(newExercises);
              }
              
              // Identifica e rimuovi esercizi non più presenti
              if (existingExercises && existingExercises.length > 0) {
                const currentExerciseIds = new Set(group.exercises
                  .filter(e => e.id)
                  .map(e => e.id));
                
                const exercisesToDelete = existingExercises
                  .filter(e => !currentExerciseIds.has(e.id))
                  .map(e => e.id);
                
                if (exercisesToDelete.length > 0) {
                  await supabase
                    .from('exercises')
                    .delete()
                    .in('id', exercisesToDelete);
                }
              }
            } else {
              // Se non ci sono esercizi nel gruppo, rimuovi tutti quelli esistenti
              if (existingExercises && existingExercises.length > 0) {
                await supabase
                  .from('exercises')
                  .delete()
                  .in('id', existingExercises.map(e => e.id));
              }
            }
          } 
          // È un nuovo gruppo? Crealo
          else {
            // Crea il nuovo gruppo
            const { data: newGroup, error: newGroupError } = await supabase
              .from('exercise_groups')
              .insert({
                training_plan_id: updatedPlan.id,
                title: group.title,
                order: groupIndex + 1
              })
              .select()
              .single();
            
            if (newGroupError) throw newGroupError;
            
            // Aggiungi gli esercizi al nuovo gruppo
            if (group.exercises && group.exercises.length > 0) {
              const newExercises = group.exercises.map((ex, idx) => ({
                ...ex,
                id: undefined, // Rimuovi eventuali ID esistenti
                training_plan_id: updatedPlan.id,
                group_id: newGroup.id,
                order: idx + 1
              }));
              
              await supabase
                .from('exercises')
                .insert(newExercises);
            }
          }
        }
        
        // Identifica e rimuovi i gruppi che non sono più presenti
        if (existingGroups && existingGroups.length > 0) {
          const currentGroupIds = new Set(exercise_groups
            .filter(g => g.id)
            .map(g => g.id));
          
          const groupsToDelete = existingGroups
            .filter(g => !currentGroupIds.has(g.id))
            .map(g => g.id);
          
          if (groupsToDelete.length > 0) {
            // La rimozione a cascata eliminerà anche gli esercizi associati
            await supabase
              .from('exercise_groups')
              .delete()
              .in('id', groupsToDelete);
          }
        }
      }
      // Retrocompatibilità: piano con esercizi ma senza gruppi
      else if (exercises.length > 0) {
        // Controlla se esistono già dei gruppi
        const { data: existingGroups } = await supabase
          .from('exercise_groups')
          .select('id')
          .eq('training_plan_id', updatedPlan.id);
        
        let groupId: string;
        
        // Se non c'è nessun gruppo, creane uno
        if (!existingGroups || existingGroups.length === 0) {
          const { data: newGroup } = await supabase
            .from('exercise_groups')
            .insert({
              training_plan_id: updatedPlan.id,
              title: "Gruppo 1",
              order: 1
            })
            .select()
            .single();
          
          groupId = newGroup.id;
        } else {
          // Usa il primo gruppo esistente
          groupId = existingGroups[0].id;
        }
        
        // Ottieni gli esercizi esistenti
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
              group_id: groupId // Assegna al gruppo
            })
            .eq('id', exercise.id);
          
          if (error) throw error;
        }

        // Aggiungi nuovi esercizi
        if (exercisesToAdd.length > 0) {
          const newExercises = exercisesToAdd.map((exercise, index) => ({
            ...exercise,
            training_plan_id: updatedPlan.id,
            group_id: groupId,
            order: (exercisesToUpdate.length + index + 1),
          }));

          const { error } = await supabase
            .from('exercises')
            .insert(newExercises);
          
          if (error) throw error;
        }

        // Identifica ed elimina esercizi non più presenti
        if (existingExercises && existingExercises.length > 0) {
          const currentExerciseIds = new Set(exercises.filter(e => e.id).map(e => e.id));
          const exercisesToRemove = existingExercises
            .filter(e => !currentExerciseIds.has(e.id))
            .map(e => e.id);
          
          if (exercisesToRemove.length > 0) {
            await supabase
            .from('exercises')
            .delete()
              .in('id', exercisesToRemove);
          }
        }
      }
      // Non ci sono né gruppi né esercizi - elimina tutto
      else {
        // Elimina tutti i gruppi (e di conseguenza tutti gli esercizi grazie al CASCADE)
        await supabase
          .from('exercise_groups')
          .delete()
          .eq('training_plan_id', updatedPlan.id);
      }

      // Aggiorna la cache
      queryClient.invalidateQueries({ queryKey: ['training-plans'] });
      queryClient.invalidateQueries({ queryKey: ['training-plan', updatedPlan.id] });

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
        const planToInsert = {
          name: newPlan.name,
          description: newPlan.description,
          client_id: newPlan.client_id,
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
