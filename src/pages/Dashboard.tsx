import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Calendar, CreditCard, Bell, CheckCircle2 } from 'lucide-react';
import { useAlerts } from '@/hooks/use-alerts';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, className, isLoading }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  className?: string;
  isLoading?: boolean;
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { unreadAlerts, markAsRead } = useAlerts();
  const { stats, upcomingAppointments, activeClients, isLoading } = useDashboardStats();

  const handleViewClient = (clientId: string) => {
    navigate(`/clienti/${clientId}`);
  };

  const handleAlertClick = (alertId: string) => {
    markAsRead.mutate(alertId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Benvenuto nella tua dashboard TrainMate</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Clienti Totali" 
          value={stats.totalClients} 
          icon={Users} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Appuntamenti Oggi" 
          value={stats.todayAppointmentsCount} 
          icon={Calendar} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Incasso Mensile" 
          value={stats.monthlyIncome} 
          icon={CreditCard} 
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar size={18} />
              Prossimi Appuntamenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map(event => (
                  <div key={event.id} className="trainmate-card flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{event.client}</h4>
                        <p className="text-sm text-muted-foreground">{event.type}</p>
                      </div>
                      <div className="text-sm text-right">{event.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="mx-auto h-8 w-8 opacity-30 mb-2" />
                <p>Nessun appuntamento programmato</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Bell size={18} />
              Notifiche e Promemoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : unreadAlerts && unreadAlerts.length > 0 ? (
              <div className="space-y-3">
                {unreadAlerts.map(alert => {
                  let badgeColor = "trainmate-tag-green";
                  if (alert.priority === "medium") badgeColor = "trainmate-tag-yellow";
                  if (alert.priority === "high") badgeColor = "trainmate-tag-red";
                  
                  return (
                    <div key={alert.id} className="trainmate-card group" onClick={() => handleAlertClick(alert.id)}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{alert.message}</p>
                        <div className={`trainmate-tag ${badgeColor}`}>
                          {alert.priority === "low" ? "Info" : 
                           alert.priority === "medium" ? "Attenzione" : "Urgente"}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground hidden group-hover:block">
                        Clicca per segnare come letto
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 opacity-30 mb-2" />
                <p>Nessuna notifica attiva</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users size={18} />
            Clienti Attivi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Nome</th>
                    <th className="text-left py-3 px-2">Stato</th>
                    <th className="text-left py-3 px-2">Sessioni Rimaste</th>
                    <th className="text-left py-3 px-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map(i => (
                    <tr key={i}>
                      <td className="py-3 px-2">
                        <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-6 w-8 bg-muted animate-pulse rounded"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeClients && activeClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Nome</th>
                    <th className="text-left py-3 px-2">Stato</th>
                    <th className="text-left py-3 px-2">Sessioni Rimaste</th>
                    <th className="text-left py-3 px-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {activeClients.map(client => (
                    <tr key={client.id} className="hover:bg-muted/50">
                      <td className="py-3 px-2">{client.name}</td>
                      <td className="py-3 px-2">
                        <div className={`trainmate-tag ${
                          client.status === "active" ? "trainmate-tag-green" : "trainmate-tag-red"
                        }`}>
                          {client.status === "active" ? "Attivo" : "Inattivo"}
                        </div>
                      </td>
                      <td className="py-3 px-2">{client.sessions_remaining}</td>
                      <td className="py-3 px-2">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary hover:underline" 
                          onClick={() => handleViewClient(client.id)}
                        >
                          Visualizza
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="mx-auto h-8 w-8 opacity-30 mb-2" />
              <p>Nessun cliente attivo trovato</p>
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => navigate('/clienti')}
              >
                Aggiungi un cliente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
