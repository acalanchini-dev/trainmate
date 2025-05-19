
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrainingPlan } from "@/hooks/use-training-plans";

interface WorkoutListProps {
  workouts: TrainingPlan[];
  clients: any[];
  onView: (workoutId: string) => void;
  onEdit: (workoutId: string) => void;
  isLoading: boolean;
}

const WorkoutList = ({ workouts, clients, onView, onEdit, isLoading }: WorkoutListProps) => {
  if (isLoading) {
    return (
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">Nessun piano di allenamento trovato</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-4 grid md:grid-cols-2 gap-4">
      {workouts.map(workout => (
        <Card key={workout.id} className="p-6">
          <h3 className="text-lg font-medium">{workout.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Cliente: {clients.find(c => c.id === workout.client_id)?.name || "Cliente non trovato"}
          </p>
          
          <p className="text-xs text-muted-foreground">
            {workout.exercises?.length || 0} esercizi • Creato il {workout.created_at ? formatDate(workout.created_at) : "N/A"}
          </p>
          
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => workout.id && onView(workout.id)}
            >
              Visualizza
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => workout.id && onEdit(workout.id)}
            >
              Modifica
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default WorkoutList;
