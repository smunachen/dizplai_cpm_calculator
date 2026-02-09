import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CampaignBuilder from './components/CampaignBuilder';
import CampaignDashboard from './components/CampaignDashboard';
import MultiBrandSplit from './components/MultiBrandSplit';
import MethodologyModal from './components/MethodologyModal';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('single'); // 'single', 'campaign', 'dashboard', or 'multibrand'
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="nav-container">
         <div className="nav-logo">
          <img 
           src="https://dizplai.com/wp-content/uploads/2025/09/logo-768x252.png" 
           alt="Dizplai Logo" 
           className="logo-img"
           style={{height: '30px', width: 'auto', verticalAlign: 'middle'}}
           />
          <span style={{marginLeft: '10px'}}>Stream Value Calculator</span>
          </div>
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
              className={activeView === 'multibrand' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setActiveView('multibrand')}
            >
              Multi-Brand Split
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
      {activeView === 'multibrand' && <MultiBrandSplit />}

      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)} 
      />
    </div>
  );
}

export default App;