
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Building, GraduationCap, User, LogOut, Plus } from 'lucide-react';

export default function NavBar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Rent', path: '/rent', icon: Building },
    { name: 'Student PG', path: '/student-pg', icon: GraduationCap },
    { name: 'Profile', path: '/profile', icon: User, authRequired: true },
  ];

  // Only show nav items that the user has access to
  const filteredNavItems = navItems.filter(
    item => !item.authRequired || user
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 md:hidden z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 ${
                isActive(item.path)
                  ? 'text-homefinder-primary'
                  : 'text-gray-500 hover:text-homefinder-primary'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
          
          {user && (
            <>
              <Link
                to="/student-pg/add"
                className={`flex flex-col items-center p-2 ${
                  isActive('/student-pg/add')
                    ? 'text-homefinder-primary'
                    : 'text-gray-500 hover:text-homefinder-primary'
                }`}
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs mt-1">Add PG</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex flex-col items-center p-2 text-gray-500 hover:text-homefinder-primary"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-xs mt-1">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
