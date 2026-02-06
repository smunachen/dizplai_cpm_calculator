const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const PricingEngine = require('../services/pricingEngine');

/**
 * POST /api/calculator/calculate
 * Calculate sponsorship placement value
 * 
 * Body:
 * {
 *   industry_id: number,
 *   stream_length_minutes: number,
 *   avg_view_time_minutes: number,
 *   total_views: number,
 *   user_selected_frequency: number (optional)
 * }
 */
router.post('/calculate', async (req, res) => {
  try {
    const {
      industry_id,
      stream_length_minutes,
      avg_view_time_minutes,
      total_views,
      user_selected_frequency = null,
    } = req.body;

    // Validation
    if (!industry_id || !stream_length_minutes || !avg_view_time_minutes || !total_views) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['industry_id', 'stream_length_minutes', 'avg_view_time_minutes', 'total_views'],
      });
    }

    // Fetch industry base CPM
    const industryResult = await query(
      'SELECT id, name, video_cpm_avg FROM industries WHERE id = $1',
      [industry_id]
    );

    if (industryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Industry not found',
      });
    }

    const industry = industryResult.rows[0];
    const baseCPM = parseFloat(industry.video_cpm_avg);

    // Fetch active multipliers
    const multipliersResult = await query(`
      SELECT multiplier_value, name, category
      FROM multipliers
      WHERE is_active = true
      ORDER BY sort_order ASC
    `);

    const multiplierValues = multipliersResult.rows.map(m => parseFloat(m.multiplier_value));
    const multiplierDetails = multipliersResult.rows;

    // Perform calculation using pricing engine
    const calculation = PricingEngine.calculateAdValue({
      baseCPM,
      multipliers: multiplierValues,
      streamLengthMinutes: stream_length_minutes,
      avgViewTimeMinutes: avg_view_time_minutes,
      totalViews: total_views,
      userSelectedFrequency: user_selected_frequency,
    });

    // Generate session ID for tracking
    const sessionId = uuidv4();

    // Store calculation in database
    await query(
      `
      INSERT INTO calculations (
        session_id,
        industry_id,
        stream_length_minutes,
        avg_view_time_minutes,
        total_views,
        base_cpm,
        total_multiplier,
        premium_cpm,
        unique_watch_sessions,
        effective_unique_viewers,
        min_ad_frequency,
        user_selected_frequency,
        cost_per_30s_placement,
        total_placements_possible,
        total_inventory_value
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
      `,
      [
        sessionId,
        industry_id,
        stream_length_minutes,
        avg_view_time_minutes,
        total_views,
        calculation.inputs.baseCPM,
        calculation.totalMultiplier,
        calculation.premiumCPM,
        calculation.uniqueWatchSessions,
        calculation.effectiveUniqueViewers,
        calculation.minAdFrequency,
        calculation.selectedFrequency,
        calculation.costPerPlacement,
        calculation.maxPlacements,
        calculation.totalInventoryValue,
      ]
    );

    // Return comprehensive results
    res.json({
      success: true,
      sessionId,
      industry: {
        id: industry.id,
        name: industry.name,
      },
      multipliers: multiplierDetails,
      calculation,
    });
  } catch (error) {
    console.error('Error performing calculation:', error);
    res.status(500).json({
      success: false,
      error: 'Calculation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/calculator/multi-brand
 * Calculate multiple brand placements in same stream
 * 
 * Body:
 * {
 *   calculation_id: number,
 *   brands: [
 *     { name: "Brand A", placements: 4 },
 *     { name: "Brand B", placements: 4 }
 *   ]
 * }
 */
router.post('/multi-brand', async (req, res) => {
  try {
    const { calculation_id, brands } = req.body;

    // Validation
    if (!calculation_id || !brands || !Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'calculation_id and brands array are required',
      });
    }

    // Fetch the base calculation
    const calcResult = await query(
      `
      SELECT 
        cost_per_30s_placement as "costPerPlacement",
        total_placements_possible as "maxPlacements",
        stream_length_minutes as "streamLengthMinutes"
      FROM calculations
      WHERE id = $1
      `,
      [calculation_id]
    );

    if (calcResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Calculation not found',
      });
    }

    const baseCalculation = calcResult.rows[0];

    // Calculate multi-brand breakdown
    const multiBrandResult = PricingEngine.calculateMultiBrandPlacements(baseCalculation, brands);

    // Store ad slots in database
    for (const brand of multiBrandResult.brands) {
      await query(
        `
        INSERT INTO ad_slots (calculation_id, brand_name, placements_purchased, slot_value)
        VALUES ($1, $2, $3, $4)
        `,
        [calculation_id, brand.brandName, brand.placements, brand.totalCost]
      );
    }

    res.json({
      success: true,
      calculation_id,
      result: multiBrandResult,
    });
  } catch (error) {
    console.error('Error calculating multi-brand placements:', error);
    res.status(500).json({
      success: false,
      error: 'Multi-brand calculation failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/calculator/history
 * Retrieve calculation history (recent calculations)
 */
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await query(
      `
      SELECT 
        c.id,
        c.session_id,
        c.created_at,
        i.name as industry_name,
        c.stream_length_minutes,
        c.total_views,
        c.premium_cpm,
        c.total_inventory_value
      FROM calculations c
      JOIN industries i ON c.industry_id = i.id
      ORDER BY c.created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching calculation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve calculation history',
      message: error.message,
    });
  }
});

/**
 * GET /api/calculator/calculation/:id
 * Retrieve specific calculation by ID with all details
 */
router.get('/calculation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch calculation
    const calcResult = await query(
      `
      SELECT 
        c.*,
        i.name as industry_name
      FROM calculations c
      JOIN industries i ON c.industry_id = i.id
      WHERE c.id = $1
      `,
      [id]
    );

    if (calcResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Calculation not found',
      });
    }

    // Fetch associated ad slots if any
    const slotsResult = await query(
      `
      SELECT brand_name, placements_purchased, slot_value, created_at
      FROM ad_slots
      WHERE calculation_id = $1
      ORDER BY created_at ASC
      `,
      [id]
    );

    res.json({
      success: true,
      calculation: calcResult.rows[0],
      adSlots: slotsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching calculation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve calculation',
      message: error.message,
    });
  }
});

module.exports = router;
