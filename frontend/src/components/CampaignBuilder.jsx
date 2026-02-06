import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CampaignBuilder.css';

const API_URL = process.env.REACT_APP_API_URL;

function CampaignBuilder() {
  const [industries, setIndustries] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [streams, setStreams] = useState([]);
  const [currency, setCurrency] = useState('GBP');
  const [loading, setLoading] = useState(false);
  const exchangeRates = { GBP: 1, USD: 1.27 };

  // Fetch industries on mount
  useEffect(() => {
    axios.get(`${API_URL}/api/benchmarks/industries`)
      .then(response => {
        setIndustries(response.data.data);
      })
      .catch(error => console.error('Error fetching industries:', error));
  }, []);

  const addStream = () => {
    setStreams([...streams, {
      id: Date.now(),
      stream_type: '',
      industry_id: industries[0]?.id || '',
      stream_length_minutes: 180,
      avg_view_time_minutes: 45,
      total_views: 50000,
      result: null
    }]);
  };

  const removeStream = (id) => {
    setStreams(streams.filter(s => s.id !== id));
  };

  const updateStream = (id, field, value) => {
    setStreams(streams.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const calculateStream = async (streamId) => {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    // Calculate frequency automatically
    const calculatedFrequency = Math.round(stream.stream_length_minutes / stream.avg_view_time_minutes);

    try {
      const response = await axios.post(`${API_URL}/api/calculator/calculate`, {
        industry_id: parseInt(stream.industry_id),
        stream_length_minutes: parseInt(stream.stream_length_minutes),
        avg_view_time_minutes: parseInt(stream.avg_view_time_minutes),
        total_views: parseInt(stream.total_views),
        user_selected_frequency: calculatedFrequency,
        currency: currency,
        exchangeRate: currency === 'USD' ? 1 / exchangeRates.USD : 1
      });

      updateStream(streamId, 'result', response.data);
      
      // Only add a new stream if all current streams are calculated
      setTimeout(() => {
        const allCalculated = streams.every(s => s.id === streamId || s.result);
        if (allCalculated) {
          addStream();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error calculating stream:', error);
    }
  };

  const createCampaign = async () => {
    if (!channelName) {
      alert('Please enter a channel name');
      return;
    }

    const calculatedStreams = streams.filter(s => s.result);
    if (calculatedStreams.length === 0) {
      alert('Please calculate at least one stream');
      return;
    }

    setLoading(true);

    try {
      const campaignData = {
        channel_name: channelName,
        streams: calculatedStreams.map(s => ({
          sessionId: s.result.sessionId,
          stream_type: s.stream_type,
          industry_id: s.industry_id,
          stream_length_minutes: s.stream_length_minutes,
          avg_view_time_minutes: s.avg_view_time_minutes,
          total_views: s.total_views,
          baseCPM: s.result.calculation.inputs.baseCPM,
          totalMultiplier: s.result.calculation.totalMultiplier,
          premiumCPM: s.result.calculation.premiumCPM,
          uniqueWatchSessions: s.result.calculation.uniqueWatchSessions,
          effectiveUniqueViewers: s.result.calculation.effectiveUniqueViewers,
          minAdFrequency: s.result.calculation.minAdFrequency,
          selectedFrequency: s.result.calculation.selectedFrequency,
          costPerPlacement: s.result.calculation.costPerPlacement,
          maxPlacements: s.result.calculation.maxPlacements,
          totalInventoryValue: s.result.calculation.totalInventoryValue
        }))
      };

      await axios.post(`${API_URL}/api/campaigns/create`, campaignData);
      setLoading(false);
      alert('Campaign saved successfully! View it in Saved Campaigns.');
      
      // Reset form
      setChannelName('');
      setStreams([]);
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      setLoading(false);
      alert('Failed to create campaign');
    }
  };

  const formatCurrency = (value) => {
    const convertedValue = value * (currency === 'USD' ? exchangeRates.USD : 1);
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
  };

  const getTotalValue = () => {
    return streams
      .filter(s => s.result)
      .reduce((sum, s) => sum + s.result.calculation.totalInventoryValue, 0);
  };

  const getCalculatedFrequency = (stream) => {
    if (!stream.stream_length_minutes || !stream.avg_view_time_minutes) return 0;
    return Math.round(stream.stream_length_minutes / stream.avg_view_time_minutes);
  };

  const getMaxPlacements = (stream) => {
    if (!stream.avg_view_time_minutes) return 0;
    return Math.floor((stream.avg_view_time_minutes * 0.3) / 0.5);
  };

  return (
    <div className="campaign-builder">
      <header className="header">
        <h1>Campaign Value Calculator</h1>
        <p>Build multi-stream campaigns and calculate total value</p>
      </header>

      <div className="campaign-container">
        <div className="campaign-setup">
          <h2>Campaign Setup</h2>
          
          <div className="input-group">
            <label>Channel Name</label>
            <input 
              type="text" 
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g., Dizplai Gaming Channel"
            />
          </div>

          <div className="input-group">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="GBP">£ GBP (British Pounds)</option>
              <option value="USD">$ USD (US Dollars)</option>
            </select>
          </div>

          {streams.length === 0 && (
            <button className="add-stream-btn" onClick={addStream}>
              + Add First Stream
            </button>
          )}
        </div>

        <div className="streams-list">
          <h2>Streams ({streams.length})</h2>
          
          {streams.map((stream, index) => (
            <div key={stream.id} className="stream-card">
              <div className="stream-header">
                <h3>Stream {index + 1}</h3>
                <button className="remove-btn" onClick={() => removeStream(stream.id)}>×</button>
              </div>

              <div className="stream-inputs">
                <div className="input-group">
                  <label>Stream Type / Name</label>
                  <input 
                    type="text"
                    value={stream.stream_type}
                    onChange={(e) => updateStream(stream.id, 'stream_type', e.target.value)}
                    placeholder="e.g., Weekly Sports Show"
                  />
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>What category is your content?</label>
                    <select 
                      value={stream.industry_id}
                      onChange={(e) => updateStream(stream.id, 'industry_id', e.target.value)}
                    >
                      {industries.map(ind => (
                        <option key={ind.id} value={ind.id}>{ind.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Expected duration? (min)</label>
                    <input 
                      type="number"
                      value={stream.stream_length_minutes}
                      onChange={(e) => updateStream(stream.id, 'stream_length_minutes', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Average user view time? (min)</label>
                    <input 
                      type="number"
                      value={stream.avg_view_time_minutes}
                      onChange={(e) => updateStream(stream.id, 'avg_view_time_minutes', e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Average total live views?</label>
                    <input 
                      type="number"
                      value={stream.total_views}
                      onChange={(e) => updateStream(stream.id, 'total_views', e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label>Minimum Ad Frequency</label>
                    <div className="calculated-value-small">
                      Each brand must appear {getCalculatedFrequency(stream)} times
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Maximum Placements (30% Rule)</label>
                    <div className="calculated-value-small">
                      Slots for up to {getMaxPlacements(stream)} brands
                    </div>
                  </div>
                </div>

                <button 
                  className="calculate-stream-btn"
                  onClick={() => calculateStream(stream.id)}
                >
                  Calculate Stream Value
                </button>

                {stream.result && (
                  <div className="stream-result">
                    <div className="result-value">
                      {formatCurrency(stream.result.calculation.totalInventoryValue)}
                    </div>
                    <div className="result-details">
                      Premium CPM: {formatCurrency(stream.result.calculation.premiumCPM)} | 
                      Placements: {stream.result.calculation.selectedFrequency}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {streams.length === 0 && (
            <div className="empty-state">
              <p>No streams added yet. Click "Add First Stream" to get started.</p>
            </div>
          )}
        </div>

        {streams.filter(s => s.result).length > 0 && (
          <div className="campaign-summary">
            <h2>Campaign Summary</h2>
            
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Stream Type</th>
                  <th>Content</th>
                  <th>Views</th>
                  <th>Placements</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {streams.filter(s => s.result).map((stream, index) => (
                  <tr key={stream.id}>
                    <td>{stream.stream_type || `Stream ${index + 1}`}</td>
                    <td>{industries.find(i => i.id === stream.industry_id)?.name}</td>
                    <td>{stream.total_views.toLocaleString()}</td>
                    <td>{stream.result.calculation.selectedFrequency}</td>
                    <td className="value-cell">
                      {formatCurrency(stream.result.calculation.totalInventoryValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="4"><strong>Total Campaign Value</strong></td>
                  <td className="value-cell">
                    <strong>{formatCurrency(getTotalValue())}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            <button 
              className="create-campaign-btn"
              onClick={createCampaign}
              disabled={loading}
            >
              {loading ? 'Creating Campaign...' : 'Save Campaign'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CampaignBuilder;