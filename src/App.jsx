import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Artboard from './pages/Artboard';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Artboard />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
