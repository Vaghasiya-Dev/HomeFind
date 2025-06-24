
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function SavedSearches() {
  return (
    <>
      <h2 className="text-xl font-bold mb-6">Saved Searches</h2>
      
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">3BHK in Powai</h3>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">3+ BHK</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Powai, Mumbai</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">₹30k-50k/month</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Apartment</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Last updated: 2 days ago
              </div>
              <Button size="sm">View Results (12)</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">Properties for Sale in Andheri</h3>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">For Sale</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">Andheri, Mumbai</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">₹1.5Cr - 3Cr</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">2+ BHK</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Last updated: 5 days ago
              </div>
              <Button size="sm">View Results (8)</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
