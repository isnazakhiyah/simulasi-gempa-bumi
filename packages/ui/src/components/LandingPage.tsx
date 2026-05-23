import { useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { FeaturesStrip } from './FeaturesStrip';
import { Footer } from './Footer';
import { HeroSection } from './HeroSection';

const navItems = [];

export function LandingPage() {
  useEffect(() => {
    document.title = 'Simulasi Gempa - Landing Page';
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light text-text-main">
      <AppHeader brandIcon="tsunami" navItems={navItems} maxWidthClass="max-w-[1280px]" />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <FeaturesStrip />
      </main>
      <Footer />
    </div>
  );
}
