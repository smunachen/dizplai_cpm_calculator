import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MultiBrandInfoModal from './MultiBrandInfoModal';
import './MultiBrandSplit.css';

const API_URL = process.env.REACT_APP_API_URL;

function MultiBrandSplit() {
  const [industries, setIndustries] = useState([]);
  const [mode, setMode] = useState('single');
  const [showInfo, setShowInfo] = useState(false);
  
  // Single stream state
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [streamLength, setStreamLength] = useState(180);
  const [avgViewTime, setAvgViewTime] = useState(45);
  const [totalViews, setTotalViews] = useState(50000);
  const [currency, setCurrency] = useState('GBP');
  const [calculated, setCalculated] = useState(false);
  const [slotValue, setSlotValue] = useState(0);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [minFrequency, setMinFrequency] = useState(0);
  const [maxPlacements, setMaxPlacements] = useState(0);
  const [brands, setBrands] = useState([]);
  
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

  const calculateSlots = async () => {
    try {
      const calculatedFrequency = Math.ceil(parseInt(streamLength) / parseInt(avgViewTime));
      const calculatedMaxPlacements = Math.floor((parseInt(streamLength) * 0.3) / 0.5);
      const slots = Math.floor(calculatedMaxPlacements / calculatedFrequency);

      const response = await axios.post(`${API_URL}/api/calculator/calculate`, {
        industry_id: parseInt(selectedIndustry),
        stream_length_minutes: parseInt(streamLength),
        avg_view_time_minutes: parseInt(avgViewTime),
        total_views: parseInt(totalViews),
        user_selected_frequency: calculatedFrequency,
        currency: currency,
        exchangeRate: currency === 'USD' ? 1 / exchangeRates.USD : 1
      });

      // FIXED: Use costPerPlacement instead of costPerActivation
      setSlotValue(response.data.calculation.costPerPlacement);
      setAvailableSlots(slots);
      setMinFrequency(calculatedFrequency);
      setMaxPlacements(calculatedMaxPlacements);
      setCalculated(true);
      setBrands([]);
    } catch (error) {
      console.error('Error calculating:', error);
    }
  };

  const addBrand = () => {
    if (brands.length >= availableSlots) {
      alert(`Maximum ${availableSlots} brands allowed based on available inventory`);
      return;
    }
    setBrands([...brands, { id: Date.now(), name: '' }]);
  };

  const removeBrand = (id) => {
    setBrands(brands.filter(b => b.id !== id));
  };

  const updateBrandName = (id, name) => {
    setBrands(brands.map(b => b.id === id ? { ...b, name } : b));
  };

  const getTotalRevenue = () => {
    return brands.length * slotValue;
  };

  const formatCurrency = (value) => {
    const convertedValue = value * (currency === 'USD' ? exchangeRates.USD : 1);
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
  };

  return (
    <div className="multi-brand-split">
      <header className="header">
        <h1>Multi-Brand Split Calculator</h1>
        <p>Maximize revenue by splitting sponsorship inventory between multiple brands</p>
        <button className="info-btn" onClick={() => setShowInfo(true)}>
          ℹ️ How This Works
        </button>
      </header>

      <div className="mode-selector">
        <button 
          className={mode === 'single' ? 'mode-btn active' : 'mode-btn'}
          onClick={() => setMode('single')}
        >
          Single Stream
        </button>
        <button 
          className={mode === 'campaign' ? 'mode-btn active' : 'mode-btn'}
          onClick={() => setMode('campaign')}
        >
          Campaign (Coming Soon)
        </button>
      </div>

      {mode === 'single' && (
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
              <label>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="GBP">£ GBP (British Pounds)</option>
                <option value="USD">$ USD (US Dollars)</option>
              </select>
            </div>

            <button className="calculate-btn" onClick={calculateSlots}>
              Calculate Available Slots
            </button>
          </div>

          {calculated && (
            <div className="slots-section">
              <h2>Multi-Brand Breakdown</h2>
              
              <div className="slots-info">
                <div className="slot-card">
                  <h3>Slot Value</h3>
                  <p className="big-value">{formatCurrency(slotValue)}</p>
                  <p className="detail">Per brand slot</p>
                  <p className="explainer">
                    Each brand pays {formatCurrency(slotValue)} per placement slot. 
                    For full audience reach, brands need {minFrequency} placements.
                  </p>
                </div>

                <div className="slot-card">
                  <h3>Available Slots</h3>
                  <p className="big-value">{availableSlots} brands</p>
                  <p className="detail">Maximum capacity</p>
                  <p className="explainer">
                    Based on {maxPlacements} max placements ÷ {minFrequency} per brand = {availableSlots} slots
                  </p>
                </div>

                <div className="slot-card highlight">
                  <h3>Maximum Revenue</h3>
                  <p className="big-value">{formatCurrency(availableSlots * slotValue)}</p>
                  <p className="detail">All {availableSlots} slots sold</p>
                  <p className="explainer">
                    {availableSlots} brands × {formatCurrency(slotValue)} = {formatCurrency(availableSlots * slotValue)} total inventory value!
                  </p>
                </div>
              </div>

              <div className="brands-section">
                <div className="brands-header">
                  <h3>Add Brands ({brands.length}/{availableSlots})</h3>
                  <button 
                    className="add-brand-btn" 
                    onClick={addBrand}
                    disabled={brands.length >= availableSlots}
                  >
                    + Add Brand
                  </button>
                </div>

                {brands.length === 0 ? (
                  <div className="empty-brands">
                    <p>Click "Add Brand" to start allocating slots</p>
                  </div>
                ) : (
                  <div className="brands-list">
                    {brands.map((brand, index) => (
                      <div key={brand.id} className="brand-item">
                        <span className="brand-number">Brand {index + 1}</span>
                        <input 
                          type="text"
                          placeholder="e.g., Nike"
                          value={brand.name}
                          onChange={(e) => updateBrandName(brand.id, e.target.value)}
                        />
                        <span className="brand-value">{formatCurrency(slotValue)}</span>
                        <button className="remove-brand-btn" onClick={() => removeBrand(brand.id)}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {brands.length > 0 && (
                  <div className="total-revenue">
                    <h3>Total Campaign Revenue</h3>
                    <p className="revenue-value">{formatCurrency(getTotalRevenue())}</p>
                    <p className="revenue-detail">
                      {brands.length} brand{brands.length > 1 ? 's' : ''} × {formatCurrency(slotValue)} = {formatCurrency(getTotalRevenue())}
                    </p>
                    <p className="revenue-increase">
                      📈 {brands.length}x more revenue than selling to single sponsor!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'campaign' && (
            <div className="coming-soon">
              <h2>Campaign Mode Coming Soon</h2>
              <p>Split multiple streams across brands in a single campaign</p>
            </div>
          )}
        </div>
      )}

      <MultiBrandInfoModal 
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
}

export default MultiBrandSplit;