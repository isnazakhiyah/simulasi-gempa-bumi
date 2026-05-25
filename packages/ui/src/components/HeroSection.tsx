import { actionCards } from '../data/landingContent';
import { ActionCard } from './ActionCard';
import { MaterialIcon } from './MaterialIcon';

export function HeroSection() {
  return (
    <section className="hero-pattern relative flex min-h-[700px] flex-col items-center justify-center overflow-hidden px-6 py-14 md:p-12 lg:px-24 lg:py-20">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/seismic-hero.png"
          alt="Visualisasi jaringan global abstrak yang merepresentasikan data seismik"
          className="h-full w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-light/95 via-surface-light/90 to-background-light" />
      </div>

      <div className="relative z-10 flex max-w-4xl animate-fade-in-up flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary shadow-sm">
          <MaterialIcon className="text-[16px] leading-none">school</MaterialIcon>
          <span>Modul Pembelajaran v2.0</span>
        </div>

        <h1 className="mb-6 text-4xl font-black leading-[1.05] tracking-tight text-text-main md:text-5xl lg:text-[72px] lg:leading-[1.04]">
          Simulasi Gempa Bumi <br />
          <span className="text-primary">SiGeMi</span>
        </h1>

        <p className="mb-10 max-w-3xl text-lg font-light leading-relaxed text-text-muted md:text-[22px]">
          AI-enhanced STEM disaster simulation platform untuk mengembangkan kompetensi calon guru IPA melalui integrasi sains, teknologi, rekayasa, dan literasi risiko kebencanaan
        </p>

        <div className="flex w-full max-w-[760px] justify-center">
          {actionCards.map((item) => (
            <ActionCard key={item.title} item={item} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-text-muted">
          <MaterialIcon className="text-[18px] leading-none">info</MaterialIcon>
          <span>Lebih dari 500+ skenario gempa tersedia berdasarkan data historis.</span>
        </div>
      </div>
    </section>
  );
}
