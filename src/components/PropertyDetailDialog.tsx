import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Phone, MapPin, Home, DoorOpen, Bath } from 'lucide-react';
import { addFavorite, removeFavorite, isFavorite } from '@/services/propertyService';
import { toast } from 'sonner';

interface PropertyDetailDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PropertyDetailDialog({ property, open, onOpenChange }: PropertyDetailDialogProps) {
  const { user } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const checkFavorite = async () => {
      if (property && user) {
        try {
          const result = await isFavorite(user.id, property.id);
          setFavorite(result);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    
    checkFavorite();
  }, [property, user]);
  
  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }
    
    if (!property) return;
    
    setLoading(true);
    try {
      if (favorite) {
        await removeFavorite(user.id, property.id);
        setFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(user.id, property.id);
        setFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating favorites');
    } finally {
      setLoading(false);
    }
  };
  
  if (!property) return null;
  
  const formatPrice = (price: number) => {
    if (property.listing_type === 'rent') {
      return `₹${price.toLocaleString()}/month`;
    } else {
      return price >= 10000000 
        ? `₹${(price / 10000000).toFixed(2)} Cr` 
        : `₹${(price / 100000).toFixed(2)} Lac`;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{property.title}</DialogTitle>
          <DialogDescription className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" /> {property.location}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Images */}
          <div className="relative h-64 overflow-hidden rounded-md">
            <img 
              src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full bg-white ${favorite ? 'text-red-500' : 'text-gray-500'}`}
                onClick={handleFavoriteToggle}
                disabled={loading}
              >
                <Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
              {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'rent' ? 'For Rent' : 'PG'}
            </div>
          </div>
          
          {/* Property Details */}
          <div>
            <h3 className="text-2xl font-bold">{formatPrice(property.price)}</h3>
            
            <div className="flex flex-wrap gap-4 mt-4">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
                </div>
              )}
              
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
                </div>
              )}
              
              {property.area_sqft && (
                <div className="flex items-center gap-1">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{property.area_sqft} sq.ft</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>{property.property_type}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">
                {property.description || 'No description available for this property.'}
              </p>
            </div>
            
            {property.amenities && Object.keys(property.amenities).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(property.amenities)
                    .filter(([_, value]) => value)
                    .map(([key]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span className="capitalize">{key.replace('_', ' ')}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
