import { create } from 'zustand';
import { toast } from "@/hooks/use-toast";

// Tipi di notifica supportati
export type NotificationType = 
  | 'training-plan-created'
  | 'training-plan-updated'
  | 'training-plan-deleted'
  | 'client-created'
  | 'client-updated'
  | 'client-deleted'
  | 'appointment-created'
  | 'appointment-updated'
  | 'appointment-deleted';

// Interfaccia per i metadati delle notifiche
interface NotificationMetadata {
  id: string;
  timestamp: number;
}

// Store per tenere traccia delle notifiche recenti
interface NotificationStore {
  recentNotifications: Record<string, NotificationMetadata>;
  addNotification: (type: NotificationType, entityId: string) => string | null;
  clearOldNotifications: () => void;
}

// Creazione dello store con Zustand
const useNotificationStore = create<NotificationStore>((set, get) => ({
  recentNotifications: {},
  
  // Aggiunge una notifica e restituisce l'ID se è nuova, null se è duplicata
  addNotification: (type: NotificationType, entityId: string) => {
    const key = `${type}-${entityId}`;
    const currentTime = Date.now();
    const recentNotifications = get().recentNotifications;
    
    // Controlla se esiste già una notifica recente (entro 2 secondi)
    const existing = recentNotifications[key];
    if (existing && (currentTime - existing.timestamp < 2000)) {
      console.log(`Notifica duplicata evitata: ${key}`);
      return null;
    }
    
    // Genera un ID univoco per la notifica
    const notificationId = `${key}-${currentTime}`;
    
    // Aggiorna lo store
    set({
      recentNotifications: {
        ...recentNotifications,
        [key]: { id: notificationId, timestamp: currentTime }
      }
    });
    
    return notificationId;
  },
  
  // Rimuove notifiche più vecchie di 10 secondi
  clearOldNotifications: () => {
    const recentNotifications = get().recentNotifications;
    const currentTime = Date.now();
    const updatedNotifications = { ...recentNotifications };
    
    Object.entries(updatedNotifications).forEach(([key, metadata]) => {
      if (currentTime - metadata.timestamp > 10000) {
        delete updatedNotifications[key];
      }
    });
    
    set({ recentNotifications: updatedNotifications });
  }
}));

// Hook principale per gestire le notifiche
export const useNotificationService = () => {
  // Funzione per pulire periodicamente lo store
  React.useEffect(() => {
    const interval = setInterval(() => {
      useNotificationStore.getState().clearOldNotifications();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Funzioni per le notifiche relative ai piani di allenamento
  // const notifyTrainingPlanCreated = (planId: string, planName?: string) => {
  //   const notificationId = useNotificationStore.getState().addNotification('training-plan-created', planId);
  //   if (notificationId) {
  //     toast({
  //       title: "Piano di allenamento creato",
  //       description: planName 
  //         ? `Il piano "${planName}" è stato creato con successo`
  //         : "Il nuovo piano di allenamento è stato creato con successo",
  //       id: notificationId,
  //       variant: "success"
  //     });
  //   }
  // };
  
  const notifyTrainingPlanUpdated = (planId: string, planName?: string) => {
    const notificationId = useNotificationStore.getState().addNotification('training-plan-updated', planId);
    if (notificationId) {
      toast({
        title: "Piano aggiornato",
        description: planName 
          ? `Il piano "${planName}" è stato aggiornato con successo`
          : "Il piano di allenamento è stato aggiornato con successo",
        id: notificationId,
        variant: "success"
      });
    }
  };
  
  const notifyTrainingPlanDeleted = (planId: string, planName?: string) => {
    const notificationId = useNotificationStore.getState().addNotification('training-plan-deleted', planId);
    if (notificationId) {
      toast({
        title: "Piano eliminato",
        description: planName 
          ? `Il piano "${planName}" è stato eliminato con successo`
          : "Il piano di allenamento è stato eliminato con successo",
        id: notificationId,
        variant: "success"
      });
    }
  };
  
  // Funzioni per gestire gli errori
  const notifyError = (message: string, details?: string) => {
    toast({
      title: "Errore",
      description: details || message,
      variant: "destructive",
      id: `error-${Date.now()}`
    });
  };
  
  return {
    notifyTrainingPlanCreated,
    notifyTrainingPlanUpdated,
    notifyTrainingPlanDeleted,
    notifyError
  };
}; 