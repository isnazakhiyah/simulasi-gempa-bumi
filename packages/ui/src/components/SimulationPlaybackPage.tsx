import { useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { WaveTimeline } from '@simulasi-gempa/shared-types';
import { AppHeader } from './AppHeader';
import { MaterialIcon } from './MaterialIcon';

const navItems = [];

type SimulationPlaybackPageProps = {
  scenarioTitle: string;
  epicenterLabel: string;
  targetLabel: string;
  magnitude: number;
  depthKm: number;
  distanceKm: number;
  targetMmiRoman?: string;
  targetIntensityLabel?: string;
  waveTimeline: WaveTimeline | null;
  pedagogicalNotes?: string[];
  currentTime: number;
  isPlaying: boolean;
  isRunningRequest?: boolean;
  hasRunResult: boolean;
  errorMessage?: string | null;
  mapPanel?: ReactNode;
  onTogglePlayback: () => void;
  onReset: () => void;
  onRunSimulation: () => void;
  onSeek: (value: number) => void;
  onBack?: () => void;
  onNext?: () => void;
  backHref?: string;
  nextHref?: string;
  nextDisabled?: boolean;
};

type ActionButtonProps = {
  label: string;
  icon?: string;
  variant: 'ghost' | 'primary';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
};

function ActionButton({ label, icon, variant, onClick, href, disabled = false }: ActionButtonProps) {
  const className =
    variant === 'primary'
      ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'
      : 'border border-[#cfd7e7] bg-white text-[#0d121b] shadow-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${className}`}
      >
        {icon ? <MaterialIcon className="text-[18px]">{icon}</MaterialIcon> : null}
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  }

  return (
    <a
      href={disabled ? '#' : href ?? '#'}
      aria-disabled={disabled}
      onClick={
        disabled
          ? (event) => {
              event.preventDefault();
            }
          : undefined
      }
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${className}`}
    >
      {icon ? <MaterialIcon className="text-[18px]">{icon}</MaterialIcon> : null}
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

function formatPlaybackTime(value: number) {
  const seconds = Math.max(0, Math.round(value));
  return `00:${seconds.toString().padStart(2, '0')}s`;
}

function formatEventTime(value: number) {
  const seconds = Math.max(0, Math.round(value));
  return `00:${seconds.toString().padStart(2, '0')} detik`;
}

function getTimelineEventState(currentTime: number, events: WaveTimeline['events'], index: number) {
  const event = events[index];
  const nextEvent = events[index + 1];

  if (currentTime >= event.timeSec && (!nextEvent || currentTime < nextEvent.timeSec)) {
    return 'active';
  }

  if (currentTime >= event.timeSec) {
    return 'completed';
  }

  return 'upcoming';
}

function getAccentClasses(
  accent: WaveTimeline['events'][number]['accent'],
  state: 'active' | 'completed' | 'upcoming',
) {
  const isMuted = state === 'upcoming';

  if (accent === 'orange') {
    return {
      badge: isMuted ? 'bg-orange-100/60 text-orange-400' : 'bg-orange-100 text-orange-500',
      card:
        state === 'active'
          ? 'border-orange-500/30 bg-[#fff7ed]'
          : isMuted
            ? 'border-transparent opacity-50'
            : 'border-transparent',
      time: isMuted ? 'text-slate-400' : 'text-orange-500',
    };
  }

  if (accent === 'red') {
    return {
      badge: isMuted ? 'bg-red-100/60 text-red-400' : 'bg-red-100 text-red-500',
      card:
        state === 'active'
          ? 'border-red-500/30 bg-[#fef2f2]'
          : isMuted
            ? 'border-transparent opacity-50'
            : 'border-transparent',
      time: isMuted ? 'text-slate-400' : 'text-red-500',
    };
  }

  return {
    badge: isMuted ? 'bg-primary/10 text-primary/60' : 'bg-primary/10 text-primary',
    card:
      state === 'active'
        ? 'border-primary/30 bg-[#f8f9fc]'
        : isMuted
          ? 'border-transparent opacity-50'
          : 'border-transparent',
    time: isMuted ? 'text-slate-400' : 'text-primary',
  };
}

export function SimulationPlaybackPage({
  scenarioTitle,
  epicenterLabel,
  targetLabel,
  magnitude,
  depthKm,
  distanceKm,
  targetMmiRoman,
  targetIntensityLabel,
  waveTimeline,
  pedagogicalNotes = [],
  currentTime,
  isPlaying,
  isRunningRequest = false,
  hasRunResult,
  errorMessage = null,
  mapPanel,
  onTogglePlayback,
  onReset,
  onRunSimulation,
  onSeek,
  onBack,
  onNext,
  backHref = '/simulasi/parameter',
  nextHref = '/simulasi/dampak',
  nextDisabled = false,
}: SimulationPlaybackPageProps) {
  useEffect(() => {
    document.title = 'Simulasi Gempa: Jalankan Simulasi';
  }, []);

  const totalDuration = waveTimeline?.durationSec ?? 40;
  const progressPercent = useMemo(
    () => (Math.min(currentTime, totalDuration) / totalDuration) * 100,
    [currentTime, totalDuration],
  );

  const playbackSliderStyle = useMemo(
    () => ({ '--progress': `${progressPercent}%` }) as CSSProperties,
    [progressPercent],
  );

  const metrics = [
    {
      label: 'Target Pembelajaran',
      value: targetLabel,
      icon: 'location_on',
    },
    {
      label: 'Jarak Episentral',
      value: `${distanceKm.toFixed(1)} km`,
      icon: 'straighten',
    },
    {
      label: 'Intensitas Target',
      value: hasRunResult && targetMmiRoman ? `MMI ${targetMmiRoman}` : 'Belum dihitung',
      icon: 'monitoring',
      hint: hasRunResult && targetIntensityLabel ? targetIntensityLabel : undefined,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-[#0d121b]">
      <AppHeader
        brandIcon="public"
        brandTitle="Simulasi Gempa Bumi"
        navItems={navItems}
        maxWidthClass="max-w-[1440px]"
      />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center px-6 py-8 md:px-12 lg:px-20">
        <div className="mb-8 flex w-full max-w-[960px] flex-col gap-3">
          <div className="flex items-end justify-between gap-6">
            <p className="text-lg font-medium text-[#0d121b]">Langkah 3 dari 5</p>
            <span className="text-sm font-medium text-primary">60% Selesai</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#cfd7e7]">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: '60%' }}
            />
          </div>
          <p className="text-sm font-normal text-[#4c669a]">
            Simulasi Temporal: Visualisasi Perambatan Gelombang
          </p>
        </div>

        <div className="mb-6 flex w-full max-w-[960px] flex-wrap items-start justify-between gap-4">
          <div className="flex max-w-3xl flex-col gap-2">
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#0d121b] md:text-4xl">
              Propagasi Gelombang Gempa
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#4c669a]">
              Perhatikan bagaimana gelombang Primer (P) dan Sekunder (S) menyebar dari
              hiposentrum ke target simulasi. Halaman ini sekarang memakai hasil hitung
              backend, bukan animasi statis semata.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">{scenarioTitle}</span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                Magnitudo {magnitude.toFixed(1)} SR
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                Kedalaman {depthKm.toFixed(0)} km
              </span>
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                Episentrum {epicenterLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Reset"
              icon="restart_alt"
              variant="ghost"
              onClick={onReset}
              disabled={!hasRunResult}
            />
            <ActionButton
              label={isRunningRequest ? 'Menjalankan...' : 'Jalankan Simulasi'}
              icon={isRunningRequest ? 'hourglass_top' : 'play_arrow'}
              variant="primary"
              onClick={onRunSimulation}
              disabled={isRunningRequest}
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 w-full max-w-[960px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="mb-6 grid w-full max-w-[960px] grid-cols-1 gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-[#e7ebf3] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <MaterialIcon className="text-[20px]">{metric.icon}</MaterialIcon>
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  {metric.label}
                </span>
              </div>
              <p className="text-base font-bold text-[#0d121b]">{metric.value}</p>
              {metric.hint ? <p className="mt-1 text-sm text-[#4c669a]">{metric.hint}</p> : null}
            </div>
          ))}
        </div>

        <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-xl border border-[#e7ebf3] bg-white shadow-sm">
          <div className="relative h-[480px] w-full overflow-hidden bg-[#eef2f6]">
            {mapPanel ?? (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(19,91,236,0.16),_transparent_45%),linear-gradient(135deg,_#f8fafc,_#dbeafe)] px-6 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-900">Peta propagasi belum tersedia</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Jalankan simulasi untuk menampilkan episentrum, target, dan radius gelombang.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6">
            <div className="mb-6 flex items-center gap-4">
              <button
                type="button"
                onClick={onTogglePlayback}
                disabled={!hasRunResult}
                className="text-[#0d121b] transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <MaterialIcon className="!text-[32px]">
                  {isPlaying ? 'pause_circle' : 'play_circle'}
                </MaterialIcon>
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  step={0.1}
                  value={Math.min(currentTime, totalDuration)}
                  onChange={(event) => onSeek(Number(event.target.value))}
                  className="playback-slider h-6 w-full cursor-pointer"
                  style={playbackSliderStyle}
                  disabled={!hasRunResult}
                />
              </div>

              <span className="w-20 text-right text-sm font-medium text-[#0d121b]">
                {formatPlaybackTime(currentTime)}
              </span>
            </div>

            {hasRunResult && waveTimeline ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#e7ebf3] bg-[#f8f9fc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Timeline
                  </p>
                  <p className="mt-2 text-sm text-[#4c669a]">
                    P-wave {formatPlaybackTime(waveTimeline.pArrivalSec)}
                  </p>
                  <p className="text-sm text-[#4c669a]">
                    S-wave {formatPlaybackTime(waveTimeline.sArrivalSec)}
                  </p>
                  <p className="text-sm text-[#4c669a]">
                    Durasi {waveTimeline.durationSec.toFixed(1)} detik
                  </p>
                </div>
                <div className="rounded-xl border border-[#e7ebf3] bg-[#f8f9fc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Interpretasi
                  </p>
                  <p className="mt-2 text-sm text-[#4c669a]">
                    Gelombang P memberi sinyal awal, sedangkan gelombang S hadir lebih
                    lambat namun lebih kuat terhadap struktur.
                  </p>
                </div>
                <div className="rounded-xl border border-[#e7ebf3] bg-[#f8f9fc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Intensitas Target
                  </p>
                  <p className="mt-2 text-lg font-bold text-[#0d121b]">
                    {targetMmiRoman ? `MMI ${targetMmiRoman}` : '—'}
                  </p>
                  <p className="text-sm text-[#4c669a]">
                    {targetIntensityLabel ?? 'Belum tersedia'}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-[auto_1fr] gap-4">
              <div className="flex flex-col items-center pt-2">
                {(waveTimeline?.events ?? []).map((event, index, array) => {
                  const state = getTimelineEventState(currentTime, array, index);
                  const accentClass = getAccentClasses(event.accent, state);

                  return (
                    <div key={event.key} className="flex flex-col items-center">
                      <div className={`flex size-6 items-center justify-center rounded-full ${accentClass.badge}`}>
                        <MaterialIcon className="!text-[18px]">{event.icon}</MaterialIcon>
                      </div>
                      {index < array.length - 1 ? <div className="h-12 w-0.5 bg-[#e7ebf3]" /> : null}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-6 py-1">
                {(waveTimeline?.events ?? []).map((event, index, array) => {
                  const state = getTimelineEventState(currentTime, array, index);
                  const accentClass = getAccentClasses(event.accent, state);

                  return (
                    <div
                      key={event.key}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-all ${accentClass.card}`}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-[#0d121b]">{event.title}</h4>
                        <p className="text-xs text-[#4c669a]">{event.description}</p>
                      </div>
                      <span className={`text-sm font-bold ${accentClass.time}`}>
                        {formatEventTime(event.timeSec)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {pedagogicalNotes.length > 0 ? (
              <div className="mt-8 rounded-xl border border-primary/15 bg-primary/5 p-5">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <MaterialIcon className="text-[18px]">auto_awesome</MaterialIcon>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">
                    Catatan Pedagogis
                  </p>
                </div>
                <ul className="space-y-2 pl-4 text-sm leading-7 text-[#4c669a]">
                  {pedagogicalNotes.map((note) => (
                    <li key={note} className="list-disc">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex w-full max-w-[960px] justify-between gap-4">
          <ActionButton
            label="Kembali"
            icon="arrow_back"
            variant="ghost"
            onClick={onBack}
            href={backHref}
          />
          <ActionButton
            label="Lanjut ke Analisis Dampak"
            icon="arrow_forward"
            variant="primary"
            onClick={onNext}
            href={nextHref}
            disabled={nextDisabled}
          />
        </div>
      </main>
    </div>
  );
}