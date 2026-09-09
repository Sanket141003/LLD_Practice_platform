import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttempt, getEvaluation, createAttempt } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ScoreBadge from '../components/ScoreBadge';

const SECTION_LABELS = {
  requirementsUnderstanding: 'Requirements Understanding',
  assumptions: 'Assumptions',
  classes: 'Classes / Interfaces',
  responsibilities: 'Responsibilities',
  relationships: 'Relationships',
  flow: 'Main Flow / Behaviour',
  patterns: 'Design Patterns / Abstractions',
  edgeCases: 'Edge Cases',
  extensibility: 'Extensibility',
  tradeoffs: 'Trade-offs',
};

export default function AttemptDetailPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const att = await getAttempt(attemptId);
        setAttempt(att);

        if (att.evaluationId?._id || att.evaluationId) {
          const evalId = att.evaluationId?._id || att.evaluationId;
          try {
            const ev = await getEvaluation(evalId);
            setEvaluation(ev);
          } catch {
            // Evaluation may not exist yet
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId]);

  const handleTryAgain = async () => {
    setRetrying(true);
    try {
      const problemId = attempt.problemId?._id || attempt.problemId;
      const newAttempt = await createAttempt(problemId);
      navigate(`/practice/${newAttempt._id}`);
    } catch (err) {
      alert(err.message);
      setRetrying(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading attempt..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!attempt) return <ErrorMessage message="Attempt not found." />;

  const problem = attempt.problemId;
  const submission = attempt.submissionId;
  const content = submission?.content || {};

  return (
    <div className="page-container page-narrow">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('/history')}>
        ← Back to History
      </button>

      <div className="attempt-detail-header">
        <div className="attempt-detail-meta">
          <h1>{problem?.title || 'Problem'}</h1>
          <span className={`difficulty-badge diff-${problem?.difficulty?.toLowerCase()}`}>
            {problem?.difficulty}
          </span>
        </div>
        <div className="attempt-detail-info">
          <span>Attempt #{attempt.attemptNumber}</span>
          <span className={`status-chip status-${attempt.status?.toLowerCase()}`}>
            {attempt.status}
          </span>
          {evaluation?.overallScore != null && (
            <ScoreBadge score={evaluation.overallScore} size="md" />
          )}
        </div>
      </div>

      {evaluation?.status === 'COMPLETED' && (
        <div className="attempt-eval-summary">
          <p className="eval-summary-text">{evaluation.summary}</p>

          {evaluation.strengths?.length > 0 && (
            <div className="mini-strengths">
              {evaluation.strengths.map((s, i) => (
                <div key={i} className="mini-strength-item"><span>✓</span> {s}</div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="attempt-submission">
        <h2 className="section-heading">Your Submission</h2>
        {Object.entries(SECTION_LABELS).map(([key, label]) => {
          const text = content[key];
          if (!text) return null;
          return (
            <div key={key} className="submission-section">
              <h3 className="submission-section-title">{label}</h3>
              <p className="submission-section-content">{text}</p>
            </div>
          );
        })}
      </div>

      {evaluation?.status === 'COMPLETED' && evaluation.criteria?.length > 0 && (
        <div className="attempt-feedback">
          <h2 className="section-heading">Feedback</h2>
          {evaluation.criteria.map((c, i) => (
            <div key={i} className="criterion-card">
              <div className="criterion-header">
                <span className="criterion-name">{c.criterion}</span>
                <ScoreBadge score={c.score} size="sm" />
              </div>
              {c.concern && (
                <div className="criterion-block concern">
                  <span className="block-label">Concern</span>
                  <p>{c.concern}</p>
                </div>
              )}
              {c.suggestion && (
                <div className="criterion-block suggestion">
                  <span className="block-label">Suggestion</span>
                  <p>{c.suggestion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="attempt-detail-actions">
        <button
          className="btn btn-primary"
          onClick={handleTryAgain}
          disabled={retrying}
        >
          {retrying ? 'Starting...' : 'Try Again →'}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/problems')}>
          Browse Problems
        </button>
      </div>
    </div>
  );
}
