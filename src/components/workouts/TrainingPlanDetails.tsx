import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Eye, Trash, Calendar, FileText, Info, Dumbbell, Link as LinkIcon, Clock, CalendarDays, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TrainingPlan } from "@/types/training";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendEmail } from "@/integrations/email/send-email";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TrainingPlanDetailsProps {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (planId: string) => void;
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: it });
  } catch (e) {
    return dateString;
  }
};

const TrainingPlanDetails: React.FC<TrainingPlanDetailsProps> = ({ planId, isOpen, onClose, onEdit, onDelete }) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');

  const { data: planDetails, isLoading, error } = useQuery({
    queryKey: ['trainingPlanDetails', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as TrainingPlan;
    },
    enabled: isOpen,
  });

  const generatePdf = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          training_plan_id: planId,
        },
      });

      if (error) {
        console.error("Errore nella generazione del file:", error);
        toast({
          title: "Errore",
          description: "Impossibile generare il PDF"
        });
        return;
      }

      const pdfUrl = data.url;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error("Errore nella generazione del file:", error);
      toast({
        title: "Errore",
        description: "Impossibile generare il PDF"
      });
      return;
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleteDialogOpen(false);
      await onDelete(planId);
      onClose();
    } catch (error) {
      console.error("Errore nell'eliminazione del piano:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il piano di allenamento",
        variant: "destructive"
      });
    }
  };

  const handleSendEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          training_plan_id: planId,
        },
      });

      if (error) {
        console.error("Errore nella generazione del file:", error);
        toast({
          title: "Errore",
          description: "Impossibile generare il PDF"
        });
        return;
      }

      const pdfUrl = data.url;

      if (!email) {
        toast({
          title: "Errore",
          description: "Inserisci un indirizzo email valido",
          variant: "destructive"
        });
        return;
      }

      // Utilizziamo la funzione send-email-training-plan per inviare email con allegati
      const emailResponse = await supabase.functions.invoke('send-email-training-plan', {
        body: {
        to: email,
          subject: `Piano di allenamento - ${planDetails?.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h1 style="color: #0f172a; margin-top: 0;">Il tuo piano di allenamento</h1>
                <p>Ciao,</p>
                <p>Ti allego il piano di allenamento come richiesto.</p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px;">
                <p>Buon allenamento!</p>
              </div>
            </div>
          `,
          attachmentUrl: pdfUrl,
          filename: `${planDetails?.name}.pdf`
        },
      });

      if (emailResponse.error) {
        throw new Error(emailResponse.error);
      }

      toast({
        title: "Email inviata",
        description: "Il piano di allenamento è stato inviato via email"
      });
      setIsEmailDialogOpen(false);
    } catch (error: unknown) {
      console.error("Errore nell'invio dell'email:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
      toast({
        title: "Errore",
        description: `Impossibile inviare l'email: ${errorMessage}`
      });
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/piano/${planId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copiato",
        description: "Il link al piano di allenamento è stato copiato negli appunti"
      });
    });
  };

  if (!isOpen) return null;

  if (isLoading) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Caricamento...</DialogTitle>
        </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !planDetails) {
    console.error("Errore nel rendering del piano:", error);
    toast({
      title: "Errore",
      description: "Impossibile visualizzare i dettagli del piano"
    });
    onClose();
    return null;
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              {planDetails.name}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Sezione Informazioni Generali */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Informazioni Generali
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Nome</Label>
                      <p className="text-sm font-medium">{planDetails.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Creato il</Label>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(planDetails.created_at || '')}
                      </p>
                    </div>
                  </div>
                  {planDetails.description && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Descrizione</Label>
                      <p className="text-sm">{planDetails.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sezione Esercizi */}
              {planDetails.exercises && planDetails.exercises.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Esercizi
                    </CardTitle>
                    <CardDescription>
                      Lista degli esercizi inclusi nel piano
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {planDetails.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <Badge variant="outline">{index + 1}</Badge>
                              {exercise.name}
                            </h4>
                            {exercise.video_link && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(exercise.video_link, '_blank')}
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Guarda il video dell'esercizio</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Serie</Label>
                              <p className="font-medium">{exercise.sets}</p>
          </div>
                            <div>
                              <Label className="text-muted-foreground">Ripetizioni</Label>
                              <p className="font-medium">{exercise.reps}</p>
          </div>
        </div>
                          {exercise.notes && (
                            <div className="mt-2">
                              <Label className="text-sm text-muted-foreground">Note</Label>
                              <p className="text-sm">{exercise.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <Separator className="my-4" />
          
          {/* Azioni */}
        <div className="flex justify-between">
          <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
            <Button onClick={generatePdf}>
              <FileText className="mr-2 h-4 w-4" />
                    PDF
            </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Scarica il piano in formato PDF</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(true)}>
              <Calendar className="mr-2 h-4 w-4" />
                    Email
            </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Invia il piano via email</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Condividi
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copia il link pubblico del piano</p>
                </TooltipContent>
              </Tooltip>
          </div>
            
          <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Modifica il piano di allenamento</p>
                </TooltipContent>
              </Tooltip>
              
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Elimina
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non può essere annullata. Vuoi davvero eliminare questo piano di allenamento?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
      </Dialog>

      {/* Dialog per l'invio email */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
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
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSendEmail}>
              Invia
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default TrainingPlanDetails;
