import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Server, Users, Eye, Layers } from "lucide-react";

export const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 animate-scale-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              <Shield className="w-12 h-12 inline-block mr-4 text-primary" />
              Security First Approach
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how GreenHost outperforms other storage solutions with our innovative onion-layer security architecture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="shadow-soft hover-lift animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Layers className="w-6 h-6 text-primary" />
                  Onion Layer Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Multiple layers of security protect your data at every level - from network access to file encryption, 
                  creating an impenetrable fortress around your information.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover-lift animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Server className="w-6 h-6 text-primary" />
                  Isolated Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Each client gets their own isolated storage environment with dedicated resources, 
                  preventing cross-contamination and ensuring complete data separation.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover-lift animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary" />
                  End-to-End Encryption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Military-grade encryption protects your data both in transit and at rest, 
                  with keys that only you control and access.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover-lift animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Multi-User Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Granular permission controls allow you to manage team access precisely, 
                  with role-based security and audit trails for every action.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover-lift animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  24/7 Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time threat detection and monitoring systems watch over your data around the clock, 
                  with instant alerts for any suspicious activity.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover-lift animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  Zero-Trust Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our zero-trust model means every access request is verified and authenticated, 
                  regardless of location or previous access history.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-strong animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl">Why Choose GreenHost Over Competitors?</CardTitle>
              <CardDescription>
                Here's what sets us apart from traditional storage providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Traditional Storage Providers</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Shared infrastructure with security risks</li>
                    <li>• Basic encryption with provider-controlled keys</li>
                    <li>• Limited customization options</li>
                    <li>• Generic security measures for all clients</li>
                    <li>• Reactive security monitoring</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">GreenHost Advantage</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Completely isolated, dedicated environments</li>
                    <li>• Client-controlled encryption with multiple layers</li>
                    <li>• Fully customizable security configurations</li>
                    <li>• Tailored security policies per organization</li>
                    <li>• Proactive threat prevention and monitoring</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">The GreenHost Security Promise</h3>
                <p className="text-muted-foreground">
                  We don't just store your data - we protect it with enterprise-grade security that scales with your needs. 
                  Our onion-layer approach means that even if one security measure fails, multiple backup systems ensure 
                  your data remains safe and accessible only to authorized users.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};