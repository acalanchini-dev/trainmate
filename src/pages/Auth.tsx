
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Auth = () => {
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
    <div className="flex h-screen flex-col items-center justify-center px-4 py-8 md:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Accedi al tuo account</h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Entra nella tua area personale per gestire i tuoi allenamenti e monitorare i tuoi progressi.
        </p>
      </div>
      <AuthForm />
    </div>
  );
};

export default Auth;
