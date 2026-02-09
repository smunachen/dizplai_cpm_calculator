import React from 'react';
import './LandingPage.css';

function LandingPage({ onNavigate, onShowMethodology }) {
  return (
    <div className="landing-page">
      <div className="landing-container">
        
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            Welcome to the <span className="highlight">Dizplai</span> Stream Value Calculator
          </h1>
          <p className="hero-description">
            Transform your live streaming sponsorships with the industry's first research-backed valuation platform. 
            Our calculator combines 14 content category benchmarks, premium multipliers validated by academic research, 
            and sophisticated audience modeling to give you defensible, transparent pricing that maximizes your revenue 
            potential. Whether you're pricing a single stream or building multi-brand campaigns, Dizplai empowers you 
            with the data-driven insights brands trust.
          </p>
          
          <button className="methodology-btn-landing" onClick={onShowMethodology}>
            <span className="btn-icon">📊</span>
            How It Works
          </button>
        </div>

        {/* Calculator Options */}
        <div className="calculator-options-section">
          <h2 className="section-title">Calculate Your Potential Live Stream Value</h2>
          
          <div className="calculator-grid">
            
            {/* Single Stream */}
            <div className="calculator-card" onClick={() => onNavigate('single-stream')}>
              <div className="card-icon">🎯</div>
              <h3 className="card-title">Single Stream</h3>
              <p className="card-description">
                Price one live stream with precision. Get instant valuation based on your audience, 
                stream length, and content category.
              </p>
              <div className="card-features">
                <span className="feature-tag">✓ Instant Pricing</span>
                <span className="feature-tag">✓ PDF Export</span>
                <span className="feature-tag">✓ Multi-Brand Analysis</span>
              </div>
              <div className="card-cta">
                <span>Start Calculating</span>
                <span className="arrow">→</span>
              </div>
            </div>

            {/* Campaign Builder */}
            <div className="calculator-card featured" onClick={() => onNavigate('campaign-builder')}>
              <div className="featured-badge">Most Popular</div>
              <div className="card-icon">🚀</div>
              <h3 className="card-title">Campaign Builder</h3>
              <p className="card-description">
                Plan multi-stream campaigns with aggregated valuations. Perfect for agencies and 
                creators with sponsorship packages.
              </p>
              <div className="card-features">
                <span className="feature-tag">✓ Multiple Streams</span>
                <span className="feature-tag">✓ Campaign Dashboard</span>
                <span className="feature-tag">✓ Professional PDFs</span>
              </div>
              <div className="card-cta">
                <span>Build Campaign</span>
                <span className="arrow">→</span>
              </div>
            </div>

            {/* Multi-Brand Split */}
            <div className="calculator-card" onClick={() => onNavigate('multi-brand-split')}>
              <div className="card-icon">💰</div>
              <h3 className="card-title">Multi-Brand Split</h3>
              <p className="card-description">
                Maximize revenue by splitting inventory across multiple sponsors. See how 9x revenue 
                is achievable with strategic brand allocation.
              </p>
              <div className="card-features">
                <span className="feature-tag">✓ Revenue Optimizer</span>
                <span className="feature-tag">✓ Brand Allocation</span>
                <span className="feature-tag">✓ 9x Revenue Potential</span>
              </div>
              <div className="card-cta">
                <span>Optimize Revenue</span>
                <span className="arrow">→</span>
              </div>
            </div>

          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-section">
          <div className="trust-item">
            <div className="trust-number">14</div>
            <div className="trust-label">Content Categories</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">30+</div>
            <div className="trust-label">Research Sources</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">2.54x</div>
            <div className="trust-label">Validated Premium</div>
          </div>
          <div className="trust-item">
            <div className="trust-number">9x</div>
            <div className="trust-label">Revenue Potential</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LandingPage;
