
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ClientDetailNotFound() {
  const navigate = useNavigate();

  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-bold">Cliente non trovato</h2>
      <Button variant="outline" onClick={() => navigate('/clienti')} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla lista
      </Button>
    </div>
  );
}
