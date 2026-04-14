'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export default function FloatingElements() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isDesktop, setIsDesktop] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isDesktop) return
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isDesktop])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-green-500 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center hover:bg-green-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cursor glow effect (desktop only) */}
      {isDesktop && (
        <motion.div
          className="fixed pointer-events-none z-[55] w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)',
            left: cursorPos.x - 128,
            top: cursorPos.y - 128,
          }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.15 }}
        />
      )}
    </>
  )
}
