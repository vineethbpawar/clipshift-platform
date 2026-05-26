import { supabase } from './supabase';

export type Bucket = 'avatars' | 'portfolios' | 'project-files';

export const uploadFile = async (
  file: File,
  bucket: Bucket,
  userId: string,
  onProgress: (progress: number) => void
) => {
  const fileExt = file.name.split('.').pop();
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2);
  const filePath = `${userId}/${Date.now()}-${uuid}.${fileExt}`;

  console.log("PROJECT FILE UPLOAD START", filePath);
  onProgress(40); // Set to 40% when upload starts as requested

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });

  if (error) {
    console.error("PROJECT FILE UPLOAD ERROR:", error);
    onProgress(0);
    throw error;
  }

  onProgress(100); 

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  const uploadedFile = {
    file_url: publicUrl,
    file_path: filePath,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size
  };

  console.log("PROJECT FILE UPLOAD SUCCESS", uploadedFile);
  return uploadedFile;
};

export const deleteFile = async (bucket: Bucket, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};
