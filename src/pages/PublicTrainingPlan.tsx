import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Video } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  notes?: string;
  video_link?: string;
  order?: number;
  group_id?: string;
}

interface ExerciseGroup {
  id?: string;
  title: string;
  order: number;
  exercises?: Exercise[];
}

interface TrainingPlan {
  id: string;
  name: string;
  description?: string;
  exercise_groups?: ExerciseGroup[];
  exercises?: Exercise[];
}

export default function PublicTrainingPlan() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        // Ottieni il piano di allenamento
        const { data: planData, error: planError } = await supabase
          .from('training_plans')
          .select('*')
          .eq('id', id)
          .single();

        if (planError) throw planError;

        // Ottieni i gruppi del piano
        const { data: groups, error: groupsError } = await supabase
          .from('exercise_groups')
          .select('*')
          .eq('training_plan_id', id)
          .order('order');

        if (groupsError) throw groupsError;

        const completePlan: TrainingPlan = { ...planData };

        // Se ci sono gruppi, per ciascuno ottieni gli esercizi
        if (groups && groups.length > 0) {
          const groupsWithExercises = await Promise.all(
            groups.map(async (group) => {
              const { data: exercises, error: exercisesError } = await supabase
                .from('exercises')
                .select('*')
                .eq('training_plan_id', id)
                .eq('group_id', group.id)
                .order('order');

              if (exercisesError) throw exercisesError;

              return {
                ...group,
                exercises: exercises || [],
              };
            })
          );

          completePlan.exercise_groups = groupsWithExercises;
        } else {
          // Se non ci sono gruppi, ottieni tutti gli esercizi
          const { data: exercises, error: exercisesError } = await supabase
            .from('exercises')
            .select('*')
            .eq('training_plan_id', id)
            .order('order');

          if (exercisesError) throw exercisesError;

          if (exercises && exercises.length > 0) {
            completePlan.exercise_groups = [{
              id: 'default',
              title: 'Esercizi',
              order: 1,
              exercises: exercises
            }];
          }
        }

        setPlan(completePlan);
      } catch (error) {
        console.error('Errore nel caricamento del piano:', error);
        setError('Impossibile caricare il piano di allenamento');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPlan();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Errore</h1>
          <p className="text-gray-600">{error || 'Piano di allenamento non trovato'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-trainmate-600 text-2xl font-bold">Train</span>
              <span className="text-gray-800 text-2xl font-bold">Mate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{plan.name}</h1>
          {plan.description && (
            <p className="text-gray-600 mb-8 whitespace-pre-line">{plan.description}</p>
          )}

          <div className="space-y-8">
            {plan.exercise_groups?.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {group.exercises?.map((exercise, index) => (
                      <div key={exercise.id}>
                        {index > 0 && <Separator className="my-4" />}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{exercise.name}</h3>
                            {exercise.video_link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary"
                                onClick={() => window.open(exercise.video_link, '_blank')}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Guarda il video
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Serie: {exercise.sets} | Ripetizioni: {exercise.reps}</p>
                            {exercise.notes && (
                              <p className="mt-1">Note: {exercise.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} TrainMate. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </div>
  );
} 