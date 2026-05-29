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
  onProgress(40);

  // 1. Bucket access test
  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log("SUPABASE STORAGE BUCKET TEST", { buckets, bucketError });
    if (bucketError) {
      console.error("Storage access failed. Check Supabase policies.");
    }
  } catch (e) {
    console.error("Bucket test error", e);
  }

  // 2. Upload with Timeout
  console.log("SUPABASE STORAGE UPLOAD START", {
    bucket,
    filePath,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  const uploadPromise = supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Upload timed out after 30 seconds")), 30000)
  );

  try {
    const response = (await Promise.race([
      uploadPromise,
      timeoutPromise
    ])) as { data: { path: string } | null; error: Error | null };

    const { data, error } = response;
    console.log("SUPABASE STORAGE UPLOAD RESPONSE", { data, error });

    if (error) {
      console.error("PROJECT FILE UPLOAD ERROR", error);
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

  } catch (error: unknown) {
    console.error("PROJECT FILE UPLOAD ERROR", error);
    onProgress(0);
    throw error;
  }
};

export const deleteFile = async (bucket: Bucket, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};
