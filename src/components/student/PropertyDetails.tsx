
import React from 'react';
import { Property } from '@/types/property';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Calendar, MapPin, Home } from 'lucide-react';
import { format } from 'date-fns';

interface PropertyDetailsProps {
  property: Property;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          {property.title}
        </CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" /> {property.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Image */}
        {property.images && property.images.length > 0 && (
          <div className="relative h-60 overflow-hidden rounded-md">
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Property Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="capitalize">{property.property_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rent:</span>
                <span className="font-medium">₹{property.price.toLocaleString()}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bedrooms:</span>
                <span>{property.bedrooms || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms:</span>
                <span>{property.bathrooms || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area:</span>
                <span>{property.area_sqft ? `${property.area_sqft} sq ft` : 'N/A'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Amenities</h3>
            {property.amenities && Object.keys(property.amenities).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(property.amenities as Record<string, boolean>)
                  .filter(([_, value]) => value)
                  .map(([key]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No amenities listed</p>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div>
          <h3 className="text-lg font-medium mb-3">Description</h3>
          <p className="text-muted-foreground">
            {property.description || 'No description available for this property.'}
          </p>
        </div>
        
        {/* Important Dates */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Important Dates
          </h3>
          <div className="text-muted-foreground">
            <p>This property was listed on {property.created_at ? format(new Date(property.created_at), 'PPP') : 'N/A'}</p>
            {property.updated_at && (
              <p>Last updated on {format(new Date(property.updated_at), 'PPP')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
