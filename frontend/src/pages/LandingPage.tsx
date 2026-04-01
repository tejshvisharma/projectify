import { useEffect, useRef } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import InsightsSection from '@/components/landing/InsightsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import TechStackSection from '@/components/landing/TechStackSection';
import CtaSection from '@/components/landing/CtaSection';
import Footer from '@/components/landing/Footer';
import { useThemeStore } from '@/stores/theme.store';

export default function LandingPage() {
  const { isDark, toggleTheme } = useThemeStore();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (prefersReducedMotion || coarsePointer) {
      return;
    }

    const initialX = window.innerWidth * 0.5;
    const initialY = window.innerHeight * 0.22;

    let targetX = initialX;
    let targetY = initialY;
    let leadX = initialX;
    let leadY = initialY;
    let lagX = initialX;
    let lagY = initialY;
    let prevLeadX = initialX;
    let prevLeadY = initialY;
    let velocity = 0;
    let rafId = 0;

    const setEffectVars = () => {
      root.style.setProperty('--jelly-x', `${leadX.toFixed(1)}px`);
      root.style.setProperty('--jelly-y', `${leadY.toFixed(1)}px`);
      root.style.setProperty('--jelly-lag-x', `${lagX.toFixed(1)}px`);
      root.style.setProperty('--jelly-lag-y', `${lagY.toFixed(1)}px`);
      root.style.setProperty('--jelly-strength', velocity.toFixed(3));
    };

    const animate = () => {
      leadX += (targetX - leadX) * 0.16;
      leadY += (targetY - leadY) * 0.16;
      lagX += (leadX - lagX) * 0.11;
      lagY += (leadY - lagY) * 0.11;

      const deltaX = leadX - prevLeadX;
      const deltaY = leadY - prevLeadY;
      velocity += (Math.min(1, Math.hypot(deltaX, deltaY) / 38) - velocity) * 0.22;
      prevLeadX = leadX;
      prevLeadY = leadY;

      setEffectVars();

      const stillMoving =
        Math.abs(targetX - leadX) > 0.2 ||
        Math.abs(targetY - leadY) > 0.2 ||
        velocity > 0.015;

      if (stillMoving) {
        rafId = window.requestAnimationFrame(animate);
      } else {
        rafId = 0;
      }
    };

    const ensureAnimation = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      ensureAnimation();
    };

    const handlePointerLeave = () => {
      targetX = window.innerWidth * 0.5;
      targetY = window.innerHeight * 0.22;
      ensureAnimation();
    };

    const handleResize = () => {
      targetX = Math.min(targetX, window.innerWidth - 16);
      targetY = Math.min(targetY, window.innerHeight - 16);
      ensureAnimation();
    };

    setEffectVars();
    ensureAnimation();

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="landing-jelly-root relative min-h-screen overflow-hidden bg-background text-foreground font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui]"
    >
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="landing-jelly-base" />
        <div className="landing-jelly-orb landing-jelly-orb-lead" />
        <div className="landing-jelly-orb landing-jelly-orb-lag" />
        <div className="landing-jelly-wave" />
        <div className="absolute left-[-16rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-[-14rem] top-[8rem] h-[26rem] w-[26rem] rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute bottom-[-18rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
      </div>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InsightsSection />
        <TestimonialsSection />
        <PricingSection />
        <TechStackSection />
        <CtaSection />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}