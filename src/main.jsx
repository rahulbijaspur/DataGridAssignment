import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import DataGrid from './DataGrid.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DataGrid />
  </StrictMode>
);
