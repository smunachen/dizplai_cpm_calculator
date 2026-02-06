import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CampaignBuilder from './components/CampaignBuilder';
import CampaignDashboard from './components/CampaignDashboard';
import MethodologyModal from './components/MethodologyModal';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('single'); // 'single', 'campaign', or 'dashboard'
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-logo">Dizplai CPM Calculator</div>
          <div className="nav-buttons">
            <button 
              className={activeView === 'single' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveView('single')}
            >
              Single Stream
            </button>
            <button 
              className={activeView === 'campaign' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveView('campaign')}
            >
              Campaign Builder
            </button>
            <button 
              className={activeView === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveView('dashboard')}
            >
              Saved Campaigns
            </button>
            <button 
              className="nav-btn methodology-btn"
              onClick={() => setShowMethodology(true)}
            >
              ℹ️ How It Works
            </button>
          </div>
        </div>
      </nav>

      {activeView === 'single' && <Dashboard />}
      {activeView === 'campaign' && <CampaignBuilder />}
      {activeView === 'dashboard' && <CampaignDashboard />}

      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)} 
      />
    </div>
  );
}

export default App;