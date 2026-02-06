import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CampaignBuilder from './components/CampaignBuilder';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('single'); // 'single' or 'campaign'

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
          </div>
        </div>
      </nav>

      {activeView === 'single' ? <Dashboard /> : <CampaignBuilder />}
    </div>
  );
}

export default App;