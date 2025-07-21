import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Copy, Download, Shield, Network, ArrowRight } from "lucide-react";

interface ZeroTierGuideProps {
  onClose: () => void;
}

export const ZeroTierGuide = ({ onClose }: ZeroTierGuideProps) => {
  const { toast } = useToast();
  const [networkId, setNetworkId] = useState('233ccaac274edbe5');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchNetworkId();
  }, []);

  const fetchNetworkId = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'zerotier_network_id')
        .single();

      if (error) throw error;
      setNetworkId(data.setting_value);
    } catch (error) {
      console.error('Error fetching network ID:', error);
    }
  };

  const copyNetworkId = () => {
    navigator.clipboard.writeText(networkId);
    toast({
      title: "Copied!",
      description: "Network ID copied to clipboard",
    });
  };

  const detectPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    if (userAgent.includes('windows')) return 'windows';
    if (userAgent.includes('mac')) return 'mac';
    if (userAgent.includes('linux')) return 'linux';
    return 'unknown';
  };

  const getDownloadLink = () => {
    const platform = detectPlatform();
    switch (platform) {
      case 'android':
        return 'https://play.google.com/store/apps/details?id=com.zerotier.one';
      case 'ios':
        return 'https://apps.apple.com/app/zerotier-one/id1084101492';
      case 'windows':
        return 'https://download.zerotier.com/dist/ZeroTier%20One.msi';
      case 'mac':
        return 'https://download.zerotier.com/dist/ZeroTier%20One.pkg';
      case 'linux':
        return 'https://www.zerotier.com/download/';
      default:
        return 'https://www.zerotier.com/download/';
    }
  };

  const openDownloadLink = () => {
    window.open(getDownloadLink(), '_blank');
    setCurrentStep(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-strong animate-scale-in">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Network className="w-6 h-6 text-primary" />
                ZeroTier Network Access
              </CardTitle>
              <CardDescription>
                Connect to our secure network to access your storage drive
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Security Overview */}
          <div className="bg-gradient-card p-4 rounded-lg border">
            <h3 className="flex items-center gap-2 font-semibold mb-3">
              <Shield className="w-5 h-5 text-primary" />
              Enterprise-Grade Security
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>End-to-end encryption with 256-bit AES</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Zero-trust network architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Military-grade onion layer security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Peer-to-peer encrypted tunneling</span>
              </div>
            </div>
          </div>

          {/* Step 1: Download */}
          <div className={`border rounded-lg p-4 ${currentStep >= 1 ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={currentStep >= 1 ? "default" : "secondary"}>
                Step 1
              </Badge>
              <h3 className="font-semibold">Download ZeroTier</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Download the ZeroTier application for your device to establish secure network connection.
            </p>
            <Button 
              onClick={openDownloadLink}
              className="bg-gradient-primary"
            >
              <Download className="w-4 h-4 mr-2" />
              Download ZeroTier
            </Button>
          </div>

          {/* Step 2: Network ID */}
          <div className={`border rounded-lg p-4 ${currentStep >= 2 ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={currentStep >= 2 ? "default" : "secondary"}>
                Step 2
              </Badge>
              <h3 className="font-semibold">Join Network</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Copy the network ID below and paste it into ZeroTier to join our secure network.
            </p>
            <div className="bg-card border rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Network ID</p>
                  <p className="text-lg font-mono font-bold text-primary">{networkId}</p>
                </div>
                <Button onClick={copyNetworkId} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => setCurrentStep(3)}
              disabled={currentStep < 2}
              variant="outline"
            >
              I've Joined the Network
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Step 3: Connection Instructions */}
          <div className={`border rounded-lg p-4 ${currentStep >= 3 ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant={currentStep >= 3 ? "default" : "secondary"}>
                Step 3
              </Badge>
              <h3 className="font-semibold">Connect to Network</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-card border rounded p-3">
                <p className="font-medium mb-1">For Desktop (Windows/Mac/Linux):</p>
                <p>1. Open ZeroTier application</p>
                <p>2. Paste the network ID: <code className="bg-muted px-1 rounded">{networkId}</code></p>
                <p>3. Click "Join Network"</p>
                <p>4. Wait for connection status to show "OK"</p>
              </div>
              <div className="bg-card border rounded p-3">
                <p className="font-medium mb-1">For Mobile (Android/iOS):</p>
                <p>1. Open ZeroTier app</p>
                <p>2. Tap "+" to add network</p>
                <p>3. Enter network ID: <code className="bg-muted px-1 rounded">{networkId}</code></p>
                <p>4. Enable the network toggle</p>
              </div>
            </div>
            <Button 
              onClick={() => setCurrentStep(4)}
              disabled={currentStep < 3}
              variant="outline"
              className="mt-4"
            >
              I'm Connected
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Step 4: Access Options */}
          {currentStep >= 4 && (
            <div className="border border-primary bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="default">Step 4</Badge>
                <h3 className="font-semibold">Access Your Storage</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you want to access your storage drive:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button className="h-auto p-4 flex flex-col gap-2" variant="outline">
                  <div className="font-semibold">Web Interface</div>
                  <div className="text-xs text-muted-foreground">
                    Access via browser
                  </div>
                </Button>
                <Button className="h-auto p-4 flex flex-col gap-2" variant="outline">
                  <div className="font-semibold">Map Drive</div>
                  <div className="text-xs text-muted-foreground">
                    Mount as local drive
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-gradient-primary">
              Complete Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};