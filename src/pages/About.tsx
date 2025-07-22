import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Server, Lock, Users, Zap, Globe } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            About Our SFTPGo Service
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Learn how our secure, automated storage service works and how to get the most out of your storage solution.
          </p>
        </div>

        {/* Service Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                What is SFTPGo?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                SFTPGo is a powerful, secure file transfer server that supports SFTP, FTP, and WebDAV protocols. 
                Our service provides you with automated SFTPGo instances with enterprise-grade security and management.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">SFTP Protocol</Badge>
                <Badge variant="secondary">Web Interface</Badge>
                <Badge variant="secondary">Multi-user Support</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Enterprise Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All communications are encrypted using AES-256-CBC encryption. Your data is protected with 
                industry-standard security protocols and isolated environments for each company.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">AES-256 Encryption</Badge>
                <Badge variant="secondary">Isolated Environments</Badge>
                <Badge variant="secondary">Secure Tunneling</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How Our Service Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Purchase Storage</h3>
              <p className="text-muted-foreground">
                Choose your storage plan and complete the secure checkout process. Your company account is automatically created.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Automatic Setup</h3>
              <p className="text-muted-foreground">
                Our system automatically provisions your SFTPGo server, creates your company space, and provides secure access credentials.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Access & Manage</h3>
              <p className="text-muted-foreground">
                Access your files via SFTP clients or web interface. Add users to your company space and manage permissions easily.
              </p>
            </div>
          </div>
        </div>

        {/* User Guide */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">User Guide</h2>
          
          <div className="grid gap-8">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>🚀 Getting Started</CardTitle>
                <CardDescription>Step-by-step guide to using your storage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 1: Access Your Dashboard</h4>
                  <p className="text-muted-foreground text-sm">
                    After purchasing, log into your dashboard to view your storage account details and manage users.
                  </p>
                </div>
                
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 2: Company Web Panel Access</h4>
                  <p className="text-muted-foreground text-sm">
                    Use your company email and admin password to access the storage panel at <code className="bg-muted px-2 py-1 rounded">/storage-panel</code>
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 3: Add Users to Your Space</h4>
                  <p className="text-muted-foreground text-sm">
                    Create users for your team. Each user gets SFTP access and web interface login credentials.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold mb-2">Step 4: Connect with SFTP Client</h4>
                  <p className="text-muted-foreground text-sm">
                    Use any SFTP client (FileZilla, WinSCP, etc.) with the provided connection details to access your files.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>🔐 Access Methods</CardTitle>
                <CardDescription>Multiple ways to access your storage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      SFTP Access
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Use any SFTP client software</li>
                      <li>• Secure file transfer protocol</li>
                      <li>• Command line or GUI access</li>
                      <li>• Perfect for automated backups</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Web Interface
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Browser-based file management</li>
                      <li>• Upload/download files easily</li>
                      <li>• No software installation required</li>
                      <li>• Access from anywhere</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>⚙️ Technical Architecture</CardTitle>
                <CardDescription>How our system ensures security and reliability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-mono text-sm font-semibold mb-2">Communication Flow:</h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    Website → Zrok Tunnel → Middleman (AES Encryption) → SFTPGo Server
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">🔒 Encryption Details</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• AES-256-CBC encryption</li>
                      <li>• Unique IV for each request</li>
                      <li>• Secure key exchange</li>
                      <li>• Request/response validation</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2">🌐 Network Security</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Zrok tunnel protection</li>
                      <li>• Isolated company environments</li>
                      <li>• Automated provisioning</li>
                      <li>• 24/7 monitoring</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center bg-gradient-card p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is ready to help you get the most out of your storage solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="/consultation" 
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Book Consultation
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;