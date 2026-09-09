import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttempt, saveDraft, submitSolution } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { toast, ToastContainer } from '../components/Toast';

const SECTIONS = [
  { key: 'requirementsUnderstanding', label: 'Requirements Understanding', placeholder: 'List the core requirements you identified. What must the system do?', required: true },
  { key: 'assumptions', label: 'Assumptions', placeholder: 'What assumptions are you making? (e.g., single location, no real-time sync, etc.)' },
  { key: 'classes', label: 'Classes / Interfaces', placeholder: 'List the main classes and interfaces. What abstractions will you introduce?', required: true },
  { key: 'responsibilities', label: 'Responsibilities', placeholder: 'For each class, what is its single responsibility? What behaviour does it own?', required: true },
  { key: 'relationships', label: 'Relationships', placeholder: 'How do the classes relate? (has-a, is-a, depends-on, etc.)' },
  { key: 'flow', label: 'Main Flow / Behaviour', placeholder: 'Walk through the primary use case step by step.' },
  { key: 'patterns', label: 'Design Patterns / Abstractions', placeholder: 'Which design patterns are you using? Why are they appropriate here?' },
  { key: 'edgeCases', label: 'Edge Cases', placeholder: 'What could go wrong? List error scenarios, boundary conditions, and failure modes.' },
  { key: 'extensibility', label: 'Extensibility', placeholder: 'How can the design evolve? What would need to change for a new requirement?' },
  { key: 'tradeoffs', label: 'Trade-offs', placeholder: 'What trade-offs did you make? What did you sacrifice for simplicity or speed?' },
];

const EMPTY_CONTENT = Object.fromEntries(SECTIONS.map(s => [s.key, '']));

export default function PracticePage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [problem, setProblem] = useState(null);
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    getAttempt(attemptId)
      .then(data => {
        setAttempt(data);
        setProblem(data.problemId);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const handleChange = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = useCallback(async () => {
    setSaving(true);
    try {
      await saveDraft(attemptId, content);
      setLastSaved(new Date());
      toast('Draft saved', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [attemptId, content]);

  const handleSubmit = async () => {
    setValidationErrors([]);
    const confirmed = window.confirm(
      'Submitting will start AI evaluation. You won\'t be able to edit this attempt after submission. Continue?'
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const result = await submitSolution(attemptId, content);
      toast('Submitted! Evaluation starting...', 'success');
      navigate(`/evaluation/${result.evaluation._id}`);
    } catch (err) {
      if (err.errors) {
        setValidationErrors(err.errors);
        toast('Please fix validation errors before submitting.', 'error');
      } else {
        toast(err.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading practice session..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!attempt || !problem) return <ErrorMessage message="Attempt not found." />;

  const filledCount = SECTIONS.filter(s => content[s.key]?.trim()).length;

  return (
    <div className="practice-page">
      <ToastContainer />

      <div className="practice-sidebar">
        <div className="practice-problem-info">
          <div className="sidebar-label">Practicing</div>
          <div className="sidebar-title">{problem.title}</div>
          <div className="sidebar-meta">
            <span className={`difficulty-badge diff-${problem.difficulty?.toLowerCase()}`}>
              {problem.difficulty}
            </span>
            <span>Attempt #{attempt.attemptNumber}</span>
          </div>
        </div>

        <div className="section-progress">
          <div className="progress-label">{filledCount} / {SECTIONS.length} sections filled</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(filledCount / SECTIONS.length) * 100}%` }} />
          </div>
        </div>

        <nav className="section-nav" aria-label="Solution sections">
          {SECTIONS.map(s => (
            <a
              key={s.key}
              href={`#section-${s.key}`}
              className={`section-nav-item ${content[s.key]?.trim() ? 'filled' : ''} ${s.required ? 'required' : ''}`}
            >
              <span className="nav-dot">{content[s.key]?.trim() ? '✓' : '○'}</span>
              {s.label}
              {s.required && <span className="req-star">*</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-requirements">
          <div className="sidebar-label">Requirements</div>
          <ul className="mini-req-list">
            {problem.requirements?.slice(0, 4).map((r, i) => <li key={i}>{r}</li>)}
            {problem.requirements?.length > 4 && <li className="more-reqs">+{problem.requirements.length - 4} more</li>}
          </ul>
        </div>
      </div>

      <div className="practice-editor">
        <div className="editor-header">
          <h1 className="editor-title">Your Solution</h1>
          {lastSaved && (
            <span className="last-saved">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors" role="alert">
            <strong>Please fix before submitting:</strong>
            <ul>
              {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="editor-sections">
          {SECTIONS.map(s => (
            <div key={s.key} id={`section-${s.key}`} className="editor-section">
              <label className="section-label" htmlFor={s.key}>
                {s.label}
                {s.required && <span className="req-star" aria-label="required"> *</span>}
              </label>
              <textarea
                id={s.key}
                className="section-textarea"
                placeholder={s.placeholder}
                value={content[s.key]}
                onChange={e => handleChange(s.key, e.target.value)}
                rows={6}
              />
            </div>
          ))}
        </div>

        <div className="editor-actions">
          <button
            className="btn btn-secondary"
            onClick={handleSaveDraft}
            disabled={saving || submitting}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting || saving}
          >
            {submitting ? 'Submitting...' : 'Submit for Evaluation →'}
          </button>
        </div>
      </div>
    </div>
  );
}
