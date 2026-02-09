import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CampaignBuilder from './components/CampaignBuilder';
import CampaignDashboard from './components/CampaignDashboard';
import MultiBrandSplit from './components/MultiBrandSplit';
import MethodologyModal from './components/MethodologyModal';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('landing'); // Start with landing page
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="App">
      {activeView !== 'landing' && (
        <nav className="main-nav">
          <div className="nav-container">
            <div className="nav-logo" onClick={() => setActiveView('landing')} style={{cursor: 'pointer'}}>
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
                className={activeView === 'single-stream' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setActiveView('single-stream')}
              >
                Single Stream
              </button>
              <button 
                className={activeView === 'campaign-builder' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setActiveView('campaign-builder')}
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
                className={activeView === 'multi-brand-split' ? 'nav-btn active' : 'nav-btn'}
                onClick={() => setActiveView('multi-brand-split')}
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
      )}

      {activeView === 'landing' && (
        <LandingPage 
          onNavigate={setActiveView} 
          onShowMethodology={() => setShowMethodology(true)}
        />
      )}
      {activeView === 'single-stream' && <Dashboard />}
      {activeView === 'campaign-builder' && <CampaignBuilder />}
      {activeView === 'dashboard' && <CampaignDashboard />}
      {activeView === 'multi-brand-split' && <MultiBrandSplit />}

      <MethodologyModal 
        isOpen={showMethodology} 
        onClose={() => setShowMethodology(false)} 
      />
    </div>
  );
}

export default App;