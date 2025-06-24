import React, { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import PropertyDetailDialog from '@/components/PropertyDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, MapPin } from 'lucide-react';
import { Property, PropertyFilter, PropertyType } from '@/types/property';
import { getProperties } from '@/services/propertyService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Buy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState<PropertyFilter>({
    minPrice: 1000000,
    maxPrice: 25000000,
    propertyType: [],
    bedrooms: [],
    searchQuery: '',
  });
  
  // Query properties from Supabase
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties', 'sale', filter],
    queryFn: () => getProperties(filter),
  });
  
  // Handle filter change
  const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle property type toggle
  const handlePropertyTypeToggle = (type: PropertyType) => {
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
  
  const filteredProperties = properties?.filter(p => p.listing_type === 'sale') || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Properties for Sale</h1>
      <p className="text-muted-foreground mb-6">
        Browse through our exclusive collection of properties available for purchase
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
              <h3 className="font-medium mb-4">Price Range</h3>
              <div className="space-y-6">
                <Slider 
                  defaultValue={[filter.minPrice || 1000000, filter.maxPrice || 25000000]} 
                  max={50000000} 
                  step={500000}
                  onValueChange={(value) => {
                    handleFilterChange('minPrice', value[0]);
                    handleFilterChange('maxPrice', value[1]);
                  }}
                />
                <div className="flex justify-between">
                  <span>₹{((filter.minPrice || 0) / 100000).toFixed(0)}L</span>
                  <span>₹{((filter.maxPrice || 0) / 100000).toFixed(0)}L</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Property Type</h3>
              <div className="space-y-3">
                {(['apartment', 'villa', 'house', 'plot'] as PropertyType[]).map(type => (
                  <div key={type} className="flex items-center">
                    <Checkbox 
                      id={type} 
                      checked={filter.propertyType?.includes(type)} 
                      onCheckedChange={() => handlePropertyTypeToggle(type)}
                    />
                    <label htmlFor={type} className="ml-2 text-sm capitalize">{type}</label>
                  </div>
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
                type="sale"
                userId={property.user_id}
                ownerName={property.owner_name}
                ownerPhone={property.owner_phone}
                ownerEmail={property.owner_email}
                ownerAddress={property.owner_address}
                ownerDescription={property.owner_description}
                images={property.images}
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
      
      {/* Property Detail Dialog */}
      <PropertyDetailDialog 
        property={selectedProperty} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
}