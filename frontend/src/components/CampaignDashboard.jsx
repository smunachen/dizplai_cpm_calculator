import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CampaignDashboard.css';

const API_URL = process.env.REACT_APP_API_URL;

function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency] = useState('GBP');
  const exchangeRates = { GBP: 1, USD: 1.27 };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/campaigns/list`);
      setCampaigns(response.data.campaigns);
      setLoading(false);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/campaigns/${id}`);
      setSelectedCampaign(response.data);
    } catch (error) {
      console.error('Error loading campaign details:', error);
    }
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c.id !== id));
      if (selectedCampaign?.campaign.id === id) {
        setSelectedCampaign(null);
      }
      alert('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '£0';
    const convertedValue = parseFloat(value) * (currency === 'USD' ? exchangeRates.USD : 1);
    const symbol = currency === 'GBP' ? '£' : '$';
    return `${symbol}${convertedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="campaign-dashboard">
        <div className="loading">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="campaign-dashboard">
      <header className="header">
        <h1>Campaign Dashboard</h1>
        <p>View and manage your saved campaigns</p>
      </header>

      <div className="dashboard-container">
        <div className="campaigns-grid">
          {campaigns.length === 0 ? (
            <div className="empty-state">
              <h3>No campaigns yet</h3>
              <p>Create your first campaign using the Campaign Builder</p>
            </div>
          ) : (
            campaigns.map(campaign => (
              <div 
                key={campaign.id} 
                className={`campaign-card ${selectedCampaign?.campaign.id === campaign.id ? 'selected' : ''}`}
                onClick={() => loadCampaignDetails(campaign.id)}
              >
                <div className="campaign-card-header">
                  <h3>{campaign.channel_name}</h3>
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCampaign(campaign.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
                <div className="campaign-card-stats">
                  <div className="stat">
                    <span className="stat-label">Streams</span>
                    <span className="stat-value">{campaign.stream_count}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total Value</span>
                    <span className="stat-value">{formatCurrency(campaign.total_value)}</span>
                  </div>
                </div>
                <div className="campaign-card-footer">
                  <span className="date">Created: {formatDate(campaign.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedCampaign && (
          <div className="campaign-details">
            <div className="details-header">
              <h2>{selectedCampaign.campaign.channel_name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedCampaign(null)}
              >
                ×
              </button>
            </div>

            <div className="details-summary">
              <div className="summary-stat">
                <span className="label">Total Streams</span>
                <span className="value">{selectedCampaign.streams.length}</span>
              </div>
              <div className="summary-stat highlight">
                <span className="label">Total Campaign Value</span>
                <span className="value">{formatCurrency(selectedCampaign.total_value)}</span>
              </div>
            </div>

            <h3>Streams Breakdown</h3>
            <table className="streams-table">
              <thead>
                <tr>
                  <th>Stream Type</th>
                  <th>Content</th>
                  <th>Length</th>
                  <th>Views</th>
                  <th>Placements</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {selectedCampaign.streams.map((stream, index) => (
                  <tr key={index}>
                    <td>{stream.stream_type}</td>
                    <td>{stream.industry_name}</td>
                    <td>{stream.stream_length_minutes} min</td>
                    <td>{parseInt(stream.total_views).toLocaleString()}</td>
                    <td>{stream.user_selected_frequency}</td>
                    <td className="value-cell">
                      {formatCurrency(stream.total_inventory_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td colSpan="5"><strong>Total</strong></td>
                  <td className="value-cell">
                    <strong>{formatCurrency(selectedCampaign.total_value)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CampaignDashboard;