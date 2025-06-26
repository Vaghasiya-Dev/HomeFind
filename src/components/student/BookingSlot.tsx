
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { StudentDetail } from '@/types/property';

interface BookingSlotProps {
  propertyId?: string;
}

// Update the Booking interface to match the data structure from the student_details table
interface Booking {
  id: string;
  user_id: string;
  property_id: string;
  college_name_pkey?: string;
  course?: string;
  degree?: string;
  branch?: string;
  year_of_study?: string;
  move_in_date?: string;
  move_out_date?: string;
  emergency_contact?: string;
  daily_routine?: {
    wake_up_time?: string;
    sleep_time?: string;
    study_hours?: string[];
    meal_times?: string[];
    work_schedule?: string;
    extracurricular_activities?: string;
    [key: string]: any;
  };
  preferences?: {
    room_type?: string;
    special_requests?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

const dailyRoutineTimeOptions = [
  '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
  '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'
];

export default function BookingSlot({ propertyId }: BookingSlotProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [moveInDate, setMoveInDate] = useState<Date | undefined>(undefined);
  const [moveOutDate, setMoveOutDate] = useState<Date | undefined>(undefined);
  const [roomType, setRoomType] = useState('shared');
  const [specialRequests, setSpecialRequests] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [wakeUpTime, setWakeUpTime] = useState('7:00 AM');
  const [sleepTime, setSleepTime] = useState('11:00 PM');
  const [workSchedule, setWorkSchedule] = useState('');
  const [extracurricularActivities, setExtracurricularActivities] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Get user's booking if it exists
  const { data: existingBooking, isLoading } = useQuery({
    queryKey: ['booking', user?.id, propertyId],
    queryFn: async () => {
      if (!user || !propertyId) return null;
      
      console.log('Fetching booking for user:', user.id, 'property:', propertyId);
      
      const { data, error } = await supabase
        .from('student_details')
        .select('*')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching booking:', error);
        throw error;
      }
      
      console.log('Existing booking data:', data);
      return data as Booking | null;
    },
    enabled: !!user && !!propertyId,
  });

  // Initialize form with existing booking data if available
  React.useEffect(() => {
    if (existingBooking) {
      console.log('Initializing form with existing booking:', existingBooking);
      if (existingBooking.move_in_date) {
        setMoveInDate(new Date(existingBooking.move_in_date));
      }
      if (existingBooking.move_out_date) {
        setMoveOutDate(new Date(existingBooking.move_out_date));
      }
      if (existingBooking.preferences?.room_type) {
        setRoomType(existingBooking.preferences.room_type);
      }
      if (existingBooking.preferences?.special_requests) {
        setSpecialRequests(existingBooking.preferences.special_requests);
      }
      if (existingBooking.college_name_pkey) {
        setCollegeName(existingBooking.college_name_pkey);
      }
      if (existingBooking.degree) {
        setDegree(existingBooking.degree);
      }
      if (existingBooking.branch) {
        setBranch(existingBooking.branch);
      }
      if (existingBooking.course) {
        setCourse(existingBooking.course);
      }
      if (existingBooking.year_of_study) {
        setYearOfStudy(existingBooking.year_of_study);
      }
      if (existingBooking.daily_routine?.wake_up_time) {
        setWakeUpTime(existingBooking.daily_routine.wake_up_time);
      }
      if (existingBooking.daily_routine?.sleep_time) {
        setSleepTime(existingBooking.daily_routine.sleep_time);
      }
      if (existingBooking.daily_routine?.work_schedule) {
        setWorkSchedule(existingBooking.daily_routine.work_schedule);
      }
      if (existingBooking.daily_routine?.extracurricular_activities) {
        setExtracurricularActivities(existingBooking.daily_routine.extracurricular_activities);
      }
    }
  }, [existingBooking]);

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!user || !propertyId || !moveInDate) {
        throw new Error('Missing required fields');
      }
      if (!collegeName || !degree || !branch) {
        throw new Error('College, degree, and branch information are required');
      }
      
