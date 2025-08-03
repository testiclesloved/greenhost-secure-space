import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Check, AlertTriangle, ArrowLeft } from "lucide-react";

interface StoragePlan {
  id: string;
  name: string;
  storage_gb: number;
  monthly_fee: number;
  one_time_fee: number;
  description: string;
  plan_type: string;
}

interface AdminSettings {
  bank_name: string;
  account_number: string;
  account_name: string;
}

export const Checkout = () => {
  const { planType } = useParams<{ planType: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plan, setPlan] = useState<StoragePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);

  useEffect(() => {
    if (planType) {
      fetchPlan();
      fetchAdminSettings();
    } else {
      console.log('No planType provided, redirecting to dashboard');
      setLoading(false);
    }
  }, [planType]);

  const fetchAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['bank_name', 'account_number', 'account_name']);

      if (error) throw error;
      
      const settingsObj: any = {};
      data?.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      
      console.log('Admin settings fetched:', settingsObj); // Debug log
      setAdminSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching admin settings:', error);
    }
  };

  const fetchPlan = async () => {
    try {
      console.log('Fetching plan for planType:', planType);
      const { data, error } = await supabase
        .from('storage_plans')
        .select('*')
        .eq('plan_type', planType as any)
        .maybeSingle();

      console.log('Plan fetch result:', { data, error });
      if (error) throw error;
      
      if (data) {
        setPlan(data);
      } else {
        console.log('No plan found for planType:', planType);
        toast({
          title: "Plan not found",
          description: `No storage plan found for type: ${planType}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      toast({
        title: "Error",
        description: "Could not load plan details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!plan || !user) return;

    setProcessing(true);
    
    try {
      const totalAmount = plan.monthly_fee + (plan.one_time_fee || 0);
      
      const { error } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          storage_plan_id: plan.id,
          amount_paid: totalAmount,
          payment_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Payment submitted",
        description: "Your payment is being processed. You'll be notified once confirmed.",
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Complete Your Purchase
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure your cloud storage with GreenHost
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Details */}
            <Card className="shadow-strong animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {plan.name} Plan
                </CardTitle>
                <CardDescription>
                  Premium cloud storage solution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                    <span className="font-medium">Storage Space</span>
                    <Badge variant="secondary" className="text-lg">
                      {plan.storage_gb}GB
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                    <span className="font-medium">One-time Setup Fee</span>
                    <span className="text-xl font-bold text-primary">
                      ₦{(plan.one_time_fee || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gradient-card rounded-lg">
                    <span className="font-medium">Monthly Maintenance</span>
                    <span className="text-xl font-bold text-primary">
                      ₦{plan.monthly_fee.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">What's Included:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">High-speed internet connectivity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">24/7 maintenance and support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">Secure ZeroTier network access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">Enterprise-grade security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">Multi-user access management</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="shadow-strong animate-slide-up">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Complete your purchase securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-blue-900">
                        GreenHost Service Agreement
                      </p>
                      <p className="text-blue-800">
                        By proceeding with this purchase, you agree to our terms of service. 
                        Your storage will be provisioned within 24 hours of payment confirmation.
                      </p>
                      <p className="text-blue-800">
                        <strong>Trust & Verification:</strong> If you have any concerns about our 
                        services, you can book a consultation to meet with our development team 
                        in person for verification and peace of mind.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {adminSettings && Object.keys(adminSettings).length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Payment Details</h3>
                      <div className="space-y-2 text-sm">
                        {adminSettings.bank_name && (
                          <div className="flex justify-between">
                            <span className="text-blue-800 dark:text-blue-200">Bank Name:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">{adminSettings.bank_name}</span>
                          </div>
                        )}
                        {adminSettings.account_number && (
                          <div className="flex justify-between">
                            <span className="text-blue-800 dark:text-blue-200">Account Number:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">{adminSettings.account_number}</span>
                          </div>
                        )}
                        {adminSettings.account_name && (
                          <div className="flex justify-between">
                            <span className="text-blue-800 dark:text-blue-200">Account Name:</span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">{adminSettings.account_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-card p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Payment Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Storage Plan ({plan.name})</span>
                        <span>₦{plan.monthly_fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Space Amount (One-time payment)</span>
                        <span>₦{(plan.one_time_fee || 0).toLocaleString()}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount</span>
                        <span>₦{(plan.monthly_fee + (plan.one_time_fee || 0)).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        *Monthly maintenance fee of ₦{plan.monthly_fee.toLocaleString()} will be billed monthly after initial payment
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePurchase}
                    disabled={processing}
                    className="w-full bg-gradient-primary text-lg py-6"
                  >
                    {processing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    I Have Paid - Confirm Purchase
                  </Button>

                  <div className="text-center">
                    <Link to="/consultation">
                      <Button variant="link">
                        Book a consultation instead
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};