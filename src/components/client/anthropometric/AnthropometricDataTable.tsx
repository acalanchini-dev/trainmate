import React from 'react';
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AnthropometricData } from "@/types/anthropometric";

interface AnthropometricDataTableProps {
  data: AnthropometricData[];
  onEdit: (item: AnthropometricData) => void;
  onDelete: (id: string) => void;
}

export function AnthropometricDataTable({ data, onEdit, onDelete }: AnthropometricDataTableProps) {
  const [openRows, setOpenRows] = React.useState<Record<string, boolean>>({});

  // Formatta la data per la visualizzazione
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: it });
    } catch (e) {
      return dateString;
    }
  };

  const toggleRow = (id: string) => {
    setOpenRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Peso (kg)</TableHead>
          <TableHead>Altezza (cm)</TableHead>
          <TableHead>Grasso corporeo (%)</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <React.Fragment key={item.id}>
            <TableRow>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleRow(item.id)}
                >
                  {openRows[item.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            <TableCell>{formatDate(item.date)}</TableCell>
            <TableCell>{item.weight || "-"}</TableCell>
            <TableCell>{item.height || "-"}</TableCell>
            <TableCell>{item.body_fat_percentage || "-"}</TableCell>
            <TableCell className="max-w-[200px] truncate">{item.notes || "-"}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                  Modifica
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Questa azione non può essere annullata. Vuoi davvero eliminare questa misurazione?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(item.id)}>Elimina</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
            <TableRow className={openRows[item.id] ? "" : "hidden"}>
              <TableCell colSpan={7}>
                <div className="py-2 px-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Circonferenze corporee</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Vita:</span>
                      <p className="text-sm font-medium">{item.waist_circumference || "-"} cm</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Fianchi:</span>
                      <p className="text-sm font-medium">{item.hip_circumference || "-"} cm</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Torace:</span>
                      <p className="text-sm font-medium">{item.chest_circumference || "-"} cm</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Coscia:</span>
                      <p className="text-sm font-medium">{item.thigh_circumference || "-"} cm</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Braccio:</span>
                      <p className="text-sm font-medium">{item.arm_circumference || "-"} cm</p>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
