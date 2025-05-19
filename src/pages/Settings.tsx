
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground">
          Gestisci le impostazioni del tuo account e le preferenze.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
          <CardDescription>
            Visualizza e modifica le informazioni del tuo profilo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p>
                  {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* In futuro qui possono essere aggiunte altre sezioni di impostazioni */}
    </div>
  );
};

export default Settings;
