import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dumbbell, LinkIcon, Trash, Mail } from 'lucide-react';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { TrainingPlan } from "@/hooks/use-training-plans";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClientInfo {
  id: string;
  name: string;
}

interface WorkoutDetailsProps {
  selectedWorkout: string | null;
  selectedPlanDetails: TrainingPlan | undefined;
  clients: ClientInfo[];
  onUpdateExerciseCompletion: (exerciseId: string, completed: boolean) => Promise<void>;
  onEdit: () => void;
  onDelete: (planId: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const WorkoutDetails = ({
  selectedWorkout,
  selectedPlanDetails,
  clients,
  onUpdateExerciseCompletion,
  onEdit,
  onDelete,
  onClose,
  isLoading
}: WorkoutDetailsProps) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  if (!selectedPlanDetails || isLoading) return null;

  const handleSendEmail = async () => {
    if (!email || !selectedPlanDetails.id) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSendingEmail(true);
      
      // Genera il PDF
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('generate-pdf', {
        body: {
          training_plan_id: selectedPlanDetails.id,
        },
      });

      if (pdfError) {
        throw new Error(`Errore nella generazione del PDF: ${pdfError.message}`);
      }

      const pdfUrl = pdfData.url;

      // Invia l'email con allegato
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email-training-plan', {
        body: {
          to: email,
          subject: `Piano di allenamento - ${selectedPlanDetails.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #0f172a; margin-top: 0;">Il tuo piano di allenamento</h1>
                <p>Ciao,</p>
                <p>Ti allego il piano di allenamento ${selectedPlanDetails.name} come richiesto.</p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px;">
                <p>Buon allenamento!</p>
              </div>
            </div>
          `,
          attachmentUrl: pdfUrl,
          filename: `${selectedPlanDetails.name}.pdf`
        },
      });

      if (emailError) {
        throw new Error(`Errore nell'invio dell'email: ${emailError.message}`);
      }

      toast({
        title: "Email inviata",
        description: "Il piano di allenamento è stato inviato via email con successo"
      });
      
      setIsEmailDialogOpen(false);
      setEmail('');
    } catch (error) {
      console.error("Errore nell'invio dell'email:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
      toast({
        title: "Errore",
        description: `Impossibile inviare l'email: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <Dialog open={selectedWorkout !== null} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell size={18} />
              {selectedPlanDetails.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground">Cliente</p>
            <p>{clients?.find(c => c.id === selectedPlanDetails.client_id)?.name}</p>
          </div>
          
          {selectedPlanDetails.description && (
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground">Descrizione</p>
              <p>{selectedPlanDetails.description}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Esercizi</h3>
            
            {selectedPlanDetails.exercises && selectedPlanDetails.exercises.length > 0 ? (
              selectedPlanDetails.exercises.map((exercise) => (
                <div key={exercise.id} className="border p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`complete-${exercise.id}`}
                        checked={!!exercise.completed}
                        onCheckedChange={(checked) => 
                          exercise.id && onUpdateExerciseCompletion(
                            exercise.id, 
                            !!checked
                          )
                        }
                      />
                      <h4 className={`font-medium ${exercise.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {exercise.name}
                      </h4>
                    </div>

                    {exercise.video_link && (
                      <a 
                        href={exercise.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <LinkIcon size={14} /> Video
                      </a>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Serie</p>
                      <p className="text-sm">{exercise.sets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ripetizioni</p>
                      <p className="text-sm">{exercise.reps}</p>
                    </div>
                    {exercise.notes && (
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-muted-foreground">Note</p>
                        <p className="text-sm">{exercise.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Nessun esercizio presente in questo piano.</p>
            )}
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                Modifica
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsEmailDialogOpen(true)}
              >
                <Mail size={14} className="mr-1" /> Invia via email
              </Button>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash size={14} className="mr-1" /> Elimina
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
                    <AlertDialogAction onClick={() => {
                      selectedPlanDetails.id && onDelete(selectedPlanDetails.id);
                    }}>
                      Elimina
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button variant="outline" size="sm" onClick={onClose}>
                Chiudi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog per invio email */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invia piano di allenamento
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Indirizzo email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Inserisci l'indirizzo email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)} disabled={isSendingEmail}>
              Annulla
            </Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail}>
              {isSendingEmail ? "Invio in corso..." : "Invia"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkoutDetails;
