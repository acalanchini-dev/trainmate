import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { useClientDetails } from "@/hooks/client/use-client-details";
import { useTrainingPlans } from "@/hooks/use-training-plans";
import { ClientFormData } from "@/types/client";
import { ClientDetailHeader } from "./ClientDetailHeader";
import { ClientDetailTabs } from "./ClientDetailTabs";
import WorkoutForm from "@/components/workouts/WorkoutForm";
import { ClientDetailLoading } from "./ClientDetailLoading";
import { ClientDetailNotFound } from "./ClientDetailNotFound";
import { toast } from "@/hooks/use-toast";

export function ClientDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateClient, deleteClient } = useClients();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewPlanDialogOpen, setIsNewPlanDialogOpen] = useState(false);
  const { createTrainingPlan } = useTrainingPlans(id);
  
  // Utilizziamo il hook per caricare i dati del cliente
  const { 
    client, 
    isLoading, 
    appointments, 
    isLoadingAppointments, 
    trainingPlans, 
    isLoadingTrainingPlans,
    refetchTrainingPlans,
    refetchClient 
  } = useClientDetails(id);

  // Aggiungiamo un effetto per debugging
  useEffect(() => {
    console.log("[ClientDetailContainer] Stato della finestra di modifica:", isEditDialogOpen);
    console.log("[ClientDetailContainer] Dati del cliente caricati:", client);
  }, [isEditDialogOpen, client]);

  // Utilizziamo un ID univoco per il toast di aggiornamento
  const handleUpdateClient = async (data: ClientFormData) => {
    if (!id || !client) {
      console.error("[ClientDetailContainer] ID cliente o dati cliente mancanti");
      toast("Errore: dati cliente non disponibili");
      return;
    }
    
    console.log("[ClientDetailContainer] Inizio aggiornamento cliente con ID:", id);
    console.log("[ClientDetailContainer] Dati da inviare:", data);
    
    try {
      // Aggiunta di stato di caricamento visibile nel form
      console.log("[ClientDetailContainer] Chiamata updateClient.mutateAsync...");
      
      const result = await updateClient.mutateAsync({
        id,
        ...data
      });
      
      console.log("[ClientDetailContainer] Aggiornamento completato, risultato:", result);
      
      // Ricarica esplicitamente i dati del cliente e mostra feedback visivo
      try {
        console.log("[ClientDetailContainer] Chiamata refetchClient per aggiornare i dati visualizzati");
        const refreshSuccess = await refetchClient();
        console.log("[ClientDetailContainer] Risultato refetchClient:", refreshSuccess);
        
        // Il toast di successo è gestito nel hook useClients
        setIsEditDialogOpen(false);
      } catch (refetchError) {
        console.error("[ClientDetailContainer] Errore nel refresh dei dati:", refetchError);
        toast("Cliente aggiornato ma è necessario ricaricare la pagina per vedere le modifiche");
      }
    } catch (error) {
      console.error("[ClientDetailContainer] Errore nell'aggiornamento del cliente:", error);
      toast("Errore nell'aggiornamento del cliente. Riprova più tardi.");
    }
  };

  const handleDeleteClient = async () => {
    if (!id) return;
    
    try {
      await deleteClient.mutateAsync(id);
      // Il toast di successo è già gestito nel hook useClients
      navigate('/clienti');
    } catch (error) {
      // Manteniamo solo il log dell'errore poiché il toast è già gestito nel hook
      console.error("[ClientDetailContainer] Errore nell'eliminazione del cliente:", error);
    }
  };

  const handleSaveTrainingPlan = async (planData: TrainingPlan) => {
    try {
      await createTrainingPlan(planData);
      refetchTrainingPlans();
      setIsNewPlanDialogOpen(false);
      // toast({
      //   title: " creato",
      //   description: "Il nuovo piano di allenamento è stato creato con successo",
      //   id: `training-plan-created-${planData.client_id}-${Date.now()}`
      // });
    } catch (error) {
      console.error("[ClientDetailContainer] Errore nel salvataggio del piano:", error);
    }
  };

  if (isLoading) {
    return <ClientDetailLoading />;
  }

  if (!client) {
    return <ClientDetailNotFound />;
  }

  return (
    <div className="space-y-6">
      <ClientDetailHeader
        client={client}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        onUpdateClient={handleUpdateClient}
        onDeleteClient={handleDeleteClient}
        updateClientPending={updateClient.isPending}
      />

      <ClientDetailTabs
        client={client}
        appointments={appointments || []}
        trainingPlans={trainingPlans || []}
        isLoadingAppointments={isLoadingAppointments}
        isLoadingTrainingPlans={isLoadingTrainingPlans}
        onNewPlanClick={() => setIsNewPlanDialogOpen(true)}
      />
      
      {/* Form per la creazione del piano di allenamento */}
      <WorkoutForm
        isOpen={isNewPlanDialogOpen}
        onOpenChange={setIsNewPlanDialogOpen}
        onSave={handleSaveTrainingPlan}
        isEditMode={false}
        clients={client ? [{ id: client.id, name: client.name }] : []}
      />
    </div>
  );
}
