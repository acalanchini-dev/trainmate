import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnthropometricData } from "@/types/anthropometric";
import { Separator } from "@/components/ui/separator";

// Schema di validazione
const anthropometricSchema = z.object({
  date: z.string().default(() => new Date().toISOString().slice(0, 16)),
  weight: z.string().refine(val => !val || !isNaN(Number(val)), { message: "Il peso deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  height: z.string().refine(val => !val || !isNaN(Number(val)), { message: "L'altezza deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  body_fat_percentage: z.string().refine(val => !val || !isNaN(Number(val)), { message: "La percentuale di grasso corporeo deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  waist_circumference: z.string().refine(val => !val || !isNaN(Number(val)), { message: "La circonferenza vita deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  hip_circumference: z.string().refine(val => !val || !isNaN(Number(val)), { message: "La circonferenza fianchi deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  chest_circumference: z.string().refine(val => !val || !isNaN(Number(val)), { message: "La circonferenza torace deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  thigh_circumference: z.string().refine(val => !val || !isNaN(Number(val)), { message: "La circonferenza coscia deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  arm_circumference: z.string().refine(val => !val || !isNaN(Number(val)), { message: "La circonferenza braccio deve essere un numero." })
    .transform(val => val ? Number(val) : null).optional(),
  notes: z.string().optional(),
});

// Interface per i valori del form
export interface FormInputValues {
  date: string;
  weight: string;
  height: string;
  body_fat_percentage: string;
  waist_circumference: string;
  hip_circumference: string;
  chest_circumference: string;
  thigh_circumference: string;
  arm_circumference: string;
  notes: string;
}

interface AnthropometricDataFormProps {
  selectedData: AnthropometricData | null;
  onSubmit: (values: FormInputValues) => Promise<void>;
  onCancel: () => void;
}

export function AnthropometricDataForm({ selectedData, onSubmit, onCancel }: AnthropometricDataFormProps) {
  const form = useForm<FormInputValues>({
    resolver: zodResolver(anthropometricSchema),
    defaultValues: {
      date: selectedData ? new Date(selectedData.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      weight: selectedData?.weight?.toString() || "",
      height: selectedData?.height?.toString() || "",
      body_fat_percentage: selectedData?.body_fat_percentage?.toString() || "",
      waist_circumference: selectedData?.waist_circumference?.toString() || "",
      hip_circumference: selectedData?.hip_circumference?.toString() || "",
      chest_circumference: selectedData?.chest_circumference?.toString() || "",
      thigh_circumference: selectedData?.thigh_circumference?.toString() || "",
      arm_circumference: selectedData?.arm_circumference?.toString() || "",
      notes: selectedData?.notes || "",
    },
  });

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {selectedData ? "Modifica misurazione" : "Nuova misurazione"}
        </DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Misure principali</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="Es. 75.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Altezza (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="Es. 175" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
          <FormField
            control={form.control}
            name="body_fat_percentage"
            render={({ field }) => (
              <FormItem>
                    <FormLabel>Grasso corporeo (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Es. 15.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            </div>
          </div>

          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Circonferenze corporee</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="waist_circumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circonferenza vita (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Es. 80" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hip_circumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circonferenza fianchi (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Es. 95" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="chest_circumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circonferenza torace (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Es. 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="thigh_circumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circonferenza coscia (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Es. 55" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="arm_circumference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circonferenza braccio (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Es. 35" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea placeholder="Aggiungi note" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit">
              {selectedData ? "Aggiorna" : "Salva"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}
