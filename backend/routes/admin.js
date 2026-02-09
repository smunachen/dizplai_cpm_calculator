const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Admin password
const ADMIN_PASSWORD = 'dizplai2026admin';

// Add new industries (doesn't delete existing ones)
router.post('/add-industries', async (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Add 9 new industries (keeping existing 6)
    const newIndustries = [
      ['Finance & Investing', 'finance', 30.00, 40.00, 50.00, 'Personal finance, crypto, stock market, wealth building - highest paying niche. Source: OutlierKit, Lenos, upGrowth 2025-2026'],
      ['Legal & Insurance', 'legal', 25.00, 35.00, 55.00, 'Legal advice, court content, insurance products - ultra-premium CPM. Source: OutlierKit, YouTube Tools Hub 2026'],
      ['Real Estate', 'real_estate', 25.00, 32.00, 45.00, 'Property investing, market analysis, home buying. Source: YouTube Tools Hub, OutlierKit 2026'],
      ['Business & Entrepreneurship', 'business', 20.00, 28.00, 45.00, 'Startups, B2B software, business strategy. Source: YouTube Tools Hub, Lenos 2026'],
      ['Tech & SaaS', 'tech', 18.00, 24.00, 40.00, 'Software reviews, enterprise tech, cybersecurity. Source: YouTube Tools Hub, upGrowth 2026'],
      ['Automotive', 'automotive', 18.00, 23.00, 35.00, 'Car reviews, auto industry news. Source: AWISEE, upGrowth 2025'],
      ['Digital Marketing', 'marketing', 15.00, 20.00, 30.00, 'SEO, social media marketing, affiliate marketing. Source: TastyEdits, OutlierKit 2025'],
      ['Education & Tutorials', 'education', 15.00, 20.00, 35.00, 'Online learning, skill development, certifications. Source: Lenos, AWISEE 2025-2026'],
      ['Health & Wellness', 'health', 15.00, 18.00, 28.00, 'Fitness, nutrition, mental health, longevity. Source: upGrowth, OutlierKit 2026']
    ];

    let added = 0;
    for (const industry of newIndustries) {
      // Check if slug already exists
      const existing = await client.query('SELECT id FROM industries WHERE slug = $1', [industry[1]]);
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO industries (name, slug, video_cpm_low, video_cpm_avg, video_cpm_high, notes) VALUES ($1, $2, $3, $4, $5, $6)',
          industry
        );
        added++;
      }
    }

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: `Successfully added ${added} new industries. Existing industries preserved.`,
      added: added
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding industries:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Remove a single industry by slug
router.post('/remove-industry', async (req, res) => {
  const { password, slug } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'DELETE FROM industries WHERE slug = $1 RETURNING name',
      [slug]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.json({ success: false, message: `Industry '${slug}' not found` });
    }

    res.json({ 
      success: true, 
      message: `Successfully removed industry: ${result.rows[0].name}`,
      removed: result.rows[0].name
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing industry:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;