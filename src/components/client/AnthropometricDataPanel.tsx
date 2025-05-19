import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { AnthropometricData, AnthropometricFormData } from "@/types/anthropometric";
import { useAuth } from "@/context/AuthContext";
import { Plus, LineChart } from "lucide-react";
import { AnthropometricDataForm, FormInputValues } from "./anthropometric/AnthropometricDataForm";
import { AnthropometricDataTable } from "./anthropometric/AnthropometricDataTable";
import { AnthropometricChartPlaceholder } from "./anthropometric/AnthropometricChartPlaceholder";
import { AnthropometricEmptyState } from "./anthropometric/AnthropometricEmptyState";
import { toast } from "@/hooks/use-toast";

interface AnthropometricDataPanelProps {
  clientId: string;
}

export function AnthropometricDataPanel({ clientId }: AnthropometricDataPanelProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<AnthropometricData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<AnthropometricData | null>(null);
  
  // Carica i dati antropometrici
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('anthropometric_data')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;

      setData(data || []);
    } catch (error: any) {
      toast("Errore", {
        description: `Impossibile caricare i dati: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  // Gestisce la sottomissione del form
  const handleSubmit = async (values: FormInputValues) => {
    if (!user) return;

    try {
      // La trasformazione dei valori avviene qui
      const formattedValues: AnthropometricFormData = {
        date: values.date,
        weight: values.weight ? Number(values.weight) : null,
        height: values.height ? Number(values.height) : null,
        body_fat_percentage: values.body_fat_percentage ? Number(values.body_fat_percentage) : null,
        waist_circumference: values.waist_circumference ? Number(values.waist_circumference) : null,
        hip_circumference: values.hip_circumference ? Number(values.hip_circumference) : null,
        chest_circumference: values.chest_circumference ? Number(values.chest_circumference) : null,
        thigh_circumference: values.thigh_circumference ? Number(values.thigh_circumference) : null,
        arm_circumference: values.arm_circumference ? Number(values.arm_circumference) : null,
        notes: values.notes || null,
      };

      const dataToSave = {
        ...formattedValues,
        client_id: clientId,
        user_id: user.id
      };

      if (selectedItemId) {
        // Aggiorna un record esistente
        const { error } = await supabase
          .from('anthropometric_data')
          .update(dataToSave)
          .eq('id', selectedItemId);

        if (error) throw error;

        toast("Dati aggiornati", {
          description: "I dati antropometrici sono stati aggiornati con successo."
        });
      } else {
        // Crea un nuovo record
        const { error } = await supabase
          .from('anthropometric_data')
          .insert(dataToSave);

        if (error) throw error;

        toast("Dati salvati", {
          description: "I dati antropometrici sono stati salvati con successo."
        });
      }

      // Chiudi il dialog e ricarica i dati
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast("Errore", {
        description: `Impossibile salvare i dati: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Gestisce la chiusura del dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItemId(null);
    setSelectedItem(null);
  };

  // Apre il dialog per modifica
  const handleEdit = (item: AnthropometricData) => {
    setSelectedItemId(item.id);
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  // Apre il dialog per un nuovo record
  const handleNew = () => {
    setSelectedItemId(null);
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  // Elimina un record
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('anthropometric_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast("Dati eliminati", {
        description: "I dati antropometrici sono stati eliminati con successo."
      });

      fetchData();
    } catch (error: any) {
      toast("Errore", {
        description: `Impossibile eliminare i dati: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dati Antropometrici</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowChart(!showChart)}>
            <LineChart className="h-4 w-4 mr-2" />
            {showChart ? "Nascondi grafico" : "Mostra grafico"}
          </Button>
          <Button size="sm" onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova misurazione
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : data.length > 0 ? (
          <div className="space-y-6">
            <AnthropometricDataTable 
              data={data} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
            />

            {showChart && <AnthropometricChartPlaceholder data={data} />}
          </div>
        ) : (
          <AnthropometricEmptyState onAddClick={handleNew} />
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AnthropometricDataForm
            selectedData={selectedItem}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
}
