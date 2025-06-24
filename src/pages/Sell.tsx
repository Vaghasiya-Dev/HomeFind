
import React from 'react';
import PropertyForm from '@/components/PropertyForm';

export default function Sell() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">List Your Property for Sale</h1>
      <p className="text-muted-foreground mb-8">
        Fill in the details below to list your property and connect with potential buyers
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-lg p-6">
            <PropertyForm type="sale" />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Why sell with Home Finder?</h3>
            <ul className="space-y-3">
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Zero brokerage - sell directly to buyers</span>
              </li>
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Verified buyers - quality leads only</span>
              </li>
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Reach thousands of potential buyers</span>
              </li>
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Dedicated relationship manager</span>
              </li>
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Property valuation assistance</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-homefinder-primary/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Need help?</h3>
            <p className="mb-4">
              Our property experts are available to assist you with listing your property.
            </p>
            <div className="bg-white rounded-md p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Call us</p>
                <p className="text-homefinder-primary">+91 98765 43210</p>
              </div>
              <button className="bg-homefinder-primary text-white px-4 py-2 rounded-md hover:bg-homefinder-accent transition-colors">
                Request Callback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
