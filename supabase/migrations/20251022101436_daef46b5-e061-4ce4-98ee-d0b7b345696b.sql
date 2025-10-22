-- Create storage bucket for hosted websites
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'websites',
  'websites',
  true,
  52428800, -- 50MB
  ARRAY['text/html', 'application/zip', 'application/x-zip-compressed']
);

-- Storage policies for websites bucket
CREATE POLICY "Users can upload their own website files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'websites' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own website files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'websites' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own website files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'websites' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view all website files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'websites');

CREATE POLICY "Admins can view all website files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'websites' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete any website files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'websites' AND
    public.has_role(auth.uid(), 'admin')
  );