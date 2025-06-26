import React, { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import PropertyDetailDialog from '@/components/PropertyDetailDialog';
import PropertyForm from '@/components/PropertyForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Filter, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProperties } from '@/services/propertyService';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyFilter, PropertyType } from '@/types/property';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function Rent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [filter, setFilter] = useState<PropertyFilter>({
    minPrice: 5000,
    maxPrice: 100000,
    propertyType: [],
    bedrooms: [],
    searchQuery: '',
  });
  
  // Query properties from Supabase
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties', 'rent', filter],
    queryFn: () => getProperties(filter),
  });
  
  // Handle filter change
  const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle property type toggle with redirection to Student PG page
  const handlePropertyTypeToggle = (type: PropertyType) => {
    // If PG is selected, redirect to the Student PG page
    if (type === 'pg') {
      navigate('/student-pg');
      return;
    }
    
    setFilter(prev => {
      const types = [...(prev.propertyType || [])];
      if (types.includes(type)) {
        return {
          ...prev,
          propertyType: types.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          propertyType: [...types, type]
        };
      }
    });
  };
  
  // Handle bedroom toggle
  const handleBedroomToggle = (count: number) => {
    setFilter(prev => {
      const beds = [...(prev.bedrooms || [])];
      if (beds.includes(count)) {
        return {
          ...prev,
          bedrooms: beds.filter(b => b !== count)
        };
      } else {
        return {
          ...prev,
          bedrooms: [...beds, count]
        };
      }
    });
  };
  
  // Handle property click to show detail
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };
  
  // Save search
  const handleSaveSearch = () => {
    if (!user) {
      toast.error('Please login to save searches');
      navigate('/login');
      return;
    }
    
    // This would normally open a dialog to name the search
    // For now, just show a toast
    toast.success('Search saved successfully! You can view it in your profile.');
  };
  
  if (error) {
    toast.error('Failed to load properties');
  }
  
  const filteredProperties = properties?.filter(p => p.listing_type === 'rent') || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="find">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="find">Find a Rental</TabsTrigger>
          <TabsTrigger value="list">List Your Property</TabsTrigger>
        </TabsList>
        
        <TabsContent value="find" className="outline-none">
          <h1 className="text-3xl font-bold mb-2">Properties for Rent</h1>
          <p className="text-muted-foreground mb-6">
            Find your perfect rental property without any broker fees
          </p>
          
          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location, property name..."
                  className="pl-10"
                  value={filter.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                />
              </div>
              
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              {user && (
                <Button
                  variant="outline"
                  onClick={handleSaveSearch}
                >
                  Save Search
                </Button>
              )}
            </div>
            
            {showFilters && (
              <div className="bg-white border rounded-lg p-6 mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Monthly Rent</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Min</label>
                      <Input 
                        placeholder="₹10,000" 
                        type="number"
                        value={filter.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Max</label>
                      <Input 
                        placeholder="₹50,000" 
                        type="number"
                        value={filter.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Property Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['apartment', 'house', 'villa', 'pg'] as PropertyType[]).map(type => (
                      <Button 
                        key={type}
                        variant={filter.propertyType?.includes(type) ? "default" : "outline"} 
                        className="px-4 py-1 h-auto capitalize"
                        onClick={() => handlePropertyTypeToggle(type)}
                      >
                        {type === 'pg' ? 'PG/Hostel' : type}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Bedrooms</h3>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <Button
                        key={num}
                        variant={filter.bedrooms?.includes(num) ? "default" : "outline"}
                        className="px-4 py-1 h-auto"
                        onClick={() => handleBedroomToggle(num)}
                      >
                        {num} BHK
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Property Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(property => (
                <div key={property.id} onClick={() => handlePropertyClick(property)} className="cursor-pointer">
                  <PropertyCard 
                    id={property.id}
                    title={property.title}
                    location={property.location}
                    price={property.price}
                    image={property.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80"}
                    beds={property.bedrooms || 0}
                    baths={property.bathrooms || 0}
                    sqft={property.area_sqft || 0}
                    type="rent"
                    ownerName={property.owner_name}
                    ownerPhone={property.owner_phone}
                    ownerEmail={property.owner_email}
                    ownerAddress={property.owner_address}
                    ownerDescription={property.owner_description}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No properties found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters or search query</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list" className="outline-none">
          <h1 className="text-3xl font-bold mb-2">List Your Property for Rent</h1>
          <p className="text-muted-foreground mb-8">
            Fill in the details below to list your property for rent
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white border rounded-lg p-6">
                <PropertyForm type="rent" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Benefits of renting with us</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-homefinder-primary font-medium">✓</span>
                    </div>
                    <span>Zero brokerage - rent directly to tenants</span>
                  </li>
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-homefinder-primary font-medium">✓</span>
                    </div>
                    <span>Verified tenant profiles</span>
                  </li>
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-homefinder-primary font-medium">✓</span>
                    </div>
                    <span>Digital rental agreement assistance</span>
                  </li>
                  <li className="flex">
                    <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-homefinder-primary font-medium">✓</span>
                    </div>
                    <span>Faster property renting</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-homefinder-primary/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Need help?</h3>
                <p className="mb-4">
                  Our rental experts are available to assist you with listing your property.
                </p>
                <div className="bg-white rounded-md p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Call us</p>
                    <p className="text-homefinder-primary">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Property Detail Dialog */}
      <PropertyDetailDialog 
        property={selectedProperty} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
}
