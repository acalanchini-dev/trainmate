
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Plus, Search, Calendar, Check } from 'lucide-react';

interface Payment {
  id: number;
  clientName: string;
  clientId: number;
  amount: number;
  sessions: number;
  date: string;
  status: 'paid' | 'pending';
}

const dummyPayments: Payment[] = [
  {
    id: 1,
    clientName: "Marco Rossi",
    clientId: 1,
    amount: 240,
    sessions: 5,
    date: "2025-05-01",
    status: "paid"
  },
  {
    id: 2,
    clientName: "Giulia Bianchi",
    clientId: 2,
    amount: 450,
    sessions: 10,
    date: "2025-05-03",
    status: "paid"
  },
  {
    id: 3,
    clientName: "Andrea Neri",
    clientId: 3,
    amount: 240,
    sessions: 5,
    date: "2025-05-08",
    status: "pending"
  }
];

const dummyClients = [
  { id: 1, name: "Marco Rossi" },
  { id: 2, name: "Giulia Bianchi" },
  { id: 3, name: "Andrea Neri" },
  { id: 4, name: "Luca Verdi" }
];

const packageOptions = [
  { id: 1, sessions: 1, price: 60, label: "Sessione Singola - €60" },
  { id: 2, sessions: 5, price: 240, label: "Pacchetto 5 Sessioni - €240" },
  { id: 3, sessions: 10, price: 450, label: "Pacchetto 10 Sessioni - €450" }
];

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>(dummyPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredPayments = payments.filter(payment =>
    payment.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsPaid = (paymentId: number) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, status: 'paid' } 
        : payment
    ));
  };

  // Calculate statistics
  const totalEarnings = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
    
  const pendingPayments = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight flex items-center gap-2">
          <CreditCard size={28} /> Pagamenti
        </h1>
        <p className="text-muted-foreground">Gestisci i pagamenti e i pacchetti dei tuoi clienti</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Incassi Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalEarnings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              In Attesa di Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{pendingPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Sessioni Vendute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.reduce((sum, payment) => sum + payment.sessions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca pagamenti..."
            className="pl-8 w-[250px] md:w-[300px]"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus size={16} /> Nuovo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Pagamento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Cliente
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleziona cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyClients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="package" className="text-right">
                  Pacchetto
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleziona pacchetto" />
                  </SelectTrigger>
                  <SelectContent>
                    {packageOptions.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                        {pkg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Data
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input id="date" type="date" className="flex-1" />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Stato
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Stato pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Pagato</SelectItem>
                    <SelectItem value="pending">In Attesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Note
                </Label>
                <Input id="notes" className="col-span-3" placeholder="Note opzionali" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={() => setIsAddPaymentDialogOpen(false)}>
                Salva Pagamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="paid">Pagati</TabsTrigger>
          <TabsTrigger value="pending">In Attesa</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PaymentTable 
            payments={filteredPayments} 
            markAsPaid={markAsPaid} 
            setSelectedPayment={setSelectedPayment}
          />
        </TabsContent>

        <TabsContent value="paid">
          <PaymentTable 
            payments={filteredPayments.filter(p => p.status === 'paid')} 
            markAsPaid={markAsPaid}
            setSelectedPayment={setSelectedPayment}
          />
        </TabsContent>

        <TabsContent value="pending">
          <PaymentTable 
            payments={filteredPayments.filter(p => p.status === 'pending')} 
            markAsPaid={markAsPaid}
            setSelectedPayment={setSelectedPayment}
          />
        </TabsContent>
      </Tabs>

      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Dettagli Pagamento</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p>{selectedPayment.clientName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Importo</p>
                <p>€{selectedPayment.amount}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessioni</p>
                <p>{selectedPayment.sessions}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data</p>
                <p>{new Date(selectedPayment.date).toLocaleDateString('it-IT')}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stato</p>
                <div className={`trainmate-tag ${
                  selectedPayment.status === "paid" ? "trainmate-tag-green" : "trainmate-tag-yellow"
                }`}>
                  {selectedPayment.status === "paid" ? "Pagato" : "In Attesa"}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                {selectedPayment.status === 'pending' && (
                  <Button 
                    onClick={() => {
                      markAsPaid(selectedPayment.id);
                      setSelectedPayment({ ...selectedPayment, status: 'paid' });
                    }}
                    className="gap-1"
                  >
                    <Check size={16} /> Segna come Pagato
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Chiudi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface PaymentTableProps {
  payments: Payment[];
  markAsPaid: (id: number) => void;
  setSelectedPayment: (payment: Payment) => void;
}

const PaymentTable = ({ payments, markAsPaid, setSelectedPayment }: PaymentTableProps) => {
  if (payments.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="py-10">
          <p className="text-center text-muted-foreground">Nessun pagamento trovato</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Data</th>
                <th className="text-left py-3 px-4">Sessioni</th>
                <th className="text-left py-3 px-4">Importo</th>
                <th className="text-left py-3 px-4">Stato</th>
                <th className="text-left py-3 px-4">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-muted/50">
                  <td className="py-3 px-4">{payment.clientName}</td>
                  <td className="py-3 px-4">{formatDate(payment.date)}</td>
                  <td className="py-3 px-4">{payment.sessions}</td>
                  <td className="py-3 px-4">€{payment.amount}</td>
                  <td className="py-3 px-4">
                    <div className={`trainmate-tag ${
                      payment.status === "paid" ? "trainmate-tag-green" : "trainmate-tag-yellow"
                    }`}>
                      {payment.status === "paid" ? "Pagato" : "In Attesa"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Dettagli
                      </Button>
                      
                      {payment.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsPaid(payment.id)}
                          className="gap-1"
                        >
                          <Check size={14} /> Segna Pagato
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Payments;
