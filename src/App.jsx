import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Artboard from './pages/Artboard';
import GalleryView from './pages/GalleryView';
import './index.css';

function PortfolioRoutes() {
  const navigate = useNavigate();
  const [isMono, setIsMono] = useState(false);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Artboard
            onOpenGallery={() => navigate('/gallery')}
            isMono={isMono}
            setIsMono={setIsMono}
          />
        }
      />
      <Route
        path="/gallery"
        element={
          <GalleryView
            initialFilter="ALL"
            onBackToCanvas={() => navigate('/')}
            isMono={isMono}
            setIsMono={setIsMono}
          />
        }
      />
      <Route
        path="/weddings"
        element={
          <GalleryView
            initialFilter="WEDDINGS"
            onBackToCanvas={() => navigate('/')}
            isMono={isMono}
            setIsMono={setIsMono}
          />
        }
      />
      <Route
        path="/portraits"
        element={
          <GalleryView
            initialFilter="PORTRAITS"
            onBackToCanvas={() => navigate('/')}
            isMono={isMono}
            setIsMono={setIsMono}
          />
        }
      />
      <Route
        path="/street"
        element={
          <GalleryView
            initialFilter="STREET"
            onBackToCanvas={() => navigate('/')}
            isMono={isMono}
            setIsMono={setIsMono}
          />
        }
      />
      <Route
        path="*"
        element={
          <Artboard
            onOpenGallery={() => navigate('/gallery')}
            isMono={isMono}
            setIsMono={setIsMono}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PortfolioRoutes />
    </BrowserRouter>
  );
}
