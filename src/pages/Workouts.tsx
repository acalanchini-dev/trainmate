import React, { useState, useEffect } from 'react';
import { Dumbbell, Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useClients } from "@/hooks/use-clients";
import { useTrainingPlans, TrainingPlan } from "@/hooks/use-training-plans";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorkoutList from '@/components/workouts/WorkoutList';
import WorkoutDetails from '@/components/workouts/WorkoutDetails';
import WorkoutForm from '@/components/workouts/WorkoutForm';
import { toast } from "@/components/ui/use-toast";

const Workouts = () => {
  const { user } = useAuth();
  const { clients, isLoading: isLoadingClients } = useClients();
  const { 
    trainingPlans, 
    isLoadingPlans, 
    createTrainingPlan, 
    updateTrainingPlan, 
    deleteTrainingPlan, 
    useTrainingPlanDetails, 
    updateExerciseCompletion 
  } = useTrainingPlans();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [localTrainingPlans, setLocalTrainingPlans] = useState<TrainingPlan[]>([]);
  
  // Dettagli del piano di allenamento selezionato
  const { data: selectedPlanDetails, isLoading: isLoadingDetails } = useTrainingPlanDetails(selectedWorkout || undefined);

  // Effetto per sincronizzare i piani di allenamento remoti con lo stato locale
  useEffect(() => {
    if (trainingPlans) {
      setLocalTrainingPlans(trainingPlans);
    }
  }, [trainingPlans]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filtra i workout in base alla ricerca e al cliente selezionato
  const filteredWorkouts = localTrainingPlans?.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clients?.find(c => c.id === workout.client_id)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClient = selectedClientId === "all" || workout.client_id === selectedClientId;
    
    return matchesSearch && matchesClient;
  });

  // Gestisce il salvataggio del piano di allenamento
  const handleSaveWorkout = async (data: TrainingPlan) => {
    try {
      if (isEditMode && data.id) {
        await updateTrainingPlan(data);
      } else {
        await createTrainingPlan(data);
      }
      setIsWorkoutDialogOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Errore nel salvataggio del piano:", error);
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      await deleteTrainingPlan(planId);
      setSelectedWorkout(null);
      
      // Aggiorniamo manualmente la lista locale dei piani di allenamento
      setLocalTrainingPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    } catch (error) {
      console.error("Errore nell'eliminazione del piano:", error);
    }
  };

  const handleUpdateExerciseCompletion = async (exerciseId: string, completed: boolean) => {
    try {
      await updateExerciseCompletion(exerciseId, completed);
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'esercizio:", error);
    }
  };

  const handleEditWorkout = (workoutId: string) => {
    setSelectedWorkout(workoutId);
    setIsEditMode(true);
    setIsWorkoutDialogOpen(true);
  };

  const handleViewWorkout = (workoutId: string) => {
    setSelectedWorkout(workoutId);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
          <Dumbbell size={28} /> Allenamenti
        </h1>
        <p className="text-muted-foreground">Gestisci i piani di allenamento dei tuoi clienti</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca allenamenti..."
              className="pl-8 w-full md:w-[250px]"
            value={searchQuery}
            onChange={handleSearch}
          />
          </div>

          <Select
            value={selectedClientId}
            onValueChange={setSelectedClientId}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Seleziona cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i clienti</SelectItem>
              {clients?.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="gap-1" 
          onClick={() => {
            setIsEditMode(false);
            setIsWorkoutDialogOpen(true);
          }}
        >
          <Plus size={16} /> Nuovo Piano
        </Button>
      </div>

          <WorkoutList 
            workouts={filteredWorkouts || []} 
            clients={clients || []}
            onView={handleViewWorkout} 
            onEdit={handleEditWorkout}
            isLoading={isLoadingPlans || isLoadingClients}
          />

      {/* WorkoutForm per creazione/modifica piani */}
      <WorkoutForm 
        isOpen={isWorkoutDialogOpen}
        onOpenChange={setIsWorkoutDialogOpen}
        onSave={handleSaveWorkout}
        isEditMode={isEditMode}
        currentPlan={isEditMode ? selectedPlanDetails : undefined}
        clients={clients || []}
      />

      {/* WorkoutDetails per visualizzazione dettagli piano */}
      <WorkoutDetails 
        selectedWorkout={selectedWorkout}
        selectedPlanDetails={selectedPlanDetails}
        clients={clients || []}
        onUpdateExerciseCompletion={handleUpdateExerciseCompletion}
        onEdit={() => {
          setIsEditMode(true);
          setIsWorkoutDialogOpen(true);
        }}
        onDelete={handleDelete}
        onClose={() => setSelectedWorkout(null)}
        isLoading={isLoadingDetails}
      />
    </div>
  );
};

export default Workouts;
