
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/training";

export const useExercises = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Aggiorna lo stato di completamento di un esercizio
  const updateExerciseCompletion = async (exerciseId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({ completed })
        .eq('id', exerciseId);

      if (error) throw error;

      // Trova il piano associato e aggiorna la cache
      const { data } = await supabase
        .from('exercises')
        .select('training_plan_id')
        .eq('id', exerciseId)
        .single();

      if (data) {
        queryClient.invalidateQueries({ queryKey: ['training-plan', data.training_plan_id] });
      }
    } catch (error: any) {
      console.error("Errore nell'aggiornamento dell'esercizio:", error.message);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'esercizio",
        variant: "destructive",
      });
    }
  };

  return {
    updateExerciseCompletion,
    isLoading
  };
};
