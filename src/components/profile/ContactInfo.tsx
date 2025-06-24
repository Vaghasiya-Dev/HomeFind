
import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface ContactInfoProps {
  userData: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
}

export default function ContactInfo({ userData }: ContactInfoProps) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold">Contact Information</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start">
          <User className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Name</p>
            <p>{userData.fullName}</p>
          </div>
        </div>
        <div className="flex items-start">
          <Mail className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{userData.email}</p>
          </div>
        </div>
        <div className="flex items-start">
          <Phone className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p>{userData.phone}</p>
          </div>
        </div>
        <div className="flex items-start">
          <MapPin className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">Location</p>
            <p>{userData.location}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
