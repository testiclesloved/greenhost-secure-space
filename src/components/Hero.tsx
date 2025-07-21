import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Cloud, Zap, Lock, Users, Globe } from "lucide-react";

export const Hero = () => {
  return (
    <section className="pt-20 pb-16 bg-gradient-hero min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="animate-scale-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Secure Cloud Storage
              <br />
              <span className="text-primary-glow">Redefined</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Experience premium file hosting with military-grade security, 
              lightning-fast speeds, and seamless collaboration tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                variant="glass" 
                size="xl" 
                className="hover-lift"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Cloud className="w-5 h-5 mr-2" />
                View Storage Plans
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => window.location.href = '/security'}
              >
                <Shield className="w-5 h-5 mr-2" />
                View Security
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto animate-slide-up">
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover-lift">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-glow/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-white/80">Upload and download files at incredible speeds with our optimized infrastructure.</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover-lift">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-glow/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Bank-Level Security</h3>
              <p className="text-white/80">Your files are protected with AES-256 encryption and ZeroTier networking.</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover-lift">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-glow/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-white/80">Share and collaborate on files with your team in a secure environment.</p>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12 animate-fade-in">
          <div className="flex items-center justify-center space-x-8 text-white/60">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Global CDN</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Zero Knowledge</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};