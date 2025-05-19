import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/types/client";
import { ClientInfo } from "./ClientInfo";
import { ClientAppointmentsList } from "./ClientAppointmentsList";
import { ClientTrainingPlansList } from "./ClientTrainingPlansList";
import { AnthropometricDataPanel } from "./AnthropometricDataPanel";
import { ClientDocumentsPanel } from "./ClientDocumentsPanel";
import { TrainingPlan } from "@/types/training";
import { Appointment } from "@/hooks/use-appointments";

interface ClientDetailSelectProps {
  client: Client;
  appointments: Appointment[];
  trainingPlans: TrainingPlan[];
  isLoadingAppointments: boolean;
  isLoadingTrainingPlans: boolean;
  onNewPlanClick: () => void;
}

export function ClientDetailSelect({
  client,
  appointments,
  trainingPlans,
  isLoadingAppointments,
  isLoadingTrainingPlans,
  onNewPlanClick
}: ClientDetailSelectProps) {
  const [selectedSection, setSelectedSection] = React.useState("info");

  const renderContent = () => {
    switch (selectedSection) {
      case "info":
        return <ClientInfo client={client} />;
      case "anthropometric":
        return <AnthropometricDataPanel clientId={client.id} />;
      case "documents":
        return <ClientDocumentsPanel clientId={client.id} />;
      case "appointments":
        return (
          <ClientAppointmentsList 
            appointments={appointments || []} 
            isLoading={isLoadingAppointments}
            clientId={client.id}
            clientName={client.name}
          />
        );
      case "training-plans":
        return (
          <ClientTrainingPlansList 
            trainingPlans={trainingPlans || []} 
            isLoading={isLoadingTrainingPlans}
            onNewPlanClick={onNewPlanClick}
            clientId={client.id}
            clientName={client.name}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedSection} onValueChange={setSelectedSection}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleziona una sezione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="info">Informazioni</SelectItem>
          <SelectItem value="anthropometric">Dati Antropometrici</SelectItem>
          <SelectItem value="documents">Documenti</SelectItem>
          <SelectItem value="appointments">Appuntamenti</SelectItem>
          <SelectItem value="training-plans">Piani di Allenamento</SelectItem>
        </SelectContent>
      </Select>

      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
} 