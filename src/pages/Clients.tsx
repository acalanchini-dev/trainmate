import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientForm } from "@/components/ClientForm";
import { useClients } from "@/hooks/use-clients";
import { ClientFormData } from "@/types/client";
import { Users, Search, Plus, User } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const Clients = () => {
  const navigate = useNavigate();
  const { clients, isLoading, addClient } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddClient = async (data: ClientFormData) => {
    try {
      console.log("[Clients] Aggiunta nuovo cliente con dati:", data);
      await addClient.mutateAsync(data);
      setIsClientDialogOpen(false);
      // Nota: il toast di successo ora è gestito nel hook useClients
    } catch (error: any) {
      console.error("[Clients] Errore durante l'aggiunta del cliente:", error);
      // Non mostriamo il toast qui perché è già gestito nel hook useClients
    }
  };

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleViewClient = (clientId: string) => {
    navigate(`/clienti/${clientId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
          <Users size={28} /> Clienti
        </h1>
        <p className="text-muted-foreground">Gestisci i tuoi clienti e visualizza i loro dettagli</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca cliente..."
            className="pl-8 w-[250px] md:w-[300px]"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
          <Button className="gap-1" onClick={() => setIsClientDialogOpen(true)}>
            <Plus size={16} /> Nuovo Cliente
          </Button>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Cliente</DialogTitle>
            </DialogHeader>
            <div className="pr-6">
              <ClientForm 
                onSubmit={handleAddClient} 
                isSubmitting={addClient.isPending} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="active">Attivi</TabsTrigger>
          <TabsTrigger value="inactive">Inattivi</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <ClientList 
            clients={filteredClients} 
            isLoading={isLoading}
            onViewClient={handleViewClient}
          />
        </TabsContent>
        <TabsContent value="active">
          <ClientList 
            clients={filteredClients.filter(c => c.status === 'active')} 
            isLoading={isLoading}
            onViewClient={handleViewClient}
          />
        </TabsContent>
        <TabsContent value="inactive">
          <ClientList 
            clients={filteredClients.filter(c => c.status === 'inactive')} 
            isLoading={isLoading}
            onViewClient={handleViewClient}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ClientListProps {
  clients: any[];
  isLoading: boolean;
  onViewClient: (id: string) => void;
}

const ClientList = ({ clients, isLoading, onViewClient }: ClientListProps) => {
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">Nessun cliente trovato</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Telefono</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Sessioni</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                <TableCell className="hidden md:table-cell">{client.phone || "-"}</TableCell>
                <TableCell>
                  <div className={`trainmate-tag ${
                    client.status === "active" ? "trainmate-tag-green" : "trainmate-tag-red"
                  }`}>
                    {client.status === "active" ? "Attivo" : "Inattivo"}
                  </div>
                </TableCell>
                <TableCell>{client.sessions_remaining}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewClient(client.id)}
                  >
                    Dettagli
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Clients;
