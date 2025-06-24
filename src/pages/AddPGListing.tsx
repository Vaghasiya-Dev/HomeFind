import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { GraduationCap, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/ImageUpload';

export default function AddPGListing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    pgType: 'mixed', // mixed, boys, girls
    amenities: {
      wifi: false,
      ac: false,
      food: false,
      laundry: false,
      cleaning: false,
      study_room: false,
      parking: false,
      gym: false,
    },
    images: [] as string[], // Now using string[] for URLs
    nearbyColleges: '',
  });

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle amenity checkbox change
  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: checked
      }
    }));
  };

  // Handle images change from ImageUpload
  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  // Remove an uploaded image (by index)
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to list a property');
      navigate('/login');
      return;
    }

    // Basic validation
    if (!formData.title || !formData.location || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert property listing
      const { data, error } = await supabase.from('properties').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : null,
        property_type: 'pg',
        listing_type: 'pg',
        amenities: {
          ...formData.amenities,
          pg_type: formData.pgType,
          nearby_colleges: formData.nearbyColleges,
        },
        images: formData.images,
      }).select();

      if (error) throw error;

      toast.success('PG property listed successfully!');
      navigate('/student-pg');

    } catch (error: any) {
      toast.error(error.message || 'Failed to list property');
      console.error('Error listing property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GraduationCap className="h-16 w-16 mx-auto text-homefinder-primary mb-6" />
        <h1 className="text-3xl font-bold mb-4">List Your PG Property</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Please log in to list your PG accommodation.
        </p>
        <Button onClick={() => navigate('/login')}>Login to Continue</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-4">
        <GraduationCap className="h-8 w-8 text-homefinder-primary" />
        <h1 className="text-3xl font-bold">List Your PG/Hostel</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Fill in the details below to list your PG accommodation for students
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>

              <div>
                <Label htmlFor="title">Property Title*</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g., Lakshmi PG for Girls near ABC College"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your PG accommodation, rules, and other important details..."
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="location">Location*</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Full address of the property"
                  required
                />
              </div>

              <div>
                <Label htmlFor="nearbyColleges">Nearby Colleges/Universities</Label>
                <Input
                  id="nearbyColleges"
                  name="nearbyColleges"
                  value={formData.nearbyColleges}
                  onChange={handleChange}
                  placeholder="E.g., XYZ Engineering College, ABC University (separate with commas)"
                />
              </div>
            </div>

            {/* Property Details Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Property Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Monthly Rent (₹)*</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="5000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pgType">PG Type</Label>
                  <Select
                    value={formData.pgType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, pgType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select PG type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Co-ed / Mixed</SelectItem>
                      <SelectItem value="boys">Boys Only</SelectItem>
                      <SelectItem value="girls">Girls Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Number of Beds</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    placeholder="Total number of beds"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="Total number of bathrooms"
                  />
                </div>

                <div>
                  <Label htmlFor="area_sqft">Property Area (sq.ft)</Label>
                  <Input
                    id="area_sqft"
                    name="area_sqft"
                    type="number"
                    value={formData.area_sqft}
                    onChange={handleChange}
                    placeholder="Total area in sq.ft"
                  />
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="wifi"
                    checked={formData.amenities.wifi}
                    onCheckedChange={(checked) => handleAmenityChange('wifi', checked as boolean)}
                  />
                  <Label htmlFor="wifi">WiFi</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ac"
                    checked={formData.amenities.ac}
                    onCheckedChange={(checked) => handleAmenityChange('ac', checked as boolean)}
                  />
                  <Label htmlFor="ac">Air Conditioning</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="food"
                    checked={formData.amenities.food}
                    onCheckedChange={(checked) => handleAmenityChange('food', checked as boolean)}
                  />
                  <Label htmlFor="food">Food/Meals</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="laundry"
                    checked={formData.amenities.laundry}
                    onCheckedChange={(checked) => handleAmenityChange('laundry', checked as boolean)}
                  />
                  <Label htmlFor="laundry">Laundry</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cleaning"
                    checked={formData.amenities.cleaning}
                    onCheckedChange={(checked) => handleAmenityChange('cleaning', checked as boolean)}
                  />
                  <Label htmlFor="cleaning">Room Cleaning</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="study_room"
                    checked={formData.amenities.study_room}
                    onCheckedChange={(checked) => handleAmenityChange('study_room', checked as boolean)}
                  />
                  <Label htmlFor="study_room">Study Room</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parking"
                    checked={formData.amenities.parking}
                    onCheckedChange={(checked) => handleAmenityChange('parking', checked as boolean)}
                  />
                  <Label htmlFor="parking">Parking</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gym"
                    checked={formData.amenities.gym}
                    onCheckedChange={(checked) => handleAmenityChange('gym', checked as boolean)}
                  />
                  <Label htmlFor="gym">Gym/Fitness</Label>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Property Images</h2>
              <ImageUpload
                onImagesChange={handleImagesChange}
                existingImages={formData.images}
                maxImages={10}
              />
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'List Your PG Property'}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Tips for listing your PG</h3>
            <ul className="space-y-3">
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Add clear, high-quality photos</span>
              </li>
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Be detailed about your PG rules</span>
              </li>
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Mention nearby colleges specifically</span>
              </li>
              <li className="flex">
                <div className="h-6 w-6 rounded-full bg-homefinder-light flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-homefinder-primary font-medium">✓</span>
                </div>
                <span>Be transparent about all costs</span>
              </li>
            </ul>
          </div>

          <div className="bg-homefinder-primary/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Need help?</h3>
            <p className="mb-4">
              Our team is ready to assist you with listing your PG property.
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