
import { useTrainingPlanQueries } from "./training/use-training-plan-queries";
import { useTrainingPlanCrud } from "./training/use-training-plan-crud";
import { useExercises } from "./training/use-exercises";
import { TrainingPlan, Exercise } from "@/types/training";

// Esporta le interfacce che erano definite nel file originale
export type { TrainingPlan, Exercise };

export const useTrainingPlans = (clientId?: string) => {
  // Ottieni le funzionalità dai vari hooks
  const { trainingPlans, isLoadingPlans, useTrainingPlanDetails } = useTrainingPlanQueries(clientId);
  const { isLoading, createTrainingPlan, updateTrainingPlan, deleteTrainingPlan } = useTrainingPlanCrud();
  const { updateExerciseCompletion } = useExercises();

  // Ritorna un'interfaccia unificata mantenendo la compatibilità con il codice esistente
  return {
    trainingPlans,
    isLoadingPlans,
    isLoading,
    useTrainingPlanDetails,
    createTrainingPlan,
    updateTrainingPlan,
    deleteTrainingPlan,
    updateExerciseCompletion,
  };
};
