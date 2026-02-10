import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import MethodologyModal from './MethodologyModal';
import { generateSingleStreamPDF } from '../utils/pdfGenerator';

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
  const [showMethodology, setShowMethodology] = useState(false);

  const exchangeRates = {
    GBP: 1,
    USD: 1.27
  };

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

  const handleCalculate = async () => {
    if (!selectedIndustry) {
      alert('Please select an industry');
      return;
    }

    setLoading(true);

    const calculatedFrequency = Math.ceil(streamLength / avgViewTime);

    try {
      const response = await axios.post(`${API_URL}/api/calculator/calculate`, {
        industry_id: parseInt(selectedIndustry),
        stream_length_minutes: parseInt(streamLength),
        avg_view_time_minutes: parseInt(avgViewTime),
        total_views: parseInt(totalViews),
        user_selected_frequency: calculatedFrequency,
        currency: currency,
        exchangeRate: currency === 'USD' ? 1 / exchangeRates.USD : 1
      });

      setResult(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating:', error);
      setLoading(false);
      alert('Error calculating value. Please try again.');
    }
  };

  const formatCurrency = (value) => {
    const convertedValue = value * (currency === 'USD' ? exchangeRates.USD : 1);
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
  };

  const getCalculatedFrequency = () => {
    if (!streamLength || !avgViewTime) return 0;
    return Math.ceil(streamLength / avgViewTime);
  };

  const getMaxPlacements = () => {
    if (!streamLength) return 0;
    return Math.floor((streamLength * 0.3) / 2);
  };

  const handleExportPDF = () => {
    if (!result) return;
    
    generateSingleStreamPDF(
      result,
      {
        streamLength,
        avgViewTime,
        totalViews
      },
      currency
    );
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Stream Value Calculator</h1>
        <p>Calculate the value of your live stream sponsorship inventory</p>
      </header>

      <div className="calculator-container">
        <div className="input-section">
          <h2>Stream Details</h2>
          
          <div className="input-group">
            <label>What category is your content?</label>
            <select 
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            >
              <option value="">Select industry...</option>
              {industries.map(industry => (
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
              min="1"
            />
          </div>

          <div className="input-group">
            <label>For similar streams in the past, what is the average user view time? (minutes)</label>
            <input 
              type="number" 
              value={avgViewTime}
              onChange={(e) => setAvgViewTime(e.target.value)}
              min="1"
              max={streamLength}
            />
            <p className="input-help">
              This is how long viewers typically watch before leaving
            </p>
          </div>

          <div className="input-group">
            <label>For past streams, what is the average total live views?</label>
            <input 
              type="number" 
              value={totalViews}
              onChange={(e) => setTotalViews(e.target.value)}
              min="1"
            />
            <p className="input-help">
              Total number of viewers who watched any part of your stream
            </p>
          </div>

          <div className="input-group">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="GBP">£ GBP (British Pounds)</option>
              <option value="USD">$ USD (US Dollars)</option>
            </select>
          </div>

          <div className="calculated-values">
            <div className="calculated-item">
              <span className="calc-label">Minimum Ad Frequency:</span>
              <span className="calc-value">{getCalculatedFrequency()} placements</span>
              <p className="calc-help">Each brand must appear this many times to reach full audience</p>
            </div>
            <div className="calculated-item">
              <span className="calc-label">Maximum Placements (30% Rule):</span>
              <span className="calc-value">{getMaxPlacements()} slots</span>
              <p className="calc-help">Total available 2-minute placement slots</p>
            </div>
          </div>

          <button 
            className="calculate-btn"
            onClick={handleCalculate}
            disabled={loading || !selectedIndustry}
          >
            {loading ? 'Calculating...' : 'Calculate Value'}
          </button>

          <button 
            className="methodology-btn"
            onClick={() => setShowMethodology(true)}
          >
            ℹ️ How It Works
          </button>
        </div>

        {result && (
          <div className="results-section">
            <div className="results-header">
              <h2>Your Stream Value</h2>
              <button className="export-btn" onClick={handleExportPDF}>
                📄 Export PDF
              </button>
            </div>

            <div className="result-card highlight">
              <h3>Total Inventory Value (All Slots)</h3>
              <p className="value">{formatCurrency(result.calculation.totalInventoryValue)}</p>
              <p className="detail">Maximum revenue if all brand slots sell</p>
              <p className="explanation">
                This is the MAXIMUM REVENUE if all {result.calculation.availableBrandSlots} brand slots are sold.
                <br/><br/>
                Each ad placement is valued at {formatCurrency(result.calculation.costPerPlacement)} based on the Premium CPM ({formatCurrency(result.calculation.premiumCPM)}) and the average concurrent audience of {result.calculation.concurrentViewers.toLocaleString()} viewers predicted at each point of the live stream.
                <br/><br/>
                Each sponsorship slot consists of {result.calculation.minAdFrequency} × 2-minute brand placements distributed throughout the stream to reach the full audience over its duration.
                <br/><br/>
                So, each FULL AUDIENCE brand activation is valued at {formatCurrency(result.calculation.costPerActivation)}.
                <br/><br/>
                Based on the stream length and the 30% inventory rule (no more than 30% of stream time can be used for sponsorships), there are slots for {result.calculation.availableBrandSlots} separate brands.
                <br/><br/>
                Total Inventory Value (if all {result.calculation.availableBrandSlots} slots sell) = {formatCurrency(result.calculation.totalInventoryValue)}.
              </p>
            </div>

            <div className="result-grid">
              <div className="result-card">
                <h3>Concurrent Viewers</h3>
                <p className="value">{result.calculation.concurrentViewers.toLocaleString()}</p>
                <p className="detail">Average live audience at any moment</p>
                <p className="explanation">
                  Based on {totalViews.toLocaleString()} total views with {avgViewTime} min average watch time 
                  over a {streamLength} min stream, your concurrent audience is {result.calculation.concurrentViewers.toLocaleString()} viewers.
                </p>
              </div>

              <div className="result-card">
                <h3>Premium CPM</h3>
                <p className="value">{formatCurrency(result.calculation.premiumCPM)}</p>
                <p className="detail">Industry base × {result.calculation.adjustedMultiplier}x premium</p>
                <p className="explanation">
                  {result.industry.name} base CPM ({formatCurrency(result.calculation.inputs.baseCPM)}) 
                  multiplied by {result.calculation.adjustedMultiplier}x premium for live, integrated, 
                  high-attention content.
                </p>
              </div>

              <div className="result-card">
                <h3>Cost Per Placement</h3>
                <p className="value">{formatCurrency(result.calculation.costPerPlacement)}</p>
                <p className="detail">Single 2-minute sponsored segment</p>
                <p className="explanation">
                  Each 2-minute placement reaches {result.calculation.concurrentViewers.toLocaleString()} concurrent viewers. 
                  Premium CPM ({formatCurrency(result.calculation.premiumCPM)}) is applied to concurrent audience: 
                  ({formatCurrency(result.calculation.premiumCPM)} ÷ 1,000) × {result.calculation.concurrentViewers.toLocaleString()} = {formatCurrency(result.calculation.costPerPlacement)} per placement.
                </p>
              </div>

              <div className="result-card">
                <h3>Cost Per Activation</h3>
                <p className="value">{formatCurrency(result.calculation.costPerActivation)}</p>
                <p className="detail">Full frequency package ({result.calculation.minAdFrequency} placements)</p>
                <p className="explanation">
                  For brands wanting guaranteed full reach, they can buy an activation package 
                  of {result.calculation.minAdFrequency} placements. 
                  Cost: {formatCurrency(result.calculation.costPerPlacement)} × {result.calculation.minAdFrequency} = {formatCurrency(result.calculation.costPerActivation)}.
                </p>
              </div>

              <div className="result-card">
                <h3>Available Brand Slots</h3>
                <p className="value">{result.calculation.availableBrandSlots} brands</p>
                <p className="detail">Maximum concurrent sponsors</p>
                <p className="explanation">
                  With {result.calculation.maxPlacements} max placements and {result.calculation.minAdFrequency} placements 
                  per brand, you can accommodate {result.calculation.availableBrandSlots} sponsors simultaneously.
                </p>
              </div>

              <div className="result-card">
                <h3>Ad Time</h3>
                <p className="value">{result.calculation.adTimeMinutes} minutes</p>
                <p className="detail">{result.calculation.adTimePercentage}% of stream</p>
                <p className="explanation">
                  Total sponsored content time stays within the industry-standard 30% threshold 
                  for optimal viewer experience.
                </p>
              </div>
            </div>

            <div className="methodology-note">
              <p>
                💡 <strong>Note:</strong> This valuation uses research-backed CPM benchmarks 
                with premium multipliers for unskippable, integrated, live content. 
                <button 
                  className="inline-link"
                  onClick={() => setShowMethodology(true)}
                >
                  Learn more about our methodology
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      <MethodologyModal 
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  );
}

export default Dashboard;
