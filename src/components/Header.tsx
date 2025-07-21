import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/57a44abd-e943-4884-bfc5-c53ecaf9bddc.png" 
            alt="GreenHost Logo" 
            className="h-10 w-10 rounded-full shadow-medium animate-float"
          />
          <h1 className="text-2xl font-bold text-primary">GreenHost</h1>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
        </nav>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};