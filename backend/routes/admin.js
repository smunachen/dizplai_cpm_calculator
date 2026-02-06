const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Admin password (change this to something secure)
const ADMIN_PASSWORD = 'dizplai2026admin';

// Reseed database with new industries
router.post('/reseed-industries', async (req, res) => {
  const { password } = req.body;

  // Check password
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Clear existing industries
    await client.query('DELETE FROM industries');

    // Insert new 15 industries
    const industries = [
      ['Finance & Investing', 'finance', 30.00, 40.00, 50.00, 'Personal finance, crypto, stock market, wealth building - highest paying niche. Premium for investment/credit card content. Source: OutlierKit, Lenos, upGrowth 2025-2026'],
      ['Legal & Insurance', 'legal', 25.00, 35.00, 55.00, 'Legal advice, court content, insurance products - ultra-premium CPM due to high customer lifetime value. Source: OutlierKit, YouTube Tools Hub 2026'],
      ['Real Estate', 'real_estate', 25.00, 32.00, 45.00, 'Property investing, market analysis, home buying - high purchase intent drives premium rates. Source: YouTube Tools Hub, OutlierKit 2026'],
      ['Business & Entrepreneurship', 'business', 20.00, 28.00, 45.00, 'Startups, B2B software, business strategy - premium B2B advertisers with large budgets. Source: YouTube Tools Hub, Lenos 2026'],
      ['Sports', 'sports', 15.00, 25.00, 40.00, 'Live sports, analysis, watch parties - spikes during major events. Premium live sports can reach £45+ CPM. Source: eMarketer, IAB 2024'],
      ['Tech & SaaS', 'tech', 18.00, 24.00, 40.00, 'Software reviews, enterprise tech, cybersecurity - premium tech advertisers targeting professionals. Source: YouTube Tools Hub, upGrowth 2026'],
      ['Automotive', 'automotive', 18.00, 23.00, 35.00, 'Car reviews, auto industry news, vehicle comparisons - big-ticket purchases command premium. Source: AWISEE, upGrowth 2025'],
      ['Digital Marketing', 'marketing', 15.00, 20.00, 30.00, 'SEO, social media marketing, affiliate marketing - high advertiser competition and expertise. Source: TastyEdits, OutlierKit 2025'],
      ['Education & Tutorials', 'education', 15.00, 20.00, 35.00, 'Online learning, skill development, certifications - high viewer intent and engagement. Source: Lenos, AWISEE 2025-2026'],
      ['Beauty & Fashion', 'beauty', 12.00, 18.00, 30.00, 'Makeup, skincare, styling - influencer-driven brand campaigns. Source: Statista 2024, Lenos 2025'],
      ['Health & Wellness', 'health', 15.00, 18.00, 28.00, 'Fitness, nutrition, mental health, longevity - growing premium market. Source: upGrowth, OutlierKit 2026'],
      ['News & Politics', 'news', 8.00, 12.00, 20.00, 'Breaking news, political commentary, analysis - interactive community-driven content. Source: Multiple sources 2025-2026'],
      ['Lifestyle & Entertainment', 'lifestyle', 8.00, 10.00, 15.00, 'Vlogs, daily routines, reality content - broad appeal but lower CPM. Source: AWISEE, TastyEdits 2025'],
      ['Gaming', 'gaming', 6.00, 10.00, 20.00, 'Esports, Let\'s Plays, game reviews - massive viewership but younger demographics. Source: Lenos, OutlierKit 2025-2026'],
      ['Music & Podcasts', 'music', 5.00, 8.00, 15.00, 'Live performances, interviews, talk shows - background listening results in lower CPM. Source: Lenos 2025']
    ];

    for (const industry of industries) {
      await client.query(
        'INSERT INTO industries (name, slug, video_cpm_low, video_cpm_avg, video_cpm_high, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        industry
      );
    }

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: 'Successfully reseeded 15 industries',
      count: industries.length
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reseeding industries:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;