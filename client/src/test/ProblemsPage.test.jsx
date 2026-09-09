import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProblemsPage from '../pages/ProblemsPage';
import * as api from '../services/api';

vi.mock('../services/api');

const mockProblems = [
  {
    _id: '1',
    title: 'Parking Lot System',
    description: 'Design a parking lot system with multiple floors.',
    difficulty: 'Medium',
    category: 'OOP · Strategy',
    requirements: ['Support multiple floors', 'Handle vehicles'],
  },
];

describe('ProblemsPage', () => {
  it('shows loading spinner initially', () => {
    api.getProblems.mockReturnValue(new Promise(() => {}));
    render(<MemoryRouter><ProblemsPage /></MemoryRouter>);
    expect(screen.getByText(/loading problems/i)).toBeInTheDocument();
  });

  it('renders problem cards after loading', async () => {
    api.getProblems.mockResolvedValue(mockProblems);
    render(<MemoryRouter><ProblemsPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText('Parking Lot System')).toBeInTheDocument();
    });
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('shows error when API fails', async () => {
    api.getProblems.mockRejectedValue(new Error('Network error'));
    render(<MemoryRouter><ProblemsPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no problems', async () => {
    api.getProblems.mockResolvedValue([]);
    render(<MemoryRouter><ProblemsPage /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getByText(/no problems found/i)).toBeInTheDocument();
    });
  });
});
