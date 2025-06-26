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
    <Card className="p-0 overflow-hidden shadow-md border-0">
      <div className="bg-gradient-to-r h-24 w-full flex items-center justify-center">
        <Avatar className="h-24 w-24 border-4 border-blue-600 shadow-lg bg-blue-800 -mb-12 z-10">
          <AvatarFallback className="text-3xl text-white-600">{getInitials()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="pt-14 pb-6 px-6 text-center bg-white rounded-b-lg">
        {!isEditing && (
          <>
            <h2 className="text-2xl font-bold mb-1">{userData.fullName}</h2>
            <p className="text-muted-foreground text-sm mb-2">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 font-medium border-blue-500 hover:bg-blue-50"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 text-destructive border-destructive hover:bg-destructive/10 font-medium"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}