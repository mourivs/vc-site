import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.tsx'
import { SpotifyProvider } from './spotify.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpotifyProvider><App /></SpotifyProvider>
  </StrictMode>,
)
