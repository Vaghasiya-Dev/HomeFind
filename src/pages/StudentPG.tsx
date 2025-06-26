
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Users, Star, MapPin, Calendar, Home, Wifi, Car, Coffee, Utensils, Dumbbell, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getAllProperties } from '@/services/propertyService';
import PropertyCard from '@/components/PropertyCard';
import RoommateFilters, { FilterOptions } from '@/components/student/RoommateFilters';
import StudentDashboard from '@/components/student/StudentDashboard';

const StudentPG = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: 0,
    maxPrice: 50000,
    amenities: [] as string[],
    searchQuery: ''
  });

  const [roommateFilters, setRoommateFilters] = useState<FilterOptions>({
    sleepSchedule: '',
    studyHabits: ''
  });

  // Fetch PG properties
  const { data: pgProperties = [], isLoading } = useQuery({
    queryKey: ['pg-properties', filters],
    queryFn: async () => {
      const properties = await getAllProperties({
        listingType: 'pg',
        ...filters,
        propertyType: ['pg']
      });
      return properties || [];
    }
  });

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleRoommateFilterChange = (newFilters: FilterOptions) => {
    setRoommateFilters(newFilters);
  };

  const handleRoommateFilterReset = () => {
    setRoommateFilters({
      sleepSchedule: '',
      studyHabits: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student PG & Hostel Finder</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect PG, hostel, or shared accommodation for your student life. 
            Connect with roommates and enjoy a hassle-free living experience.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="browse">Browse PGs</TabsTrigger>
            <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by location, PG name, or college..."
                    className="pl-10"
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Note: For browse tab, we'll implement property-specific filters later */}
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))
              ) : pgProperties.length > 0 ? (
                pgProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    location={property.location}
                    price={property.price}
                    image={property.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e460b1e1?q=80"}
                    beds={property.bedrooms || 1}
                    baths={property.bathrooms || 1}
                    sqft={property.area_sqft || 200}
                    type="rent"
                    ownerName={property.owner_name}
                    ownerPhone={property.owner_phone}
                    ownerEmail={property.owner_email}
                    ownerAddress={property.owner_address}
                    ownerDescription={property.owner_description}
                    images={property.images || []}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No PGs found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="roommates" className="space-y-6">
            {/* Roommate Filters */}
            <RoommateFilters 
              filters={roommateFilters}
              onFilterChange={handleRoommateFilterChange}
              onReset={handleRoommateFilterReset}
            />
            
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">Find Your Perfect Roommate</h3>
              <p className="text-gray-600 mb-6">
                Connect with like-minded students and find compatible roommates for your PG or shared accommodation.
              </p>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Users className="h-5 w-5 mr-2" />
                Browse Roommate Profiles
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {user ? (
              <StudentDashboard />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Access Your Student Dashboard</h3>
                  <p className="text-gray-600 mb-6">
                    Sign in to manage your bookings, connect with roommates, and track your applications.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/login')} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Sign In to Continue
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/signup')}
                      className="w-full"
                    >
                      Create New Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentPG;
