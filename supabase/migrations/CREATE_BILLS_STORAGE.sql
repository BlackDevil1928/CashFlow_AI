-- Create storage bucket for bill images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bills',
  'bills',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own bills
CREATE POLICY "Users can upload their own bills"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own bills
CREATE POLICY "Users can view their own bills"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own bills
CREATE POLICY "Users can delete their own bills"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Bills storage bucket created successfully!';
  RAISE NOTICE '✅ Storage policies applied';
  RAISE NOTICE '📸 Users can now upload bill images';
END $$;
