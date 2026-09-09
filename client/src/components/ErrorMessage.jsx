import React from 'react';

export default function ErrorMessage({ message, retry }) {
  return (
    <div className="error-container" role="alert">
      <div className="error-icon">⚠</div>
      <p className="error-text">{message || 'Something went wrong.'}</p>
      {retry && (
        <button className="btn btn-secondary" onClick={retry}>
          Try Again
        </button>
      )}
    </div>
  );
}
