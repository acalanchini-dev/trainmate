
import React from 'react';
import { Button } from "@/components/ui/button";

interface AnthropometricEmptyStateProps {
  onAddClick: () => void;
}

export function AnthropometricEmptyState({ onAddClick }: AnthropometricEmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      Nessun dato antropometrico registrato per questo cliente.
      <div className="mt-4">
        <Button onClick={onAddClick}>Aggiungi prima misurazione</Button>
      </div>
    </div>
  );
}
