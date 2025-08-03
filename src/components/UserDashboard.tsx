import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "./Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Wifi, AlertTriangle } from "lucide-react";
import { ZeroTierGuide } from "./ZeroTierGuide";

interface UserProfile {
  zerotier_connected: boolean;
}

export const UserDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showZeroTierGuide, setShowZeroTierGuide] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('zerotier_connected')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDrive = () => {
    if (!userProfile?.zerotier_connected) {
      setShowZeroTierGuide(true);
    } else {
      // Show connection reminder
      setShowConnectionReminder(true);
    }
  };

  const [showConnectionReminder, setShowConnectionReminder] = useState(false);

  const handleConnected = async () => {
    try {
      // Update user profile to mark ZeroTier as connected
      await supabase
        .from('profiles')
        .update({ zerotier_connected: true })
        .eq('user_id', user?.id);

      setUserProfile(prev => prev ? { ...prev, zerotier_connected: true } : { zerotier_connected: true });
      setShowZeroTierGuide(false);
      setShowConnectionReminder(false);
      
      // Open the drive URL in a new tab
      window.open('http://172.26.181.241:8080/', '_blank');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDirectAccess = () => {
    window.open('http://172.26.181.241:8080/', '_blank');
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
          <p className="text-muted-foreground">Access your secure cloud storage</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-strong">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to GreenHost Storage</CardTitle>
              <CardDescription>
                Secure, encrypted cloud storage with enterprise-grade protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-gradient-card p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Access Your Storage Drive</h3>
                  <p className="text-muted-foreground mb-4">
                    Click the button below to access your secure storage space
                  </p>
                  <Button
                    onClick={handleAccessDrive}
                    size="lg"
                    className="bg-gradient-primary text-white px-8 py-4 text-lg"
                  >
                    <ExternalLink className="w-6 h-6 mr-2" />
                    Access Storage Drive
                  </Button>
                </div>

                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Wifi className="w-4 h-4" />
                  <span>Secure network connection required for access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ZeroTier Setup Guide */}
      {showZeroTierGuide && (
        <ZeroTierGuide 
          onClose={() => setShowZeroTierGuide(false)} 
          onConnected={handleConnected}
        />
      )}

      {/* Connection Reminder Modal */}
      {showConnectionReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Network Connection Required
              </CardTitle>
              <CardDescription>
                For security, you must be connected to our ZeroTier network to access storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please ensure you are connected to the ZeroTier network before accessing your storage.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDirectAccess}
                  className="flex-1 bg-gradient-primary"
                >
                  I'm Connected
                </Button>
                <Button
                  onClick={() => {
                    setShowConnectionReminder(false);
                    setShowZeroTierGuide(true);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Setup Network
                </Button>
              </div>
              <Button
                onClick={() => setShowConnectionReminder(false)}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};