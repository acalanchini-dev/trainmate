import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrainingPlan } from "@/types/training";
import { useTrainingPlans } from "@/hooks/use-training-plans";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import TrainingPlanDetails from "@/components/workouts/TrainingPlanDetails";

interface ClientTrainingPlansListProps {
  trainingPlans: TrainingPlan[];
  isLoading: boolean;
  onNewPlanClick: () => void;
  clientId: string;
  clientName: string;
}

export function ClientTrainingPlansList({ 
  trainingPlans, 
  isLoading, 
  onNewPlanClick,
  clientId,
  clientName
}: ClientTrainingPlansListProps) {
  const { useTrainingPlanDetails, updateTrainingPlan, deleteTrainingPlan } = useTrainingPlans(clientId);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localTrainingPlans, setLocalTrainingPlans] = useState<TrainingPlan[]>([]);
  
  const { data: selectedPlanDetails, isLoading: isLoadingDetails } = useTrainingPlanDetails(selectedPlanId || undefined);

  // Sincronizza i piani di allenamento ricevuti dalle props con lo stato locale
  useEffect(() => {
    if (trainingPlans) {
      setLocalTrainingPlans(trainingPlans);
    }
  }, [trainingPlans]);
  
  const handleViewPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleUpdatePlan = async (planData: TrainingPlan) => {
    try {
      await updateTrainingPlan({
        ...planData,
        client_id: clientId
      });
      toast("Piano aggiornato", {
        description: "Il piano di allenamento è stato aggiornato con successo",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Errore nell'aggiornamento del piano:", error);
      toast("Errore", {
        description: "Impossibile aggiornare il piano di allenamento",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteTrainingPlan(planId);
      
      // Aggiorna immediatamente lo stato locale per rimuovere il piano eliminato
      setLocalTrainingPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      // Se il piano che è stato eliminato è quello attualmente selezionato, chiudi il dettaglio
      if (selectedPlanId === planId) {
        setSelectedPlanId(null);
      }
    } catch (error) {
      console.error("Errore nell'eliminazione del piano:", error);
      toast("Errore", {
        description: "Impossibile eliminare il piano di allenamento",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Piani di Allenamento</CardTitle>
        <Button size="sm" onClick={onNewPlanClick}>
          Nuovo Piano
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : localTrainingPlans && localTrainingPlans.length > 0 ? (
          <div className="space-y-4">
            {localTrainingPlans.map(plan => (
              <div key={plan.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{plan.name}</h3>
                {plan.description && (
                  <p className="text-sm mt-2">{plan.description}</p>
                )}
                <div className="flex justify-end mt-3 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewPlan(plan.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> Visualizza
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Modifica
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash className="mr-2 h-4 w-4" /> Elimina
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Questa azione non può essere annullata. Il piano di allenamento verrà eliminato permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>Elimina</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nessun piano di allenamento assegnato
          </div>
        )}
      </CardContent>

      {/* Visualizza dettagli del piano */}
      {selectedPlanId && (
        <TrainingPlanDetails
          planId={selectedPlanId}
          isOpen={!!selectedPlanId && !isEditDialogOpen}
          onClose={() => setSelectedPlanId(null)}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={handleDeletePlan}
        />
      )}

      {/* Modifica piano */}
      {selectedPlanId && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifica Piano di Allenamento</DialogTitle>
            </DialogHeader>
            <WorkoutForm
              isOpen={true}
              onOpenChange={setIsEditDialogOpen}
              onSave={handleUpdatePlan}
              isEditMode={true}
              currentPlan={selectedPlanDetails}
              clients={[{ id: clientId, name: clientName }]}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
