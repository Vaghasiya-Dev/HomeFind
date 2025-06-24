import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Home, Building, GraduationCap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Buy', path: '/buy', icon: Home },
    { name: 'Rent', path: '/rent', icon: Building },
    { name: 'Student PG', path: '/student-pg', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="bg-gradient-to-r from-homefinder-primary to-homefinder-secondary rounded-lg p-2 mr-2">
            <Home className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-bold text-2xl bg-gradient-to-r from-homefinder-primary to-homefinder-secondary bg-clip-text text-transparent">
            Home Finder
          </h1>
        </Link>
        
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                isActive(item.path) 
                  ? "bg-homefinder-light text-homefinder-primary" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
        
        {/* Search bar removed */}
        
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  className="text-sm font-medium flex items-center gap-2 rounded-full"
                >
                  <div className="bg-homefinder-primary w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-xs">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:inline">My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student-pg/management')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>PG Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student-pg/add')}>
                  <Building className="mr-2 h-4 w-4" />
                  <span>List PG Property</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={handleLoginClick}
              >
                Login
              </Button>
              <Button
                variant="default"
                className="text-sm font-medium bg-primary text-white hover:bg-homefinder-accent transition-colors"
                onClick={handleSignupClick}
              >
                Sign Up
              </Button>
            </>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}