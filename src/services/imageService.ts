
import { supabase } from '@/integrations/supabase/client';

export const uploadPropertyImage = async (file: File, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName);

  return publicUrl;
};

export const deletePropertyImage = async (imageUrl: string): Promise<void> => {
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const userFolder = urlParts[urlParts.length - 2];
    const filePath = `${userFolder}/${fileName}`;

    const { error } = await supabase.storage
      .from('property-images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
