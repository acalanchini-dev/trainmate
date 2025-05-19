
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Exercise, TrainingPlan } from "@/hooks/use-training-plans";
import { X, Plus } from 'lucide-react';

interface WorkoutFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TrainingPlan) => Promise<void>;
  isEditMode: boolean;
  currentPlan?: TrainingPlan;
  clients: any[];
}

const WorkoutForm = ({
  isOpen,
  onOpenChange,
  onSave,
  isEditMode,
  currentPlan,
  clients
}: WorkoutFormProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([
    { training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: 1 }
  ]);

  const form = useForm<TrainingPlan>({
    defaultValues: {
      name: '',
      description: '',
      client_id: '',
    }
  });

  // Resetta il form quando si apre il dialog per un nuovo piano
  useEffect(() => {
    if (isOpen && !isEditMode) {
      form.reset({
        name: '',
        description: '',
        client_id: '',
      });
      setExercises([{ training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: 1 }]);
    }
  }, [isOpen, isEditMode, form]);

  // Carica i dati del piano quando si entra in modalità modifica
  useEffect(() => {
    if (isEditMode && currentPlan) {
      form.reset({
        id: currentPlan.id,
        name: currentPlan.name,
        description: currentPlan.description || '',
        client_id: currentPlan.client_id,
      });
      
      if (currentPlan.exercises && currentPlan.exercises.length > 0) {
        setExercises(currentPlan.exercises);
      } else {
        setExercises([{ training_plan_id: currentPlan.id || '', name: "", sets: 3, reps: "", notes: "", order: 1 }]);
      }
    }
  }, [isEditMode, currentPlan, form]);

  const addNewExercise = () => {
    const newOrder = exercises.length > 0 ? Math.max(...exercises.map(ex => ex.order || 0)) + 1 : 1;
    setExercises([...exercises, { training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: newOrder }]);
  };

  const removeExercise = (index: number) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    
    // Aggiorna gli indici di ordinamento
    const updatedExercises = newExercises.map((ex, idx) => ({
      ...ex,
      order: idx + 1
    }));
    
    setExercises(updatedExercises);
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
    const updatedExercises = exercises.map((exercise, i) => {
      if (i === index) {
        return { ...exercise, [field]: value };
      }
      return exercise;
    });
    setExercises(updatedExercises);
  };

  // Gestisce il salvataggio del piano di allenamento
  const handleSaveWorkout = async (data: TrainingPlan) => {
    const planToSave: TrainingPlan = {
      ...data,
      exercises: exercises.map((ex, index) => ({
        ...ex,
        training_plan_id: data.id || '',
        order: index + 1
      }))
    };

    try {
      await onSave(planToSave);
      onOpenChange(false);
    } catch (error) {
      console.error("Errore nel salvataggio del piano:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifica Piano di Allenamento' : 'Crea Nuovo Piano di Allenamento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveWorkout)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Piano</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome del piano di allenamento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    disabled={isEditMode}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Descrizione del piano di allenamento" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="border-t my-4"></div>
            <h3 className="font-medium text-lg">Esercizi</h3>
            
            {exercises.map((exercise, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 border p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Esercizio {index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeExercise(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`exercise-name-${index}`}>Nome Esercizio</Label>
                    <Input 
                      id={`exercise-name-${index}`} 
                      placeholder="Nome esercizio" 
                      value={exercise.name} 
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor={`exercise-sets-${index}`}>Serie</Label>
                      <Input 
                        id={`exercise-sets-${index}`} 
                        type="number" 
                        placeholder="Serie" 
                        value={exercise.sets} 
                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2 w-1/2">
                      <Label htmlFor={`exercise-reps-${index}`}>Ripetizioni</Label>
                      <Input 
                        id={`exercise-reps-${index}`} 
                        placeholder="es: 8-10, Max, 30sec" 
                        value={exercise.reps} 
                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`exercise-notes-${index}`}>Note</Label>
                  <Input 
                    id={`exercise-notes-${index}`} 
                    placeholder="Note aggiuntive" 
                    value={exercise.notes || ""} 
                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`exercise-video-${index}`}>Link Video (opzionale)</Label>
                  <Input 
                    id={`exercise-video-${index}`} 
                    placeholder="URL al video dimostrativo" 
                    value={exercise.video_link || ""} 
                    onChange={(e) => handleExerciseChange(index, 'video_link', e.target.value)}
                  />
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addNewExercise} className="gap-1">
              <Plus size={16} /> Aggiungi Esercizio
            </Button>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit">
                {isEditMode ? 'Aggiorna Piano' : 'Salva Piano'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutForm;
