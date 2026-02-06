import React from 'react';
import './MethodologyModal.css';

function MethodologyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>How Our Calculator Works</h2>
        <p className="modal-subtitle">Research-backed methodology for live stream sponsorship valuation</p>

        <div className="methodology-section">
          <h3>📊 Industry CPM Benchmarks</h3>
          <p>We use average CPM rates for standard video advertising from authoritative industry sources:</p>
          
        <div className="benchmark-item">
  <strong>Gambling:</strong> <span className="cpm-value">£50 CPM</span>
  <span className="source">WordStream 2024</span>
</div>
<div className="benchmark-item">
  <strong>Banking:</strong> <span className="cpm-value">£35 CPM</span>
  <span className="source">eMarketer 2024</span>
</div>
<div className="benchmark-item">
  <strong>Sports:</strong> <span className="cpm-value">£25 CPM</span>
  <span className="source">eMarketer, IAB 2024</span>
</div>
<div className="benchmark-item">
  <strong>Fashion:</strong> <span className="cpm-value">£20 CPM</span>
  <span className="source">Statista 2024</span>
</div>
<div className="benchmark-item">
  <strong>Food Delivery:</strong> <span className="cpm-value">£20 CPM</span>
  <span className="source">WordStream 2024</span>
</div>
<div className="benchmark-item">
  <strong>Beauty:</strong> <span className="cpm-value">£18 CPM</span>
  <span className="source">Statista 2024</span>
</div>
          </div>

          <p className="note">These represent typical rates for standard YouTube pre-roll ads (skippable, separate from content).</p>
        </div>

        <div className="methodology-section">
          <h3>⚡ Premium Multipliers</h3>
          <p>Live stream sponsorships command higher rates due to four key factors:</p>

          <div className="multiplier-list">
            <div className="multiplier-item">
              <div className="multiplier-header">
                <strong>1. Unskippable Format</strong>
                <span className="multiplier-badge">1.8x</span>
              </div>
              <p>Integrated into content via on-screen graphics - viewers cannot skip. Studies show non-skippable ads command 50-100% premium over skippable formats.</p>
              <span className="source">Source: YouTube Ads Studies, Display & Video 360</span>
            </div>

            <div className="multiplier-item">
              <div className="multiplier-header">
                <strong>2. Integrated Content</strong>
                <span className="multiplier-badge">2.5x</span>
              </div>
              <p>Sponsorships embedded within content (not separate ad breaks) create authentic brand association. YouTube creator sponsorships average £25-100 CPM vs standard ads at £5-10 CPM.</p>
              <span className="source">Source: ADOPTER Media 2025, Tatari TV Studies</span>
            </div>

            <div className="multiplier-item">
              <div className="multiplier-header">
                <strong>3. Live Streaming</strong>
                <span className="multiplier-badge">1.3x</span>
              </div>
              <p>Real-time broadcasts command 20-50% premium over pre-recorded content due to FOMO, engagement, and inability to skip ahead.</p>
              <span className="source">Source: Nielsen 2024, Twitch CPM Reports</span>
            </div>

            <div className="multiplier-item">
              <div className="multiplier-header">
                <strong>4. High-Attention Environment</strong>
                <span className="multiplier-badge">1.4x</span>
              </div>
              <p>Focused viewing on premium content shows 30-50% higher completion rates. Connected TV (lean-back viewing) commands £30-45 CPM vs display ads at £6-12 CPM.</p>
              <span className="source">Source: SilverBack CTV Study, Wurl Streaming Metrics</span>
            </div>
          </div>
        </div>

        <div className="methodology-section">
          <h3>🧮 The Math</h3>
          <p>We use <strong>geometric mean</strong> methodology to balance these multipliers:</p>
          
          <div className="math-explanation">
            <div className="math-step">
              <strong>Step 1:</strong> Calculate compound effect
              <code>1.8 × 2.5 × 1.3 × 1.4 = 8.19x</code>
            </div>
            
            <div className="math-step">
              <strong>Step 2:</strong> Apply geometric mean
              <code>Geometric Mean = (8.19)^(1/4) = 1.69</code>
            </div>
            
            <div className="math-step">
              <strong>Step 3:</strong> Scale to realistic premium
              <code>Adjusted Multiplier = 1 + (1.69 - 1) × 1.5 = 2.54x</code>
            </div>
          </div>

          <p className="note"><strong>Why geometric mean?</strong> Straight multiplication assumes factors are completely independent. In reality, they overlap (live content is inherently high-attention). Geometric mean provides a more conservative, defensible premium that accounts for factor interdependence.</p>
        </div>

        <div className="methodology-section">
          <h3>💡 Example Calculation</h3>
          <div className="example-box">
            <p><strong>Scenario:</strong> Sports live stream, 180 min, 50,000 views</p>
            <ul>
              <li>Base CPM: £25 (Sports industry standard)</li>
              <li>Premium Multiplier: 2.54x</li>
              <li><strong>Premium CPM: £63.50</strong></li>
              <li>Cost per 30-second placement: (£63.50 ÷ 1,000) × 50,000 = <strong>£3,175</strong></li>
              <li>4 placements across stream = <strong>£12,700 total value</strong></li>
            </ul>
          </div>
        </div>

        <div className="methodology-section">
          <h3>📚 Data Sources</h3>
          <p>All benchmarks and multipliers sourced from:</p>
          <ul className="sources-list">
            <li><strong>eMarketer</strong> - Industry-standard advertising data</li>
            <li><strong>Statista</strong> - Global advertising statistics</li>
            <li><strong>IAB</strong> (Interactive Advertising Bureau) - Trade association reports</li>
            <li><strong>WordStream</strong> - Google Ads platform data</li>
            <li><strong>ADOPTER Media</strong> - YouTube sponsorship guides</li>
            <li><strong>Nielsen</strong> - Viewing metrics and TV advertising</li>
            <li><strong>YouTube Studies</strong> - Platform-specific CPM data</li>
          </ul>
          <p className="note">Data updated quarterly (last update: January 2025)</p>
        </div>

        <div className="methodology-footer">
          <p>This methodology provides conservative, defensible valuations backed by industry research. All calculations are transparent and auditable.</p>
        </div>
      </div>
    </div>
  );
}

export default MethodologyModal;