      console.log('Creating booking with data:', {
        user_id: user.id,
        property_id: propertyId,
        move_in_date: moveInDate.toISOString(),
        move_out_date: moveOutDate?.toISOString() || null,
        college_name_pkey: collegeName,
        degree: degree,
        branch: branch,
        course: course || null,
        year_of_study: yearOfStudy || null,
        daily_routine: {
          wake_up_time: wakeUpTime,
          sleep_time: sleepTime,
          work_schedule: workSchedule || null,
          extracurricular_activities: extracurricularActivities || null
        },
        preferences: {
          room_type: roomType,
          special_requests: specialRequests || null
        },
        has_booked_pg: true
      });
      
      const bookingData = {
        user_id: user.id,
        property_id: propertyId,
        move_in_date: moveInDate.toISOString(),
        move_out_date: moveOutDate?.toISOString() || null,
        college_name_pkey: collegeName,
        degree: degree,
        branch: branch,
        course: course || null,
        year_of_study: yearOfStudy || null,
        daily_routine: {
          wake_up_time: wakeUpTime,
          sleep_time: sleepTime,
          work_schedule: workSchedule || null,
          extracurricular_activities: extracurricularActivities || null
        },
        preferences: {
          room_type: roomType,
          special_requests: specialRequests || null
        },
        has_booked_pg: true
      };
      
      const { data, error } = await supabase
        .from('student_details')
        .upsert(bookingData, {
          onConflict: 'user_id,property_id'
        })
        .select()
        .single();
        
      if (error) {
        console.error('Booking error:', error);
        throw error;
      }
      
