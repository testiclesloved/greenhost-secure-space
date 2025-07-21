import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Mail } from "lucide-react";

export const StoragePlans = () => {
  const plans = [
    {
      name: "Personal",
      storage: "500GB+",
      price: "₦15,000",
      period: "/month",
      description: "Perfect for individuals and small projects",
      features: [
        "500GB+ storage space",
        "One-time disk purchase",
        "₦15,000 monthly internet & maintenance",
        "Personal file management",
        "Basic support",
        "Web & mobile access"
      ],
      popular: false,
      variant: "hero" as const
    },
    {
      name: "Enterprise",
      storage: "1TB+",
      price: "₦15,000",
      period: "/month",
      description: "Ideal for growing businesses and teams",
      features: [
        "1TB+ storage space",
        "Advanced file sharing",
        "₦15,000 monthly internet & maintenance",
        "Team collaboration tools",
        "Priority support",
        "Advanced security features",
        "API access"
      ],
      popular: true,
      variant: "premium" as const
    },
    {
      name: "Custom",
      storage: "10TB+",
      price: "Custom",
      period: "pricing",
      description: "Tailored solutions for large organizations",
      features: [
        "10TB+ storage space",
        "Custom configuration",
        "Dedicated support team",
        "White-label options",
        "Enterprise SLA",
        "Custom integrations",
        "On-premise deployment"
      ],
      popular: false,
      variant: "success" as const
    }
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName === "Custom") {
      // Redirect to email for appointment booking
      window.location.href = "mailto:support@greenhost.com?subject=Custom Plan Consultation&body=I'm interested in the Custom 10TB+ plan. Please schedule a consultation to discuss my requirements.";
    } else {
      // Redirect to checkout page
      console.log(`Proceeding to checkout for ${planName} plan`);
      // This will be implemented later with proper routing
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-scale-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your Storage Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the perfect storage solution for your needs. All plans include our premium security features and reliable support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative p-6 hover-lift shadow-soft animate-slide-up ${
                plan.popular ? 'border-primary shadow-medium' : ''
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-primary">{plan.storage}</div>
                  <div className="text-lg text-foreground">
                    {plan.price}
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  variant={plan.variant} 
                  size="lg" 
                  className="w-full"
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.name === "Custom" ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Book Consultation
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in">
          <p className="text-muted-foreground">
            All plans include our secure ZeroTier networking and 24/7 support.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Not sure which plan is right for you? 
            <a href="mailto:support@greenhost.com" className="text-primary hover:underline ml-1">
              Contact us for personalized recommendations
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};