import { useEffect, type ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { MaterialIcon } from './MaterialIcon';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Modules', href: '#' },
  { label: 'Simulasi', href: '/simulasi', active: true },
  { label: 'About', href: '#' },
];

type ImpactAnalysisPageProps = {
  scenarioTitle: string;
  targetLabel: string;
  runLabel?: string;
  summaryMmiRoman: string;
  summaryMmiNumeric: number;
  intensityLabel: string;
  damageLabel: string;
  riskLevel: string;
  riskSummary: string;
  pedagogicalNotes?: string[];
  selectedZoneName: string;
  selectedZoneMmiRoman: string;
  selectedZoneMmiNumeric: number;
  selectedZoneIntensityLabel: string;
  selectedZoneDamageLabel: string;
  selectedZoneRiskLevel: string;
  selectedZoneFactors: string[];
  mapPanel: ReactNode;
  errorMessage?: string | null;
  onBack?: () => void;
  onNext?: () => void;
  backHref?: string;
  nextHref?: string;
};

function getRiskBadgeClass(level: string) {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'high':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-red-100 text-red-700';
  }
}

function getImpactDotClass(label: string) {
  if (label === 'Light Damage') {
    return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
  }

  if (label === 'Moderate Damage') {
    return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
  }

  return 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]';
}

function LinkButton({
  label,
  icon,
  variant,
  onClick,
  href,
}: {
  label: string;
  icon: string;
  variant: 'outline' | 'primary';
  onClick?: () => void;
  href?: string;
}) {
  const className =
    variant === 'primary'
      ? 'bg-primary text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${className}`}
      >
        <MaterialIcon className="text-[18px]">{icon}</MaterialIcon>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <a
      href={href ?? '#'}
      className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${className}`}
    >
      <MaterialIcon className="text-[18px]">{icon}</MaterialIcon>
      <span>{label}</span>
    </a>
  );
}

export function ImpactAnalysisPage({
  scenarioTitle,
  targetLabel,
  runLabel,
  summaryMmiRoman,
  summaryMmiNumeric,
  intensityLabel,
  damageLabel,
  riskLevel,
  riskSummary,
  pedagogicalNotes = [],
  selectedZoneName,
  selectedZoneMmiRoman,
  selectedZoneMmiNumeric,
  selectedZoneIntensityLabel,
  selectedZoneDamageLabel,
  selectedZoneRiskLevel,
  selectedZoneFactors,
  mapPanel,
  errorMessage = null,
  onBack,
  onNext,
  backHref = '/simulasi/jalankan',
  nextHref = '/simulasi/refleksi',
}: ImpactAnalysisPageProps) {
  useEffect(() => {
    document.title = 'Simulasi Gempa: Amati Dampak';
  }, []);

  const selectedRiskBadgeClass = getRiskBadgeClass(selectedZoneRiskLevel);
  const summaryRiskBadgeClass = getRiskBadgeClass(riskLevel);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-light text-slate-900">
      <AppHeader brandIcon="tsunami" brandIconMode="badge" navItems={navItems} maxWidthClass="max-w-[1440px]" />

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="z-10 border-b border-slate-200 bg-background-light px-6 py-5 shadow-sm">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex max-w-3xl flex-col gap-2">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Step 4 of 5</p>
                  <div className="h-1.5 w-32 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-primary" style={{ width: '80%' }} />
                  </div>
                </div>
                <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] text-slate-900">Spatial Impact Analysis</h1>
                <p className="text-base text-slate-500">
                  Pilih zona pada peta untuk melihat estimasi intensitas, damage bangunan, dan level risiko yang dihitung dari engine simulasi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">{scenarioTitle}</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">Target {targetLabel}</span>
                {runLabel ? <span className="rounded-full bg-white px-3 py-1 shadow-sm">{runLabel}</span> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Intensitas Target</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">MMI {summaryMmiRoman}</p>
                <p className="text-sm text-slate-500">{intensityLabel} · nilai {summaryMmiNumeric.toFixed(1)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Damage Dasar</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{damageLabel}</p>
                <p className="text-sm text-slate-500">Digunakan sebagai indikator pedagogis awal.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Risk Level</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-bold uppercase ${summaryRiskBadgeClass}`}>
                  {riskLevel}
                </span>
                <p className="mt-2 text-sm text-slate-500">{riskSummary}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catatan</p>
                <p className="mt-2 text-sm text-slate-500">
                  Klik area grid untuk membandingkan perubahan MMI dan level risiko secara spasial.
                </p>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {errorMessage}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-slate-100">
          <div className="absolute inset-0">{mapPanel}</div>

          <div className="pointer-events-none absolute bottom-6 left-6 z-10 hidden sm:block">
            <div className="min-w-[220px] rounded-lg border border-slate-200 bg-white/92 p-4 shadow-lg backdrop-blur-sm">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Impact Zones</h4>
              <div className="flex flex-col gap-2">
                {['Light Damage', 'Moderate Damage', 'Heavy Damage'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className={`size-3 rounded-full ${getImpactDotClass(item)}`} />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-6 top-6 z-20 w-full max-w-[360px] animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="relative overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
              <div className="relative h-32 w-full bg-[radial-gradient(circle_at_top,_rgba(19,91,236,0.22),_transparent_52%),linear-gradient(135deg,_rgba(15,23,42,1)_0%,_rgba(37,99,235,0.9)_100%)]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-white/80">Selected Zone</p>
                    <h3 className="text-xl font-bold leading-none text-white">{selectedZoneName}</h3>
                  </div>
                  <div className={`rounded px-2 py-1 text-xs font-bold uppercase shadow-sm ${selectedRiskBadgeClass}`}>
                    {selectedZoneRiskLevel}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-1 text-xs text-slate-500">Intensity (MMI)</p>
                    <p className="text-lg font-bold text-slate-900">
                      {selectedZoneMmiRoman} <span className="text-sm font-medium text-slate-500">({selectedZoneMmiNumeric.toFixed(1)})</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-1 text-xs text-slate-500">Est. Damage</p>
                    <p className="text-lg font-bold text-slate-900">{selectedZoneDamageLabel}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Key Impact Factors</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
                    <li>Label intensitas: {selectedZoneIntensityLabel}</li>
                    {selectedZoneFactors.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                {pedagogicalNotes.length > 0 ? (
                  <div className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm leading-7 text-slate-600">
                    <div className="mb-2 flex items-center gap-2 text-primary">
                      <MaterialIcon className="text-[18px]">psychology</MaterialIcon>
                      <span className="text-xs font-bold uppercase tracking-[0.18em]">AI Analisis Pedagogi</span>
                    </div>
                    <p>{pedagogicalNotes[0]}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-background-light px-6 py-5 shadow-[0_-8px_24px_rgba(15,23,42,0.04)]">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col-reverse justify-between gap-4 md:flex-row">
            <LinkButton label="Kembali ke Jalankan Simulasi" icon="arrow_back" variant="outline" onClick={onBack} href={backHref} />
            <LinkButton label="Lanjut ke Refleksi" icon="arrow_forward" variant="primary" onClick={onNext} href={nextHref} />
          </div>
        </div>
      </main>
    </div>
  );
}
