-- Extension Detections table
CREATE TABLE IF NOT EXISTS extension_detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  imported BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Receipt Scans table
CREATE TABLE IF NOT EXISTS receipt_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receipts_found INTEGER DEFAULT 0 NOT NULL,
  imported_count INTEGER DEFAULT 0 NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_extension_detections_user_id ON extension_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_detections_service ON extension_detections(service_name);
CREATE INDEX IF NOT EXISTS idx_receipt_scans_user_id ON receipt_scans(user_id);

-- Row Level Security
ALTER TABLE extension_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;

-- Extension detections policies
CREATE POLICY "Users can view their own extension detections"
  ON extension_detections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extension detections"
  ON extension_detections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extension detections"
  ON extension_detections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own extension detections"
  ON extension_detections FOR DELETE
  USING (auth.uid() = user_id);

-- Receipt scans policies
CREATE POLICY "Users can view their own receipt scans"
  ON receipt_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipt scans"
  ON receipt_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipt scans"
  ON receipt_scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipt scans"
  ON receipt_scans FOR DELETE
  USING (auth.uid() = user_id);
