-- Dizplai CPM Calculator Database Schema
-- Live Stream Sponsorship Placement Calculator

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ad_slots CASCADE;
DROP TABLE IF EXISTS calculations CASCADE;
DROP TABLE IF EXISTS multipliers CASCADE;
DROP TABLE IF EXISTS industries CASCADE;

-- Industries table: Base CPM benchmarks for different content types
CREATE TABLE industries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  video_cpm_low DECIMAL(10,2) NOT NULL,
  video_cpm_avg DECIMAL(10,2) NOT NULL,
  video_cpm_high DECIMAL(10,2) NOT NULL,
  notes TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multipliers table: Premium factors for live, integrated, unskippable content
CREATE TABLE multipliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  multiplier_value DECIMAL(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Calculations table: Store user calculation sessions
CREATE TABLE calculations (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100),
  industry_id INTEGER REFERENCES industries(id),
  
  -- User inputs
  stream_length_minutes INTEGER NOT NULL,
  avg_view_time_minutes INTEGER NOT NULL,
  total_views INTEGER NOT NULL,
  
  -- Calculated values
  base_cpm DECIMAL(10,2),
  total_multiplier DECIMAL(5,2),
  premium_cpm DECIMAL(10,2),
  
  -- Frequency calculations
  unique_watch_sessions DECIMAL(10,2),
  effective_unique_viewers DECIMAL(10,2),
  min_ad_frequency INTEGER,
  user_selected_frequency INTEGER,
  
  -- Pricing outputs
  cost_per_30s_placement DECIMAL(10,2),
  total_placements_possible INTEGER,
  total_inventory_value DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad slots table: Track multiple brand placements in same stream
CREATE TABLE ad_slots (
  id SERIAL PRIMARY KEY,
  calculation_id INTEGER REFERENCES calculations(id),
  brand_name VARCHAR(100),
  placements_purchased INTEGER,
  slot_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_calculations_session ON calculations(session_id);
CREATE INDEX idx_calculations_created ON calculations(created_at);
CREATE INDEX idx_ad_slots_calculation ON ad_slots(calculation_id);

-- Campaigns table: Groups multiple streams under a channel
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  channel_name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign streams: Individual streams within a campaign
CREATE TABLE campaign_streams (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
  stream_type VARCHAR(100) NOT NULL,
  calculation_id INTEGER REFERENCES calculations(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_campaigns_channel ON campaigns(channel_name);
CREATE INDEX idx_campaign_streams_campaign ON campaign_streams(campaign_id);
