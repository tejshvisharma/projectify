import { useState, useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import TechStackSection from '@/components/landing/TechStackSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/landing/Footer';
import { useThemeStore } from '@/stores/theme.store';

export default function LandingPage() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <TechStackSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}