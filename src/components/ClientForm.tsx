import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ClientFormData } from "@/types/client";
import { Loader2, CheckCircle } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { useState, useEffect } from "react";

// Schema di validazione migliorato per accettare null per profile_picture_url
const clientSchema = z.object({
  name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri"),
  email: z.string()
    .min(1, "L'email è obbligatoria")
    .email("L'email non è valida")
    .transform(e => e.toLowerCase().trim()),
  birth_date: z.string()
    .min(1, "La data di nascita è obbligatoria")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate < today;
    }, "La data di nascita non può essere nel futuro"),
  phone: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  sessions_remaining: z.coerce.number().int().min(0, "Le sessioni non possono essere negative"),
  status: z.enum(["active", "inactive"]),
  profile_picture_url: z.string().nullable().optional(),
});

interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  isSubmitting?: boolean;
}

export function ClientForm({ defaultValues, onSubmit, isSubmitting = false }: ClientFormProps) {
  const { checkEmailExists } = useClients();
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [lastCheckedEmail, setLastCheckedEmail] = useState<string>("");
  const [isEmailValidated, setIsEmailValidated] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      birth_date: "",
      phone: "",
      objective: "",
      notes: "",
      sessions_remaining: 0,
      status: "active",
      profile_picture_url: null,
      ...defaultValues,
    },
  });

  // Verifica l'email quando cambia (solo per nuovi clienti)
  const emailValue = form.watch("email");
  const isNewClient = !defaultValues?.email;

  useEffect(() => {
    // Resetta lo stato di validazione quando l'email cambia
    setIsEmailValidated(false);
    if (emailError) setEmailError(null);
    
    const validateEmail = async () => {
      if (emailValue === lastCheckedEmail) return;
      if (!emailValue || !emailValue.includes('@')) return;
      
      if (isNewClient && emailValue && emailValue !== defaultValues?.email) {
        try {
          setIsCheckingEmail(true);
          const exists = await checkEmailExists(emailValue);
          setLastCheckedEmail(emailValue);
          
          if (exists) {
            setEmailError("Un cliente con questa email esiste già");
            form.setError("email", {
              type: "manual",
              message: "Un cliente con questa email esiste già"
            });
          }
        } catch (error) {
          console.error("[ClientForm] Errore nella verifica dell'email:", error);
          setEmailError("Errore durante la verifica dell'email. Riprova più tardi.");
        } finally {
          setIsCheckingEmail(false);
        }
      }
    };

    const timer = setTimeout(validateEmail, 1000);
    return () => clearTimeout(timer);
  }, [emailValue, isNewClient, defaultValues?.email, checkEmailExists, lastCheckedEmail]);

  console.log("[ClientForm] Rendering form, isSubmitting:", isSubmitting);
  console.log("[ClientForm] Valori predefiniti:", defaultValues);
  console.log("[ClientForm] Errori di validazione:", form.formState.errors);

  const handleFormSubmit = async (data: ClientFormData) => {
    if (emailError) {
      form.setError("email", {
        type: "manual",
        message: emailError
      });
      return;
    }
    
    try {
      if (typeof onSubmit !== 'function') {
        console.error("[ClientForm] onSubmit non è una funzione valida");
        return;
      }
      
      await onSubmit(data);
      setIsEmailValidated(true); // Imposta l'email come validata dopo il successo
      console.log("[ClientForm] Sottomissione completata con successo");
    } catch (error) {
      console.error("[ClientForm] Errore durante la sottomissione del form:", error);
    }
  };

  // Effetto di debug
  React.useEffect(() => {
    console.log("[ClientForm] Stato del form:", {
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      isValid: form.formState.isValid,
      errors: form.formState.errors
    });
  }, [form.formState]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di nascita</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    max={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="email@esempio.com" 
                      type="email" 
                      {...field} 
                      className={`
                        ${emailError ? "border-destructive" : ""}
                        ${isCheckingEmail ? "pr-10" : ""}
                      `}
                      disabled={isSubmitting || isCheckingEmail}
                      aria-invalid={!!emailError}
                    />
                      <div className="absolute right-2 top-2">
                      {isCheckingEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : isEmailValidated && !emailError ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : null}
                      </div>
                  </div>
                </FormControl>
                {emailError && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {emailError}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="333-1234567" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sessions_remaining"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sessioni rimanenti</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Obiettivo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Obiettivo del cliente" 
                  className="min-h-[60px]"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note personali</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Note opzionali" 
                  className="min-h-[60px]"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stato</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona uno stato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="inactive">Inattivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || form.formState.isSubmitting || !!emailError || isCheckingEmail}
            onClick={() => console.log("[ClientForm] Pulsante Salva cliccato")}
          >
            {isSubmitting || form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio in corso...
              </>
            ) : (
              "Salva Cliente"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
