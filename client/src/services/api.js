import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Learner identity — simple anonymous ID persisted in localStorage
function getLearnerId() {
  let id = localStorage.getItem('lld_learner_id');
  if (!id) {
    id = 'learner_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('lld_learner_id', id);
  }
  return id;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach learner ID to all requests
api.interceptors.request.use(config => {
  config.headers['x-learner-id'] = getLearnerId();
  return config;
});

// Normalize errors
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.message || err.message || 'Network error';
    const errors = err.response?.data?.errors;
    const enhanced = new Error(message);
    enhanced.statusCode = err.response?.status;
    enhanced.errors = errors;
    return Promise.reject(enhanced);
  }
);

// Problems
export const getProblems = () => api.get('/problems').then(r => r.data.data);
export const getProblem = (id) => api.get(`/problems/${id}`).then(r => r.data.data);

// Attempts
export const createAttempt = (problemId) =>
  api.post(`/problems/${problemId}/attempts`).then(r => r.data.data);
export const getAttempt = (attemptId) =>
  api.get(`/attempts/${attemptId}`).then(r => r.data.data);
export const getHistory = () =>
  api.get('/history').then(r => r.data.data);

// Submissions
export const saveDraft = (attemptId, content) =>
  api.post(`/attempts/${attemptId}/draft`, { content }).then(r => r.data.data);
export const submitSolution = (attemptId, content) =>
  api.post(`/attempts/${attemptId}/submit`, { content }).then(r => r.data.data);

// Evaluations
export const getEvaluation = (evaluationId) =>
  api.get(`/evaluations/${evaluationId}`).then(r => r.data.data);
export const retryEvaluation = (evaluationId) =>
  api.post(`/evaluations/${evaluationId}/retry`).then(r => r.data.data);
