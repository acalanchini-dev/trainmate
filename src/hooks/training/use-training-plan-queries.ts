import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrainingPlan } from "@/types/training";

export const useTrainingPlanQueries = (clientId?: string) => {
  // Carica i piani di allenamento (eventualmente filtrati per cliente)
  const { data: trainingPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['training-plans', clientId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('training_plans')
          .select('*')
          .order('created_at', { ascending: false });

        if (clientId) {
          query = query.eq('client_id', clientId);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return data || [];
      } catch (error: any) {
        console.error("Errore nel caricamento dei piani di allenamento:", error.message);
        toast({
          title: "Errore",
          description: "Impossibile caricare i piani di allenamento",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: true,
  });

  // Carica un singolo piano con i suoi esercizi
  const fetchPlanWithExercises = async (planId: string) => {
    try {
      // Ottieni il piano
      const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Ottieni i gruppi
      const { data: groups, error: groupsError } = await supabase
        .from('exercise_groups')
        .select('*')
        .eq('training_plan_id', planId)
        .order('order', { ascending: true });

      if (groupsError) throw groupsError;

      // Ottieni gli esercizi
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('training_plan_id', planId)
        .order('order', { ascending: true });

      if (exercisesError) throw exercisesError;

      // Se abbiamo gruppi, associamo gli esercizi ai rispettivi gruppi
      if (groups && groups.length > 0) {
        const exerciseGroups = groups.map(group => {
          const groupExercises = exercises?.filter(ex => ex.group_id === group.id) || [];
          return {
            ...group,
            exercises: groupExercises
          };
        });

        return {
          ...plan,
          exercise_groups: exerciseGroups,
          exercises: exercises || [] // Manteniamo anche l'array piatto per compatibilità
        };
      }

      // Se non ci sono gruppi, restituisci solo gli esercizi
      return {
        ...plan,
        exercises: exercises || []
      };
    } catch (error: any) {
      console.error("Errore nel caricamento del piano:", error.message);
      toast({
        title: "Errore",
        description: "Impossibile caricare il piano di allenamento",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Query per ottenere un piano specifico con i suoi esercizi
  const useTrainingPlanDetails = (planId?: string) => {
    return useQuery({
      queryKey: ['training-plan', planId],
      queryFn: () => fetchPlanWithExercises(planId as string),
      enabled: !!planId,
    });
  };

  return {
    trainingPlans,
    isLoadingPlans,
    useTrainingPlanDetails,
  };
};
