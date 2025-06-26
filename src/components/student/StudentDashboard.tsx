
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentDetails, updateStudentDetails, getPropertyResidents, getPropertyById } from '@/services/propertyService';
import { StudentDetail } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Home, User, Users, MessageSquare, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import RoommateReviews from './RoommateReviews';
import PropertyDetails from './PropertyDetails';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(undefined);
  const [moveOutDate, setMoveOutDate] = useState<Date | undefined>(undefined);
  
  const [formData, setFormData] = useState<Partial<StudentDetail>>({
    college_name: '',
    course: '',
    year_of_study: '',
    emergency_contact: '',
    preferences: {
      cleanliness: 3,
      noise_level: 3,
      sleep_schedule: 'regular',
      guests_preference: 'occasional'
    }
  });
  
  // Fetch student details
  const { data: studentDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['studentDetails', user?.id],
    queryFn: () => user ? getStudentDetails(user.id) : Promise.resolve(null),
    enabled: !!user,
  });
  
  // Fetch property details if student has a property
  const { data: property, isLoading: loadingProperty } = useQuery({
    queryKey: ['property', studentDetails?.property_id],
    queryFn: () => studentDetails?.property_id ? getPropertyById(studentDetails.property_id) : Promise.resolve(null),
    enabled: !!studentDetails?.property_id,
  });
  
  // Fetch residents of the student's PG
  const { data: residents, isLoading: loadingResidents } = useQuery({
    queryKey: ['residents', studentDetails?.property_id],
    queryFn: () => studentDetails?.property_id ? getPropertyResidents(studentDetails.property_id) : Promise.resolve([]),
    enabled: !!studentDetails?.property_id,
  });
  
  // Update student details mutation
  const updateDetailsMutation = useMutation({
    mutationFn: (details: Partial<StudentDetail>) => {
      if (!user || !studentDetails?.property_id) {
        throw new Error("User or property not found");
      }
      return updateStudentDetails(user.id, studentDetails.property_id, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentDetails', user?.id] });
      toast.success('Your details have been updated');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update your details');
    }
  });
  
  // Set form data when student details are loaded
  useEffect(() => {
    if (studentDetails) {
      setFormData({
        college_name: studentDetails.college_name || '',
        course: studentDetails.course || '',
        year_of_study: studentDetails.year_of_study || '',
        emergency_contact: studentDetails.emergency_contact || '',
        preferences: studentDetails.preferences || {
          cleanliness: 3,
          noise_level: 3,
          sleep_schedule: 'regular',
          guests_preference: 'occasional'
        }
      });
      
      if (studentDetails.move_in_date) {
        setMoveInDate(new Date(studentDetails.move_in_date));
      }
      
      if (studentDetails.move_out_date) {
        setMoveOutDate(new Date(studentDetails.move_out_date));
      }
    }
  }, [studentDetails]);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePreferenceChange = (preference: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: value
      }
    }));
  };
  
  const handleSubmit = () => {
    if (!user || !studentDetails?.property_id) return;
    
    const updatedDetails = {
      ...formData,
      move_in_date: moveInDate ? moveInDate.toISOString() : undefined,
      move_out_date: moveOutDate ? moveOutDate.toISOString() : undefined
    };
    
    updateDetailsMutation.mutate(updatedDetails);
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
        <p className="mb-6">Please log in to access your student dashboard.</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }
  
  if (loadingDetails || loadingProperty) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!studentDetails || !studentDetails.property_id) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
        <p className="mb-6">You haven't booked a PG accommodation yet.</p>
        <Button onClick={() => navigate('/student-pg')}>Browse PG Accommodations</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Home className="mr-2 h-8 w-8 text-primary" />
        Student Dashboard
      </h1>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            My Details
          </TabsTrigger>
          <TabsTrigger value="property" className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            PG Details
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>
        
        {/* My Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>My Personal Details</span>
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Details'}
                </Button>
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="college_name">College/University</Label>
                      <Input 
                        id="college_name"
                        name="college_name" 
                        value={formData.college_name} 
                        onChange={handleFormChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="course">Course/Degree</Label>
                      <Input 
                        id="course"
                        name="course" 
                        value={formData.course} 
                        onChange={handleFormChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year_of_study">Year of Study</Label>
                      <Input 
                        id="year_of_study"
                        name="year_of_study" 
                        value={formData.year_of_study} 
                        onChange={handleFormChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">Emergency Contact</Label>
                      <Input 
                        id="emergency_contact"
                        name="emergency_contact" 
                        value={formData.emergency_contact} 
                        onChange={handleFormChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Move-in Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {moveInDate ? format(moveInDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={moveInDate}
                            onSelect={setMoveInDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Move-out Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {moveOutDate ? format(moveOutDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={moveOutDate}
                            onSelect={setMoveOutDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preferences</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Cleanliness (1-5)</Label>
                        <div className="flex items-center mt-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.preferences?.cleanliness || 3}
                            onChange={(e) => handlePreferenceChange('cleanliness', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            title="Select your cleanliness preference from 1 (Relaxed) to 5 (Very clean)"
                          />
                          <span className="ml-2 font-medium">
                            {formData.preferences?.cleanliness || 3}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Relaxed</span>
                          <span>Very clean</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Noise Level (1-5)</Label>
                        <div className="flex items-center mt-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.preferences?.noise_level || 3}
                            onChange={(e) => handlePreferenceChange('noise_level', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="ml-2 font-medium">
                            {formData.preferences?.noise_level || 3}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Very quiet</span>
                          <span>Noisy</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="sleep_schedule">Sleep Schedule</Label>
                        <select
                          id="sleep_schedule"
                          value={formData.preferences?.sleep_schedule || 'regular'}
                          onChange={(e) => handlePreferenceChange('sleep_schedule', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="early">Early Bird (Before 10 PM)</option>
                          <option value="regular">Regular (10 PM - 12 AM)</option>
                          <option value="night">Night Owl (After 12 AM)</option>
                          <option value="variable">Variable Schedule</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="guests_preference">Guest Preference</Label>
                        <select
                          id="guests_preference"
                          value={formData.preferences?.guests_preference || 'occasional'}
                          onChange={(e) => handlePreferenceChange('guests_preference', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          <option value="often">Often welcome guests</option>
                          <option value="occasional">Occasionally welcome guests</option>
                          <option value="rarely">Rarely welcome guests</option>
                          <option value="never">Prefer no guests</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-lg mb-3">Personal Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{user.user_metadata?.fullName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{user.email || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">College/University:</span>
                          <span className="font-medium">{studentDetails.college_name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Course/Degree:</span>
                          <span className="font-medium">{studentDetails.course || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Year of Study:</span>
                          <span className="font-medium">{studentDetails.year_of_study || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Emergency Contact:</span>
                          <span className="font-medium">{studentDetails.emergency_contact || '-'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-3">Stay Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property:</span>
                          <span className="font-medium">{property?.title || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{property?.location || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Move-in Date:</span>
                          <span className="font-medium">
                            {studentDetails.move_in_date 
                              ? format(new Date(studentDetails.move_in_date), 'PPP')
                              : '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Move-out Date:</span>
                          <span className="font-medium">
                            {studentDetails.move_out_date
                              ? format(new Date(studentDetails.move_out_date), 'PPP')
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-3">Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cleanliness:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "h-4 w-4",
                                  i <= (studentDetails.preferences?.cleanliness || 3) 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-300"
                                )} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Noise Level:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "h-4 w-4",
                                  i <= (studentDetails.preferences?.noise_level || 3) 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-300"
                                )} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sleep Schedule:</span>
                          <span className="font-medium">
                            {studentDetails.preferences?.sleep_schedule === 'early' && 'Early Bird'}
                            {studentDetails.preferences?.sleep_schedule === 'regular' && 'Regular'}
                            {studentDetails.preferences?.sleep_schedule === 'night' && 'Night Owl'}
                            {studentDetails.preferences?.sleep_schedule === 'variable' && 'Variable'}
                            {!studentDetails.preferences?.sleep_schedule && 'Not specified'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guest Preference:</span>
                          <span className="font-medium">
                            {studentDetails.preferences?.guests_preference === 'often' && 'Often welcome guests'}
                            {studentDetails.preferences?.guests_preference === 'occasional' && 'Occasionally welcome guests'}
                            {studentDetails.preferences?.guests_preference === 'rarely' && 'Rarely welcome guests'}
                            {studentDetails.preferences?.guests_preference === 'never' && 'Prefer no guests'}
                            {!studentDetails.preferences?.guests_preference && 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={updateDetailsMutation.isPending}
                >
                  {updateDetailsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        {/* Property Details Tab */}
        <TabsContent value="property" className="mt-6">
          {property && <PropertyDetails property={property} />}
        </TabsContent>
        
        {/* Roommates Tab */}
        
        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          {studentDetails?.property_id && (
            <RoommateReviews propertyId={studentDetails.property_id} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
