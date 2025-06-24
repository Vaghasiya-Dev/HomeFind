import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProperties } from '@/services/propertyService';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Property } from '@/types/property';
import PropertyCard from '@/components/PropertyCard';
import PropertyDetailDialog from '@/components/PropertyDetailDialog';
import { Search } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch featured properties
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['featuredProperties'],
    queryFn: () => getProperties(),
  });

  if (error) {
    toast.error('Failed to load properties');
  }

  // Get properties by type and filter by search
  const getFeaturedProperties = (type: 'sale' | 'rent' | 'pg', limit = 3) => {
    if (!properties) return [];
    let filtered = properties.filter(property => property.listing_type === type);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        property =>
          property.title?.toLowerCase().includes(q) ||
          property.location?.toLowerCase().includes(q)
      );
    }

    return filtered.slice(0, limit);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-xl overflow-hidden mb-16">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80" 
          alt="Luxury home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8 md:p-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Find Your Dream Home</h1>
          <p className="text-lg text-white/80 max-w-lg mb-8">
            Discover thousands of properties for sale and rent across India with zero brokerage
          </p>
          {/* Search Bar */}
          <div className="mb-8 w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-homefinder-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/buy">
              <button className="bg-homefinder-primary hover:bg-homefinder-accent text-white px-8 py-3 rounded-md font-medium transition-colors">
                Buy
              </button>
            </Link>
            <Link to="/rent">
              <button className="bg-white hover:bg-gray-100 text-homefinder-primary px-8 py-3 rounded-md font-medium transition-colors">
                Rent
              </button>
            </Link>
            <Link to="/student-pg">
              <button className="bg-homefinder-secondary hover:bg-homefinder-secondary/80 text-white px-8 py-3 rounded-md font-medium transition-colors">
                Student PG
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Properties for Sale Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Properties for Sale</h2>
          <Link to="/buy" className="text-homefinder-primary hover:underline">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeaturedProperties('sale').map(property => (
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
                />
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Properties for Rent Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Properties for Rent</h2>
          <Link to="/rent" className="text-homefinder-primary hover:underline">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeaturedProperties('rent').map(property => (
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
                />
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Student PG Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Student PG Accommodations</h2>
          <Link to="/student-pg" className="text-homefinder-primary hover:underline">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFeaturedProperties('pg').map(property => (
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
                />
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Property Detail Dialog */}
      <PropertyDetailDialog 
        property={selectedProperty} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
}