import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Client } from "@/types/client";

interface ClientInfoProps {
  client: Client;
}

export function ClientInfo({ client }: ClientInfoProps) {
  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return "Non specificata";
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Se non abbiamo ancora raggiunto il mese del compleanno quest'anno, o
    // se siamo nello stesso mese ma non abbiamo ancora raggiunto il giorno,
    // sottraiamo un anno
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} anni`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dettagli Personali</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
          <p>{client.email}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Età</h4>
          <p>{calculateAge(client.birth_date)}</p>
          {client.birth_date && (
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(client.birth_date).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Telefono</h4>
          <p>{client.phone || "Non specificato"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Sessioni Rimanenti</h4>
          <p>{client.sessions_remaining}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Stato</h4>
          <div className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
            client.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {client.status === "active" ? "Attivo" : "Inattivo"}
          </div>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium text-muted-foreground">Obiettivo</h4>
          <p>{client.objective || "Non specificato"}</p>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium text-muted-foreground">Note</h4>
          <p>{client.notes || "Nessuna nota"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
