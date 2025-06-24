
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '@/services/propertyService';
import { toast } from 'sonner';
import { PropertyType, ListingType } from '@/types/property';
import ImageUpload from '@/components/ImageUpload';

interface PropertyFormProps {
  type: 'sale' | 'rent' | 'pg';
}

// Form schema
const propertyFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  location: z.string().min(3, { message: 'Location is required' }),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  propertyType: z.enum(['apartment', 'house', 'villa', 'pg', 'plot']),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  areaSqft: z.number().int().positive().optional(),
  amenities: z.record(z.boolean()).optional(),
  ownerName: z.string().min(2, { message: 'Owner name is required' }),
  ownerPhone: z.string().min(10, { message: 'Valid phone number is required' }),
  ownerEmail: z.string().email({ message: 'Valid email is required' }).optional(),
  ownerAddress: z.string().optional(),
  ownerDescription: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const PropertyForm: React.FC<PropertyFormProps> = ({ type }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const defaultValues: Partial<PropertyFormValues> = {
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    amenities: {
      parking: false,
      gym: false,
      swimming_pool: false,
      security: false,
      wifi: false,
      furnished: false,
      air_conditioning: false,
    },
  };
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });
  
  const propertyType = watch('propertyType');
  
  const onSubmit = async (data: PropertyFormValues) => {
    if (!user) {
      toast.error('Please login to list a property');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    
    try {
      const propertyData = {
        title: data.title,
        description: data.description,
        location: data.location,
        price: data.price,
        property_type: data.propertyType as PropertyType,
        listing_type: type as ListingType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area_sqft: data.areaSqft,
        amenities: data.amenities,
        owner_name: data.ownerName,
        owner_phone: data.ownerPhone,
        owner_email: data.ownerEmail,
        owner_address: data.ownerAddress,
        owner_description: data.ownerDescription,
        images: images,
      };
      
      await createProperty(propertyData, user.id);
      
      toast.success('Property listed successfully!');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Error listing property');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-4">Login Required</h3>
        <p className="text-muted-foreground mb-6">You need to be logged in to list a property.</p>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Basic Property Information */}
        <div>
          <Label htmlFor="title">Property Title</Label>
          <Input
            id="title"
            placeholder="e.g., 3BHK Apartment in Andheri West"
            {...register('title')}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your property..."
            className="min-h-[100px]"
            {...register('description')}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g., Andheri West, Mumbai"
            {...register('location')}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="price">
            {type === 'rent' ? 'Monthly Rent (₹)' : type === 'pg' ? 'Monthly Fee (₹)' : 'Price (₹)'}
          </Label>
          <Input
            id="price"
            type="number"
            placeholder={type === 'rent' || type === 'pg' ? 'e.g., 25000' : 'e.g., 5000000'}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <select
            id="propertyType"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('propertyType')}
          >
            <option value="apartment">Apartment</option>
            <option value="house">Independent House</option>
            <option value="villa">Villa</option>
            {type === 'sale' && <option value="plot">Plot/Land</option>}
            {(type === 'rent' || type === 'pg') && <option value="pg">PG/Hostel</option>}
          </select>
          {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>}
        </div>

        <ImageUpload
          onImagesChange={setImages}
          existingImages={images}
          maxImages={10}
        />
        
        {/* Owner Contact Information Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Owner Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                placeholder="e.g., John Doe"
                {...register('ownerName')}
              />
              {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="ownerPhone">Phone Number *</Label>
              <Input
                id="ownerPhone"
                placeholder="e.g., +91 9876543210"
                {...register('ownerPhone')}
              />
              {errors.ownerPhone && <p className="text-red-500 text-sm mt-1">{errors.ownerPhone.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="ownerEmail">Email Address</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="e.g., owner@example.com"
                {...register('ownerEmail')}
              />
              {errors.ownerEmail && <p className="text-red-500 text-sm mt-1">{errors.ownerEmail.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="ownerAddress">Owner Address</Label>
              <Input
                id="ownerAddress"
                placeholder="e.g., 123 Main Street, City"
                {...register('ownerAddress')}
              />
              {errors.ownerAddress && <p className="text-red-500 text-sm mt-1">{errors.ownerAddress.message}</p>}
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="ownerDescription">Additional Information</Label>
            <Textarea
              id="ownerDescription"
              placeholder="Any additional information about the owner or contact preferences..."
              rows={3}
              {...register('ownerDescription')}
            />
            {errors.ownerDescription && <p className="text-red-500 text-sm mt-1">{errors.ownerDescription.message}</p>}
          </div>
        </div>
        
        {propertyType !== 'plot' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  {...register('bedrooms', { valueAsNumber: true })}
                />
                {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  {...register('bathrooms', { valueAsNumber: true })}
                />
                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="areaSqft">Area (sq.ft)</Label>
                <Input
                  id="areaSqft"
                  type="number"
                  {...register('areaSqft', { valueAsNumber: true })}
                />
                {errors.areaSqft && <p className="text-red-500 text-sm mt-1">{errors.areaSqft.message}</p>}
              </div>
            </div>
            
            <div>
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="parking" {...register('amenities.parking')} />
                  <label htmlFor="parking" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Parking</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="gym" {...register('amenities.gym')} />
                  <label htmlFor="gym" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Gym</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="swimming_pool" {...register('amenities.swimming_pool')} />
                  <label htmlFor="swimming_pool" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Swimming Pool</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="security" {...register('amenities.security')} />
                  <label htmlFor="security" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Security</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="wifi" {...register('amenities.wifi')} />
                  <label htmlFor="wifi" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">WiFi</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="furnished" {...register('amenities.furnished')} />
                  <label htmlFor="furnished" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Furnished</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="air_conditioning" {...register('amenities.air_conditioning')} />
                  <label htmlFor="air_conditioning" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Air Conditioning</label>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Submitting...' : `List Property for ${type === 'sale' ? 'Sale' : type === 'rent' ? 'Rent' : 'PG'}`}
      </Button>
    </form>
  );
};

export default PropertyForm;