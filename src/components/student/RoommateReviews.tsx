
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getBookedStudents, calculateCompatibilityScore, filterStudents } from '@/services/roommateService';
import { getStudentDetails } from '@/services/propertyService';
import { supabase } from '@/integrations/supabase/client';
import { Users, AlertCircle, Loader2, User, Phone } from 'lucide-react';
import RoommateCard from './RoommateCard';
import RoommateFilters, { FilterOptions } from './RoommateFilters';
import { StudentDetail } from '@/types/property';

interface RoommateReviewsProps {
  propertyId?: string;
}

export default function RoommateReviews({ propertyId }: RoommateReviewsProps) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    sleepSchedule: 'any',
    studyHabits: 'any'
  });

  // Get current user's profile data
  const { data: userProfile, isLoading: loadingProfile, error: profileError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Get current user's student details
  const { data: currentUserDetails } = useQuery({
    queryKey: ['currentUserDetails', user?.id],
    queryFn: () => user ? getStudentDetails(user.id) : Promise.resolve(null),
    enabled: !!user,
  });

  // Get all booked students
  const { data: bookedStudents, isLoading, error } = useQuery({
    queryKey: ['bookedStudents'],
    queryFn: getBookedStudents,
    enabled: !!user,
  });

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      sleepSchedule: 'any',
      studyHabits: 'any'
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
          <p className="text-muted-foreground">Please log in to view roommate recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || loadingProfile) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading roommate recommendations...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || profileError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load roommate data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter out current user and apply filters
  const otherStudents = (bookedStudents || []).filter(
    student => student.user_id !== user.id
  );

  const filteredStudents = filterStudents(otherStudents, filters);

  // Calculate compatibility scores and sort by score
  const studentsWithScores = filteredStudents.map(student => ({
    ...student,
    compatibilityScore: currentUserDetails 
      ? calculateCompatibilityScore(currentUserDetails, student)
      : 50
  })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Roommate Reviews</h1>
      </div>

      {/* User Profile Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {userProfile?.full_name || 'Not provided'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">
                  {userProfile?.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
          
          {(!userProfile?.full_name || !userProfile?.phone) && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete your profile information to improve roommate matching. 
                Missing: {!userProfile?.full_name && 'Name'} {!userProfile?.full_name && !userProfile?.phone && ', '} {!userProfile?.phone && 'Phone'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <RoommateFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Potential Roommates ({studentsWithScores.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentsWithScores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentsWithScores.map((student) => (
                <RoommateCard
                  key={student.id}
                  student={student}
                  compatibilityScore={student.compatibilityScore}
                />
              ))}
            </div>
          ) : otherStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Students Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No other students have booked PG accommodations yet.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Matches Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
