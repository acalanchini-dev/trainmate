
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";

export function useDashboardStats() {
  const { user } = useAuth();
  const today = new Date();
  
  // Recupera il numero totale di clienti
  const { data: totalClients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['dashboard-stats', 'clients-count'],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      return count || 0;
    },
    enabled: !!user,
  });
  
  // Recupera il numero di appuntamenti per oggi
  const { data: todayAppointments, isLoading: isLoadingTodayAppointments } = useQuery({
    queryKey: ['dashboard-stats', 'today-appointments'],
    queryFn: async () => {
      if (!user) return [];
      
      const start = startOfDay(today);
      const end = endOfDay(today);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .eq('status', 'scheduled');
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user,
  });
  
  // Recupera gli appuntamenti imminenti
  const { data: upcomingAppointments, isLoading: isLoadingUpcomingAppointments } = useQuery({
    queryKey: ['dashboard-stats', 'upcoming-appointments'],
    queryFn: async () => {
      if (!user) return [];
      
      const now = new Date();
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*, clients(name)')
        .gt('start_time', now.toISOString())
        .eq('status', 'scheduled')
        .order('start_time')
        .limit(5);
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user,
  });
  
  // Recupera i clienti attivi
  const { data: activeClients, isLoading: isLoadingActiveClients } = useQuery({
    queryKey: ['dashboard-stats', 'active-clients'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('name')
        .limit(5);
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!user,
  });
  
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Se è oggi
    if (date.toDateString() === now.toDateString()) {
      return `Oggi, ${format(date, 'HH:mm')}`;
    }
    
    // Se è domani
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Domani, ${format(date, 'HH:mm')}`;
    }
    
    // Altrimenti formato completo
    return format(date, 'dd MMM, HH:mm', { locale: it });
  };
  
  return {
    stats: {
      totalClients,
      todayAppointmentsCount: todayAppointments?.length || 0,
      monthlyIncome: '€2,400' // Per ora statico, ma potrebbe essere calcolato da un'altra query
    },
    upcomingAppointments: upcomingAppointments?.map(appointment => ({
      id: appointment.id,
      client: appointment.clients.name,
      type: appointment.title,
      date: formatAppointmentDate(appointment.start_time)
    })),
    activeClients,
    isLoading: 
      isLoadingClients || 
      isLoadingTodayAppointments || 
      isLoadingUpcomingAppointments ||
      isLoadingActiveClients
  };
}
