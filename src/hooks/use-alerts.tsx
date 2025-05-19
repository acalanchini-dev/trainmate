
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export type Alert = {
  id: string;
  user_id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  related_client_id?: string;
  related_appointment_id?: string;
  created_at: string;
};

export function useAlerts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Recupera tutti gli avvisi dell'utente
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          description: "Impossibile caricare gli avvisi: " + error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Alert[];
    },
    enabled: !!user,
  });
  
  // Segna un avviso come letto
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .select()
        .single();
        
      if (error) {
        toast({
          description: "Impossibile aggiornare l'avviso: " + error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
  
  // Segna tutti gli avvisi come letti
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .select();
        
      if (error) {
        toast({
          description: "Impossibile aggiornare gli avvisi: " + error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        description: "Tutti gli avvisi sono stati segnati come letti.",
        variant: "success"
      });
    }
  });
  
  // Restituisce solo gli avvisi non letti
  const unreadAlerts = alerts?.filter(alert => !alert.is_read) || [];
  
  return {
    alerts,
    unreadAlerts,
    isLoading,
    error,
    markAsRead,
    markAllAsRead
  };
}
