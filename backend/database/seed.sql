-- Dizplai CPM Calculator Seed Data
-- Industry benchmarks and premium multipliers

-- Insert industry CPM benchmarks
-- Data sources: WordStream 2024, eMarketer, IAB Reports, Statista
INSERT INTO industries (name, slug, video_cpm_low, video_cpm_avg, video_cpm_high, notes) VALUES
('Sports', 'sports', 15.00, 25.00, 40.00, 'Spikes during major events (Super Bowl, World Cup, Olympics). Premium live sports can reach $45+ CPM. Source: eMarketer 2024, IAB Video Ad Spend Report'),
('Fashion', 'fashion', 12.00, 20.00, 35.00, 'Higher CPMs Q4 holiday season. Strong performance with influencer content and haul videos. Source: Statista 2024, WordStream Benchmarks'),
('Gambling', 'gambling', 30.00, 50.00, 80.00, 'Highest CPM vertical due to regulatory restrictions and high customer lifetime value. Betting/casino content commands premium. Source: WordStream 2024'),
('Beauty', 'beauty', 10.00, 18.00, 30.00, 'Strong performance with tutorial and review content. Makeup/skincare brands highly active. Source: Statista 2024, eMarketer Beauty Advertising'),
('Banking', 'banking', 20.00, 35.00, 55.00, 'High-value B2C vertical. Credit cards, loans, investment products command premium CPMs. Source: eMarketer Financial Services 2024'),
('Food Delivery', 'food_delivery', 12.00, 20.00, 32.00, 'Peak during meal times and weekends. Competitive market with DoorDash, UberEats, etc. Source: WordStream 2024, IAB Reports');

-- Insert premium multipliers for live streaming sponsorships
-- Research sources: YouTube sponsorship studies, CTV advertising reports, live streaming benchmarks

-- Unskippable Format Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('Unskippable Format', 'format', 1.80, 
'Non-skippable ads show 50-100% higher CPM than skippable formats. Studies show up to 400% CPM increase with viewership adjustment resulting in net 2x effective CPM. Source: YouTube Ads Studies 2024, Display & Video 360 benchmarks', 
true, 1);

-- Integrated Content/Sponsorship Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('Integrated Content', 'placement', 2.50, 
'Integrated sponsorships (embedded within content, not separate ad breaks) command 2-4x standard ad rates. YouTube creator sponsorships: $25-100 CPM vs standard ads $5-25 CPM. Source: ADOPTER Media 2025, Tatari TV Sponsorship Study', 
true, 2);

-- Live Streaming Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('Live Streaming', 'content_type', 1.30, 
'Live broadcasts command 20-50% premium over pre-recorded content. Traditional TV live sports: $45+ CPM vs regular programming $20-30 CPM. Live streaming engagement drives higher value. Source: Nielsen 2024, Twitch CPM Rates 2025', 
true, 3);

-- High-Attention Environment Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('High-Attention Environment', 'engagement', 1.40, 
'Premium content environments with guaranteed viewership show 30-50% uplift. Connected TV high-attention: $30-45 CPM vs display ads $6-12 CPM. Captive audience in focused viewing context. Source: SilverBack Advertising CTV Study, Wurl Streaming Metrics', 
true, 4);

-- Combined multiplier explanation
-- Total multiplier = 1.80 × 2.50 × 1.30 × 1.40 = 8.19x
-- This means premium live streaming sponsorships are worth 8-10x standard YouTube video CPMs
