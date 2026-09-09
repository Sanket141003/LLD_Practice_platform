import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProblems } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const DIFFICULTY_COLORS = { Easy: 'diff-easy', Medium: 'diff-medium', Hard: 'diff-hard' };

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProblems();
      setProblems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner message="Loading problems..." />;
  if (error) return <ErrorMessage message={error} retry={load} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">LLD Problems</h1>
        <p className="page-subtitle">Pick a problem, design a solution, get feedback.</p>
      </div>

      {problems.length === 0 ? (
        <div className="empty-state">
          <p>No problems found. Make sure the server is running and seeded.</p>
        </div>
      ) : (
        <div className="problems-grid">
          {problems.map(p => (
            <div key={p._id} className="problem-card">
              <div className="problem-card-header">
                <h2 className="problem-card-title">{p.title}</h2>
                <span className={`difficulty-badge ${DIFFICULTY_COLORS[p.difficulty] || ''}`}>
                  {p.difficulty}
                </span>
              </div>
              <p className="problem-card-desc">{p.description.slice(0, 130)}...</p>
              <div className="problem-card-meta">
                <span className="problem-category">{p.category}</span>
                <span className="problem-reqs">{p.requirements?.length || 0} requirements</span>
              </div>
              <button
                className="btn btn-primary problem-card-btn"
                onClick={() => navigate(`/problems/${p._id}`)}
              >
                View Problem →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
