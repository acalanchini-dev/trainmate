import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ClientDocument, DocumentFormData } from "@/types/document";
import { useAuth } from "@/context/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Download, FileText, FileImage, FileArchive, FileVideo, FileQuestion } from "lucide-react";

interface ClientDocumentsPanelProps {
  clientId: string;
}

const documentSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  file: z.instanceof(File, { message: "Il file è obbligatorio" }).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

const documentCategories = [
  "Certificato medico",
  "Scheda di valutazione",
  "Documento di identità",
  "Accordo di allenamento",
  "Altro"
];

export function ClientDocumentsPanel({ clientId }: ClientDocumentsPanelProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      category: "Altro",
      description: "",
    },
  });

  // Carica i documenti
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: `Impossibile caricare i documenti: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchDocuments();
    }
  }, [clientId]);

  // Gestisce la sottomissione del form
  const handleSubmit = async (values: z.infer<typeof documentSchema>) => {
    if (!user || !selectedFile) return;

    try {
      // Carica il file nel bucket client_media
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${clientId}-${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client_media')
        .upload(filePath, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // Ottieni l'URL pubblico del file
      const { data: urlData } = supabase.storage
        .from('client_media')
        .getPublicUrl(filePath);

      // Salva le informazioni del documento nel database
      const { error } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientId,
          user_id: user.id,
          name: values.name,
          file_url: urlData.publicUrl,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          category: values.category,
          description: values.description || null,
        });

      if (error) throw error;

      toast({
        title: "Documento salvato",
        description: "Il documento è stato caricato con successo."
      });

      // Chiudi il dialog e ricarica i documenti
      setIsDialogOpen(false);
      form.reset();
      setSelectedFile(null);
      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: `Impossibile salvare il documento: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Elimina un documento
  const handleDelete = async (document: ClientDocument) => {
    try {
      // Estrai il percorso dal file_url
      const filePath = document.file_url.split('/').slice(-2).join('/');
      
      if (filePath) {
        // Elimina il file dallo storage
        await supabase.storage
          .from('client_media')
          .remove([filePath]);
      }
      
      // Elimina il record dal database
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: "Documento eliminato",
        description: "Il documento è stato eliminato con successo."
      });

      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: `Impossibile eliminare il documento: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Scarica un documento
  const handleDownload = async (document: ClientDocument) => {
    // Apri il documento in una nuova scheda
    window.open(document.file_url, '_blank');
  };

  // Formatta la dimensione del file
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Ottieni l'icona corretta in base al tipo di file
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="h-5 w-5" />;
    return <FileQuestion className="h-5 w-5" />;
  };

  // Formatta la data per la visualizzazione
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: it });
    } catch (e) {
      return dateString;
    }
  };

  // Gestisce la selezione del file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('name', file.name.split('.')[0]); // Pre-popola il nome con il nome del file
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documenti</CardTitle>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo documento
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(document => (
              <div key={document.id} className="border rounded-lg p-4 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {getFileIcon(document.file_type)}
                    <div className="ml-3">
                      <h3 className="font-medium">{document.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {document.category} - {formatFileSize(document.file_size)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4" />
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
                            Questa azione non può essere annullata. Vuoi davvero eliminare questo documento?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(document)}>Elimina</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {document.description && (
                  <p className="text-sm mt-2 text-muted-foreground">{document.description}</p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  Caricato il {formatDate(document.created_at)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nessun documento caricato per questo cliente.
            <div className="mt-4">
              <Button onClick={() => setIsDialogOpen(true)}>Carica primo documento</Button>
            </div>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Carica nuovo documento</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium mb-1">
                        Clicca per selezionare un file
                      </span>
                      <span className="text-xs text-muted-foreground">
                        o trascina un file qui
                      </span>
                    </div>
                  </label>
                  {selectedFile && (
                    <div className="mt-3 text-sm">
                      File selezionato: <span className="font-medium">{selectedFile.name}</span> ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome documento</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome documento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona una categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentCategories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Aggiungi una descrizione" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={!selectedFile}
                  >
                    Carica documento
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
