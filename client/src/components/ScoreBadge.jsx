import React from 'react';

function getScoreClass(score) {
  if (score >= 8) return 'score-excellent';
  if (score >= 6) return 'score-good';
  if (score >= 4) return 'score-fair';
  return 'score-poor';
}

export default function ScoreBadge({ score, size = 'md' }) {
  const cls = getScoreClass(score);
  return (
    <span className={`score-badge ${cls} score-${size}`}>
      {Number(score).toFixed(1)}<span className="score-max">/10</span>
    </span>
  );
}
