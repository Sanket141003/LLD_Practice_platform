import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import HistoryPage from '../pages/HistoryPage';
import * as api from '../services/api';

vi.mock('../services/api');

const mockHistory = [
  {
    _id: 'a1',
    attemptNumber: 1,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    problemId: { _id: 'p1', title: 'Parking Lot System', difficulty: 'Medium', category: 'OOP' },
    evaluationId: { overallScore: 6.2, status: 'COMPLETED' },
  },
  {
    _id: 'a2',
    attemptNumber: 2,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    problemId: { _id: 'p1', title: 'Parking Lot System', difficulty: 'Medium', category: 'OOP' },
    evaluationId: { overallScore: 8.4, status: 'COMPLETED' },
  },
];

describe('HistoryPage', () => {
  it('shows loading initially', () => {
    api.getHistory.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><HistoryPage /></MemoryRouter>);
    expect(screen.getByText(/loading history/i)).toBeInTheDocument();
  });

  it('renders attempt groups by problem', async () => {
    api.getHistory.mockResolvedValue(mockHistory);
    render(<MemoryRouter><HistoryPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Parking Lot System')).toBeInTheDocument();
      expect(screen.getByText('Attempt #1')).toBeInTheDocument();
      expect(screen.getByText('Attempt #2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no history', async () => {
    api.getHistory.mockResolvedValue([]);
    render(<MemoryRouter><HistoryPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/no attempts yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    api.getHistory.mockRejectedValue(new Error('Failed to fetch'));
    render(<MemoryRouter><HistoryPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});
