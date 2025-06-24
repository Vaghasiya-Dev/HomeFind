
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, LogOut } from 'lucide-react';
import { ProfileFormValues } from '@/types/profile';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileHeaderProps {
  userData: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
  };
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setUserData: (values: ProfileFormValues) => void;
}

export default function ProfileHeader({ userData, isEditing, setIsEditing }: ProfileHeaderProps) {
  const { signOut, user } = useAuth();
  
  const handleLogout = () => {
    signOut();
  };
  
  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!userData.fullName) return '??';
    return userData.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="p-6 text-center">
      <Avatar className="h-24 w-24 mx-auto mb-4">
        <AvatarImage src="https://randomuser.me/api/portraits/men/24.jpg" alt="User profile" />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      
      {!isEditing && (
        <>
          <h2 className="text-xl font-semibold">{userData.fullName}</h2>
          <p className="text-muted-foreground">
            Member since {new Date(user?.created_at || '').toLocaleDateString()}
          </p>
          
          <div className="mt-6 space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 text-destructive border-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
