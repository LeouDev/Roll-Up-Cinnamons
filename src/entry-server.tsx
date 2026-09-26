import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export { site } from './data/site'

/** Used at build time by scripts/prerender.mjs to write the page's HTML. */
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
