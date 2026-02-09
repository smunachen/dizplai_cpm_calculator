/**
 * Pricing Engine - Core calculation logic for CPM Calculator
 * 
 * Calculates the value of sponsorship placements in live-streamed content
 * by applying premium multipliers to industry base CPMs.
 */

class PricingEngine {
  /**
   * Calculate sponsorship placement value
   * 
   * @param {Object} inputs - Calculation inputs
   * @param {number} inputs.baseCPM - Industry base CPM for video content
   * @param {Array<number>} inputs.multipliers - Array of multiplier values to apply
   * @param {number} inputs.streamLengthMinutes - Total length of stream
   * @param {number} inputs.avgViewTimeMinutes - Average time each viewer watches
   * @param {number} inputs.totalViews - Total number of views expected
   * @param {number} [inputs.userSelectedFrequency] - Optional: User-selected ad frequency
   * 
   * @returns {Object} Calculation results with all metrics
   */
  static calculateAdValue(inputs) {
    const {
      baseCPM,
      multipliers,
      streamLengthMinutes,
      avgViewTimeMinutes,
      totalViews,
      userSelectedFrequency = null,
      currency = 'GBP',
      exchangeRate = 0.79
    } = inputs;

    // Validation
    if (!baseCPM || baseCPM <= 0) {
      throw new Error('Base CPM must be a positive number');
    }
    if (!multipliers || multipliers.length === 0) {
      throw new Error('At least one multiplier is required');
    }
    if (streamLengthMinutes <= 0 || avgViewTimeMinutes <= 0 || totalViews <= 0) {
      throw new Error('Stream length, average view time, and total views must be positive');
    }
    if (avgViewTimeMinutes > streamLengthMinutes) {
      throw new Error('Average view time cannot exceed stream length');
    }

    // Step 1: Calculate total multiplier (compound multiplicatively)
    const totalMultiplier = multipliers.reduce((acc, val) => acc * val, 1);
    
    // Step 2: Calculate premium CPM using adjusted multiplier
    // Instead of compounding (1.8 × 2.5 × 1.3 × 1.4 = 8.19x)
    // We use geometric mean to get a more balanced premium
    const geometricMean = Math.pow(totalMultiplier, 1 / multipliers.length);
    const adjustedMultiplier = 1 + (geometricMean - 1) * 1.5;
    const premiumCPM = baseCPM * adjustedMultiplier;
    
    // Step 3: Calculate CONCURRENT VIEWERS (NEW FORMULA)
    // This represents the average live audience size at any moment
    // Formula: Total Views × (Avg View Time ÷ Stream Length)
    const concurrentViewers = Math.round(totalViews * (avgViewTimeMinutes / streamLengthMinutes));
    
    // Step 4: Determine minimum ad frequency
    // How many placements needed for one brand to reach full audience
    const uniqueWatchSessions = streamLengthMinutes / avgViewTimeMinutes;
    const minAdFrequency = Math.ceil(uniqueWatchSessions);
    
    // Step 5: Calculate maximum possible placements (30% rule based on STREAM)
    const maxAdTimeMinutes = streamLengthMinutes * 0.30;
    const maxPlacements = Math.floor(maxAdTimeMinutes / 0.5); // 30 seconds per ad
    
    // Step 6: Calculate available brand slots
    const availableBrandSlots = Math.floor(maxPlacements / minAdFrequency);
    const leftoverPlacements = maxPlacements % minAdFrequency;
    
    // Step 7: Calculate cost per SINGLE placement (SIMPLIFIED)
    // This is what ONE brand pays for ONE 30-second slot
    // CPM is per 1000 impressions, so divide by 1000 and multiply by concurrent viewers
    const costPerPlacement = (premiumCPM / 1000) * concurrentViewers;
    
    // Step 8: Calculate cost per activation (one brand buying full frequency)
    // This is for reference only - inventory is sold per placement
    const costPerActivation = costPerPlacement * minAdFrequency;
    
    // Step 9: Determine selected frequency (for backwards compatibility)
    const selectedFrequency = userSelectedFrequency || minAdFrequency;
    
    // Handle partial reach scenario
    let actualFrequency = selectedFrequency;
    let audienceReachPercentage = 100;
    let isPartialReach = false;

    if (selectedFrequency > maxPlacements) {
      actualFrequency = maxPlacements;
      audienceReachPercentage = (maxPlacements / selectedFrequency) * 100;
      isPartialReach = true;
    }
    
    // Step 10: Calculate TOTAL INVENTORY VALUE (FIXED)
    // Total value = Cost Per Placement × Total Available Brand Slots
    // This is the MAXIMUM REVENUE if all slots are sold
    const totalInventoryValue = costPerPlacement * availableBrandSlots;

    // Return all calculated metrics
    return {
      // Input values (for reference)
      inputs: {
        baseCPM: parseFloat(baseCPM.toFixed(2)),
        currency,
        exchangeRate,
        streamLengthMinutes,
        avgViewTimeMinutes,
        totalViews,
      },
      
      // Multiplier calculations
      totalMultiplier: parseFloat(totalMultiplier.toFixed(2)),
      adjustedMultiplier: parseFloat(adjustedMultiplier.toFixed(2)),
      geometricMean: parseFloat(geometricMean.toFixed(2)),
      premiumCPM: parseFloat(premiumCPM.toFixed(2)),
      
      // Audience calculations (UPDATED)
      uniqueWatchSessions: parseFloat(uniqueWatchSessions.toFixed(2)),
      concurrentViewers, // NEW: Replaces effectiveUniqueViewers
      effectiveUniqueViewers: concurrentViewers, // Keep for backwards compatibility
      minAdFrequency,
      
      // Placement constraints
      maxPlacements,
      selectedFrequency,
      actualFrequency,
      availableBrandSlots,
      leftoverPlacements,
      
      // Partial reach information
      isPartialReach,
      audienceReachPercentage: parseFloat(audienceReachPercentage.toFixed(1)),
      
      // Pricing outputs (UPDATED)
      costPerPlacement: parseFloat(costPerPlacement.toFixed(2)), // Single slot value
      costPerActivation: parseFloat(costPerActivation.toFixed(2)), // Full frequency cost
      costPerActivationFull: parseFloat(costPerActivation.toFixed(2)), // Same as above
      totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)), // FIXED: costPerPlacement × slots
      
