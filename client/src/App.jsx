import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import PracticePage from './pages/PracticePage';
import EvaluationPage from './pages/EvaluationPage';
import HistoryPage from './pages/HistoryPage';
import AttemptDetailPage from './pages/AttemptDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="problems" element={<ProblemsPage />} />
          <Route path="problems/:id" element={<ProblemDetailPage />} />
          <Route path="practice/:attemptId" element={<PracticePage />} />
          <Route path="evaluation/:evaluationId" element={<EvaluationPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="attempts/:attemptId" element={<AttemptDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
