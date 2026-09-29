import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import AutoclickerOverlay from './components/AutoclickerOverlay'
import PotatoRainOverlay from './components/PotatoRainOverlay'
import PersonalCheatModal from './components/PersonalCheatModal'
import AdminBanModal from './components/AdminBanModal'

import ErrorBoundary from './components/ErrorBoundary'

// Отключаем клик правой кнопкой мыши по всему документу, чтобы игра ощущалась как приложение
document.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <AutoclickerOverlay />
      <PotatoRainOverlay />
      <PersonalCheatModal />
      <AdminBanModal />
      <Toaster theme="dark" position="top-center" richColors />
    </ErrorBoundary>
  </StrictMode>,
)
