const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

/**
 * POST /api/campaigns/create
 * Create a new campaign with multiple streams
 */
router.post('/create', async (req, res) => {
  try {
    const { channel_name, streams } = req.body;

    if (!channel_name || !streams || streams.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Channel name and at least one stream required'
      });
    }

    // Create campaign
    const campaignResult = await query(
      'INSERT INTO campaigns (channel_name) VALUES ($1) RETURNING id',
      [channel_name]
    );
    const campaignId = campaignResult.rows[0].id;

    // Store each stream calculation
    const streamResults = [];
    
    for (const stream of streams) {
      // First create the calculation
      const calcResult = await query(
        `INSERT INTO calculations (
          session_id, industry_id, stream_length_minutes, avg_view_time_minutes,
          total_views, base_cpm, total_multiplier, premium_cpm,
          unique_watch_sessions, effective_unique_viewers, min_ad_frequency,
          user_selected_frequency, cost_per_30s_placement, total_placements_possible,
          total_inventory_value
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          stream.sessionId,
          stream.industry_id,
          stream.stream_length_minutes,
          stream.avg_view_time_minutes,
          stream.total_views,
          stream.baseCPM,
          stream.totalMultiplier,
          stream.premiumCPM,
          stream.uniqueWatchSessions,
          stream.effectiveUniqueViewers,
          stream.minAdFrequency,
          stream.selectedFrequency,
          stream.costPerPlacement,
          stream.maxPlacements,
          stream.totalInventoryValue
        ]
      );
      
      const calculationId = calcResult.rows[0].id;

      // Link to campaign
      await query(
        'INSERT INTO campaign_streams (campaign_id, stream_type, calculation_id) VALUES ($1, $2, $3)',
        [campaignId, stream.stream_type, calculationId]
      );

      streamResults.push({
        stream_type: stream.stream_type,
        calculation_id: calculationId,
        value: stream.totalInventoryValue
      });
    }

    res.json({
      success: true,
      campaign_id: campaignId,
      channel_name,
      streams: streamResults
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign'
    });
  }
});

/**
 * GET /api/campaigns/list
 * Get all campaigns
 */
router.get('/list', async (req, res) => {
  try {
    const campaigns = await query(
      `SELECT 
        c.id,
        c.channel_name,
        c.created_at,
        COUNT(cs.id) as stream_count,
        SUM(calc.total_inventory_value) as total_value
      FROM campaigns c
      LEFT JOIN campaign_streams cs ON c.id = cs.campaign_id
      LEFT JOIN calculations calc ON cs.calculation_id = calc.id
      GROUP BY c.id, c.channel_name, c.created_at
      ORDER BY c.created_at DESC`
    );

    res.json({
      success: true,
      campaigns: campaigns.rows
    });

  } catch (error) {
    console.error('Campaign list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve campaigns'
    });
  }
});

/**
 * GET /api/campaigns/:id
 * Get campaign details with all streams
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get campaign
    const campaign = await query(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Get all streams with calculations
    const streams = await query(
      `SELECT 
        cs.stream_type,
        c.*,
        i.name as industry_name
      FROM campaign_streams cs
      JOIN calculations c ON cs.calculation_id = c.id
      JOIN industries i ON c.industry_id = i.id
      WHERE cs.campaign_id = $1
      ORDER BY cs.created_at`,
      [id]
    );

    // Calculate total
    const totalValue = streams.rows.reduce(
      (sum, stream) => sum + parseFloat(stream.total_inventory_value),
      0
    );

    res.json({
      success: true,
      campaign: campaign.rows[0],
      streams: streams.rows,
      total_value: totalValue
    });

  } catch (error) {
    console.error('Campaign retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve campaign'
    });
  }
});

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign and all its streams
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if campaign exists
    const campaign = await query(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Delete campaign (cascade will delete campaign_streams)
    await query('DELETE FROM campaigns WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Campaign deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete campaign'
    });
  }
});

module.exports = router;