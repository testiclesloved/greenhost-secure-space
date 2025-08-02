import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "./Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, HardDrive, Network, Download, Copy, Wifi, WifiOff } from "lucide-react";
import { ZeroTierGuide } from "./ZeroTierGuide";
import { addUser as addUserToSFTPGo, checkServerStatus } from "@/lib/sftpgo-api";

interface StorageAccount {
  id: string;
  account_email: string;
  storage_quota_gb: number;
  setup_completed: boolean;
  api_key?: string;
}

interface StorageUser {
  id: string;
  username: string;
  sftp_link: string | null;
  web_link: string | null;
}

export const UserDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [storageAccount, setStorageAccount] = useState<StorageAccount | null>(null);
  const [storageUsers, setStorageUsers] = useState<StorageUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingUpAccount, setSettingUpAccount] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [showZeroTierGuide, setShowZeroTierGuide] = useState(false);
  const [accountSetup, setAccountSetup] = useState({
    email: '',
    password: ''
  });
  const [newUser, setNewUser] = useState({
    username: '',
    password: ''
  });
  const [serverStatus, setServerStatus] = useState<{status: 'online' | 'offline' | 'checking'; message: string}>({
    status: 'offline',
    message: 'Not checked'
  });
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    fetchStorageAccount();
    fetchStorageUsers();
  }, []);

  useEffect(() => {
    if (storageAccount) {
      fetchStorageUsers();
    }
  }, [storageAccount]);

  const handleServerStatusCheck = async () => {
    setCheckingStatus(true);
    setServerStatus({ status: 'checking', message: 'Checking server status...' });
    
    try {
      const status = await checkServerStatus();
      setServerStatus(status);
      
      toast({
        title: status.status === 'online' ? "Server Online" : "Server Offline",
        description: status.message,
        variant: status.status === 'online' ? "default" : "destructive"
      });
    } catch (error) {
      setServerStatus({
        status: 'offline',
        message: 'Failed to check server status'
      });
      toast({
        title: "Error",
        description: "Failed to check server status",
        variant: "destructive"
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchStorageAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('storage_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStorageAccount(data);
    } catch (error) {
      console.error('Error fetching storage account:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageUsers = async () => {
    if (!storageAccount) return;
    
    try {
      const { data, error } = await supabase
        .from('storage_users')
        .select('*')
        .eq('storage_account_id', storageAccount.id);

      if (error) throw error;
      setStorageUsers(data || []);
    } catch (error) {
      console.error('Error fetching storage users:', error);
    }
  };

  const setupStorageAccount = async () => {
    if (!accountSetup.email || !accountSetup.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setSettingUpAccount(true);
    
    try {
      // Get the user's purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from('user_purchases')
        .select('id, storage_plans(storage_gb)')
        .eq('user_id', user?.id)
        .eq('admin_confirmed', true)
        .single();

      if (purchaseError) throw purchaseError;

      // Create storage account
      const { data, error } = await supabase
        .from('storage_accounts')
        .insert({
          user_id: user?.id,
          purchase_id: purchase.id,
          account_email: accountSetup.email,
          account_password: accountSetup.password,
          storage_quota_gb: purchase.storage_plans.storage_gb,
          setup_completed: true
        })
        .select()
        .single();

      if (error) throw error;

      setStorageAccount(data);
      toast({
        title: "Storage account created",
        description: "Your storage account has been set up successfully",
      });
    } catch (error) {
      console.error('Error setting up storage account:', error);
      toast({
        title: "Error",
        description: "Failed to set up storage account",
        variant: "destructive"
      });
    } finally {
      setSettingUpAccount(false);
    }
  };

  const addStorageUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!storageAccount?.api_key) {
      toast({
        title: "Error",
        description: "Storage account not properly configured",
        variant: "destructive"
      });
      return;
    }

    setAddingUser(true);
    
    try {
      console.log('🚀 Adding user to SFTPGo...');
      
      // Call real SFTPGo API
      const sftpResponse = await addUserToSFTPGo({
        company_email: storageAccount.account_email,
        api_key: storageAccount.api_key,
        username: newUser.username,
        password: newUser.password
      });

      console.log('📥 SFTPGo response:', sftpResponse);

      // Extract SFTP and web links from response
      let sftpLink = '';
      let webLink = '';
      
      if (sftpResponse.success && sftpResponse.data) {
        sftpLink = sftpResponse.data.sftp_link || `sftp://${newUser.username}@your_server_ip:2022`;
        webLink = sftpResponse.data.web_link || 'http://your_sftpgo_url/web/client';
      }

      // Save to database
      const { data, error } = await supabase
        .from('storage_users')
        .insert({
          storage_account_id: storageAccount?.id,
          username: newUser.username,
          password: newUser.password,
          sftp_link: sftpLink,
          web_link: webLink
        })
        .select()
        .single();

      if (error) throw error;

      setStorageUsers(prev => [...prev, data]);
      setNewUser({ username: '', password: '' });
      
      toast({
        title: "User added",
        description: "Storage user has been created successfully in SFTPGo",
      });
    } catch (error) {
      console.error('Error adding storage user:', error);
      toast({
        title: "Error",
        description: `Failed to add storage user: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setAddingUser(false);
    }
  };

  const accessDrive = (user: StorageUser) => {
    setShowZeroTierGuide(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Storage Dashboard</h1>
          <p className="text-muted-foreground">Manage your cloud storage and users</p>
        </div>

        {!storageAccount ? (
          <Card className="max-w-md mx-auto shadow-medium">
            <CardHeader>
              <CardTitle>Set Up Your Storage Account</CardTitle>
              <CardDescription>
                Create your networking company credentials to access your allocated storage space
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email for Disk Space</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountSetup.email}
                  onChange={(e) => setAccountSetup(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  placeholder="Enter email for storage access"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password to Disk Space</Label>
                <Input
                  id="password"
                  type="password"
                  value={accountSetup.password}
                  onChange={(e) => setAccountSetup(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  placeholder="Enter password for storage access"
                />
              </div>
              <Button 
                onClick={setupStorageAccount}
                className="w-full bg-gradient-primary"
                disabled={settingUpAccount}
              >
                {settingUpAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Set Up Storage Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Storage Overview */}
            <Card className="lg:col-span-2 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Storage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Storage Quota</p>
                    <p className="text-2xl font-bold text-primary">
                      {storageAccount.storage_quota_gb}GB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Email</p>
                    <p className="text-lg font-medium">{storageAccount.account_email}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Storage Users</h3>
                    <Button
                      onClick={() => setShowAddUserForm(!showAddUserForm)}
                      size="sm"
                      className="bg-gradient-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>

                  {showAddUserForm && (
                    <Card className="border-2 border-primary/20">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={newUser.username}
                              onChange={(e) => setNewUser(prev => ({
                                ...prev,
                                username: e.target.value
                              }))}
                              placeholder="Enter username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="userPassword">Password</Label>
                            <Input
                              id="userPassword"
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser(prev => ({
                                ...prev,
                                password: e.target.value
                              }))}
                              placeholder="Enter password"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={addStorageUser}
                            disabled={addingUser}
                            className="bg-gradient-success"
                          >
                            {addingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create User
                          </Button>
                          <Button
                            onClick={() => setShowAddUserForm(false)}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-3">
                    {storageUsers.map((storageUser) => (
                      <div key={storageUser.id} className="border rounded-lg p-4 hover-lift">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{storageUser.username}</h4>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(storageUser.sftp_link || '')}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                SFTP Link
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(storageUser.web_link || '')}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Web Link
                              </Button>
                            </div>
                          </div>
                          <Button
                            onClick={() => accessDrive(storageUser)}
                            className="bg-gradient-primary"
                          >
                            Access Drive
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Network Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-4">
                    ZeroTier Network Required
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    To access your storage, you need to join our secure ZeroTier network.
                  </p>
                  <Button
                    onClick={() => setShowZeroTierGuide(true)}
                    className="w-full bg-gradient-primary mb-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Setup Network Access
                  </Button>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Server Status</span>
                      <div className="flex items-center gap-1">
                        {serverStatus.status === 'online' ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : serverStatus.status === 'offline' ? (
                          <WifiOff className="w-4 h-4 text-red-500" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        )}
                        <span className={`text-xs ${
                          serverStatus.status === 'online' ? 'text-green-600' : 
                          serverStatus.status === 'offline' ? 'text-red-600' : 
                          'text-orange-600'
                        }`}>
                          {serverStatus.status.charAt(0).toUpperCase() + serverStatus.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{serverStatus.message}</p>
                    <Button
                      onClick={handleServerStatusCheck}
                      disabled={checkingStatus}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {checkingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Check Server Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showZeroTierGuide && (
        <ZeroTierGuide onClose={() => setShowZeroTierGuide(false)} />
      )}
    </div>
  );
};