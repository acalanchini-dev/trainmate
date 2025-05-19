import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProfileImageUploadProps {
  clientId: string;
  currentImageUrl: string | null;
  clientName: string;
  onImageUpdated: (url: string | null) => void;
}

export function ProfileImageUpload({ clientId, currentImageUrl, clientName, onImageUpdated }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Funzione per ottenere le iniziali del nome del cliente
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Gestisce l'upload dell'immagine
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Verifica che il file sia un'immagine
    if (!file.type.startsWith('image/')) {
      toast("Errore: Per favore carica solo file immagine.");
      return;
    }
    
    // Verifica che la dimensione sia inferiore a 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast("Errore: La dimensione del file deve essere inferiore a 5MB.");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Genera un nome file univoco per evitare conflitti
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}-${Date.now()}.${fileExt}`;
      const filePath = `profile_pictures/${fileName}`;
      
      // Carica il file nel bucket client_media
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client_media')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Ottieni l'URL pubblico del file
      const { data: urlData } = supabase.storage
        .from('client_media')
        .getPublicUrl(filePath);
        
      // Se c'è già un'immagine esistente, elimina il vecchio file
      if (currentImageUrl) {
        // Estrai il percorso dal currentImageUrl
        const oldFilePath = currentImageUrl.split('/').slice(-2).join('/');
        if (oldFilePath) {
          await supabase.storage
            .from('client_media')
            .remove([oldFilePath]);
        }
      }
      
      // Aggiorna il client con il nuovo URL dell'immagine
      const { error: updateError } = await supabase
        .from('clients')
        .update({ profile_picture_url: urlData.publicUrl })
        .eq('id', clientId);
        
      if (updateError) throw updateError;
      
      // Notifica al componente padre che l'immagine è stata aggiornata
      onImageUpdated(urlData.publicUrl);
      
      toast("Immagine aggiornata con successo.");
    } catch (error: any) {
      console.error('Errore durante il caricamento dell\'immagine:', error);
      toast(`Impossibile caricare l'immagine: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Funzione per rimuovere l'immagine
  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;
    
    try {
      setIsUploading(true);
      
      // Estrai il percorso dal currentImageUrl
      const filePath = currentImageUrl.split('/').slice(-2).join('/');
      
      // Elimina il file dallo storage
      if (filePath) {
        await supabase.storage
          .from('client_media')
          .remove([filePath]);
      }
      
      // Aggiorna il client rimuovendo l'URL dell'immagine
      const { error: updateError } = await supabase
        .from('clients')
        .update({ profile_picture_url: null })
        .eq('id', clientId);
        
      if (updateError) throw updateError;
      
      // Notifica al componente padre che l'immagine è stata rimossa
      onImageUpdated(null);
      
      toast("Immagine rimossa con successo.");
    } catch (error: any) {
      console.error('Errore durante la rimozione dell\'immagine:', error);
      toast(`Impossibile rimuovere l'immagine: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <Avatar className="h-32 w-32 border-2 border-primary/20">
        {currentImageUrl ? (
          <AvatarImage src={currentImageUrl} alt={clientName} />
        ) : null}
        <AvatarFallback className="text-3xl bg-muted">
          {getInitials(clientName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={isUploading} 
          onClick={() => document.getElementById('profile-image-upload')?.click()}
        >
          {currentImageUrl ? 'Cambia foto' : 'Aggiungi foto'}
        </Button>
        
        {currentImageUrl && (
          <Button 
            variant="destructive" 
            size="sm"
            disabled={isUploading} 
            onClick={handleRemoveImage}
          >
            Rimuovi
          </Button>
        )}
        
        <input
          id="profile-image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
      
      {isUploading && (
        <div className="text-sm text-muted-foreground">
          Caricamento in corso...
        </div>
      )}
    </div>
  );
}
