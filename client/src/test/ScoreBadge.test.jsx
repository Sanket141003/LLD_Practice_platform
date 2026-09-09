import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoreBadge from '../components/ScoreBadge';

describe('ScoreBadge', () => {
  it('renders score value', () => {
    render(<ScoreBadge score={8.4} />);
    expect(screen.getByText(/8\.4/)).toBeInTheDocument();
  });

  it('applies excellent class for score >= 8', () => {
    const { container } = render(<ScoreBadge score={9} />);
    expect(container.firstChild).toHaveClass('score-excellent');
  });

  it('applies good class for score 6-7.9', () => {
    const { container } = render(<ScoreBadge score={7} />);
    expect(container.firstChild).toHaveClass('score-good');
  });

  it('applies fair class for score 4-5.9', () => {
    const { container } = render(<ScoreBadge score={5} />);
    expect(container.firstChild).toHaveClass('score-fair');
  });

  it('applies poor class for score < 4', () => {
    const { container } = render(<ScoreBadge score={2} />);
    expect(container.firstChild).toHaveClass('score-poor');
  });
});
