
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon, UsersIcon, CalendarIcon, WalletIcon } from "lucide-react";

const Landing = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-background px-6 py-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="font-bold text-2xl">TrainMate</div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline">Accedi</Button>
            </Link>
            <Link to="/auth">
              <Button>Prova gratuita</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Gestisci il tuo business con TrainMate</h1>
              <p className="text-lg text-muted-foreground mb-8">
                La piattaforma completa per personal trainer che vogliono gestire clienti, appuntamenti e pagamenti in modo semplice ed efficace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="px-8">Inizia subito</Button>
                </Link>
                <Button size="lg" variant="outline" className="px-8">Scopri i piani</Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/placeholder.svg" 
                alt="TrainMate Dashboard" 
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Strumenti essenziali per il tuo successo</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TrainMate offre tutto ciò di cui hai bisogno per gestire e far crescere la tua attività da personal trainer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border">
              <div className="bg-primary/10 p-4 rounded-lg inline-block mb-4">
                <UsersIcon className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestione clienti</h3>
              <p className="text-muted-foreground">
                Gestisci facilmente i profili dei clienti, traccia i loro obiettivi e monitora i loro progressi.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border">
              <div className="bg-primary/10 p-4 rounded-lg inline-block mb-4">
                <CalendarIcon className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Calendario ottimizzato</h3>
              <p className="text-muted-foreground">
                Organizza al meglio i tuoi appuntamenti, evita sovrapposizioni e invia promemoria automatici.
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg border">
              <div className="bg-primary/10 p-4 rounded-lg inline-block mb-4">
                <WalletIcon className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestione pagamenti</h3>
              <p className="text-muted-foreground">
                Tieni traccia di abbonamenti, pacchetti e sessioni rimanenti, con notifiche per i rinnovi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cosa dicono i professionisti</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Scopri come TrainMate ha aiutato altri personal trainer a far crescere la loro attività.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                </div>
                <p className="mb-6">
                  "Da quando uso TrainMate ho aumentato il numero di clienti del 30% e posso dedicare più tempo alla formazione invece che all'amministrazione."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">ML</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Marco Liverani</p>
                    <p className="text-sm text-muted-foreground">Personal Trainer, Milano</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                </div>
                <p className="mb-6">
                  "TrainMate mi ha semplificato enormemente la gestione degli appuntamenti e dei pagamenti. Un investimento che si ripaga da solo."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">SR</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Silvia Ricci</p>
                    <p className="text-sm text-muted-foreground">Fitness Coach, Roma</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                  <StarIcon className="text-yellow-500 h-5 w-5" />
                </div>
                <p className="mb-6">
                  "La mia clientela è raddoppiata in sei mesi grazie alla gestione efficiente che TrainMate mi permette di avere del mio tempo."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">AF</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Andrea Ferretti</p>
                    <p className="text-sm text-muted-foreground">Personal Trainer, Bologna</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Piani e Prezzi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Scegli il piano più adatto alle tue esigenze. Tutti i piani includono aggiornamenti gratuiti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border relative">
              <h3 className="text-xl font-bold mb-2">Base</h3>
              <div className="text-3xl font-bold mb-2">€25<span className="text-lg text-muted-foreground font-normal">/mese</span></div>
              <p className="text-muted-foreground mb-6">Perfetto per trainer che iniziano</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Fino a 20 clienti</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Gestione calendario</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Monitoraggio pagamenti</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Report avanzati</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Supporto premium</span>
                </li>
              </ul>
              <Button className="w-full">Inizia gratis</Button>
            </div>

            <div className="bg-card p-8 rounded-lg border border-primary relative">
              <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Più popolare
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-2">€45<span className="text-lg text-muted-foreground font-normal">/mese</span></div>
              <p className="text-muted-foreground mb-6">Ideale per trainer affermati</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Fino a 50 clienti</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Gestione calendario</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Monitoraggio pagamenti</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Report avanzati</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Supporto premium</span>
                </li>
              </ul>
              <Button className="w-full">Prova 14 giorni gratis</Button>
            </div>

            <div className="bg-card p-8 rounded-lg border relative">
              <h3 className="text-xl font-bold mb-2">Business</h3>
              <div className="text-3xl font-bold mb-2">€75<span className="text-lg text-muted-foreground font-normal">/mese</span></div>
              <p className="text-muted-foreground mb-6">Per studi e team di trainer</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Clienti illimitati</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Gestione calendario</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Monitoraggio pagamenti</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Report avanzati</span>
                </li>
                <li className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                  <span>Supporto premium</span>
                </li>
              </ul>
              <Button className="w-full">Contattaci</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Domande frequenti</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trova risposte alle domande più comuni su TrainMate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-3">Posso esportare i dati dei miei clienti?</h3>
              <p className="text-muted-foreground">
                Sì, TrainMate permette di esportare tutti i dati dei tuoi clienti in formato CSV o PDF in qualsiasi momento.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Come funziona il periodo di prova?</h3>
              <p className="text-muted-foreground">
                Offriamo 14 giorni di prova gratuita senza vincoli. Non è richiesta la carta di credito per iniziare.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Posso passare da un piano all'altro?</h3>
              <p className="text-muted-foreground">
                Certamente! Puoi cambiare il tuo piano in qualsiasi momento, e l'addebito verrà adeguato di conseguenza.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">I miei dati sono al sicuro?</h3>
              <p className="text-muted-foreground">
                Assolutamente. TrainMate utilizza la crittografia di livello bancario per proteggere tutti i tuoi dati e quelli dei tuoi clienti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto a far crescere il tuo business?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di personal trainer che stanno già ottimizzando la loro attività con TrainMate.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8">Inizia la prova gratuita</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="font-bold text-xl">TrainMate</div>
              <p className="text-muted-foreground mt-2">La soluzione completa per personal trainer</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <Link to="#" className="text-muted-foreground hover:text-foreground">Chi siamo</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Blog</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Assistenza</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Termini</Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">Contatti</Link>
            </div>
          </div>
          <div className="text-center text-muted-foreground text-sm mt-12">
            © {new Date().getFullYear()} TrainMate. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
