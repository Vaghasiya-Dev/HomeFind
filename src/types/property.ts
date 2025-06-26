
export type PropertyType = 'apartment' | 'house' | 'villa' | 'pg' | 'plot';
export type ListingType = 'sale' | 'rent' | 'pg';
export type PropertyStatus = 'active' | 'under_review' | 'inactive';

export interface Property {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  property_type: PropertyType;
  listing_type: ListingType;
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  amenities?: Record<string, boolean>;
  images?: string[];
  status?: PropertyStatus;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  owner_address?: string;
  owner_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FavoriteProperty {
  id: string;
  user_id: string;
  property_id: string;
  property?: Property;
  created_at?: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  criteria: Record<string, any>;
  created_at?: string;
}

export interface PropertyFilter {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType[];
  bedrooms?: number[];
  amenities?: string[];
  searchQuery?: string;
}

export interface PGFeedback {
  id: string;
  user_id: string;
  property_id: string;
  rating: number;
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

// Roommate Review interface
export interface RoommateReview {
  id: string;
  reviewer_id: string;
  roommate_id: string;
  property_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

// User profile type for sender/recipient
export interface UserProfile {
  id?: string;
  full_name?: string;
  email?: string;
  [key: string]: any;
}

// Type to represent when there's an error with the relation
export interface RelationError {
  error: true;
}

// Roommate Message interface
export interface RoommateMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  property_id: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
  sender?: UserProfile | RelationError;
  recipient?: UserProfile | RelationError;
}

export interface DailyRoutine {
  wake_up_time?: string;
  sleep_time?: string;
  study_hours?: string;
  extracurricular?: string;
  [key: string]: any;
}

export interface StudentDetail {
  id: string;
  user_id: string;
  property_id: string;
  college_name?: string;
  college_name_pkey?: string; // Add this field to match database schema
  course?: string;
  branch?: string;
  year_of_study?: string;
  move_in_date?: string;
  move_out_date?: string;
  emergency_contact?: string;
  preferences?: Record<string, any> | any;
  daily_routine?: DailyRoutine | any;
  created_at?: string;
  updated_at?: string;
  user?: UserProfile | RelationError;
}

// Helper function to check if an object is a RelationError
export function isRelationError(obj: any): obj is RelationError {
  return obj && typeof obj === 'object' && 'error' in obj;
}