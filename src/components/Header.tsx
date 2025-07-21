import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/57a44abd-e943-4884-bfc5-c53ecaf9bddc.png" 
            alt="GreenHost Logo" 
            className="h-10 w-10 animate-float"
          />
          <h1 className="text-2xl font-bold text-primary">GreenHost</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
          <Button variant="hero" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};