import { useEffect, type ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { FieldInfo } from './FieldInfo';
import { MaterialIcon } from './MaterialIcon';
import { RangeControl } from './RangeControl';

const navItems = [];

const defaultPresetOptions = [
  { value: 'banda_aceh', label: 'Banda Aceh, Indonesia' },
  { value: 'padang', label: 'Padang, Indonesia' },
  { value: 'yogyakarta', label: 'Yogyakarta, Indonesia' },
  { value: 'palu', label: 'Palu, Indonesia' },
  { value: 'custom', label: 'Custom (Pilih di Peta)' },
];

export type ParameterSettingsPresetOption = {
  value: string;
  label: string;
};

export type ParameterSettingsPageProps = {
  progressStepText?: string;
  progressTitle?: string;
  progressPercent?: number;
  scenarioTitle?: string;
  modeLabel?: string;
  saveStateLabel?: string;
  datasetLabel?: string;
  datasetDescription?: ReactNode;
  errorMessage?: string | null;
  presetOptions?: ParameterSettingsPresetOption[];
  selectedPreset?: string;
  onPresetChange?: (value: string) => void;
  magnitude?: number;
  onMagnitudeChange?: (value: number) => void;
  depthKm?: number;
  onDepthChange?: (value: number) => void;
  targetLabel?: string;
  distanceKm?: number;
  siteFactor?: number;
  buildingProfileLabel?: string;
  statusMessage?: ReactNode;
  mapPanel?: ReactNode;
  backLabel?: string;
  nextLabel?: string;
  backHref?: string;
  nextHref?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
};

type ActionButtonProps = {
  label: string;
  variant: 'outline' | 'primary';
  href?: string;
  onClick?: () => void;
  icon?: string;
  disabled?: boolean;
};

function ActionButton({ label, variant, href, onClick, icon, disabled = false }: ActionButtonProps) {
  const baseClassName =
    'flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-base transition-colors';

  const variantClassName =
    variant === 'primary'
      ? 'bg-primary font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60'
      : 'border border-border-light font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${baseClassName} ${variantClassName}`}
      >
        <span>{label}</span>
        {icon ? <MaterialIcon className="text-[18px]">{icon}</MaterialIcon> : null}
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
      className={`${baseClassName} ${variantClassName} ${disabled ? 'pointer-events-none opacity-60' : ''}`.trim()}
    >
      <span>{label}</span>
      {icon ? <MaterialIcon className="text-[18px]">{icon}</MaterialIcon> : null}
    </a>
  );
}

