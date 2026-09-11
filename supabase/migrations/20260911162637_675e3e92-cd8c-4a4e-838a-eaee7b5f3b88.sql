CREATE POLICY "own crop photos read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'crop-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own crop photos insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'crop-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "own crop photos delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'crop-photos' AND auth.uid()::text = (storage.foldername(name))[1]);