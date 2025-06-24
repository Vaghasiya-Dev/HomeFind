import { supabase } from '@/integrations/supabase/client';
import { 
  Property, 
  PropertyFilter, 
  FavoriteProperty, 
  SavedSearch, 
  PGFeedback,
  PropertyType,
  ListingType,
  RoommateReview,
  StudentDetail
} from '@/types/property';
import { Json } from '@/integrations/supabase/types';

// Property CRUD operations
export const getProperties = async (filter?: PropertyFilter) => {
  let query = supabase.from('properties').select('*');

  if (filter) {
    if (filter.location) {
      query = query.ilike('location', `%${filter.location}%`);
    }
    
    if (filter.minPrice !== undefined) {
      query = query.gte('price', filter.minPrice);
    }
    
    if (filter.maxPrice !== undefined) {
      query = query.lte('price', filter.maxPrice);
    }
    
    if (filter.propertyType && filter.propertyType.length > 0) {
      query = query.in('property_type', filter.propertyType);
    }
    
    if (filter.bedrooms && filter.bedrooms.length > 0) {
      query = query.in('bedrooms', filter.bedrooms);
    }
    
    if (filter.searchQuery) {
      query = query.or(`title.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%`);
    }
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Property[];
};

export const getPropertyById = async (id: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Property;
};

export const getUserProperties = async (userId: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data as Property[];
};

export const createProperty = async (property: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string) => {
  const propertyToInsert = {
    ...property,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('properties')
    .insert(propertyToInsert)
    .select()
    .single();
  
  if (error) throw error;
  return data as Property;
};

export const updateProperty = async (id: string, property: Partial<Property>) => {
  const { data, error } = await supabase
    .from('properties')
    .update(property)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Property;
};

export const deleteProperty = async (id: string) => {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Favorites operations
export const getFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, property:properties(*)')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data as (FavoriteProperty & { property: Property })[];
};

export const addFavorite = async (userId: string, propertyId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, property_id: propertyId })
    .select()
    .single();
  
  if (error) throw error;
  return data as FavoriteProperty;
};

export const removeFavorite = async (userId: string, propertyId: string) => {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId);
  
  if (error) throw error;
  return true;
};

export const isFavorite = async (userId: string, propertyId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();
  
  if (error) throw error;
  return !!data;
};

// Saved searches operations
export const getSavedSearches = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data as SavedSearch[];
};

export const saveSearch = async (userId: string, name: string, criteria: Record<string, any>) => {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert({ user_id: userId, name, criteria })
    .select()
    .single();
  
  if (error) throw error;
  return data as SavedSearch;
};

export const updateSavedSearch = async (id: string, name: string, criteria: Record<string, any>) => {
  const { data, error } = await supabase
    .from('saved_searches')
    .update({ name, criteria })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as SavedSearch;
};

export const deleteSavedSearch = async (id: string) => {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// PG Feedback operations
export const getPropertyFeedback = async (propertyId: string) => {
  const { data, error } = await supabase
    .from('pg_feedback')
    .select('*')
    .eq('property_id', propertyId);
  
  if (error) throw error;
  return data as PGFeedback[];
};

export const addFeedback = async (feedback: Omit<PGFeedback, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('pg_feedback')
    .insert(feedback)
    .select()
    .single();
  
  if (error) throw error;
  return data as PGFeedback;
};

export const updateFeedback = async (id: string, feedback: Partial<PGFeedback>) => {
  const { data, error } = await supabase
    .from('pg_feedback')
    .update(feedback)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as PGFeedback;
};

export const deleteFeedback = async (id: string) => {
  const { error } = await supabase
    .from('pg_feedback')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Student Details operations
export const getStudentDetails = async (userId: string) => {
  const { data, error } = await supabase
    .from('student_details')
    .select('*, property:properties(*)')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

export const updateStudentDetails = async (userId: string, propertyId: string, details: Partial<StudentDetail>) => {
  const { data, error } = await supabase
    .from('student_details')
    .upsert({ 
      user_id: userId, 
      property_id: propertyId,
      ...details
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Roommate Feedback operations
export const getRoommateReviews = async (propertyId: string) => {
  const { data, error } = await supabase
    .from('roommate_reviews')
    .select('*, reviewer:profiles(*), roommate:profiles(*)')
    .eq('property_id', propertyId);
  
  if (error) throw error;
  return data;
};

export const addRoommateReview = async (review: Omit<RoommateReview, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('roommate_reviews')
    .insert(review)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRoommateReview = async (id: string, review: Partial<RoommateReview>) => {
  const { data, error } = await supabase
    .from('roommate_reviews')
    .update(review)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRoommateReview = async (id: string) => {
  const { error } = await supabase
    .from('roommate_reviews')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Get residents of a property
export const getPropertyResidents = async (propertyId: string) => {
  const { data, error } = await supabase
    .from('student_details')
    .select('*, user:profiles(*)')
    .eq('property_id', propertyId);
  
  if (error) throw error;
  return data;
};

// Roommate Chat operations
export const sendRoommateMessage = async (senderId: string, recipientId: string, propertyId: string, message: string) => {
  const { data, error } = await supabase
    .from('roommate_messages')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      property_id: propertyId,
      message,
      read: false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getRoommateMessages = async (userId: string, propertyId: string) => {
  // Get both sent and received messages
  const { data: sentMessages, error: sentError } = await supabase
    .from('roommate_messages')
    .select('*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)')
    .eq('sender_id', userId)
    .eq('property_id', propertyId);
    
  const { data: receivedMessages, error: receivedError } = await supabase
    .from('roommate_messages')
    .select('*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)')
    .eq('recipient_id', userId)
    .eq('property_id', propertyId);
    
  if (sentError || receivedError) throw sentError || receivedError;
  
  // Combine and sort by created_at
  const allMessages = [...(sentMessages || []), ...(receivedMessages || [])];
  return allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export const markMessageAsRead = async (messageId: string) => {
  const { data, error } = await supabase
    .from('roommate_messages')
    .update({ read: true })
    .eq('id', messageId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Function to get all properties based on filter criteria
export async function getAllProperties(filter?: {
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string[];
  listingType?: string;
  location?: string;
  searchQuery?: string;
  amenities?: string[];
}) {
  try {
    let query = supabase
      .from('properties')
      .select('*');
    
    if (filter) {
      // Apply filters if they exist
      if (filter.minPrice) {
        query = query.gte('price', filter.minPrice);
      }
      
      if (filter.maxPrice) {
        query = query.lte('price', filter.maxPrice);
      }
      
      if (filter.propertyType && filter.propertyType.length > 0) {
        query = query.in('property_type', filter.propertyType);
      }
      
      if (filter.listingType) {
        query = query.eq('listing_type', filter.listingType);
      }
      
      if (filter.location) {
        query = query.ilike('location', `%${filter.location}%`);
      }
      
      if (filter.searchQuery) {
        query = query.or(`title.ilike.%${filter.searchQuery}%,location.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%`);
      }
      
      if (filter.amenities && filter.amenities.length > 0) {
        // For each amenity, check if it exists and is true in the amenities JSONB
        filter.amenities.forEach(amenity => {
          query = query.or(`amenities->>${amenity}.eq.true`);
        });
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}
