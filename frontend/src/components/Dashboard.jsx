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
  const [frequency, setFrequency] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch industries on mount
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
      user_selected_frequency: parseInt(frequency)
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
            <label>Content Type</label>
            <select value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
              {industries.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Stream Length (minutes)</label>
            <input 
              type="number" 
              value={streamLength} 
              onChange={(e) => setStreamLength(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Average View Time (minutes)</label>
            <input 
              type="number" 
              value={avgViewTime} 
              onChange={(e) => setAvgViewTime(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Total Views</label>
            <input 
              type="number" 
              value={totalViews} 
              onChange={(e) => setTotalViews(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Ad Frequency (placements)</label>
            <input 
              type="number" 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value)}
            />
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
              <p className="value">${result.calculation.totalInventoryValue.toLocaleString()}</p>
            </div>

            <div className="result-card">
              <h3>Premium CPM</h3>
              <p className="value">${result.calculation.premiumCPM}</p>
              <p className="detail">{result.calculation.totalMultiplier}x base CPM</p>
            </div>

            <div className="result-card">
              <h3>Cost Per Placement</h3>
              <p className="value">${result.calculation.costPerPlacement.toLocaleString()}</p>
              <p className="detail">Per 30-second ad</p>
            </div>

            <div className="result-card">
              <h3>Effective Unique Viewers</h3>
              <p className="value">{result.calculation.effectiveUniqueViewers.toLocaleString()}</p>
              <p className="detail">Estimated unique audience</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;