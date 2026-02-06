-- Dizplai CPM Calculator Seed Data
-- Industry benchmarks and premium multipliers
-- Updated February 2026

-- Insert industry CPM benchmarks (15 categories - updated 2026)
-- Data sources: OutlierKit, Lenos, upGrowth, YouTube Tools Hub, AWISEE, TastyEdits 2025-2026
INSERT INTO industries (name, slug, video_cpm_low, video_cpm_avg, video_cpm_high, notes) VALUES
('Finance & Investing', 'finance', 30.00, 40.00, 50.00, 'Personal finance, crypto, stock market, wealth building - highest paying niche. Premium for investment/credit card content. Source: OutlierKit, Lenos, upGrowth 2025-2026'),
('Legal & Insurance', 'legal', 25.00, 35.00, 55.00, 'Legal advice, court content, insurance products - ultra-premium CPM due to high customer lifetime value. Source: OutlierKit, YouTube Tools Hub 2026'),
('Real Estate', 'real_estate', 25.00, 32.00, 45.00, 'Property investing, market analysis, home buying - high purchase intent drives premium rates. Source: YouTube Tools Hub, OutlierKit 2026'),
('Business & Entrepreneurship', 'business', 20.00, 28.00, 45.00, 'Startups, B2B software, business strategy - premium B2B advertisers with large budgets. Source: YouTube Tools Hub, Lenos 2026'),
('Sports', 'sports', 15.00, 25.00, 40.00, 'Live sports, analysis, watch parties - spikes during major events (Super Bowl, World Cup, Olympics). Premium live sports can reach £45+ CPM. Source: eMarketer, IAB 2024'),
('Tech & SaaS', 'tech', 18.00, 24.00, 40.00, 'Software reviews, enterprise tech, cybersecurity - premium tech advertisers targeting professionals. Source: YouTube Tools Hub, upGrowth 2026'),
('Automotive', 'automotive', 18.00, 23.00, 35.00, 'Car reviews, auto industry news, vehicle comparisons - big-ticket purchases command premium. Source: AWISEE, upGrowth 2025'),
('Digital Marketing', 'marketing', 15.00, 20.00, 30.00, 'SEO, social media marketing, affiliate marketing - high advertiser competition and expertise. Source: TastyEdits, OutlierKit 2025'),
('Education & Tutorials', 'education', 15.00, 20.00, 35.00, 'Online learning, skill development, certifications - high viewer intent and engagement. Digital education ad spend: £404B by 2025. Source: Lenos, AWISEE 2025-2026'),
('Beauty & Fashion', 'beauty', 12.00, 18.00, 30.00, 'Makeup, skincare, styling - strong performance with tutorial and review content. Influencer-driven brand campaigns. Source: Statista 2024, Lenos 2025'),
('Health & Wellness', 'health', 15.00, 18.00, 28.00, 'Fitness, nutrition, mental health, longevity - growing premium market with affluent demographics. Source: upGrowth, OutlierKit 2026'),
('News & Politics', 'news', 8.00, 12.00, 20.00, 'Breaking news, political commentary, analysis - interactive community-driven content with moderate CPM. Source: Multiple sources 2025-2026'),
('Lifestyle & Entertainment', 'lifestyle', 8.00, 10.00, 15.00, 'Vlogs, daily routines, reality content - broad appeal but lower CPM due to mass audience. Source: AWISEE, TastyEdits 2025'),
('Gaming', 'gaming', 6.00, 10.00, 20.00, 'Esports, Let''s Plays, game reviews - massive viewership but younger demographics result in moderate CPM. Source: Lenos, OutlierKit 2025-2026'),
('Music & Podcasts', 'music', 5.00, 8.00, 15.00, 'Live performances, interviews, talk shows - background listening and broad audience results in lower CPM. Podcasts perform better than pure music. Source: Lenos 2025');

-- Insert premium multipliers for live streaming sponsorships
-- Research sources: YouTube sponsorship studies, CTV advertising reports, live streaming benchmarks

-- Unskippable Format Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('Unskippable Format', 'format', 1.80, 
'Non-skippable ads show 50-100% higher CPM than skippable formats. Integrated on-screen graphics cannot be skipped by viewers, guaranteeing full exposure. Studies show up to 400% CPM increase with viewership adjustment resulting in net 2x effective CPM. Source: YouTube Ads Studies 2024, Display & Video 360 benchmarks', 
true, 1);

-- Integrated Content/Sponsorship Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('Integrated Content', 'placement', 2.50, 
'Integrated sponsorships (embedded within content, not separate ad breaks) command 2-4x standard ad rates due to authentic brand association and higher trust. YouTube creator sponsorships: £25-100 CPM vs standard ads £5-25 CPM. Viewers perceive integrated content as more credible. Source: ADOPTER Media 2025, Tatari TV Sponsorship Study', 
true, 2);

-- Live Streaming Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('Live Streaming', 'content_type', 1.30, 
'Live broadcasts command 20-50% premium over pre-recorded content due to FOMO (fear of missing out), real-time engagement, and inability to skip ahead. Traditional TV live sports: £45+ CPM vs regular programming £20-30 CPM. Live streaming creates urgency and drives higher completion rates. Source: Nielsen 2024, Twitch CPM Rates 2025', 
true, 3);

-- High-Attention Environment Premium
INSERT INTO multipliers (name, category, multiplier_value, description, is_active, sort_order) VALUES
('High-Attention Environment', 'engagement', 1.40, 
'Premium content environments with focused viewing show 30-50% uplift in completion rates and engagement. Connected TV (lean-back viewing) commands £30-45 CPM vs display ads £6-12 CPM. Captive audience in focused viewing context without multitasking. Viewers in high-attention mode demonstrate higher brand recall and purchase intent. Source: SilverBack Advertising CTV Study, Wurl Streaming Metrics 2024', 
true, 4);

-- Combined multiplier explanation
-- Compound multiplier = 1.80 × 2.50 × 1.30 × 1.40 = 8.19x
-- Geometric mean = (8.19)^(1/4) = 1.69
-- Adjusted multiplier = 1 + (1.69 - 1) × 1.5 = 2.54x
-- This balanced approach accounts for factor overlap while maintaining defensible premium pricing
-- Premium live streaming sponsorships are worth 2.54x standard video CPMs