      // Additional useful metrics
      adTimeMinutes: actualFrequency * 0.5,
      adTimePercentage: parseFloat(((actualFrequency * 0.5 / streamLengthMinutes) * 100).toFixed(1)),
      costPerUniqueViewer: parseFloat((costPerPlacement / concurrentViewers).toFixed(2)),
    };
  }

  /**
   * Calculate multiple brand placements in same stream
   * 
   * @param {Object} baseCalculation - Base calculation result from calculateAdValue
   * @param {Array<Object>} brands - Array of brand placement requests
   * @param {string} brands[].name - Brand name
   * @param {number} brands[].placements - Number of placements this brand wants
   * 
   * @returns {Object} Multi-brand calculation with per-brand breakdown
   */
  static calculateMultiBrandPlacements(baseCalculation, brands) {
    const { maxPlacements, costPerPlacement, streamLengthMinutes } = baseCalculation;
    
    // Calculate total placements requested
    const totalPlacementsRequested = brands.reduce((sum, brand) => sum + brand.placements, 0);
    
    // Validate doesn't exceed maximum
    if (totalPlacementsRequested > maxPlacements) {
      throw new Error(
        `Total placements requested (${totalPlacementsRequested}) exceeds maximum (${maxPlacements}). ` +
        `Maximum ad time is 30% of stream time.`
      );
    }
    
    // Calculate per-brand values
    const brandBreakdown = brands.map(brand => ({
      brandName: brand.name,
      placements: brand.placements,
      totalCost: parseFloat((costPerPlacement * brand.placements).toFixed(2)),
      adTimeMinutes: brand.placements * 0.5,
      percentageOfStream: parseFloat(((brand.placements * 0.5 / streamLengthMinutes) * 100).toFixed(1)),
    }));
    
    // Calculate totals
    const totalCost = brandBreakdown.reduce((sum, brand) => sum + brand.totalCost, 0);
    const totalAdTimeMinutes = totalPlacementsRequested * 0.5;
    const totalAdPercentage = parseFloat(((totalAdTimeMinutes / streamLengthMinutes) * 100).toFixed(1));
    
    return {
      brands: brandBreakdown,
      totals: {
        placements: totalPlacementsRequested,
        cost: parseFloat(totalCost.toFixed(2)),
        adTimeMinutes: totalAdTimeMinutes,
        adPercentage: totalAdPercentage,
        remainingSlots: maxPlacements - totalPlacementsRequested,
      },
    };
  }

  /**
   * Helper: Format currency for display
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Helper: Format number with commas
   */
  static formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
  }
}

module.exports = PricingEngine;