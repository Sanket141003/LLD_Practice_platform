import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvaluation, retryEvaluation, getAttempt } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ScoreBadge from '../components/ScoreBadge';

const POLL_INTERVAL = 3000;

export default function EvaluationPage() {
  const { evaluationId } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const fetchEvaluation = async () => {
    try {
      const data = await getEvaluation(evaluationId);
      setEvaluation(data);

      if (data.status === 'EVALUATING') {
        pollRef.current = setTimeout(fetchEvaluation, POLL_INTERVAL);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [evaluationId]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const updated = await retryEvaluation(evaluationId);
      setEvaluation(updated);
      pollRef.current = setTimeout(fetchEvaluation, POLL_INTERVAL);
    } catch (err) {
      setError(err.message);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading evaluation..." />;
  if (error) return <ErrorMessage message={error} />;

  if (evaluation?.status === 'EVALUATING') {
    return (
      <div className="page-container page-narrow evaluating-state">
        <div className="eval-status-card">
          <div className="eval-spinner" aria-label="Evaluating" />
          <h2>Evaluation in progress</h2>
          <p>Your submission has been saved. AI is reviewing your design.</p>
          <p className="eval-note">This usually takes 15–30 seconds. The page will update automatically.</p>
        </div>
      </div>
    );
  }

  if (evaluation?.status === 'FAILED') {
    return (
      <div className="page-container page-narrow">
        <div className="eval-status-card eval-failed">
          <div className="eval-icon">✗</div>
          <h2>Evaluation failed</h2>
          <p>We couldn't complete the evaluation. Your submission is safe.</p>
          {evaluation.errorMessage && (
            <p className="error-detail">{evaluation.errorMessage}</p>
          )}
          <button
            className="btn btn-primary"
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Retry Evaluation'}
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation || evaluation.status !== 'COMPLETED') {
    return <ErrorMessage message="Evaluation not available." />;
  }

  const isDemoMode = evaluation.evaluatorType === 'DEMO';

  return (
    <div className="page-container page-narrow feedback-page">
      {isDemoMode && (
        <div className="demo-banner" role="note">
          Demo Mode — this feedback is simulated. Set up an OpenAI API key for real AI evaluation.
        </div>
      )}

      <div className="feedback-header">
        <div className="feedback-title-row">
          <h1>Evaluation Complete</h1>
          <ScoreBadge score={evaluation.overallScore} size="lg" />
        </div>
        <p className="feedback-summary">{evaluation.summary}</p>
      </div>

      {evaluation.strengths?.length > 0 && (
        <div className="feedback-section strengths-section">
          <h2 className="feedback-section-title">Strengths</h2>
          <ul className="strengths-list">
            {evaluation.strengths.map((s, i) => (
              <li key={i}><span className="strength-icon">✓</span>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {evaluation.priorityImprovements?.length > 0 && (
        <div className="feedback-section improvements-section">
          <h2 className="feedback-section-title">Priority Improvements</h2>
          <ol className="improvements-list">
            {evaluation.priorityImprovements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="feedback-section">
        <h2 className="feedback-section-title">Detailed Feedback</h2>
        <div className="criteria-list">
          {evaluation.criteria?.map((c, i) => (
            <div key={i} className="criterion-card">
              <div className="criterion-header">
                <span className="criterion-name">{c.criterion}</span>
                <ScoreBadge score={c.score} size="sm" />
              </div>

              {c.evidence && (
                <div className="criterion-block">
                  <span className="block-label">Evidence</span>
                  <p>{c.evidence}</p>
                </div>
              )}

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

              <div className="criterion-confidence">
                Confidence: {Math.round(c.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="feedback-actions">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/attempts/${evaluation.attemptId}`)}
        >
          View Full Attempt
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/history')}
        >
          My History
        </button>
      </div>
    </div>
  );
}
