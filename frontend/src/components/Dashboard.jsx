import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [streamLength, setStreamLength] = useState('');
  const [avgViewTime, setAvgViewTime] = useState('');
  const [totalViews, setTotalViews] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const exchangeRates = {
    GBP: 1,
    USD: 1.27,
    EUR: 1.17
  };

  useEffect(() => {
    axios.get(`${API_URL}/api/benchmarks/industries`)
      .then(response => {
        // Backend returns {success: true, count: 15, data: [...]}
        const industriesData = response.data.data || response.data || [];
        setIndustries(Array.isArray(industriesData) ? industriesData : []);
      })
      .catch(error => {
        console.error('Error fetching industries:', error);
        setIndustries([]); // Set empty array on error
      });
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    setResult(null);
    
    axios.post(`${API_URL}/api/calculator/calculate`, {
      industry_id: parseInt(selectedIndustry),
      stream_length_minutes: parseInt(streamLength),
      avg_view_time_minutes: parseInt(avgViewTime),
      total_views: parseInt(totalViews),
      user_selected_frequency: Math.ceil(parseInt(streamLength) / parseInt(avgViewTime)),
      currency: currency,
      exchangeRate: currency === 'USD' ? 1 / exchangeRates.USD : 1
    })
      .then(response => {
        setResult(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error calculating:', error);
        setLoading(false);
        alert('Error calculating. Please check your inputs and try again.');
      });
  };

  const formatCurrency = (amount) => {
    const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
    const convertedAmount = currency === 'GBP' ? amount : amount * exchangeRates[currency];
    return `${symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Single Stream Calculator</h1>
        
        <div className="input-section">
          <h2>Stream Parameters</h2>
          
          <div className="input-group">
            <label>What category is your content?</label>
            <select 
              value={selectedIndustry} 
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="input-field"
            >
              <option value="">Select industry...</option>
              {Array.isArray(industries) && industries.map(industry => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>What is the expected duration of your stream? (minutes)</label>
            <input
              type="number"
              value={streamLength}
              onChange={(e) => setStreamLength(e.target.value)}
              placeholder="e.g., 180"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>For similar streams in the past, what is the average user view time? (minutes)</label>
            <input
              type="number"
              value={avgViewTime}
              onChange={(e) => setAvgViewTime(e.target.value)}
              placeholder="e.g., 45"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label>For past streams, what is the average total live views?</label>
            <input
              type="number"
              value={totalViews}
              onChange={(e) => setTotalViews(e.target.value)}
              placeholder="e.g., 50000"
              className="input-field"
            />
          </div>

          {streamLength && avgViewTime && (
            <>
              <div className="input-group">
                <label>Minimum Ad Frequency</label>
                <div className="calculated-value">
                  Each brand must appear {Math.ceil(streamLength / avgViewTime)} {Math.ceil(streamLength / avgViewTime) === 1 ? 'time' : 'times'}
                </div>
                <p className="input-help">
                  Based on your stream length and average view time, ads must appear {Math.ceil(streamLength / avgViewTime)} {Math.ceil(streamLength / avgViewTime) === 1 ? 'time' : 'times'} to ensure every viewer sees at least one placement.
                </p>
              </div>

              <div className="input-group">
                <label>Maximum Ad Placements (30% Rule)</label>
                <div className="calculated-value">
                  There are slots available for up to {Math.floor(Math.floor((streamLength * 0.3) / 0.5) / Math.ceil(streamLength / avgViewTime))} brands
                </div>
                <p className="input-help">
                  With {streamLength} minutes stream length, you can have up to {Math.floor((streamLength * 0.3) / 0.5)} ads 
                  (30% of stream time = {(streamLength * 0.3).toFixed(1)} minutes = {Math.floor((streamLength * 0.3) / 0.5)} × 30-second slots). 
                  Each brand needs {Math.ceil(streamLength / avgViewTime)} placements, so {Math.floor(Math.floor((streamLength * 0.3) / 0.5) / Math.ceil(streamLength / avgViewTime))} brands can fit.
                </p>
              </div>
            </>
          )}

          <div className="input-group">
            <label>Currency</label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="input-field"
            >
              <option value="GBP">£ GBP (British Pounds)</option>
              <option value="USD">$ USD (US Dollars)</option>
              <option value="EUR">€ EUR (Euros)</option>
            </select>
          </div>

          <button 
            onClick={handleCalculate}
            disabled={!selectedIndustry || !streamLength || !avgViewTime || !totalViews || loading}
            className="calculate-btn"
          >
            {loading ? 'Calculating...' : 'Calculate Value'}
          </button>
        </div>

        {result && (
          <div className="results-section">
            <h2>Sponsorship Value</h2>
            
            {result.calculation.isPartialReach && (
              <div className="warning-banner" style={{
                background: '#ff9800',
                color: '#000',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontWeight: 'bold'
              }}>
                ⚠️ Partial Audience Reach
                <p style={{fontWeight: 'normal', marginTop: '8px', fontSize: '14px'}}>
                  Your stream parameters only allow {result.calculation.actualFrequency} placements (30% rule), 
                  but {result.calculation.minAdFrequency} are needed for 100% reach. 
                  Brands will reach approximately <strong>{result.calculation.audienceReachPercentage}%</strong> of your audience. 
                  Cost has been adjusted to reflect this partial reach.
                </p>
              </div>
            )}
            
            <div className="result-card highlight">
              <h3>Total Inventory Value (All Slots)</h3>
              <p className="value">{formatCurrency(result.calculation.totalInventoryValue)}</p>
              <p className="explanation">
                This is the MAXIMUM REVENUE if all {result.calculation.availableBrandSlots} brand slots are sold. 
                Each brand pays {formatCurrency(result.calculation.costPerActivation)} per activation × {result.calculation.availableBrandSlots} available slots = {formatCurrency(result.calculation.totalInventoryValue)}. 
                {result.calculation.isPartialReach ? (
                  <> <strong>Note:</strong> Cost reflects {result.calculation.audienceReachPercentage}% audience reach due to placement constraints.</>
                ) : (
                  <> Each activation includes {result.calculation.minAdFrequency} placements to guarantee full audience reach.</>
                )}
              </p>
            </div>

            <div className="result-card">
              <h3>Cost Per Activation</h3>
              <p className="value">{formatCurrency(result.calculation.costPerActivation)}</p>
              <p className="detail">Includes {result.calculation.actualFrequency} placements</p>
              <p className="explanation">
                Each brand buys ONE activation slot = {result.calculation.actualFrequency} × 30-second placements. 
                {result.calculation.isPartialReach ? (
                  <>
                    <strong>⚠️ Partial reach:</strong> Only {result.calculation.actualFrequency} of {result.calculation.minAdFrequency} needed placements available. 
                    Reaches {result.calculation.audienceReachPercentage}% of audience. 
                    Full reach cost would be {formatCurrency(result.calculation.costPerActivationFull)}.
                  </>
                ) : (
                  <>
                    Cost per single placement: {formatCurrency(result.calculation.costPerPlacement)} × {result.calculation.actualFrequency} placements = {formatCurrency(result.calculation.costPerActivation)}. 
                    This guarantees the brand reaches all {result.calculation.effectiveUniqueViewers.toLocaleString()} unique viewers.
                  </>
                )}
              </p>
            </div>

            <div className="result-card">
              <h3>Available Brand Slots</h3>
              <p className="value">{result.calculation.availableBrandSlots} brands</p>
              <p className="detail">{result.calculation.leftoverPlacements} leftover placements</p>
              <p className="explanation">
                With {result.calculation.maxPlacements} maximum placements (30% of {result.calculation.inputs.streamLengthMinutes} min stream time = {(result.calculation.inputs.streamLengthMinutes * 0.3).toFixed(1)} min of ads) 
                and {result.calculation.actualFrequency} placements per brand, you can fit {result.calculation.availableBrandSlots} brands. 
                Maximum revenue: {result.calculation.availableBrandSlots} × {formatCurrency(result.calculation.costPerActivation)} = {formatCurrency(result.calculation.totalInventoryValue)}.
              </p>
            </div>
            
            <div className="result-card">
              <h3>Premium CPM</h3>
              <p className="value">{formatCurrency(result.calculation.premiumCPM)}</p>
              <p className="detail">{result.calculation.adjustedMultiplier}x base CPM</p>
              <p className="explanation">
                Your base {result.industry.name} CPM ({formatCurrency(result.calculation.inputs.baseCPM)}) 
                is multiplied by {result.calculation.adjustedMultiplier}x using a geometric mean calculation. 
                This provides a more balanced premium than straight compounding: instead of multiplying 
                all factors (1.8 × 2.5 × 1.3 × 1.4 = 8.19x), we use the geometric mean ({result.calculation.geometricMean.toFixed(2)}) 
                and scale it to {result.calculation.adjustedMultiplier}x. This accounts for unskippable format, 
                integrated content, live streaming, and high-attention environment without over-inflating the value.
              </p>
            </div>

            <div className="result-card">
              <h3>Effective Unique Viewers</h3>
              <p className="value">{result.calculation.effectiveUniqueViewers.toLocaleString()}</p>
              <p className="detail">Estimated unique audience</p>
              <p className="explanation">
                With a {result.calculation.inputs.streamLengthMinutes}-minute stream and 
                {result.calculation.inputs.avgViewTimeMinutes}-minute average view time, 
                viewers cycle through {result.calculation.uniqueWatchSessions.toFixed(1)} times. 
                This means {result.calculation.inputs.totalViews.toLocaleString()} total views 
                represents approximately {result.calculation.effectiveUniqueViewers.toLocaleString()} unique people.
              </p>
            </div>

            <div className="result-card">
              <h3>Placement Details</h3>
              <p className="value">{result.calculation.actualFrequency} placements per brand</p>
              <p className="detail">{result.calculation.maxPlacements} total slots available</p>
              <p className="explanation">
                {result.calculation.isPartialReach ? (
                  <>
                    <strong>⚠️ Limited by 30% rule:</strong> Each brand gets {result.calculation.actualFrequency} placements (maximum allowed), 
                    but {result.calculation.minAdFrequency} would be needed for 100% reach. 
                    Consider increasing average view time to allow more placements.
                  </>
                ) : (
                  <>
                    Each brand must appear {result.calculation.minAdFrequency} times (minimum frequency) to reach everyone. 
                    With {result.calculation.maxPlacements} total placement slots available (30% of {result.calculation.inputs.streamLengthMinutes} min stream time = {(result.calculation.inputs.streamLengthMinutes * 0.3).toFixed(1)} min of ads), 
                    you can accommodate {result.calculation.availableBrandSlots} brands at full reach.
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;