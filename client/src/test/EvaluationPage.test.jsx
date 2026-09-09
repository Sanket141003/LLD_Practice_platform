import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import EvaluationPage from '../pages/EvaluationPage';
import * as api from '../services/api';

vi.mock('../services/api');

const completedEval = {
  _id: 'eval1',
  status: 'COMPLETED',
  evaluatorType: 'DEMO',
  overallScore: 7.5,
  summary: 'Good design overall with some improvements needed.',
  criteria: [
    {
      criterion: 'Class Responsibilities',
      score: 8,
      evidence: 'Clear class definitions',
      concern: 'Minor overlap',
      suggestion: 'Separate allocation logic',
      confidence: 0.9,
    },
  ],
  strengths: ['Good abstraction', 'Clear flow'],
  priorityImprovements: ['Separate responsibilities', 'Add interfaces'],
  attemptId: 'attempt1',
};

function renderWithRoute(evalId) {
  return render(
    <MemoryRouter initialEntries={[`/evaluation/${evalId}`]}>
      <Routes>
        <Route path="/evaluation/:evaluationId" element={<EvaluationPage />} />
        <Route path="/history" element={<div>History Page</div>} />
        <Route path="/attempts/:attemptId" element={<div>Attempt Detail</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EvaluationPage', () => {
  it('shows loading state initially', () => {
    api.getEvaluation.mockReturnValue(new Promise(() => {}));
    renderWithRoute('eval1');
    expect(screen.getByText(/loading evaluation/i)).toBeInTheDocument();
  });

  it('shows evaluating state when status is EVALUATING', async () => {
    api.getEvaluation.mockResolvedValue({ ...completedEval, status: 'EVALUATING' });
    renderWithRoute('eval1');
    await waitFor(() => {
      expect(screen.getByText(/evaluation in progress/i)).toBeInTheDocument();
    });
  });

  it('renders completed evaluation feedback', async () => {
    api.getEvaluation.mockResolvedValue(completedEval);
    renderWithRoute('eval1');
    await waitFor(() => {
      expect(screen.getByText(/evaluation complete/i)).toBeInTheDocument();
      expect(screen.getByText('7.5')).toBeInTheDocument();
      expect(screen.getByText('Good design overall with some improvements needed.')).toBeInTheDocument();
      expect(screen.getByText('Class Responsibilities')).toBeInTheDocument();
    });
  });

  it('shows demo mode banner for DEMO evaluator', async () => {
    api.getEvaluation.mockResolvedValue(completedEval);
    renderWithRoute('eval1');
    await waitFor(() => {
      expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
    });
  });

  it('shows retry button on failed evaluation', async () => {
    api.getEvaluation.mockResolvedValue({ ...completedEval, status: 'FAILED', errorMessage: 'AI timeout' });
    renderWithRoute('eval1');
    await waitFor(() => {
      expect(screen.getByText(/evaluation failed/i)).toBeInTheDocument();
      expect(screen.getByText(/retry evaluation/i)).toBeInTheDocument();
    });
  });
});
