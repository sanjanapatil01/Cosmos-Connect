
-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true);

-- Allow anyone to upload to chat-attachments bucket
CREATE POLICY "Anyone can upload chat attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow anyone to read chat attachments
CREATE POLICY "Anyone can read chat attachments"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'chat-attachments');
