import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// TODO: Remove this temporary auth setup when production auth is implemented
// Set default admin auth for development/testing
if (!localStorage.getItem('auth')) {
  localStorage.setItem('auth', 'admin:admin:08123456789');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
