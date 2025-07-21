import { ArrowLeft, Home, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAdmin = user?.email === 'emzywoo89@gmail.com';
  const currentPath = location.pathname;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Back button and Logo */}
        <div className="flex items-center space-x-4">
          {currentPath !== '/' && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/57a44abd-e943-4884-bfc5-c53ecaf9bddc.png" 
              alt="GreenHost Logo" 
              className="h-8 w-8 rounded-full shadow-medium"
            />
            <h1 className="text-xl font-bold text-primary">GreenHost</h1>
          </Link>
        </div>
        
        {/* Center - Navigation links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`transition-colors ${currentPath === '/' ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
            <Home className="w-4 h-4 inline mr-1" />
            Home
          </Link>
          
          {user && (
            <Link to="/dashboard" className={`transition-colors ${currentPath === '/dashboard' ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
              <User className="w-4 h-4 inline mr-1" />
              Dashboard
            </Link>
          )}
          
          {isAdmin && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              Admin
            </span>
          )}
        </div>
        
        {/* Right side - Theme toggle and auth buttons */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};