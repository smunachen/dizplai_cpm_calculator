const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * GET /api/benchmarks/industries
 * Retrieve all industry CPM benchmarks
 */
router.get('/industries', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        slug,
        video_cpm_low,
        video_cpm_avg,
        video_cpm_high,
        notes,
        last_updated
      FROM industries
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve industry benchmarks',
      message: error.message,
    });
  }
});

/**
 * GET /api/benchmarks/industries/:id
 * Retrieve specific industry by ID
 */
router.get('/industries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `
      SELECT 
        id,
        name,
        slug,
        video_cpm_low,
        video_cpm_avg,
        video_cpm_high,
        notes,
        last_updated
      FROM industries
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Industry not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching industry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve industry',
      message: error.message,
    });
  }
});

/**
 * GET /api/benchmarks/industries/slug/:slug
 * Retrieve specific industry by slug (e.g., "sports", "fashion")
 */
router.get('/industries/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await query(
      `
      SELECT 
        id,
        name,
        slug,
        video_cpm_low,
        video_cpm_avg,
        video_cpm_high,
        notes,
        last_updated
      FROM industries
      WHERE slug = $1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Industry not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching industry by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve industry',
      message: error.message,
    });
  }
});

/**
 * GET /api/benchmarks/multipliers
 * Retrieve all active premium multipliers
 */
router.get('/multipliers', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        category,
        multiplier_value,
        description,
        is_active,
        sort_order
      FROM multipliers
      WHERE is_active = true
      ORDER BY sort_order ASC
    `);

    // Calculate total compound multiplier
    const totalMultiplier = result.rows.reduce(
      (acc, m) => acc * parseFloat(m.multiplier_value),
      1
    );

    res.json({
      success: true,
      count: result.rows.length,
      totalMultiplier: parseFloat(totalMultiplier.toFixed(2)),
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching multipliers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve multipliers',
      message: error.message,
    });
  }
});

/**
 * GET /api/benchmarks/summary
 * Get complete benchmarks summary (industries + multipliers)
 */
router.get('/summary', async (req, res) => {
  try {
    // Fetch industries
    const industriesResult = await query(`
      SELECT 
        id,
        name,
        slug,
        video_cpm_avg as base_cpm,
        notes
      FROM industries
      ORDER BY name ASC
    `);

    // Fetch multipliers
    const multipliersResult = await query(`
      SELECT 
        id,
        name,
        category,
        multiplier_value,
        description
      FROM multipliers
      WHERE is_active = true
      ORDER BY sort_order ASC
    `);

    // Calculate total multiplier
    const totalMultiplier = multipliersResult.rows.reduce(
      (acc, m) => acc * parseFloat(m.multiplier_value),
      1
    );

    res.json({
      success: true,
      data: {
        industries: industriesResult.rows,
        multipliers: multipliersResult.rows,
        totalMultiplier: parseFloat(totalMultiplier.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error fetching benchmarks summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve benchmarks summary',
      message: error.message,
    });
  }
});

module.exports = router;