      console.log('Booking created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', user?.id, propertyId] });
      queryClient.invalidateQueries({ queryKey: ['studentDetails', user?.id] });
      toast.success('Booking request submitted successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Booking mutation error:', error);
      toast.error(error.message || 'Failed to submit booking request');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const handleSubmitBooking = async () => {
    console.log('Submit booking clicked');
    
    if (!moveInDate) {
      toast.error('Please select a move-in date');
      return;
    }
    
    if (!collegeName) {
      toast.error('Please enter your college name');
      return;
    }
    
    if (!degree) {
      toast.error('Please enter your degree');
      return;
    }
    
    if (!branch) {
      toast.error('Please enter your branch');
      return;
    }
    
    setLoading(true);
    createBookingMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }
  
  if (!propertyId) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Property Selected</h3>
            <p className="text-muted-foreground">
              You need to select a property before booking a slot.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingBooking && !isEditing) {
    // TypeScript safe access to the preferences object
    const roomTypeValue = existingBooking.preferences && 
      typeof existingBooking.preferences === 'object' ? 
      (existingBooking.preferences as any).room_type : undefined;

    const specialRequestsValue = existingBooking.preferences && 
      typeof existingBooking.preferences === 'object' ? 
      (existingBooking.preferences as any).special_requests : undefined;

    const wakeUpTimeValue = existingBooking.daily_routine && 
      typeof existingBooking.daily_routine === 'object' ? 
      (existingBooking.daily_routine as any).wake_up_time : 'Not specified';

    const sleepTimeValue = existingBooking.daily_routine && 
      typeof existingBooking.daily_routine === 'object' ? 
      (existingBooking.daily_routine as any).sleep_time : 'Not specified';
      
    const workScheduleValue = existingBooking.daily_routine && 
      typeof existingBooking.daily_routine === 'object' ? 
      (existingBooking.daily_routine as any).work_schedule : 'Not specified';
      
    const extracurricularActivitiesValue = existingBooking.daily_routine && 
      typeof existingBooking.daily_routine === 'object' ? 
      (existingBooking.daily_routine as any).extracurricular_activities : 'Not specified';
      
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your PG Booking</CardTitle>
          <CardDescription>Your booking details for this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-lg mb-3">Booking Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Move In Date</p>
                  <p>{existingBooking.move_in_date ? format(new Date(existingBooking.move_in_date), 'PPP') : 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Move Out Date</p>
                  <p>{existingBooking.move_out_date ? format(new Date(existingBooking.move_out_date), 'PPP') : 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Room Type</p>
                  <p className="capitalize">{roomTypeValue || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Special Requests</p>
                  <p>{specialRequestsValue || 'None'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-3">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">College Name</p>
                  <p>{existingBooking.college_name_pkey || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Degree</p>
                  <p>{existingBooking.degree || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Branch</p>
                  <p>{existingBooking.branch || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Course</p>
                  <p>{existingBooking.course || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Year of Study</p>
                  <p>{existingBooking.year_of_study || 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-3">Daily Routine</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Wake Up Time</p>
                  <p>{wakeUpTimeValue}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Sleep Time</p>
                  <p>{sleepTimeValue}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Work Schedule</p>
                  <p>{workScheduleValue}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Extracurricular Activities</p>
                  <p>{extracurricularActivitiesValue}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Update Booking
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{existingBooking ? 'Update Your Booking' : 'Book Your PG Slot'}</CardTitle>
        <CardDescription>Fill in the details to {existingBooking ? 'update your' : 'book your'} accommodation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-base mb-3">Move-in / Move-out Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="move-in-date">Move In Date*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !moveInDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {moveInDate ? format(moveInDate, "PPP") : "Select move-in date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={moveInDate}
                      onSelect={setMoveInDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="move-out-date">Move Out Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !moveOutDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {moveOutDate ? format(moveOutDate, "PPP") : "Select move-out date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={moveOutDate}
                      onSelect={setMoveOutDate}
                      initialFocus
                      disabled={(date) => !moveInDate || date <= moveInDate}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-base mb-3">Academic Information*</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="college-name">College Name*</Label>
                <Input 
                  id="college-name" 
                  placeholder="Enter your college name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="degree">Degree*</Label>
                <Select value={degree} onValueChange={setDegree}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor's</SelectItem>
                    <SelectItem value="master">Master's</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch">Branch*</Label>
                <Input 
                  id="branch" 
                  placeholder="e.g., Computer Science, Mechanical, etc."
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Input 
                  id="course" 
                  placeholder="Specific course name"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year-of-study">Year of Study (Optional)</Label>
                <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year of study" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                    <SelectItem value="5+">5+ Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-3">Daily Routine*</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wake-up-time">Wake Up Time*</Label>
                <Select value={wakeUpTime} onValueChange={setWakeUpTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select wake up time" />
                  </SelectTrigger>
                  <SelectContent>
                    {dailyRoutineTimeOptions.slice(0, 12).map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sleep-time">Sleep Time*</Label>
                <Select value={sleepTime} onValueChange={setSleepTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sleep time" />
                  </SelectTrigger>
                  <SelectContent>
                    {dailyRoutineTimeOptions.slice(12).map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="work-schedule">Work Schedule (Optional)</Label>
                <Textarea
                  id="work-schedule"
                  placeholder="Describe your daily work schedule"
                  value={workSchedule}
                  onChange={(e) => setWorkSchedule(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extracurricular">Extracurricular Activities (Optional)</Label>
                <Textarea
                  id="extracurricular"
                  placeholder="List your extracurricular activities"
                  value={extracurricularActivities}
                  onChange={(e) => setExtracurricularActivities(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-base mb-3">Room Preferences</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-type">Room Type</Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared">Shared Room</SelectItem>
                    <SelectItem value="double">Double Room</SelectItem>
                    <SelectItem value="single">Single Room</SelectItem>
                    <SelectItem value="deluxe">Deluxe Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special-requests">Special Requests (Optional)</Label>
                <Textarea 
                  id="special-requests" 
                  placeholder="Any special requirements or preferences..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmitBooking} 
          disabled={loading || !moveInDate || !collegeName || !degree || !branch}
          className={isEditing ? "" : "ml-auto"}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingBooking ? 'Update Booking' : 'Submit Booking'}
        </Button>
      </CardFooter>
    </Card>
  );
}
