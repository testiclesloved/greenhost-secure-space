import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { addUser } from "@/lib/sftpgo-api";
import { Eye, EyeOff, Plus, Trash2, ExternalLink, Copy, Users, Server, HardDrive } from "lucide-react";
import { Header } from "@/components/Header";

interface StorageAccount {
  id: string;
  account_email: string;
  account_password: string;
  storage_quota_gb: number;
  setup_completed: boolean;
  purchase_id: string;
  user_purchases: {
    sftpgo_api_key: string;
  };
}

interface StorageUser {
  id: string;
  username: string;
  password: string;
  sftp_link: string;
  web_link: string;
  created_at: string;
}

export default function StoragePanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [storageAccount, setStorageAccount] = useState<StorageAccount | null>(null);
  const [storageUsers, setStorageUsers] = useState<StorageUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const { toast } = useToast();

  const login = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verify credentials against storage_accounts table
      const { data, error } = await supabase
        .from('storage_accounts')
        .select(`
          *,
          user_purchases!inner(sftpgo_api_key)
        `)
        .eq('account_email', email)
        .eq('account_password', password)
        .eq('setup_completed', true)
        .single();

      if (error || !data) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      setStorageAccount(data);
      setIsAuthenticated(true);
      await loadStorageUsers(data.id);
      
      toast({
        title: "Login Successful",
        description: "Welcome to your storage panel",
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStorageUsers = async (storageAccountId: string) => {
    try {
      const { data, error } = await supabase
        .from('storage_users')
        .select('*')
        .eq('storage_account_id', storageAccountId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStorageUsers(data || []);
    } catch (error) {
      console.error('Error loading storage users:', error);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser({ ...newUser, password });
  };

  const downloadUserData = (username: string, password: string, companyEmail: string) => {
    const userData = `Company Storage Access Details
====================================

Company Email: ${companyEmail}
Username: ${username}
Password: ${password}

Login Instructions:
------------------
1. To access your company storage dashboard, visit our website and login with these credentials
2. For direct SFTP access, use: sftp://${username}@172.26.181.241:2022
3. For web interface access, visit: http://172.26.181.241:8080/web/client

Important Security Notice:
-------------------------
- Keep these credentials secure and do not share them
- You must be connected to our ZeroTier network to access storage
- Contact your administrator if you need assistance

Generated on: ${new Date().toLocaleString()}
`;

    const blob = new Blob([userData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `your_data_from_${companyEmail.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const addNewUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    if (!storageAccount) return;

    setIsAddingUser(true);
    try {
      console.log('🚀 Creating user via SFTPGo API...');
      
      // Call SFTPGo API to add user
      const response = await addUser({
        company_email: storageAccount.account_email,
        api_key: storageAccount.user_purchases.sftpgo_api_key,
        username: newUser.username,
        password: newUser.password,
      });

      console.log('📥 SFTPGo response:', response);

      if (response.success) {
        // Extract data from nested response structure (response.data.data)
        const userData = response.data?.data || response.data;
        
        // Save user to database
        const { error } = await supabase
          .from('storage_users')
          .insert({
            storage_account_id: storageAccount.id,
            username: newUser.username,
            password: newUser.password,
            sftp_link: userData.sftp_link || `sftp://${newUser.username}@172.26.181.241:2022`,
            web_link: userData.web_link || 'http://172.26.181.241:8080/web/client',
          });

        if (error) throw error;

        await loadStorageUsers(storageAccount.id);
        
        // Download user data file
        downloadUserData(newUser.username, newUser.password, storageAccount.account_email);
        
        setNewUser({ username: "", password: "" });
        
        toast({
          title: "User Created Successfully",
          description: `User ${newUser.username} has been created and credentials downloaded`,
        });
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: `Failed to add user: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!storageAccount) return;

    try {
      // Call SFTPGo API to delete user
      // Note: You'll need to implement deleteUser in sftpgo-api.ts
      
      // Remove from database
      const { error } = await supabase
        .from('storage_users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await loadStorageUsers(storageAccount.id);
      
      toast({
        title: "User Deleted",
        description: `User ${username} has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setStorageAccount(null);
    setStorageUsers([]);
    setEmail("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Storage Panel Login</CardTitle>
                <CardDescription className="text-center">
                  Access your company's storage dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Company Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="company@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your admin password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={login} disabled={loading} className="w-full">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Storage Panel</h1>
            <p className="text-gray-600">{storageAccount?.account_email}</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="connections">Connection Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Quota</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{storageAccount?.storage_quota_gb} GB</div>
                  <p className="text-xs text-muted-foreground">Total allocated storage</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{storageUsers.length}</div>
                  <p className="text-xs text-muted-foreground">Users with access</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={storageAccount?.setup_completed ? "default" : "destructive"}>
                      {storageAccount?.setup_completed ? "Active" : "Setup Required"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Service status</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>
                  Create a new user account for your storage space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPassword">Password</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="userPassword"
                          type={showNewUserPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Enter password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                        >
                          {showNewUserPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button type="button" onClick={generatePassword} variant="outline">
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addNewUser} disabled={isAddingUser} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      {isAddingUser ? "Adding..." : "Add User"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Users</CardTitle>
                <CardDescription>
                  Manage users with access to your storage space
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Username</TableHead>
                       <TableHead>Password</TableHead>
                       <TableHead>Created</TableHead>
                       <TableHead>Access Storage</TableHead>
                       <TableHead>Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {storageUsers.map((user) => (
                       <TableRow key={user.id}>
                         <TableCell className="font-medium">{user.username}</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2">
                             <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                               {user.password}
                             </code>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => copyToClipboard(user.password)}
                             >
                               <Copy className="h-3 w-3" />
                             </Button>
                           </div>
                         </TableCell>
                         <TableCell>
                           {new Date(user.created_at).toLocaleDateString()}
                         </TableCell>
                         <TableCell>
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button size="sm" className="bg-gradient-primary text-white">
                                 <Users className="h-3 w-3 mr-1" />
                                 {user.username}
                               </Button>
                             </DialogTrigger>
                             <DialogContent>
                               <DialogHeader>
                                 <DialogTitle>ZeroTier Network Authentication</DialogTitle>
                                 <DialogDescription>
                                   Due to security reasons, you must be authenticated with our ZeroTier network to use our service.
                                 </DialogDescription>
                               </DialogHeader>
                               <div className="space-y-4">
                                 <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                   <p className="text-sm text-yellow-800">
                                     <strong>Important:</strong> You need to be connected to our ZeroTier network to access your storage.
                                   </p>
                                 </div>
                                 <div className="flex gap-2">
                                   <Button
                                     className="flex-1"
                                     onClick={() => window.open('http://172.26.181.241:8080/web/client', '_blank')}
                                   >
                                     I have done this
                                   </Button>
                                   <Button
                                     variant="outline"
                                     className="flex-1"
                                     onClick={() => window.open('/zerotier-guide', '_blank')}
                                   >
                                     Help me do this
                                   </Button>
                                 </div>
                               </div>
                             </DialogContent>
                           </Dialog>
                         </TableCell>
                         <TableCell>
                           <Dialog>
                             <DialogTrigger asChild>
                               <Button size="sm" variant="destructive">
                                 <Trash2 className="h-3 w-3 mr-1" />
                                 Delete
                               </Button>
                             </DialogTrigger>
                             <DialogContent>
                               <DialogHeader>
                                 <DialogTitle>Delete User</DialogTitle>
                                 <DialogDescription>
                                   Are you sure you want to delete user "{user.username}"? This action cannot be undone.
                                 </DialogDescription>
                               </DialogHeader>
                               <div className="flex justify-end gap-2">
                                 <DialogTrigger asChild>
                                   <Button variant="outline">Cancel</Button>
                                 </DialogTrigger>
                                 <Button
                                   variant="destructive"
                                   onClick={() => deleteUser(user.id, user.username)}
                                 >
                                   Delete User
                                 </Button>
                               </div>
                             </DialogContent>
                           </Dialog>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
                {storageUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users created yet. Add your first user above.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Information</CardTitle>
                <CardDescription>
                  Use these details to connect to your storage space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SFTP Server</Label>
                  <div className="flex items-center gap-2">
                    <Input value="sftp://server:2022" readOnly />
                    <Button size="sm" onClick={() => copyToClipboard("sftp://server:2022")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Web Portal</Label>
                  <div className="flex items-center gap-2">
                    <Input value="http://server:8080/web/client" readOnly />
                    <Button size="sm" onClick={() => copyToClipboard("http://server:8080/web/client")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <div className="flex items-center gap-2">
                    <Input value={storageAccount?.account_email || ""} readOnly />
                    <Button size="sm" onClick={() => copyToClipboard(storageAccount?.account_email || "")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}