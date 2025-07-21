import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Clock, Phone } from "lucide-react";

export const Contact = () => {
  const handleWhatsApp = () => {
    window.open("https://wa.me/2348109595054", "_blank");
  };

  const handleEmail = () => {
    window.location.href = "mailto:emzywoo89@gmail.com?subject=GreenHost Inquiry";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 animate-scale-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to secure your data with GreenHost? We're here to help you choose the perfect storage solution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="shadow-soft hover-lift animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  WhatsApp Support
                </CardTitle>
                <CardDescription>
                  Get instant responses to your questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>+234 810 959 5054</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Available 24/7 for support</span>
                </div>
                <Button onClick={handleWhatsApp} className="w-full bg-gradient-primary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft hover-lift animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  Email Support
                </CardTitle>
                <CardDescription>
                  Send us detailed inquiries and specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>emzywoo89@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Response within 24 hours</span>
                </div>
                <Button onClick={handleEmail} variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-strong animate-scale-in">
            <CardHeader>
              <CardTitle>Why Contact Us?</CardTitle>
              <CardDescription>
                We're here to provide personalized solutions for your storage needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Pre-Sales Support</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Plan recommendations based on your needs</li>
                    <li>• Custom configuration consultations</li>
                    <li>• Security requirement discussions</li>
                    <li>• Integration planning assistance</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-primary">Technical Support</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Setup and configuration help</li>
                    <li>• Troubleshooting assistance</li>
                    <li>• Performance optimization tips</li>
                    <li>• User management guidance</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-lg">
                <h3 className="font-semibold mb-3">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-4">
                  Whether you have questions about our plans, need a custom solution, or want to discuss your specific requirements, 
                  we're here to help. Our team is ready to provide you with the information and support you need to make the best decision for your storage needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleWhatsApp} className="bg-gradient-primary flex-1">
                    Quick Chat on WhatsApp
                  </Button>
                  <Button onClick={handleEmail} variant="outline" className="flex-1">
                    Detailed Email Inquiry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};