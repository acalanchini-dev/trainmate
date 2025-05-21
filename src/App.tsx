import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Calendar from "./pages/Calendar";
import Workouts from "./pages/Workouts";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import PublicTrainingPlan from "./pages/PublicTrainingPlan";

const queryClient = new QueryClient();

// Componente per le rotte protette
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        {/* Utilizziamo il Toaster di Radix UI */}
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/piano/:id" element={<PublicTrainingPlan />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clienti" element={
              <ProtectedRoute>
                <AppLayout><Clients /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clienti/:id" element={
              <ProtectedRoute>
                <AppLayout><ClientDetail /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/calendario" element={
              <ProtectedRoute>
                <AppLayout><Calendar /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/allenamenti" element={
              <ProtectedRoute>
                <AppLayout><Workouts /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/pagamenti" element={
              <ProtectedRoute>
                <AppLayout><Payments /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/impostazioni" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
