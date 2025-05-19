
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users, Calendar, Dumbbell, CreditCard, Home } from 'lucide-react';
import { SidebarProvider, Sidebar as ShadcnSidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { useIsMobile } from '@/hooks/use-mobile';
import { Navbar } from './Navbar';

const navItems = [{
  icon: Home,
  label: "Dashboard",
  href: "/"
}, {
  icon: Users,
  label: "Clienti",
  href: "/clienti"
}, {
  icon: Calendar,
  label: "Calendario",
  href: "/calendario"
}, {
  icon: Dumbbell,
  label: "Allenamenti",
  href: "/allenamenti"
}, {
  icon: CreditCard,
  label: "Pagamenti",
  href: "/pagamenti"
}];

// Renamed from SidebarContent to AppSidebarContent to avoid naming conflict
export function AppSidebarContent() {
  const location = useLocation();
  return <ShadcnSidebar>
      <SidebarContent className="">
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map(item => <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Link to={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors", location.pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-gray-100")}>
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>;
}

export function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  return <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Navbar sopra tutto il resto */}
        <Navbar />
        
        {/* La sidebar e il contenuto principale allineati sotto la navbar con uno spazio di 4rem (h-16) */}
        <div className="flex flex-1 w-full pt-16">
          <AppSidebarContent />
          <main className="flex-1 p-2 md:p-6 overflow-x-hidden">
            <div className="w-full mx-auto">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <SidebarTrigger />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
}

export default AppLayout;
