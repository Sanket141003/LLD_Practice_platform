import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, createAttempt } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ScoreBadge from '../components/ScoreBadge';

function groupByProblem(attempts) {
  const map = {};
  for (const a of attempts) {
    const pid = a.problemId?._id || 'unknown';
    if (!map[pid]) map[pid] = { problem: a.problemId, attempts: [] };
    map[pid].attempts.push(a);
  }
  return Object.values(map);
}

function ScoreTrail({ attempts }) {
  const scored = attempts.filter(a => a.evaluationId?.overallScore != null);
  if (scored.length < 2) return null;
  return (
    <div className="score-trail">
      {scored.map((a, i) => (
        <React.Fragment key={a._id}>
          <span className="trail-score">{Number(a.evaluationId.overallScore).toFixed(1)}</span>
          {i < scored.length - 1 && <span className="trail-arrow">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setGroups(groupByProblem(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTryAgain = async (problemId) => {
    setRetrying(problemId);
    try {
      const attempt = await createAttempt(problemId);
      navigate(`/practice/${attempt._id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setRetrying(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading history..." />;
  if (error) return <ErrorMessage message={error} retry={load} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Practice History</h1>
        <p className="page-subtitle">Track your improvement across attempts.</p>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No attempts yet. Start practicing to see your history here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/problems')}>
            Browse Problems
          </button>
        </div>
      ) : (
        <div className="history-list">
          {groups.map(({ problem, attempts }) => (
            <div key={problem?._id} className="history-group">
              <div className="history-group-header">
                <div className="history-problem-info">
                  <h2 className="history-problem-title">{problem?.title || 'Unknown Problem'}</h2>
                  <span className={`difficulty-badge diff-${problem?.difficulty?.toLowerCase()}`}>
                    {problem?.difficulty}
                  </span>
                  <span className="problem-category">{problem?.category}</span>
                </div>
                <div className="history-group-actions">
                  <ScoreTrail attempts={attempts} />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleTryAgain(problem?._id)}
                    disabled={retrying === problem?._id}
                  >
                    {retrying === problem?._id ? 'Starting...' : 'Try Again'}
                  </button>
                </div>
              </div>

              <div className="attempts-list">
                {attempts.map(a => (
                  <div
                    key={a._id}
                    className="attempt-row"
                    onClick={() => navigate(`/attempts/${a._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/attempts/${a._id}`)}
                  >
                    <div className="attempt-row-left">
                      <span className="attempt-num">Attempt #{a.attemptNumber}</span>
                      <span className={`status-chip status-${a.status?.toLowerCase()}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className="attempt-row-right">
                      {a.evaluationId?.overallScore != null ? (
                        <ScoreBadge score={a.evaluationId.overallScore} size="sm" />
                      ) : (
                        <span className="no-score">—</span>
                      )}
                      <span className="attempt-date">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                      <span className="attempt-arrow">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
