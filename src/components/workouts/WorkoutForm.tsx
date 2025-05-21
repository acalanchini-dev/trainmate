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
import { Exercise, ExerciseGroup, TrainingPlan } from "@/types/training";
import { X, Plus, Dumbbell } from 'lucide-react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ClientInfo {
  id: string;
  name: string;
}

interface WorkoutFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TrainingPlan) => Promise<void>;
  isEditMode: boolean;
  currentPlan?: TrainingPlan;
  clients: ClientInfo[];
}

const WorkoutForm = ({
  isOpen,
  onOpenChange,
  onSave,
  isEditMode,
  currentPlan,
  clients
}: WorkoutFormProps) => {
  const [groups, setGroups] = useState<ExerciseGroup[]>([
    { training_plan_id: '', title: "Gruppo 1", order: 1, exercises: [
      { training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: 1 }
    ]}
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
      setGroups([
        { training_plan_id: '', title: "Gruppo 1", order: 1, exercises: [
          { training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: 1 }
        ]}
      ]);
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
      
      // Gestione dei piani con il vecchio formato (senza gruppi)
      if (currentPlan.exercise_groups && currentPlan.exercise_groups.length > 0) {
        setGroups(currentPlan.exercise_groups);
      } else if (currentPlan.exercises && currentPlan.exercises.length > 0) {
        // Conversione dal vecchio formato: tutti gli esercizi in un unico gruppo
        setGroups([
          { 
            training_plan_id: currentPlan.id || '', 
            title: "Gruppo 1", 
            order: 1, 
            exercises: currentPlan.exercises 
          }
        ]);
      } else {
        setGroups([
          { training_plan_id: currentPlan.id || '', title: "Gruppo 1", order: 1, exercises: [
            { training_plan_id: currentPlan.id || '', name: "", sets: 3, reps: "", notes: "", order: 1 }
          ]}
        ]);
      }
    }
  }, [isEditMode, currentPlan, form]);

  const addNewGroup = () => {
    const newOrder = groups.length > 0 ? Math.max(...groups.map(g => g.order || 0)) + 1 : 1;
    setGroups([...groups, { 
      training_plan_id: '', 
      title: `Gruppo ${newOrder}`, 
      order: newOrder,
      exercises: [{ training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: 1 }]
    }]);
  };

  const removeGroup = (groupIndex: number) => {
    if (groups.length <= 1) {
      return; // Mantenere almeno un gruppo
    }
    
    const newGroups = [...groups];
    newGroups.splice(groupIndex, 1);
    
    // Aggiorna gli indici di ordinamento
    const updatedGroups = newGroups.map((group, idx) => ({
      ...group,
      order: idx + 1
    }));
    
    setGroups(updatedGroups);
  };

  const handleGroupChange = (groupIndex: number, field: keyof ExerciseGroup, value: string | number) => {
    const updatedGroups = groups.map((group, i) => {
      if (i === groupIndex) {
        return { ...group, [field]: value };
      }
      return group;
    });
    setGroups(updatedGroups);
  };

  const addNewExercise = (groupIndex: number) => {
    const group = groups[groupIndex];
    const exercises = group.exercises || [];
    const newOrder = exercises.length > 0 ? Math.max(...exercises.map(ex => ex.order || 0)) + 1 : 1;
    
    const updatedGroups = groups.map((g, i) => {
      if (i === groupIndex) {
        return {
          ...g,
          exercises: [...exercises, { training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: newOrder }]
        };
      }
      return g;
    });
    
    setGroups(updatedGroups);
  };

  const removeExercise = (groupIndex: number, exerciseIndex: number) => {
    const group = groups[groupIndex];
    const newExercises = [...(group.exercises || [])];
    newExercises.splice(exerciseIndex, 1);
    
    // Se non ci sono più esercizi, aggiungiamo uno vuoto
    if (newExercises.length === 0) {
      newExercises.push({ training_plan_id: '', name: "", sets: 3, reps: "", notes: "", order: 1 });
    } else {
      // Aggiorniamo gli indici di ordinamento
      newExercises.forEach((ex, idx) => {
        ex.order = idx + 1;
      });
    }
    
    const updatedGroups = groups.map((g, i) => {
      if (i === groupIndex) {
        return { ...g, exercises: newExercises };
      }
      return g;
    });
    
    setGroups(updatedGroups);
  };

  const handleExerciseChange = (groupIndex: number, exerciseIndex: number, field: keyof Exercise, value: string | number) => {
    const updatedGroups = groups.map((group, i) => {
      if (i === groupIndex) {
        const updatedExercises = (group.exercises || []).map((exercise, j) => {
          if (j === exerciseIndex) {
            return { ...exercise, [field]: value };
          }
          return exercise;
        });
        return { ...group, exercises: updatedExercises };
      }
      return group;
    });
    setGroups(updatedGroups);
  };

  // Gestisce il salvataggio del piano di allenamento
  const handleSaveWorkout = async (data: TrainingPlan) => {
    // Prepariamo i gruppi con gli esercizi per il salvataggio
    const exerciseGroups = groups.map((group, groupIndex) => ({
      ...group,
      training_plan_id: data.id || '',
      order: groupIndex + 1,
      exercises: (group.exercises || []).map((ex, exIndex) => ({
        ...ex,
        training_plan_id: data.id || '',
        group_id: group.id, // Sarà undefined per nuovi gruppi, ma verrà assegnato dopo la creazione
        order: exIndex + 1
      }))
    }));

    const planToSave: TrainingPlan = {
      ...data,
      exercise_groups: exerciseGroups
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
            <h3 className="font-medium text-lg mb-4">Gruppi di Esercizi</h3>
            
            <Accordion type="multiple" defaultValue={groups.map((_, i) => `item-${i}`)}>
              {groups.map((group, groupIndex) => (
                <AccordionItem value={`item-${groupIndex}`} key={groupIndex} className="border p-0">
                  <AccordionTrigger className="px-3 py-2">
                    <div className="flex items-center gap-2 w-full">
                      <Dumbbell size={16} />
                      <Input 
                        className="max-w-[200px] py-1 h-auto"
                        placeholder="Nome gruppo" 
                        value={group.title} 
                        onChange={(e) => handleGroupChange(groupIndex, 'title', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {groups.length > 1 && (
                        <div 
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGroup(groupIndex);
                          }}
                        >
                          <X size={14} />
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-3 pb-3">
                    {(group.exercises || []).map((exercise, exerciseIndex) => (
                      <Card key={exerciseIndex} className="mb-3 border">
                        <CardHeader className="p-3 pb-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm">Esercizio {exerciseIndex + 1}</h4>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeExercise(groupIndex, exerciseIndex)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-3 pt-2 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`exercise-name-${groupIndex}-${exerciseIndex}`}>Nome Esercizio</Label>
                              <Input 
                                id={`exercise-name-${groupIndex}-${exerciseIndex}`} 
                                placeholder="Nome esercizio" 
                                value={exercise.name} 
                                onChange={(e) => handleExerciseChange(groupIndex, exerciseIndex, 'name', e.target.value)}
                              />
                            </div>
                            
                            <div className="flex gap-4">
                              <div className="space-y-2 w-1/2">
                                <Label htmlFor={`exercise-sets-${groupIndex}-${exerciseIndex}`}>Serie</Label>
                                <Input 
                                  id={`exercise-sets-${groupIndex}-${exerciseIndex}`} 
                                  type="number" 
                                  placeholder="Serie" 
                                  value={exercise.sets} 
                                  onChange={(e) => handleExerciseChange(groupIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2 w-1/2">
                                <Label htmlFor={`exercise-reps-${groupIndex}-${exerciseIndex}`}>Ripetizioni</Label>
                                <Input 
                                  id={`exercise-reps-${groupIndex}-${exerciseIndex}`} 
                                  placeholder="es: 8-10, Max, 30sec" 
                                  value={exercise.reps} 
                                  onChange={(e) => handleExerciseChange(groupIndex, exerciseIndex, 'reps', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`exercise-notes-${groupIndex}-${exerciseIndex}`}>Note</Label>
                            <Input 
                              id={`exercise-notes-${groupIndex}-${exerciseIndex}`} 
                              placeholder="Note aggiuntive" 
                              value={exercise.notes || ""} 
                              onChange={(e) => handleExerciseChange(groupIndex, exerciseIndex, 'notes', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`exercise-video-${groupIndex}-${exerciseIndex}`}>Link Video (opzionale)</Label>
                            <Input 
                              id={`exercise-video-${groupIndex}-${exerciseIndex}`} 
                              placeholder="URL al video dimostrativo" 
                              value={exercise.video_link || ""} 
                              onChange={(e) => handleExerciseChange(groupIndex, exerciseIndex, 'video_link', e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button type="button" variant="outline" onClick={() => addNewExercise(groupIndex)} size="sm" className="gap-1 w-full">
                      <Plus size={14} /> Aggiungi Esercizio
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <Button type="button" variant="outline" onClick={addNewGroup} className="gap-1 w-full">
              <Plus size={16} /> Aggiungi Gruppo
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
