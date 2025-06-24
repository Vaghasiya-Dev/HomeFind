
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function FavoriteProperties() {
  return (
    <>
      <h2 className="text-xl font-bold mb-6">Favorite Properties</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
              alt="Property"
              className="h-48 w-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-homefinder-secondary text-white text-xs px-2 py-1 rounded">
              For Sale
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold">Modern 3BHK Apartment</h3>
            <p className="text-muted-foreground text-sm">Bandra, Mumbai</p>
            <p className="font-bold mt-2">₹2,50,00,000</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                3 Beds
              </span>
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                2 Baths
              </span>
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                1500 sqft
              </span>
            </div>
            <Button variant="outline" className="w-full mt-4">View Property</Button>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
              alt="Property"
              className="h-48 w-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-homefinder-accent text-white text-xs px-2 py-1 rounded">
              For Rent
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold">Furnished 2BHK with Balcony</h3>
            <p className="text-muted-foreground text-sm">Koramangala, Bangalore</p>
            <p className="font-bold mt-2">₹32,000/month</p>
            <div className="flex justify-between text-sm mt-2">
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                2 Beds
              </span>
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                2 Baths
              </span>
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                1100 sqft
              </span>
            </div>
            <Button variant="outline" className="w-full mt-4">View Property</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
