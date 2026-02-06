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
    // Formula: (product of all multipliers) ^ (1/number of multipliers)
    const geometricMean = Math.pow(totalMultiplier, 1 / multipliers.length);
    const adjustedMultiplier = 1 + (geometricMean - 1) * 1.5; // Scale the premium
    const premiumCPM = baseCPM * adjustedMultiplier;
    
    // Step 3: Calculate unique watch sessions
    // How many times does the average viewer "cycle" through the stream?
    const uniqueWatchSessions = streamLengthMinutes / avgViewTimeMinutes;
    
    // Step 4: Calculate effective unique viewers
    // Estimate true unique audience accounting for multiple sessions
    const effectiveUniqueViewers = Math.round(totalViews / uniqueWatchSessions);
    
    // Step 5: Determine minimum ad frequency
    // Minimum placements needed to reach each viewer at least once
    const minAdFrequency = Math.ceil(uniqueWatchSessions);
    
    // Step 6: Calculate cost per 30-second placement
    // CPM = cost per 1000 impressions, so divide by 1000 and multiply by total views
    const costPerPlacement = (premiumCPM / 1000) * totalViews;
    
    // Step 7: Calculate maximum possible placements (30% rule)
    // Ads cannot exceed 30% of total stream time
    const maxAdTimeMinutes = streamLengthMinutes * 0.30;
    const maxPlacements = Math.floor(maxAdTimeMinutes / 0.5); // 30 seconds = 0.5 minutes per ad
    
    // Step 8: Determine selected frequency
    const selectedFrequency = userSelectedFrequency || minAdFrequency;
    
    // Validate selected frequency doesn't exceed maximum
    if (selectedFrequency > maxPlacements) {
      throw new Error(
        `Selected frequency (${selectedFrequency}) exceeds maximum placements (${maxPlacements}). ` +
        `Reduce frequency or increase stream length.`
      );
    }
    
    // Step 9: Calculate total inventory value
    const totalInventoryValue = costPerPlacement * selectedFrequency;
    
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
      
      // Frequency calculations
      uniqueWatchSessions: parseFloat(uniqueWatchSessions.toFixed(2)),
      effectiveUniqueViewers,
      minAdFrequency,
      
      // Placement constraints
      maxPlacements,
      selectedFrequency,
      
      // Pricing outputs
      costPerPlacement: parseFloat(costPerPlacement.toFixed(2)),
      totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
      
      // Additional useful metrics
      adTimeMinutes: selectedFrequency * 0.5,
      adTimePercentage: parseFloat(((selectedFrequency * 0.5 / streamLengthMinutes) * 100).toFixed(1)),
      costPerUniqueViewer: parseFloat((totalInventoryValue / effectiveUniqueViewers).toFixed(2)),
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
        `Maximum ad time is 30% of stream length.`
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
