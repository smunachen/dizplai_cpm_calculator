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
        <h1>Dizplai Inventory Value Calculator</h1>
        <p>Live Stream Sponsorship Value</p>
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
  	     Each brand must appear {Math.ceil(streamLength / avgViewTime)} {Math.ceil(streamLength / avgViewTime) === 1 ? 'time' : 'times'}
  	  </div>
  	  <p className="input-help">
 	     Based on your stream length and average view time, ads must appear {Math.ceil(streamLength / avgViewTime)} {Math.ceil(streamLength / avgViewTime) === 1 ? 'time' : 'times'} to ensure every viewer sees at least one placement.
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
              <h3>Total Inventory Value (All Inventory Sold)</h3>
              <p className="value">{formatCurrency(result.calculation.totalInventoryValue)}</p>
              <p className="explanation">
  This is the MAXIMUM REVENUE if all {result.calculation.availableBrandSlots} brand slots are sold. 
  Each brand pays {formatCurrency(result.calculation.costPerActivation)} per activation × {result.calculation.availableBrandSlots} available slots = {formatCurrency(result.calculation.totalInventoryValue)}. 
  Each activation includes {result.calculation.minAdFrequency} placements to guarantee full audience reach.
</p>
            </div>

            <div className="result-card">
              <h3>Cost Per Activation</h3>
              <p className="value">{formatCurrency(result.calculation.costPerActivation)}</p>
              <p className="detail">Includes {result.calculation.minAdFrequency} placements</p>
              <p className="explanation">
                Each brand buys ONE activation slot = {result.calculation.minAdFrequency} × 30-second placements. 
                Cost per single placement: {formatCurrency(result.calculation.costPerPlacement)} × {result.calculation.minAdFrequency} placements = {formatCurrency(result.calculation.costPerActivation)}. 
                This guarantees the brand reaches all {result.calculation.effectiveUniqueViewers.toLocaleString()} unique viewers.
              </p>
            </div>

            <div className="result-card">
              <h3>Available Brand Slots</h3>
              <p className="value">{result.calculation.availableBrandSlots} brands</p>
              <p className="detail">{result.calculation.leftoverPlacements} leftover placements</p>
              <p className="explanation">
                With {result.calculation.maxPlacements} maximum placements (30% of {result.calculation.inputs.avgViewTimeMinutes} min average view time) 
                and {result.calculation.minAdFrequency} placements required per brand, you can fit {result.calculation.availableBrandSlots} brands. 
                Maximum revenue: {result.calculation.availableBrandSlots} × {formatCurrency(result.calculation.costPerActivation)} = {formatCurrency(result.calculation.availableBrandSlots * result.calculation.costPerActivation)}.
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
              <p className="value">{result.calculation.minAdFrequency} placements per brand</p>
              <p className="detail">{result.calculation.maxPlacements} total slots available</p>
              <p className="explanation">
                Each brand must appear {result.calculation.minAdFrequency} times (minimum frequency) to reach everyone. 
                With {result.calculation.maxPlacements} total placement slots available (30% of {result.calculation.inputs.avgViewTimeMinutes} min average view time = {(result.calculation.inputs.avgViewTimeMinutes * 0.3).toFixed(1)} min of ads), 
                you can accommodate {result.calculation.availableBrandSlots} brands at full reach.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;