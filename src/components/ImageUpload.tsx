
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
}

export default function ImageUpload({ onImagesChange, existingImages = [], maxImages = 10 }: ImageUploadProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!user) {
      toast.error('Please login to upload images');
      return;
    }

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`File ${file.name} is not a supported format (JPG, PNG, WEBP)`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log('Attempting to upload file:', fileName);

        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
        console.log('Successfully uploaded:', publicUrl);
      }

      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      if (newImageUrls.length > 0) {
        toast.success(`${newImageUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [user, images, maxImages, onImagesChange]);

  const removeImage = useCallback(async (imageUrl: string, index: number) => {
    try {
      // Only try to delete from storage if it's actually stored there
      if (imageUrl.includes('supabase')) {
        // Extract file path from URL to delete from storage
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
      }
    } catch (error) {
      console.error('Delete error:', error);
    }

    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
    toast.success('Image removed');
  }, [images, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-4">
      <Label>Property Images (Max {maxImages})</Label>
      
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, WEBP up to 5MB ({images.length}/{maxImages})
            </p>
          </div>
        </label>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Property image ${index + 1}`}
                className="w:full h-24 object-cover rounded-lg border"
                onError={(e) => {
                  console.log('Image failed to load:', imageUrl);
                  // You could set a placeholder image here
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                onClick={() => removeImage(imageUrl, index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
