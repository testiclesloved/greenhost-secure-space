import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Settings, Users, DollarSign } from "lucide-react";
import { Header } from "./Header";

interface PendingPurchase {
  id: string;
  user_id: string;
  amount_paid: number;
  payment_status: string;
  account_number: string | null;
  created_at: string;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  storage_plans: {
    name: string;
    storage_gb: number;
    plan_type: string;
  } | null;
}

interface AdminSettings {
  zerotier_network_id: string;
  sftpgo_encryption_key: string;
  sftpgo_tunnel_url: string;
  admin_key: string;
}

export const AdminPanel = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingPurchases, setPendingPurchases] = useState<PendingPurchase[]>([]);
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({
    zerotier_network_id: '',
    sftpgo_encryption_key: '',
    sftpgo_tunnel_url: '',
    admin_key: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingPurchases();
      fetchAdminSettings();
    }
  }, [isAuthenticated]);

  const handleAdminAuth = async () => {
    const correctKey = 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z6A7b8C9d0E1f2G3h4I5j6K7l8M9n0O1p2Q3r4S5t6U7v8W9x0Y1z2A3b4C5d6E7f8G9h0I1j2K3l4M5n6O7p8Q9r0S1t2U3v4W5x6Y7z8';
    
    if (adminKey === correctKey) {
      setIsAuthenticated(true);
      toast({
        title: "Admin access granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Invalid admin key",
        variant: "destructive"
      });
    }
  };

  const fetchPendingPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('user_purchases')
        .select(`
          *,
          profiles (
            email,
            first_name,
            last_name
          ),
          storage_plans (
            name,
            storage_gb,
            plan_type
          )
        `)
        .eq('admin_confirmed', false)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingPurchases((data as any) || []);
    } catch (error) {
      console.error('Error fetching pending purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) throw error;
      
      const settingsObj: any = {};
      data?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    }
  };

  const confirmPayment = async (purchaseId: string) => {
    const confirmKey = prompt('Enter 128-character admin key to confirm payment:');
    
    if (confirmKey !== settings.admin_key) {
      toast({
        title: "Confirmation failed",
        description: "Invalid admin key",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_purchases')
        .update({
          admin_confirmed: true,
          payment_status: 'confirmed'
        })
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Payment confirmed",
        description: "User has been granted access to their storage plan",
      });

      fetchPendingPurchases();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payment",
        variant: "destructive"
      });
    }
  };

  const updateSettings = async () => {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('admin_settings')
          .update({ setting_value: value })
          .eq('setting_key', key);
      }

      toast({
        title: "Settings updated",
        description: "Admin settings have been saved successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Admin Access</CardTitle>
            <CardDescription>Enter the 128-character admin key to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Admin Key</Label>
              <Input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter 128-character key..."
              />
            </div>
            <Button onClick={handleAdminAuth} className="w-full bg-gradient-primary">
              Authenticate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage GreenHost operations</p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Payments</CardTitle>
                <CardDescription>
                  Review and confirm user payments to grant storage access
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : pendingPurchases.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No pending payments
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingPurchases.map((purchase) => (
                      <div key={purchase.id} className="border rounded-lg p-4 hover-lift">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {purchase.profiles?.email || 'No email'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {purchase.profiles?.first_name} {purchase.profiles?.last_name}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {purchase.payment_status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium">Plan</p>
                            <p className="text-lg">{purchase.storage_plans?.name || 'No plan'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Storage</p>
                            <p className="text-lg">{purchase.storage_plans?.storage_gb || 0}GB</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Amount</p>
                            <p className="text-lg">₦{purchase.amount_paid.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Account Number</p>
                            <p className="text-lg">{purchase.account_number || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => confirmPayment(purchase.id)}
                            className="bg-gradient-success"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Confirm Payment
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts and storage allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  User management features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure ZeroTier network and SFTPGo integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zerotier">ZeroTier Network ID</Label>
                    <Input
                      id="zerotier"
                      value={settings.zerotier_network_id}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        zerotier_network_id: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tunnel">SFTPGo Tunnel URL</Label>
                    <Input
                      id="tunnel"
                      value={settings.sftpgo_tunnel_url}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sftpgo_tunnel_url: e.target.value
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="encryption">SFTPGo Encryption Key</Label>
                  <Input
                    id="encryption"
                    type="password"
                    value={settings.sftpgo_encryption_key}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sftpgo_encryption_key: e.target.value
                    }))}
                  />
                </div>

                <Button onClick={updateSettings} className="bg-gradient-primary">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};