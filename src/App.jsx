import { useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls } from '@react-three/drei'
import { Leva } from 'leva'
import Lenis from '@studio-freight/lenis'
import Scene from './layout/Scene'
import { useStore } from './store'
import HeroOverlay from './components/dom/HeroOverlay'
import AboutOverlay from './components/dom/AboutOverlay'
import WorkOverlay from './components/dom/WorkOverlay'
import ContactOverlay from './components/dom/ContactOverlay'

function App() {
  const setScrollProgress = useStore((state) => state.setScrollProgress)
  const setLenis = useStore((state) => state.setLenis)

  useEffect(() => {
    const lenis = new Lenis()
    setLenis(lenis)
    function raf(time) {
      lenis.raf(time)
      setScrollProgress(lenis.progress) // Sync progress
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [setScrollProgress, setLenis])

  return (
    <>
      <Leva hidden />
      <Scene />
      <main className="absolute top-0 left-0 w-full z-10 pointer-events-none">
        <HeroOverlay />
        <AboutOverlay />
        <WorkOverlay />
        <ContactOverlay />
      </main>
    </>
  )
}

export default App
