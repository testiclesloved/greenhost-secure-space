import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StoragePlans } from "@/components/StoragePlans";
import { UserDashboard } from "@/components/UserDashboard";
import { AdminPanel } from "@/components/AdminPanel";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
}

interface UserPurchase {
  id: string;
  storage_plan_id: string;
  payment_status: 'pending' | 'confirmed' | 'failed';
  admin_confirmed: boolean;
  storage_setup_completed: boolean;
  amount_paid: number;
  storage_plans: {
    name: string;
    storage_gb: number;
    plan_type: string;
  };
}

export const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserPurchases();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          storage_plans (
            name,
            storage_gb,
            plan_type
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin Panel Access
  if (profile?.role === 'admin' && profile?.email === 'emzywoo89@gmail.com') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16">
          <AdminPanel />
        </div>
      </div>
    );
  }

  // First-time user or no confirmed purchases - show storage plans
  const confirmedPurchases = purchases.filter(p => p.admin_confirmed && p.payment_status === 'confirmed');
  
  if (confirmedPurchases.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
              Welcome, {profile?.first_name || 'User'}!
            </h1>
            <p className="text-xl text-white/80 animate-slide-up">
              Choose your storage plan to get started with GreenHost
            </p>
          </div>
          
          {purchases.length > 0 && (
            <Card className="mb-8 shadow-medium">
              <CardHeader>
                <CardTitle>Pending Purchases</CardTitle>
                <CardDescription>
                  Your purchases are being processed. You'll be notified once they're confirmed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex justify-between items-center p-4 border rounded-lg mb-2">
                    <div>
                      <h3 className="font-semibold">{purchase.storage_plans.name} Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {purchase.storage_plans.storage_gb}GB - ₦{purchase.amount_paid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-600">
                        {purchase.payment_status === 'pending' ? 'Payment Pending' : 'Awaiting Confirmation'}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <StoragePlans />
        </div>
      </div>
    );
  }

  // User has confirmed purchases - show dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <UserDashboard />
      </div>
    </div>
  );
};