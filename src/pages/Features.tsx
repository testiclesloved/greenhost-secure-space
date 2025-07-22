import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Server, 
  Globe, 
  Users, 
  Lock, 
  Zap, 
  Cloud, 
  Settings, 
  Monitor, 
  FileText,
  Key,
  UserPlus
} from "lucide-react";

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Powerful Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover all the advanced features that make our SFTPGo storage solution the perfect choice for your business.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>Military-grade encryption and security protocols</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AES-256-CBC encryption</li>
                  <li>• Secure tunnel communication</li>
                  <li>• Isolated company environments</li>
                  <li>• End-to-end encryption</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Server className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>SFTP Protocol</CardTitle>
                <CardDescription>Industry-standard secure file transfer</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Compatible with all SFTP clients</li>
                  <li>• FileZilla, WinSCP, Cyberduck support</li>
                  <li>• Command line access</li>
                  <li>• Automated scripting support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Web Interface</CardTitle>
                <CardDescription>Browser-based file management</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• No software installation required</li>
                  <li>• Drag & drop file uploads</li>
                  <li>• Mobile-friendly interface</li>
                  <li>• Real-time file preview</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Multi-User Support</CardTitle>
                <CardDescription>Manage teams and permissions easily</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unlimited users per company</li>
                  <li>• Individual user credentials</li>
                  <li>• Shared quota management</li>
                  <li>• User activity tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Automated Setup</CardTitle>
                <CardDescription>Zero-configuration deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Instant server provisioning</li>
                  <li>• Automatic configuration</li>
                  <li>• No technical knowledge required</li>
                  <li>• Ready in minutes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>24/7 Monitoring</CardTitle>
                <CardDescription>Continuous system health monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Real-time server monitoring</li>
                  <li>• Automated health checks</li>
                  <li>• Instant error detection</li>
                  <li>• Performance optimization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Management Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Management Features</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>Complete control over your storage environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">User Management</h4>
                    <p className="text-sm text-muted-foreground">Add, remove, and manage users in your company space</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Access Control</h4>
                    <p className="text-sm text-muted-foreground">Set permissions and access levels for each user</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Activity Logs</h4>
                    <p className="text-sm text-muted-foreground">Track user activity and file operations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-primary" />
                  Storage Management
                </CardTitle>
                <CardDescription>Flexible storage options and quota management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Usage Monitoring</h4>
                    <p className="text-sm text-muted-foreground">Real-time storage usage tracking and alerts</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Quota Management</h4>
                    <p className="text-sm text-muted-foreground">Easily upgrade or modify your storage limits</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold">Backup & Recovery</h4>
                    <p className="text-sm text-muted-foreground">Automated backups and disaster recovery options</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Technical Specifications</h2>
          
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>Built on proven technologies for reliability and security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Encryption
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• AES-256-CBC encryption</li>
                    <li>• RSA key exchange</li>
                    <li>• Perfect Forward Secrecy</li>
                    <li>• HMAC authentication</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    Infrastructure
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• SFTPGo server technology</li>
                    <li>• Docker containerization</li>
                    <li>• Load-balanced architecture</li>
                    <li>• Redundant storage systems</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Connectivity
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Zrok tunnel protection</li>
                    <li>• High-availability endpoints</li>
                    <li>• Global CDN integration</li>
                    <li>• API-first architecture</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance & Reliability */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Performance & Reliability</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-card rounded-lg border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm font-semibold mb-1">Uptime SLA</div>
              <div className="text-xs text-muted-foreground">Guaranteed availability</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-card rounded-lg border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">&lt;100ms</div>
              <div className="text-sm font-semibold mb-1">API Response</div>
              <div className="text-xs text-muted-foreground">Average response time</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-card rounded-lg border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm font-semibold mb-1">Monitoring</div>
              <div className="text-xs text-muted-foreground">Continuous oversight</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-card rounded-lg border border-border/50">
              <div className="text-3xl font-bold text-primary mb-2">256-bit</div>
              <div className="text-sm font-semibold mb-1">Encryption</div>
              <div className="text-xs text-muted-foreground">Military-grade security</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-card p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience These Features?</h2>
          <p className="text-muted-foreground mb-6">
            Start with our free tier or choose a plan that fits your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/#pricing" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Pricing Plans
            </a>
            <a 
              href="/consultation" 
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Book Demo
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;