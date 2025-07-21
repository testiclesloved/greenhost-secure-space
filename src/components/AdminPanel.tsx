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
import { Loader2, Check, X, Settings, Users, DollarSign, Edit3, Save } from "lucide-react";
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
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface StoragePlan {
  id: string;
  name: string;
  storage_gb: number;
  monthly_fee: number;
  one_time_fee: number;
  description: string;
  plan_type: "personal" | "enterprise" | "custom";
  is_active: boolean;
}

interface UserStats {
  total_users: number;
  total_purchases: number;
  confirmed_purchases: number;
  pending_purchases: number;
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
    admin_key: '',
    bank_name: '',
    account_number: '',
    account_name: ''
  });
  const [storagePlans, setStoragePlans] = useState<StoragePlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<StoragePlan>>({
    name: '',
    storage_gb: 0,
    monthly_fee: 0,
    one_time_fee: 0,
    description: '',
    plan_type: 'personal',
    is_active: true
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingPurchases();
      fetchAdminSettings();
      fetchStoragePlans();
      fetchUserStats();
    }
  }, [isAuthenticated]);

  const fetchUserStats = async () => {
    try {
      // Count total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count total purchases
      const { count: totalPurchases } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true });

      // Count confirmed purchases
      const { count: confirmedPurchases } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('admin_confirmed', true)
        .eq('payment_status', 'confirmed');

      // Count pending purchases
      const { count: pendingPurchases } = await supabase
        .from('user_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('admin_confirmed', false)
        .eq('payment_status', 'pending');

      setUserStats({
        total_users: totalUsers || 0,
        total_purchases: totalPurchases || 0,
        confirmed_purchases: confirmedPurchases || 0,
        pending_purchases: pendingPurchases || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

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
      // Join with profiles using user_id relationship
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
        .eq('admin_confirmed', false)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately and merge
      const userIds = (data || []).map(purchase => purchase.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .in('user_id', userIds);

      // Merge profiles data
      const purchasesWithProfiles = (data || []).map(purchase => ({
        ...purchase,
        profiles: profiles?.find(profile => profile.user_id === purchase.user_id) || null
      }));

      setPendingPurchases(purchasesWithProfiles as any);
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

  const fetchStoragePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('storage_plans')
        .select('*')
        .order('storage_gb', { ascending: true });

      if (error) throw error;
      setStoragePlans(data || []);
    } catch (error) {
      console.error('Error fetching storage plans:', error);
    }
  };

  const updateStoragePlan = async (planId: string, updates: Partial<StoragePlan>) => {
    try {
      const { error } = await supabase
        .from('storage_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;

      // Refresh storage plans from database to ensure consistency
      await fetchStoragePlans();

      toast({
        title: "Plan updated",
        description: "Storage plan has been updated successfully",
      });

      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating storage plan:', error);
      toast({
        title: "Error",
        description: "Failed to update storage plan",
        variant: "destructive"
      });
    }
  };

  const createStoragePlan = async () => {
    try {
      // Validate required fields
      if (!newPlan.name || !newPlan.monthly_fee || !newPlan.storage_gb || !newPlan.plan_type) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const planData = {
        name: newPlan.name,
        storage_gb: newPlan.storage_gb,
        monthly_fee: newPlan.monthly_fee,
        one_time_fee: newPlan.one_time_fee || 0,
        description: newPlan.description || '',
        plan_type: newPlan.plan_type as "personal" | "enterprise" | "custom",
        is_active: newPlan.is_active ?? true
      };

      const { error } = await supabase
        .from('storage_plans')
        .insert([planData]);

      if (error) throw error;

      await fetchStoragePlans();

      toast({
        title: "Plan created",
        description: "New storage plan has been created successfully",
      });

      setIsAddingPlan(false);
      setNewPlan({
        name: '',
        storage_gb: 0,
        monthly_fee: 0,
        one_time_fee: 0,
        description: '',
        plan_type: 'personal',
        is_active: true
      });
    } catch (error) {
      console.error('Error creating storage plan:', error);
      toast({
        title: "Error",
        description: "Failed to create storage plan",
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments
              {userStats?.pending_purchases && userStats.pending_purchases > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {userStats.pending_purchases}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Plans
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

          <TabsContent value="plans" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Storage Plans Management</CardTitle>
                    <CardDescription>
                      Edit storage plan pricing and details
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setIsAddingPlan(true)}
                    className="bg-gradient-primary"
                  >
                    Add New Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingPlan && (
                  <Card className="mb-6 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">Create New Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Plan Name</Label>
                          <Input
                            value={newPlan.name || ''}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Professional Plan"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Plan Type</Label>
                          <select
                            className="w-full p-2 border rounded"
                            value={newPlan.plan_type || 'personal'}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, plan_type: e.target.value as any }))}
                          >
                            <option value="personal">Personal</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Storage (GB)</Label>
                          <Input
                            type="number"
                            value={newPlan.storage_gb || 0}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, storage_gb: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Monthly Fee (₦)</Label>
                          <Input
                            type="number"
                            value={newPlan.monthly_fee || 0}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, monthly_fee: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>One-time Fee (₦)</Label>
                          <Input
                            type="number"
                            value={newPlan.one_time_fee || 0}
                            onChange={(e) => setNewPlan(prev => ({ ...prev, one_time_fee: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={newPlan.description || ''}
                          onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Plan description"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={createStoragePlan} className="bg-gradient-success">
                          Create Plan
                        </Button>
                        <Button 
                          onClick={() => setIsAddingPlan(false)} 
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-4">
                  {storagePlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {editingPlan === plan.id ? (
                        <div className="space-y-4 border-t pt-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Monthly Fee (₦)</Label>
                              <Input
                                type="number"
                                value={plan.monthly_fee}
                                onChange={(e) => {
                                  const newPlans = storagePlans.map(p => 
                                    p.id === plan.id 
                                      ? { ...p, monthly_fee: Number(e.target.value) }
                                      : p
                                  );
                                  setStoragePlans(newPlans);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>One-time Fee (₦)</Label>
                              <Input
                                type="number"
                                value={plan.one_time_fee || 0}
                                onChange={(e) => {
                                  const newPlans = storagePlans.map(p => 
                                    p.id === plan.id 
                                      ? { ...p, one_time_fee: Number(e.target.value) }
                                      : p
                                  );
                                  setStoragePlans(newPlans);
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Storage (GB)</Label>
                              <Input
                                type="number"
                                value={plan.storage_gb}
                                onChange={(e) => {
                                  const newPlans = storagePlans.map(p => 
                                    p.id === plan.id 
                                      ? { ...p, storage_gb: Number(e.target.value) }
                                      : p
                                  );
                                  setStoragePlans(newPlans);
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                              value={plan.description || ''}
                              onChange={(e) => {
                                const newPlans = storagePlans.map(p => 
                                  p.id === plan.id 
                                    ? { ...p, description: e.target.value }
                                    : p
                                );
                                setStoragePlans(newPlans);
                              }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateStoragePlan(plan.id, {
                                monthly_fee: plan.monthly_fee,
                                one_time_fee: plan.one_time_fee,
                                storage_gb: plan.storage_gb,
                                description: plan.description
                              })}
                              className="bg-gradient-success"
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingPlan(null);
                                fetchStoragePlans(); // Reset changes
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium">Storage</p>
                            <p className="text-lg">{plan.storage_gb}GB</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Monthly Fee</p>
                            <p className="text-lg">₦{plan.monthly_fee.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">One-time Fee</p>
                            <p className="text-lg">₦{(plan.one_time_fee || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Plan Type</p>
                            <p className="text-lg capitalize">{plan.plan_type}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="grid gap-6 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="text-2xl font-bold">{userStats?.total_users || 0}</h3>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="text-2xl font-bold">{userStats?.confirmed_purchases || 0}</h3>
                        <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Loader2 className="w-8 h-8 text-yellow-600" />
                      <div>
                        <h3 className="text-2xl font-bold">{userStats?.pending_purchases || 0}</h3>
                        <p className="text-sm text-muted-foreground">Pending Payments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="text-2xl font-bold">{userStats?.total_purchases || 0}</h3>
                        <p className="text-sm text-muted-foreground">Total Purchases</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Detailed user management features coming soon...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-muted-foreground">
                  Advanced user management interface will be available in the next update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Configure bank account information for user payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={settings.bank_name}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          bank_name: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={settings.account_number}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          account_number: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input
                        id="accountName"
                        value={settings.account_name}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          account_name: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
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
                    Save All Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};