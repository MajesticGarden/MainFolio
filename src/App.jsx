import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Artboard from './pages/Artboard';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Artboard />} />
      </Routes>
    </BrowserRouter>
  );
}
