'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingScreen from '@/components/landing/LoadingScreen'
import Navbar from '@/components/landing/Navbar'
import AnnouncementBanner from '@/components/landing/AnnouncementBanner'
import HeroSection from '@/components/landing/HeroSection'
import StatsBar from '@/components/landing/StatsBar'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import DashboardPreview from '@/components/landing/DashboardPreview'
import AISpotlightSection from '@/components/landing/AISpotlightSection'
import FinancialSection from '@/components/landing/FinancialSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import ComparisonTable from '@/components/landing/ComparisonTable'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import FinalCTASection from '@/components/landing/FinalCTASection'
import Footer from '@/components/landing/Footer'
import FloatingElements from '@/components/landing/FloatingElements'

export default function LandingPage() {
  const [loading, setLoading] = useState(true)

  const handleLoadingComplete = useCallback(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [loading])

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!loading && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <FloatingElements />
          <AnnouncementBanner />
          <Navbar />
          <HeroSection />
          <StatsBar />
          <FeaturesSection />
          <HowItWorksSection />
          <DashboardPreview />
          <AISpotlightSection />
          <FinancialSection />
          <TestimonialsSection />
          <ComparisonTable />
          <PricingSection />
          <FAQSection />
          <FinalCTASection />
          <Footer />
        </motion.main>
      )}
    </>
  )
}
