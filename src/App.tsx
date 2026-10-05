import { useEffect } from 'react'
import { Footer } from './components/layout/Footer'
import { MobileOrderBar } from './components/layout/MobileOrderBar'
import { Navbar } from './components/layout/Navbar'
import { OrderModal } from './components/order/OrderModal'
import { useRevealObserver } from './components/ui/Reveal'
import { refreshMenu } from './data/products'
import { HomePage } from './pages/HomePage'
import { BuilderProvider } from './state/builder'
import { OrderProvider } from './state/order'

/**
 * App shell: providers + layout. When the site grows to several pages, add a
 * router here and render the matching page instead of <HomePage />.
 */
export default function App() {
  return (
    <OrderProvider>
      <BuilderProvider>
        <Layout />
      </BuilderProvider>
    </OrderProvider>
  )
}

function Layout() {
  useRevealObserver()
  // Pick up admin changes made since this page was built, and again when the tab comes back.
  useEffect(() => {
    refreshMenu()
    const onShow = () => document.visibilityState === 'visible' && refreshMenu()
    document.addEventListener('visibilitychange', onShow)
    return () => document.removeEventListener('visibilitychange', onShow)
  }, [])
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-chocolate px-5 py-3 text-sm font-bold text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <HomePage />
      </main>
      <Footer />
      <MobileOrderBar />
      <OrderModal />
    </>
  )
}
