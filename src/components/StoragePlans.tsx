import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoragePlan {
  id: string;
  name: string;
  storage_gb: number;
  monthly_fee: number;
  description: string;
  plan_type: string;
  one_time_fee?: number;
}

export const StoragePlans = () => {
  const [plans, setPlans] = useState<StoragePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('storage_plans')
        .select('*')
        .eq('is_active', true)
        .order('storage_gb', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load storage plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeatures = (plan: StoragePlan) => {
    const baseFeatures = [
      `${plan.storage_gb}GB storage space`,
      "SFTP/Web access",
      "24/7 monitoring",
      "Data encryption",
      "Regular backups"
    ];

    if (plan.plan_type === 'enterprise') {
      return [
        ...baseFeatures,
        "Dedicated support team",
        "Custom configuration",
        "White-label options",
        "Enterprise SLA"
      ];
    }

    if (plan.plan_type === 'custom') {
      return [
        `${plan.storage_gb}TB+ storage space`,
        "Custom configuration",
        "Dedicated support team",
        "White-label options",
        "Enterprise SLA",
        "Custom integrations",
        "On-premise deployment"
      ];
    }

    return baseFeatures;
  };

  const handlePlanSelect = (plan: StoragePlan) => {
    if (plan.plan_type === "custom") {
      // Redirect to consultation page
      navigate("/consultation");
    } else {
      // Use React Router navigation instead of window.location
      navigate(`/checkout/${plan.plan_type}`);
    }
  };

  if (loading) {
    return (
      <section id="pricing" className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading plans...</div>
          </div>
        </div>
      </section>
    );
  }

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
          {plans.map((plan, index) => {
            const features = getFeatures(plan);
            const isPopular = plan.plan_type === 'enterprise';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative p-6 hover-lift shadow-soft animate-slide-up ${
                  isPopular ? 'border-primary shadow-medium' : ''
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {plan.plan_type === 'custom' ? 'Contact us' : `₦${plan.monthly_fee.toLocaleString()}`}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {plan.plan_type === 'custom' ? 'Custom pricing' : 'per month'}
                  </p>
                  <p className="text-muted-foreground mt-3">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full group ${
                    isPopular 
                      ? 'bg-gradient-primary hover:opacity-90' 
                      : 'bg-gradient-secondary hover:opacity-90'
                  }`}
                  variant={isPopular ? "default" : "outline"}
                >
                  {plan.plan_type === 'custom' ? 'Contact Sales' : 'Get Started'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};