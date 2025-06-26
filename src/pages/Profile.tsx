import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ProfileFormValues } from '@/types/profile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ContactInfo from '@/components/profile/ContactInfo';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  getUserProperties,
  getFavorites,
  getSavedSearches,
  updateProperty,
  deleteProperty
} from '@/services/propertyService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Property, FavoriteProperty, SavedSearch } from '@/types/property';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Home, Calendar, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  // Query user properties
  const { data: properties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['userProperties', user?.id],
    queryFn: () => user ? getUserProperties(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  // Query favorites
  const { data: favorites, isLoading: favoritesLoading } = useQuery({
    queryKey: ['userFavorites', user?.id],
    queryFn: () => user ? getFavorites(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  // Query saved searches
  const { data: savedSearches, isLoading: searchesLoading } = useQuery({
    queryKey: ['userSavedSearches', user?.id],
    queryFn: () => user ? getSavedSearches(user.id) : Promise.resolve([]),
    enabled: !!user,
  });

  // Mutation for updating a property
  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, property }: { id: string, property: Partial<Property> }) =>
      updateProperty(id, property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties', user?.id] });
      toast.success('Property updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update property');
    }
  });

  // Mutation for deleting a property
  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties', user?.id] });
      toast.success('Property removed successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete property');
    }
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setUserData({
          fullName: profileData.full_name || "",
          email: user?.email || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          bio: profileData.bio || "",
        });
      } else {
        setUserData({
          fullName: user?.user_metadata?.fullName || "",
          email: user?.email || "",
          phone: user?.user_metadata?.phone || "",
          location: "",
          bio: "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (values: ProfileFormValues) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          location: values.location,
          bio: values.bio || "",
        });

      if (error) throw error;

      setUserData({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        location: values.location,
        bio: values.bio || "",
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handlePropertyStatusChange = (id: string, status: 'active' | 'under_review' | 'inactive') => {
    updatePropertyMutation.mutate({ id, property: { status } });
  };

  const handleDeleteProperty = (id: string) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      deletePropertyMutation.mutate(propertyToDelete);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <ProfileHeader
            userData={userData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setUserData={handleProfileUpdate}
          />

          {!isEditing && <ContactInfo userData={userData} />}

          {isEditing && (
            <EditProfileForm
              userData={userData}
              onSubmit={handleProfileUpdate}
              onCancel={handleCancelEdit}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="properties">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="properties">My Properties</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="searches">Saved Searches</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="outline-none">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">My Listed Properties</h2>
                <Link to="/sell">
                  <Button className="bg-homefinder-primary hover:bg-homefinder-accent">
                    + Add New Property
                  </Button>
                </Link>
              </div>

              {propertiesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="space-y-4">
                  {properties.map(property => (
                    <Card key={property.id} className="flex flex-col border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-3 h-auto sm:h-40">
                        <div className="w-48 h-40 flex-shrink-0">
                          <img
                            src={property.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80"}
                            alt={property.title}
                            className="h-40 sm:h-full w-full object-cover rounded-t-md sm:rounded-l-md sm:rounded-t-none"
                          />
                        </div>
                        <div className="col-span-2 p-4 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start sm:items-center gap-2">
                              <h3 className="font-medium">{property.title}</h3>
                              <span className={`text-sm font-medium px-2 py-1 rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800' :
                                  property.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {property.status === 'active' ? 'Active' :
                                  property.status === 'under_review' ? 'Under Review' :
                                    'Inactive'}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs sm:text-sm truncate">{property.location}</p>
                            <p className="font-semibold mt-2 text-sm sm:text-base">
                              {property.listing_type === 'rent' ?
                                `₹${property.price.toLocaleString()}/month` :
                                property.price >= 10000000 ?
                                  `₹${(property.price / 10000000).toFixed(2)} Cr` :
                                  `₹${(property.price / 100000).toFixed(2)} Lac`
                              }
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
                            <div className="text-xs sm:text-sm text-muted-foreground  ">
                              Listed on: {new Date(property.created_at || '').toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Link to={`/edit-property/${property.id}`}>
                                <Button size="sm" variant="secondary">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newStatus = property.status === 'active' ? 'inactive' : 'active';
                                  handlePropertyStatusChange(property.id, newStatus);
                                }}
                              >
                                {property.status === 'active' ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No properties listed yet</h3>
                  <p className="text-muted-foreground mt-2 mb-6">Start listing your properties for sale or rent</p>
                  <Button onClick={() => navigate('/sell')}>List a Property</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="outline-none">
              <h2 className="text-xl font-bold mb-6">Favorite Properties</h2>

              {favoritesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : favorites && favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map(favorite => (
                    <Card key={favorite.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={favorite.property?.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80"}
                          alt={favorite.property?.title || "Property"}
                          className="h-48 w-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-homefinder-secondary text-white text-xs px-2 py-1 rounded">
                          {favorite.property?.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{favorite.property?.title}</h3>
                        <p className="text-muted-foreground text-sm">{favorite.property?.location}</p>
                        <p className="font-bold mt-2">
                          {favorite.property?.listing_type === 'rent' ?
                            `₹${favorite.property.price.toLocaleString()}/month` :
                            favorite.property?.price && favorite.property.price >= 10000000 ?
                              `₹${(favorite.property.price / 10000000).toFixed(2)} Cr` :
                              favorite.property?.price ?
                                `₹${(favorite.property.price / 100000).toFixed(2)} Lac` :
                                'Price not available'
                          }
                        </p>
                        <div className="flex justify-between text-sm mt-2">
                          {favorite.property?.bedrooms && (
                            <span className="flex items-center gap-1">
                              <Home className="h-3.5 w-3.5" />
                              {favorite.property.bedrooms} Beds
                            </span>
                          )}
                          {favorite.property?.bathrooms && (
                            <span className="flex items-center gap-1">
                              <Home className="h-3.5 w-3.5" />
                              {favorite.property.bathrooms} Baths
                            </span>
                          )}
                          {favorite.property?.area_sqft && (
                            <span className="flex items-center gap-1">
                              <Home className="h-3.5 w-3.5" />
                              {favorite.property.area_sqft} sqft
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => {
                            if (favorite.property?.listing_type === 'sale') {
                              navigate('/buy');
                            } else {
                              navigate('/rent');
                            }
                          }}
                        >
                          View Property
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No favorite properties yet</h3>
                  <p className="text-muted-foreground mt-2 mb-6">Start browsing and save properties you like</p>
                  <Button onClick={() => navigate('/buy')}>Browse Properties</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="searches" className="outline-none">
              <h2 className="text-xl font-bold mb-6">Saved Searches</h2>

              {searchesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : savedSearches && savedSearches.length > 0 ? (
                <div className="space-y-4">
                  {savedSearches.map(search => (
                    <Card key={search.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold">{search.name}</h3>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {search.criteria.propertyType && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              {Array.isArray(search.criteria.propertyType)
                                ? search.criteria.propertyType.join(', ')
                                : search.criteria.propertyType}
                            </span>
                          )}
                          {search.criteria.location && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              {search.criteria.location}
                            </span>
                          )}
                          {(search.criteria.minPrice || search.criteria.maxPrice) && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              {search.criteria.minPrice && `₹${search.criteria.minPrice.toLocaleString()}`}
                              {search.criteria.minPrice && search.criteria.maxPrice && ' - '}
                              {search.criteria.maxPrice && `₹${search.criteria.maxPrice.toLocaleString()}`}
                            </span>
                          )}
                          {search.criteria.bedrooms && (
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              {Array.isArray(search.criteria.bedrooms)
                                ? `${search.criteria.bedrooms.join(', ')} BHK`
                                : `${search.criteria.bedrooms} BHK`}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm text-muted-foreground">
                            Last updated: {new Date(search.created_at || '').toLocaleDateString()}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              const { propertyType } = search.criteria;
                              if (propertyType === 'pg' ||
                                (Array.isArray(propertyType) && propertyType.includes('pg'))) {
                                navigate('/student-pg');
                              } else if (search.criteria.listingType === 'rent') {
                                navigate('/rent');
                              } else {
                                navigate('/buy');
                              }
                            }}
                          >
                            View Results
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No saved searches yet</h3>
                  <p className="text-muted-foreground mt-2 mb-6">Save your search filters to quickly find properties later</p>
                  <Button onClick={() => navigate('/buy')}>Start Searching</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProperty}
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
