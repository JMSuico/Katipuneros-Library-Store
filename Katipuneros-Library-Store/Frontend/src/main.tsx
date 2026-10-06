// [Layer: Entry Point]
// main.tsx -- React DOM entry point.
// Mounts the App component and imports the global stylesheet.
// DO NOT put business logic, components, or routing here.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './LayoutStyles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
