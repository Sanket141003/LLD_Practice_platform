import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblem, createAttempt } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProblem(id)
      .then(setProblem)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const attempt = await createAttempt(id);
      navigate(`/practice/${attempt._id}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading problem..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!problem) return <ErrorMessage message="Problem not found." />;

  return (
    <div className="page-container page-narrow">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('/problems')}>
        ← Back to Problems
      </button>

      <div className="problem-detail-header">
        <div className="problem-detail-meta">
          <span className={`difficulty-badge diff-${problem.difficulty?.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          <span className="problem-category">{problem.category}</span>
        </div>
        <h1 className="problem-detail-title">{problem.title}</h1>
        <p className="problem-detail-desc">{problem.description}</p>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Requirements</h2>
        <ul className="detail-list">
          {problem.requirements?.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Constraints</h2>
        <ul className="detail-list">
          {problem.constraints?.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Things to Consider</h2>
        <ul className="detail-list considerations">
          {problem.expectedConsiderations?.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Evaluation Criteria</h2>
        <div className="rubric-grid">
          {problem.rubric?.map(r => (
            <div key={r.criterion} className="rubric-item">
              <span className="rubric-criterion">{r.criterion}</span>
              <span className="rubric-weight">{r.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="problem-detail-cta">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleStart}
          disabled={starting}
        >
          {starting ? 'Creating attempt...' : 'Start Practice →'}
        </button>
      </div>
    </div>
  );
}