export function ParameterSettingsPage({
  progressStepText = 'Langkah 2 dari 5',
  progressTitle = 'Parameter Gempa',
  progressPercent = 40,
  scenarioTitle = 'Skenario Gempa Baru',
  modeLabel = 'Siap dikonfigurasi',
  saveStateLabel = 'Siap disunting',
  datasetLabel = 'Skenario aktif',
  datasetDescription = 'Sesuaikan parameter gempa dan lokasi target sebelum menjalankan simulasi.',
  errorMessage = null,
  presetOptions = defaultPresetOptions,
  selectedPreset,
  onPresetChange,
  magnitude = 5.5,
  onMagnitudeChange,
  depthKm = 30,
  onDepthChange,
  targetLabel = 'Banda Aceh, Indonesia',
  distanceKm,
  siteFactor,
  buildingProfileLabel,
  statusMessage,
  mapPanel,
  backLabel = 'Kembali',
  nextLabel = 'Lanjut',
  backHref = '/simulasi',
  nextHref = '/simulasi/jalankan',
  onBack,
  onNext,
  nextDisabled = false,
}: ParameterSettingsPageProps) {
  useEffect(() => {
    document.title = 'Simulasi Gempa - Parameter Setting';
  }, []);

  const resolvedPresetValue = selectedPreset ?? presetOptions[0]?.value ?? 'custom';
  const normalizedProgress = Math.max(0, Math.min(100, progressPercent));

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-main">
      <AppHeader brandIcon="tsunami" brandIconMode="badge" navItems={navItems} maxWidthClass="max-w-[1440px]" />

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 lg:px-8">
        <section className="flex w-full flex-col gap-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500">{progressStepText}</p>
              <h1 className="text-[24px] font-bold tracking-tight text-text-main sm:text-[28px]">{progressTitle}</h1>
            </div>
            <p className="hidden text-sm font-semibold text-primary sm:block">{normalizedProgress}% Selesai</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-primary" style={{ width: `${normalizedProgress}%` }} />
          </div>
        </section>

        <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="w-full shrink-0 lg:w-[388px]">
            <div className="flex h-full min-h-[720px] flex-col rounded-[28px] border border-border-light bg-surface-light p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-3 text-[20px] font-bold text-text-main">Atur Parameter</h2>
                <p className="max-w-[280px] text-sm leading-8 text-text-secondary-light">
                  Sesuaikan variabel di bawah ini untuk mensimulasikan kondisi gempa bumi yang berbeda dan amati dampaknya.
                </p>
              </div>

              <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{datasetLabel}</p>
                    <h3 className="mt-1 text-base font-bold text-text-main">{scenarioTitle}</h3>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-sm">{saveStateLabel}</span>
                </div>

                <div className="space-y-1 text-sm text-text-secondary-light">
                  <p>Mode: {modeLabel}</p>
                  <p>
                    Target: {targetLabel}
                    {typeof distanceKm === 'number' ? ` · Jarak ${distanceKm.toFixed(1)} km` : ''}
                  </p>
                  {typeof siteFactor === 'number' || buildingProfileLabel ? (
                    <p>
                      {buildingProfileLabel ? `Profil: ${buildingProfileLabel}` : 'Profil bangunan default'}
                      {typeof siteFactor === 'number' ? ` · Faktor situs ${siteFactor.toFixed(1)}` : ''}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 rounded-2xl bg-white/80 px-3 py-3 text-sm leading-7 text-text-secondary-light shadow-sm backdrop-blur-sm">
                  {datasetDescription}
                </div>
              </div>

              {errorMessage ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-1 flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
                    <MaterialIcon className="text-[20px] text-primary">pin_drop</MaterialIcon>
                    <span>Lokasi Preset</span>
                    <FieldInfo text="Pilih lokasi rawan gempa untuk memuat titik target awal, atau pilih mode custom lalu klik peta di panel kanan." />
                  </label>

                  <div className="relative">
                    <select
                      value={resolvedPresetValue}
                      onChange={(event) => onPresetChange?.(event.target.value)}
                      className="w-full appearance-none rounded-2xl border border-border-light bg-background-light px-4 py-3 pr-10 text-sm font-medium text-text-main outline-none transition-shadow focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {presetOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <MaterialIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                      expand_more
                    </MaterialIcon>
                  </div>
                </div>

                <RangeControl
                  icon="analytics"
                  label="Magnitudo (SR)"
                  infoText="Besaran energi yang dilepaskan saat gempa terjadi. Ubah nilai ini untuk membandingkan dampak pada skenario pembelajaran."
                  min={1}
                  max={10}
                  step={0.1}
                  value={magnitude}
                  onChange={(value) => onMagnitudeChange?.(value)}
                  formatValue={(value) => value.toFixed(1)}
                  tickLabels={['1.0', '5.0', '10.0']}
                />

                <RangeControl
                  icon="vertical_align_center"
                  label="Kedalaman (km)"
                  infoText="Jarak vertikal antara hiposenter dan permukaan bumi. Nilai ini memengaruhi jangkauan getaran pada simulasi."
                  min={0}
                  max={700}
                  step={10}
                  value={depthKm}
                  onChange={(value) => onDepthChange?.(value)}
                  formatValue={(value) => `${value.toFixed(0)} km`}
                  tickLabels={['0', '350', '700']}
                />

                {statusMessage ? (
                  <div className="rounded-2xl border border-border-light bg-background-light px-4 py-3 text-sm leading-7 text-text-secondary-light">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      <MaterialIcon className="text-[16px]">info</MaterialIcon>
                      <span>Catatan simulasi</span>
                    </div>
                    <div>{statusMessage}</div>
                  </div>
                ) : null}
              </div>

              <div className="mt-10 border-t border-border-light pt-6">
                <div className="flex gap-3">
                  <ActionButton label={backLabel} variant="outline" href={backHref} onClick={onBack} />
                  <ActionButton
                    label={nextLabel}
                    variant="primary"
                    href={nextHref}
                    onClick={onNext}
                    icon="arrow_forward"
                    disabled={nextDisabled}
                  />
                </div>
              </div>
            </div>
          </aside>

          <section className="relative min-h-[540px] flex-1 overflow-hidden rounded-[28px] border border-border-light bg-surface-light shadow-sm lg:min-h-[720px]">
            {mapPanel ?? (
              <div className="flex h-full min-h-[540px] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(19,91,236,0.12),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(240,244,255,0.8))] px-6 text-center lg:min-h-[720px]">
                <div className="max-w-lg">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MaterialIcon className="text-[34px]">map</MaterialIcon>
                  </div>
                  <h3 className="mt-5 text-2xl font-bold text-text-main">Panel peta interaktif</h3>
                  <p className="mt-3 text-sm leading-8 text-text-secondary-light">
                    Komponen peta dapat ditempatkan di area ini untuk memilih lokasi target, menampilkan episenter, dan memvisualisasikan jarak simulasi secara langsung.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
