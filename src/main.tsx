import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Hydrate the prerendered HTML in production; plain render in dev.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)

// Tells the safety net in index.html that the app booted.
;(window as Window & { __rollUpReady?: boolean }).__rollUpReady = true
