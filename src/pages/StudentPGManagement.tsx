import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  getStudentDetails, 
  getPropertyById,
  getAllProperties,
  getPropertyResidents
} from '@/services/propertyService';
import PropertyDetails from '@/components/student/PropertyDetails';
import RoommateReviews from '@/components/student/RoommateReviews';
import BookingSlot from '@/components/student/BookingSlot';
import { Loader2, User, MessageSquare, CalendarCheck, ArrowLeft, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentPGManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('property');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get property ID from URL query params if it exists
  const queryParams = new URLSearchParams(location.search);
  const urlPropertyId = queryParams.get('propertyId');

  // Get student details including property information
  const { data: studentDetails, isLoading: loadingStudentDetails } = useQuery({
    queryKey: ['studentDetails', user?.id],
    queryFn: () => user ? getStudentDetails(user.id) : Promise.resolve(null),
    enabled: !!user,
  });

  // Determine which property ID to use - URL param or student's assigned property
  const effectivePropertyId = urlPropertyId || studentDetails?.property_id;

  // Get property details if student has a property
  const { data: property, isLoading: loadingProperty } = useQuery({
    queryKey: ['property', effectivePropertyId],
    queryFn: () => effectivePropertyId ? getPropertyById(effectivePropertyId) : Promise.resolve(null),
    enabled: !!effectivePropertyId,
  });
  
  // Get all available properties if no specific property is being viewed
  const { data: availableProperties, isLoading: loadingProperties } = useQuery({
    queryKey: ['properties', 'pg'],
    queryFn: () => getAllProperties({ propertyType: ['pg'], listingType: 'pg' }),
    enabled: !effectivePropertyId,
  });

  // Set active tab based on URL parameters
  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab && ['property', 'booking', 'reviews'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without reloading the page
    const newParams = new URLSearchParams(location.search);
    newParams.set('tab', value);
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  // Handle returning to the Student PG listing page
  const handleBackToListing = () => {
    navigate('/student-pg');
  };

  // Function to handle booking a specific property
  const handleBookProperty = (propertyId: string) => {
    if (!user) {
      toast.error('Please login to book this PG');
      return;
    }
    
    // Update URL with the property ID and set tab to booking
    const newParams = new URLSearchParams();
    newParams.set('propertyId', propertyId);
    newParams.set('tab', 'booking');
    navigate(`${location.pathname}?${newParams.toString()}`);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground">Please log in to access your student PG dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingStudentDetails || loadingProperty) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Student PG Dashboard</h1>
        <Button variant="outline" onClick={handleBackToListing} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
      </div>
      
      {urlPropertyId && property && (
        <Card className="mb-6 bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">{property.title}</h3>
              </div>
              <Button onClick={() => handleTabChange('booking')} size="sm">
                Book This PG
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>PG Details</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span>Booking Slot</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Roommate Reviews</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="space-y-6">
          {property ? (
            <PropertyDetails property={property} />
          ) : availableProperties && availableProperties.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available PG Accommodations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableProperties.map((pg) => (
                      <Card key={pg.id} className="overflow-hidden">
                        <div className="relative h-40">
                          <img 
                            src={pg.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80"} 
                            alt={pg.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg">{pg.title}</h3>
                          <p className="text-sm text-muted-foreground">{pg.location}</p>
                          <p className="font-medium mt-2">₹{pg.price}/month</p>
                          
                          <div className="flex justify-end mt-4">
                            <Button size="sm" onClick={() => handleBookProperty(pg.id)}>
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No PG Assigned</h2>
                <p className="text-muted-foreground">You haven't been assigned to a PG accommodation yet.</p>
                <Button className="mt-4" onClick={handleBackToListing}>
                  Browse PG Listings
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="booking">
          <BookingSlot propertyId={effectivePropertyId} />
        </TabsContent>

        <TabsContent value="reviews">
          <RoommateReviews propertyId={effectivePropertyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
