import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, MapPin, Shield, Users, Calendar } from "lucide-react";

export const Consultation = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/2348109595054", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:emzywoo89@gmail.com?subject=GreenHost Consultation Request&body=Hello, I would like to schedule a consultation to discuss GreenHost services and verify your legitimacy. Please let me know your available times.";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 animate-scale-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              We Understand Your Concerns
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Skeptical about cloud storage providers? We completely understand. That's why we're more than willing to meet up and discuss everything about our services in person.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-soft hover-lift animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Meet Our Team
                </CardTitle>
                <CardDescription>
                  Schedule a face-to-face consultation with our development team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>We can meet at a convenient location for you</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Flexible scheduling to fit your availability</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Bring all your security questions and concerns</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover-lift animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  Quick Contact
                </CardTitle>
                <CardDescription>
                  Reach out immediately for consultation scheduling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleWhatsApp} className="w-full bg-gradient-primary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp: +234 810 959 5054
                </Button>
                <Button onClick={handleEmail} variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email: emzywoo89@gmail.com
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-strong animate-scale-in">
            <CardHeader>
              <CardTitle>Why We Offer In-Person Consultations</CardTitle>
              <CardDescription>
                Building trust through transparency and personal interaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Transparency First</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Meet the actual people behind GreenHost</li>
                    <li>• See our development process firsthand</li>
                    <li>• Ask any technical questions directly</li>
                    <li>• Verify our credentials and expertise</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Peace of Mind</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Understand our security infrastructure</li>
                    <li>• Learn about our data protection measures</li>
                    <li>• Discuss custom solutions for your needs</li>
                    <li>• Build a lasting business relationship</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-lg">
                <h3 className="font-semibold mb-3">What We'll Discuss</h3>
                <p className="text-muted-foreground mb-4">
                  During our consultation, we'll walk you through our entire infrastructure, explain our security measures, 
                  show you how your data will be protected, and answer any concerns you might have. We believe that trust 
                  is built through transparency, not just promises.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleWhatsApp} className="bg-gradient-primary flex-1">
                    Schedule via WhatsApp
                  </Button>
                  <Button onClick={handleEmail} variant="outline" className="flex-1">
                    Schedule via Email
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">We Value Your Trust</h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  We know that choosing a cloud storage provider is a big decision. Your data security and privacy are paramount, 
                  and we're committed to proving that GreenHost is the right choice for you. Let's meet and discuss how we can 
                  earn your trust and protect your valuable data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};