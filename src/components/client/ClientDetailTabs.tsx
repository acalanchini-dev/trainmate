import React from "react";
import { ClientDetailSelect } from "./ClientDetailSelect";
import { Client } from "@/types/client";
import { TrainingPlan } from "@/types/training";
import { Appointment } from "@/hooks/use-appointments";

interface ClientDetailTabsProps {
  client: Client;
  appointments: Appointment[];
  trainingPlans: TrainingPlan[];
  isLoadingAppointments: boolean;
  isLoadingTrainingPlans: boolean;
  onNewPlanClick: () => void;
}

export function ClientDetailTabs({
  client,
  appointments,
  trainingPlans,
  isLoadingAppointments,
  isLoadingTrainingPlans,
  onNewPlanClick
}: ClientDetailTabsProps) {
  return (
    <ClientDetailSelect
      client={client}
      appointments={appointments}
      trainingPlans={trainingPlans}
      isLoadingAppointments={isLoadingAppointments}
      isLoadingTrainingPlans={isLoadingTrainingPlans}
          onNewPlanClick={onNewPlanClick}
        />
  );
}
