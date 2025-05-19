
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, User } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Link } from "react-router-dom";

export function Navbar() {
  const {
    user
  } = useAuth();

  // Ottieni il nome dell'utente dalle informazioni del profilo
  const firstName = user?.user_metadata?.first_name || "";
  const lastName = user?.user_metadata?.last_name || "";
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : user?.email || "";

  // Crea le iniziali per l'avatar
  const initials = firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U";
  
  return <div className="fixed top-0 left-0 w-full flex h-16 items-center justify-between border-b bg-background px-4 z-10">
      {/* Logo a sinistra */}
      <Link to="/" className="flex items-center gap-2 text-xl font-display font-semibold">
        <span className="text-trainmate-600">Train</span>
        <span className="text-gray-800">Mate</span>
      </Link>
      
      {/* Menu utente a destra */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
              <span className="hidden text-sm font-medium md:inline-block">
                {displayName}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/impostazioni" className="flex w-full cursor-pointer items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Impostazioni</span>
              </Link>
            </DropdownMenuItem>
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>;
}
