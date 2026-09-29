import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { initAuth } from './features/auth/authService.ts'

// Инициализируем аутентификацию при старте
initAuth();

// Отключаем клик правой кнопкой мыши глобально
window.addEventListener('contextmenu', (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      theme="dark"
      toastOptions={{
        style: {
          background: '#0e1624',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff',
        },
      }}
    />
  </StrictMode>,
)
