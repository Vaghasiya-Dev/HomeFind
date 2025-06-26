import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Home,
  Square,
  Bath,
  User,
  Phone,
  Mail,
  Edit,
  Hash,
  Eye
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  type: 'rent' | 'sale';
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAddress?: string;
  ownerDescription?: string;
  className?: string;
  userId?: string;
  showEditButton?: boolean;
  images?: string[];
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  image,
  beds,
  baths,
  sqft,
  type,
  ownerName,
  ownerPhone,
  ownerEmail,
  ownerAddress,
  ownerDescription,
  className,
  userId,
  showEditButton = false,
  images = []
}: PropertyCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const canEdit = user && userId && user.id === userId;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-property/${id}`);
  };

  const formatPrice = (price: number) => {
    if (type === 'rent') {
      return `₹${price.toLocaleString()}/month`;
    } else {
      return price >= 10000000
        ? `₹${(price / 10000000).toFixed(2)} Cr`
        : `₹${(price / 100000).toFixed(2)} Lac`;
    }
  };

  const fallbackImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80";
  const displayImage = images && images.length > 0 ? images[0] : image || fallbackImage;

  return (
    <>
      <div
        className={cn("property-card block cursor-pointer", className)}
        onClick={handleCardClick}
      >
        {canEdit && showEditButton && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 left-2 z-10 p-2 h-8 w-8"
            onClick={handleEditClick}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
        
        <div className="relative h-48 overflow-hidden">
          <img
            src={displayImage}
            alt={title}
            className="w-full h-full object-cover"
            onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImage; }}
          />
          <div
            className={cn(
              "absolute top-2 right-2 px-2 py-1 text-xs rounded font-medium text-white",
              type === 'rent' ? 'bg-homefinder-secondary' : 'bg-homefinder-accent'
            )}
          >
            {type === 'rent' ? 'For Rent' : 'For Sale'}
          </div>
          
          {images && images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              +{images.length - 1} more
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
          
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="font-bold">
              {formatPrice(price)}
            </div>
          </div>
          
          <div className="mt-3 flex justify-between text-sm border-t pt-3">
            <div className="flex items-center">
              <Home className="h-3.5 w-3.5 mr-1" />
              <span>{beds} {beds === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center">
              <Building className="h-3.5 w-3.5 mr-1" />
              <span>{baths} {baths === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            <div className="flex items-center">
              <Square className="h-3.5 w-3.5 mr-1" />
              <span>{sqft} sqft</span>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <AlertDialogTitle className="text-2xl font-bold mb-2">{title}</AlertDialogTitle>
                <AlertDialogDescription className="flex items-center text-muted-foreground text-base">
                  <MapPin className="h-4 w-4 mr-2" /> {location}
                </AlertDialogDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary mb-1">
                  {formatPrice(price)}
                </div>
                <div
                  className={cn(
                    "inline-block px-3 py-1 rounded-full text-sm font-medium text-white",
                    type === 'rent' ? 'bg-green-500' : 'bg-blue-500'
                  )}
                >
                  {type === 'rent' ? 'For Rent' : 'For Sale'}
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="space-y-6">
            {/* Property Image Gallery */}
            <div>
              <div className="relative h-80 overflow-hidden rounded-lg shadow-lg mb-2">
                <img
                  src={images && images.length > 0 ? images[activeImage] : displayImage}
                  alt={title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackImage; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {images && images.length > 1 && (
                <div className="flex gap-2 justify-center mt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`h-14 w-20 rounded border-2 ${activeImage === idx ? 'border-blue-500' : 'border-transparent'} overflow-hidden focus:outline-none`}
                      type="button"
                    >
                      <img src={img} alt={`thumb-${idx}`} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Property Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                  <Home className="h-5 w-5 text-primary" />
                  Property Details
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{beds}</div>
                    <div className="text-sm text-muted-foreground">Bedroom{beds > 1 ? 's' : ''}</div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Bath className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{baths}</div>
                    <div className="text-sm text-muted-foreground">Bathroom{baths > 1 ? 's' : ''}</div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4 text-center col-span-2">
                    <Square className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{sqft.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Square Feet</div>
                  </div>
                </div>
                
                {/* Property Information */}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Property ID
                    </span>
                    <span className="font-medium">#{id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Property Type
                    </span>
                    <span className="font-medium capitalize">{type === 'rent' ? 'Rental' : 'Sale'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </span>
                    <span className="font-medium">{location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Status
                    </span>
                    <span className="font-medium text-green-600">Available</span>
                  </div>
                </div>
              </div>
              
              {/* Owner Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                  <User className="h-5 w-5 text-primary" />
                  Owner Information
                </h3>
                
                {(ownerName || ownerPhone || ownerEmail) ? (
                  <div className="bg-primary/5 rounded-lg p-6 space-y-4">
                    {ownerName && (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Owner Name</div>
                          <div className="font-semibold">{ownerName}</div>
                        </div>
                      </div>
                    )}
                    
                    {ownerPhone && (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Phone Number</div>
                          <a
                            href={`tel:${ownerPhone}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {ownerPhone}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {ownerEmail && (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Email Address</div>
                          <a
                            href={`mailto:${ownerEmail}`}
                            className="font-semibold text-primary hover:underline break-all"
                          >
                            {ownerEmail}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {ownerAddress && (
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Address</div>
                          <div className="font-medium text-sm">{ownerAddress}</div>
                        </div>
                      </div>
                    )}
                    
                    {ownerDescription && (
                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <div className="text-sm text-muted-foreground mb-2">Additional Information</div>
                        <p className="text-sm leading-relaxed">{ownerDescription}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Owner contact information not available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Price Breakdown */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Price Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatPrice(price)}</div>
                  <div className="text-sm text-muted-foreground">
                    {type === 'rent' ? 'Monthly Rent' : 'Total Price'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    ₹{Math.round(price / sqft).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Per Sq Ft</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {type === 'rent' ? 'Negotiable' : 'Fixed Price'}
                  </div>
                  <div className="text-sm text-muted-foreground">Price Type</div>
                </div>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="px-6">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}