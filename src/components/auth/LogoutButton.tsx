
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export const LogoutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout effettuato con successo",
        description: "Sei stato disconnesso con successo."
      });
      navigate("/landing");
    } catch (error) {
      toast({
        title: "Errore durante il logout",
        description: "Si è verificato un errore durante il logout.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenuItem asChild onClick={handleLogout}>
      <div className="flex cursor-pointer items-center text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Esci</span>
      </div>
    </DropdownMenuItem>
  );
};
