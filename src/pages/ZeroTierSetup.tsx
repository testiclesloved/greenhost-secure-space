import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Copy, Download, Network, CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ZeroTierSetup() {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  
  const networkId = "17d709436ce2dd76"; // Your actual ZeroTier network ID
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Network ID copied to clipboard",
    });
  };

  const handleConnected = () => {
    setIsConnected(true);
    setTimeout(() => {
      window.close(); // Close the popup/tab
      // If it can't close, redirect to storage panel
      window.location.href = '/storage-panel';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ZeroTier Network Setup</h1>
          <p className="text-gray-600">Connect to our secure network to access your storage</p>
        </div>

        {!isConnected ? (
          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Step 1: Download ZeroTier
                </CardTitle>
                <CardDescription>
                  Download and install ZeroTier client for your operating system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    className="h-auto flex-col gap-2 p-4"
                    variant="outline"
                    onClick={() => window.open('https://www.zerotier.com/download/', '_blank')}
                  >
                    <Download className="w-6 h-6" />
                    <span>Download for Windows</span>
                  </Button>
                  <Button
                    className="h-auto flex-col gap-2 p-4"
                    variant="outline"
                    onClick={() => window.open('https://www.zerotier.com/download/', '_blank')}
                  >
                    <Download className="w-6 h-6" />
                    <span>Download for macOS</span>
                  </Button>
                  <Button
                    className="h-auto flex-col gap-2 p-4"
                    variant="outline"
                    onClick={() => window.open('https://www.zerotier.com/download/', '_blank')}
                  >
                    <Download className="w-6 h-6" />
                    <span>Download for Linux</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Step 2: Join Our Network
                </CardTitle>
                <CardDescription>
                  Use our network ID to connect to our secure storage network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Network ID:</p>
                      <code className="text-lg font-mono bg-white px-3 py-2 rounded border">
                        {networkId}
                      </code>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(networkId)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Install and open ZeroTier client on your device</li>
                    <li>Look for the ZeroTier icon in your system tray (Windows) or menu bar (macOS)</li>
                    <li>Right-click the icon and select "Join Network"</li>
                    <li>Enter the Network ID: <code className="bg-gray-100 px-1 rounded">{networkId}</code></li>
                    <li>Click "Join" and wait for connection (may take 1-2 minutes)</li>
                    <li>You should see a green status indicating you're connected</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your connection request will be automatically approved. 
                    If you don't see a connection after 2 minutes, please contact support.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Step 3: Verify Connection
                </CardTitle>
                <CardDescription>
                  Confirm you're connected to proceed to your storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="mb-4">Once you've joined the network and see a connected status:</p>
                  <Button
                    onClick={handleConnected}
                    className="bg-gradient-primary text-white px-8 py-2"
                  >
                    I'm Connected - Access Storage
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('https://docs.zerotier.com/', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    ZeroTier Documentation
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('/contact', '_blank')}
                  >
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="text-center border-green-200">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">Successfully Connected!</h2>
              <p className="text-gray-600 mb-4">
                You're now connected to our secure network. Redirecting to your storage...
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connection Verified
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}