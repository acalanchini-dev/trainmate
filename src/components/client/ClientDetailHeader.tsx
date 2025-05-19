
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ClientForm } from "@/components/ClientForm";
import { Client, ClientFormData } from "@/types/client";
import { Edit, Trash } from "lucide-react";
import { ProfileImageUpload } from "./ProfileImageUpload";

interface ClientDetailHeaderProps {
  client: Client;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  onUpdateClient: (data: ClientFormData) => void;
  onDeleteClient: () => void;
  updateClientPending: boolean;
}

export function ClientDetailHeader({
  client,
  isEditDialogOpen,
  setIsEditDialogOpen,
  onUpdateClient,
  onDeleteClient,
  updateClientPending
}: ClientDetailHeaderProps) {
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | null>(client.profile_picture_url);

  // Aggiungiamo log per tracciare lo stato del dialog
  useEffect(() => {
    console.log("[ClientDetailHeader] Stato dialog:", isEditDialogOpen);
    console.log("[ClientDetailHeader] updateClientPending:", updateClientPending);
  }, [isEditDialogOpen, updateClientPending]);

  const handleProfileImageUpdated = (url: string | null) => {
    setProfileImageUrl(url);
  };
  
  const handleSubmit = async (data: ClientFormData) => {
    console.log("[ClientDetailHeader] Invio dati del form:", data);
    try {
      await onUpdateClient(data);
    } catch (error) {
      console.error("[ClientDetailHeader] Errore nell'aggiornamento:", error);
    }
  };

  return (
    <div className="md:flex justify-between items-start">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <ProfileImageUpload
          clientId={client.id}
          currentImageUrl={profileImageUrl}
          clientName={client.name}
          onImageUpdated={handleProfileImageUpdated}
        />
        
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <div className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
            client.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {client.status === "active" ? "Attivo" : "Inattivo"}
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-4 md:mt-0">
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          console.log("[ClientDetailHeader] Dialog stato cambiato a:", open);
          setIsEditDialogOpen(open);
        }}>
          <Button variant="outline" size="sm" onClick={() => {
            console.log("[ClientDetailHeader] Pulsante modifica cliccato");
            setIsEditDialogOpen(true);
          }}>
            <Edit className="mr-2 h-4 w-4" /> Modifica
          </Button>
          
          <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => {
            if (updateClientPending) {
              e.preventDefault();
              console.log("[ClientDetailHeader] Interazione esterna bloccata durante il salvataggio");
            }
          }}>
            <DialogHeader>
              <DialogTitle>Modifica Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm
              defaultValues={client}
              onSubmit={handleSubmit}
              isSubmitting={updateClientPending}
            />
          </DialogContent>
        </Dialog>

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
                Questa azione non può essere annullata. Questa operazione eliminerà permanentemente il cliente e tutti i dati associati.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteClient} className="bg-destructive text-destructive-foreground">
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
