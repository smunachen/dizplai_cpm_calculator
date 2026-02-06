import React from 'react';
import './MethodologyModal.css'; // Reuse the same styling

function MultiBrandInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>How Multi-Brand Split Works</h2>
        <p className="modal-subtitle">Maximize revenue by selling sponsorship inventory to multiple brands</p>

        <div className="methodology-section">
          <h3>💡 The Core Concept</h3>
          <p>Instead of selling all your sponsorship inventory to one brand, you can split it between multiple brands - dramatically increasing your total revenue.</p>
          
          <div className="example-box">
            <p><strong>Single Brand:</strong> 1 sponsor pays £12,700</p>
            <p><strong>Multi-Brand:</strong> 6 sponsors each pay £12,700 = <strong>£76,200 total</strong></p>
            <p className="highlight">📈 That's <strong>6x more revenue</strong> from the same stream!</p>
          </div>
        </div>

        <div className="methodology-section">
          <h3>🎯 What is a "Slot"?</h3>
          <p>A <strong>slot</strong> is the package each brand purchases. When a brand buys one slot, they get:</p>
          
          <ul className="sources-list">
            <li><strong>Guaranteed reach</strong> - Their ad reaches 100% of your audience</li>
            <li><strong>Multiple placements</strong> - Their brand appears the minimum number of times needed (based on viewer cycles)</li>
            <li><strong>Fair pricing</strong> - Same CPM rate as if they were the only sponsor</li>
          </ul>

          <div className="math-explanation">
            <div className="math-step">
              <strong>Example:</strong>
              <code>Stream: 180 minutes | Avg View Time: 45 minutes</code>
              <code>Minimum Frequency: 180 ÷ 45 = 4 placements</code>
              <code>1 Slot = 4 placements automatically included</code>
            </div>
          </div>

          <p className="note">Each brand pays for ONE slot, but their ad appears 4 times throughout the stream to guarantee every viewer sees it at least once.</p>
        </div>

        <div className="methodology-section">
          <h3>🔢 How Many Brands Can You Fit?</h3>
          <p>The number of available slots is determined by two factors:</p>
          
          <div className="multiplier-list">
            <div className="multiplier-item">
              <div className="multiplier-header">
                <strong>1. Minimum Frequency</strong>
                <span className="multiplier-badge">4× in this example</span>
              </div>
              <p>Based on <code>Stream Length ÷ Average View Time</code>. This ensures each brand reaches the full audience. If viewers cycle through 4 times, each brand needs 4 placements.</p>
            </div>

            <div className="multiplier-item">
              <div className="multiplier-header">
                <strong>2. Maximum Placements (30% Rule)</strong>
                <span className="multiplier-badge">27 in this example</span>
              </div>
              <p>Based on <code>(Avg View Time × 0.3) ÷ 0.5 minutes</code>. Industry standard: ads shouldn't exceed 30% of viewing time. With 45 min avg view time, viewers can see 27 ads maximum.</p>
            </div>
          </div>

          <div className="math-explanation">
            <div className="math-step">
              <strong>Calculate Available Slots:</strong>
              <code>Maximum Placements ÷ Minimum Frequency = Available Slots</code>
              <code>27 placements ÷ 4 per brand = 6 brands maximum</code>
            </div>
          </div>
        </div>

        <div className="methodology-section">
          <h3>📊 Real-World Example</h3>
          
          <div className="example-box">
            <p><strong>Your Stream:</strong></p>
            <ul>
              <li>Sports content, 180 minutes long</li>
              <li>45 min average view time</li>
              <li>50,000 total views</li>
            </ul>

            <p><strong>Single Brand Scenario:</strong></p>
            <ul>
              <li>Premium CPM: £63.50 (Sports base £25 × 2.54 multiplier)</li>
              <li>Cost per placement: £3,175</li>
              <li>Brand buys 1 slot = 4 placements = <strong>£12,700</strong></li>
            </ul>

            <p><strong>Multi-Brand Scenario:</strong></p>
            <ul>
              <li>6 brands each buy 1 slot at £12,700</li>
              <li>Total placements: 6 × 4 = 24 (within 27 max)</li>
              <li><strong>Total Revenue: £76,200</strong></li>
              <li>📈 <strong>Revenue multiplied by 6x!</strong></li>
            </ul>
          </div>
        </div>

        <div className="methodology-section">
          <h3>⚖️ Why Brands Pay the Same</h3>
          <p>Each brand pays the full slot price because:</p>
          
          <ul className="sources-list">
            <li><strong>Equal reach</strong> - Every brand reaches all 50,000 views</li>
            <li><strong>Same CPM</strong> - All brands get the premium £63.50 CPM rate</li>
            <li><strong>Guaranteed exposure</strong> - Minimum placements ensure full audience coverage</li>
            <li><strong>Fair value</strong> - Each brand gets what they pay for: complete audience reach</li>
          </ul>

          <p className="note">This is different from "shared" inventory where brands split reach. Here, each brand independently reaches 100% of viewers.</p>
        </div>

        <div className="methodology-section">
          <h3>💰 Revenue Comparison</h3>
          
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Brands</th>
                <th>Placements</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Single Brand</td>
                <td>1</td>
                <td>4</td>
                <td>£12,700</td>
              </tr>
              <tr>
                <td>Two Brands</td>
                <td>2</td>
                <td>8</td>
                <td>£25,400</td>
              </tr>
              <tr>
                <td>Four Brands</td>
                <td>4</td>
                <td>16</td>
                <td>£50,800</td>
              </tr>
              <tr className="highlight-row">
                <td><strong>Maximum (6 Brands)</strong></td>
                <td><strong>6</strong></td>
                <td><strong>24</strong></td>
                <td><strong>£76,200</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="methodology-section">
          <h3>✅ Best Practices</h3>
          <ul className="sources-list">
            <li><strong>Package naming</strong> - Create tiers: Gold, Silver, Bronze sponsors</li>
            <li><strong>Brand compatibility</strong> - Ensure sponsors aren't direct competitors</li>
            <li><strong>Placement spacing</strong> - Distribute ads evenly throughout stream</li>
            <li><strong>Visual differentiation</strong> - Each brand gets distinct on-screen placement style</li>
            <li><strong>Clear contracts</strong> - Specify reach guarantees and placement frequency</li>
          </ul>
        </div>

        <div className="methodology-footer">
          <p>Multi-brand sponsorships maximize revenue while maintaining fair value for each sponsor. All brands reach the full audience at the premium CPM rate.</p>
        </div>
      </div>
    </div>
  );
}

export default MultiBrandInfoModal;