
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function PropertyList() {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">My Listed Properties</h2>
        <Link to="/sell">
          <Button className="bg-homefinder-primary hover:bg-homefinder-accent">
            + Add New Property
          </Button>
        </Link>
      </div>
      
      {/* Property listings */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 h-40">
              <div className="col-span-1">
                <img 
                  src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
                  alt="Property"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="col-span-2 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">3BHK Apartment in Andheri West</h3>
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Mumbai, Maharashtra</p>
                  <p className="font-semibold mt-2">₹35,000/month</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Listed on: Aug 15, 2023
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Remove</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 h-40">
              <div className="col-span-1">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" 
                  alt="Property"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="col-span-2 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">2BHK Apartment for Sale</h3>
                    <span className="text-sm font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Under Review</span>
                  </div>
                  <p className="text-muted-foreground text-sm">Powai, Mumbai</p>
                  <p className="font-semibold mt-2">₹1,20,00,000</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Listed on: Oct 5, 2023
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Remove</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
