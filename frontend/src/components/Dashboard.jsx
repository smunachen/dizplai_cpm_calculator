import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL;

function Dashboard() {
  const [industries, setIndustries] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [streamLength, setStreamLength] = useState(180);
  const [avgViewTime, setAvgViewTime] = useState(45);
  const [totalViews, setTotalViews] = useState(50000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('GBP');
  const exchangeRates = { GBP: 1, USD: 1.27 };

  useEffect(() => {
    axios.get(`${API_URL}/api/benchmarks/industries`)
      .then(response => {
        setIndustries(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedIndustry(response.data.data[0].id);
        }
      })
      .catch(error => console.error('Error fetching industries:', error));
  }, []);

  const handleCalculate = () => {
    setLoading(true);
    axios.post(`${API_URL}/api/calculator/calculate`, {
      industry_id: parseInt(selectedIndustry),
      stream_length_minutes: parseInt(streamLength),
      avg_view_time_minutes: parseInt(avgViewTime),
      total_views: parseInt(totalViews),
      user_selected_frequency: Math.round(parseInt(streamLength) / parseInt(avgViewTime)),
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
      });
  };

  const formatCurrency = (value) => {
    const convertedValue = value * (currency === 'USD' ? exchangeRates.USD : 1);
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Dizplai CPM Calculator</h1>
        <p>Live Stream Sponsorship Placement Value Calculator</p>
      </header>

      <div className="calculator-container">
        <div className="input-section">
          <h2>Stream Parameters</h2>
          
          <div className="input-group">
            <label>What category is your content?</label>
            <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
              {industries.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>What is the expected duration of your stream? (minutes)</label>
            <input 
              type="number" 
              value={streamLength} 
              onChange={(e) => setStreamLength(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>For similar streams in the past, what is the average user view time? (minutes)</label>
            <input 
              type="number" 
              value={avgViewTime} 
              onChange={(e) => setAvgViewTime(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>For past streams, what is the average total live views?</label>
            <input 
              type="number" 
              value={totalViews} 
              onChange={(e) => setTotalViews(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Minimum Ad Frequency</label>
            <div className="calculated-value">
              Each brand must appear {Math.round(streamLength / avgViewTime)} times
            </div>
            <p className="input-help">
              Based on your stream length and average view time, ads must appear {Math.round(streamLength / avgViewTime)} times 
              to ensure every viewer sees at least one placement.
            </p>
          </div>

          <div className="input-group">
            <label>Maximum Ad Placements (30% Rule)</label>
            <div className="calculated-value">
              There are slots available for up to {Math.floor((avgViewTime * 0.3) / 0.5)} brands
            </div>
            <p className="input-help">
              With {avgViewTime} minutes average view time, viewers can see up to {Math.floor((avgViewTime * 0.3) / 0.5)} ads 
              (30% of viewing time = {(avgViewTime * 0.3).toFixed(1)} minutes = {Math.floor((avgViewTime * 0.3) / 0.5)} × 30-second slots).
            </p>
          </div>

          <div className="input-group">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="GBP">£ GBP (British Pounds)</option>
              <option value="USD">$ USD (US Dollars)</option>
            </select>
          </div>

          <button className="calculate-btn" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Value'}
          </button>
        </div>

        {result && (
          <div className="results-section">
            <h2>Sponsorship Value</h2>
            
            <div className="result-card highlight">
              <h3>Total Inventory Value</h3>
              <p className="value">{formatCurrency(result.calculation.totalInventoryValue)}</p>
              <p className="explanation">
                This is the total value of all {result.calculation.selectedFrequency} ad placements. 
                Calculated as: Cost Per Placement ({formatCurrency(result.calculation.costPerPlacement)}) 
                × Frequency ({result.calculation.selectedFrequency}) = {formatCurrency(result.calculation.totalInventoryValue)}
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
              <h3>Cost Per Placement</h3>
              <p className="value">{formatCurrency(result.calculation.costPerPlacement)}</p>
              <p className="detail">Per 30-second ad</p>
              <p className="explanation">
                Calculated as: (Premium CPM ÷ 1,000) × Total Views. 
                Each 30-second sponsorship placement reaches all {result.calculation.inputs.totalViews.toLocaleString()} views 
                at the premium rate of {formatCurrency(result.calculation.premiumCPM)} per thousand impressions.
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
              <h3>Minimum Ad Frequency</h3>
              <p className="value">{result.calculation.minAdFrequency}</p>
              <p className="detail">Placements to reach everyone once</p>
              <p className="explanation">
                To guarantee every viewer sees at least one ad, you need {result.calculation.minAdFrequency} placements 
                (one per viewing cycle). Maximum possible: {result.calculation.maxPlacements} placements 
                (30% of stream time = {(result.calculation.inputs.streamLengthMinutes * 0.3).toFixed(0)} minutes of ads).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;