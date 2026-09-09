import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '4rem' }}>404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        Go Home
      </button>
    </div>
  );
}
