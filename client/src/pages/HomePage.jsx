import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🎯', title: 'Structured Practice', desc: 'Work through LLD problems with a guided 10-section template that covers classes, responsibilities, patterns, and trade-offs.' },
  { icon: '🤖', title: 'AI Feedback', desc: 'Get criterion-level feedback with evidence from your own submission — not just a score, but actionable suggestions.' },
  { icon: '📈', title: 'Track Improvement', desc: 'Every attempt is saved. Review your previous work, compare scores, and watch your design thinking improve over time.' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Low-Level Design Practice</div>
          <h1 className="hero-title">
            Design better systems,<br />one attempt at a time.
          </h1>
          <p className="hero-subtitle">
            Practice LLD problems, get explainable AI feedback on your design decisions, and build a track record of improvement.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/problems')}>
              Start Practicing
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/history')}>
              My History
            </button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card-preview">
            <div className="preview-header">Parking Lot System</div>
            <div className="preview-score">8.4 <span>/10</span></div>
            <div className="preview-tag">Attempt #3</div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">How it works</h2>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="journey-section">
        <h2 className="section-title">The practice loop</h2>
        <div className="journey-steps">
          {['Choose Problem', 'Think & Design', 'Submit', 'Get Feedback', 'Review', 'Try Again'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div className="journey-step">
                <div className="step-num">{i + 1}</div>
                <div className="step-label">{step}</div>
              </div>
              {i < arr.length - 1 && <div className="step-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
