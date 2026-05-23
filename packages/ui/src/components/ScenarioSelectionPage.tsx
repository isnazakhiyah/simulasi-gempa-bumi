import { useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { HistoricCatalogPanel } from './HistoricCatalogPanel';
import { MaterialIcon } from './MaterialIcon';
import { ScenarioModeCard } from './ScenarioModeCard';

const navItems = [];

const realFeatures = [
  { icon: 'calendar_today', label: 'Filter Tanggal Kejadian' },
  { icon: 'location_on', label: 'Pilih Wilayah Terdampak' },
  { icon: 'waves', label: 'Analisis Magnitudo & Kedalaman' },
];

const customDetails = [
  {
    label: 'Lokasi Target',
    value: 'Pilih Peta',
    valueClassName: 'text-primary',
  },
  { label: 'Magnitudo', value: '2.0 - 9.5 SR' },
  { label: 'Kedalaman', value: '10 - 700 km' },
];

export type ScenarioSelectionPageProps = {
  onSelectCatalogEvent?: (eventItem: any) => void | Promise<void>;
  onCreateCustomScenario?: () => void | Promise<void>;
};

export function ScenarioSelectionPage({
  onSelectCatalogEvent,
  onCreateCustomScenario,
}: ScenarioSelectionPageProps) {
  useEffect(() => {
    document.title = 'Simulasi Gempa - Pilih Skenario';
  }, []);

  async function handleCreateCustomScenarioClick() {
    if (!onCreateCustomScenario) return;
    await onCreateCustomScenario();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-text-main">
      <AppHeader
        brandIcon="public"
        navItems={navItems}
        maxWidthClass="max-w-[1200px]"
      />

      <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 flex w-full max-w-3xl flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-base font-medium text-text-main">
              Langkah 1 dari 5
            </p>
            <p className="hidden text-sm font-normal text-text-secondary-light sm:block">
              Pemilihan Skenario
            </p>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/5 rounded-full bg-primary" />
          </div>

          <p className="text-sm font-normal text-text-secondary-light sm:hidden">
            Pemilihan Skenario
          </p>
        </div>

        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-text-main md:text-4xl">
            Pilih Mode Simulasi
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary-light">
            Mulai simulasi dengan memilih data gempa nyata dari BMKG atau buat
            skenario hipotetik untuk pembelajaran kustom.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          <ScenarioModeCard
            title="Gempa Nyata"
            description="Gunakan data historis gempa bumi yang tercatat oleh BMKG untuk analisis mendalam kejadian nyata di Indonesia."
            imageSrc="/images/scenario-real.png"
            imageAlt="Grafik pencatatan seismograf untuk data gempa nyata"
            badgeLabel="DATA BMKG"
            badgeClassName="border-primary/20 bg-white/90 text-primary"
            icon="analytics"
            buttonLabel="Eksplorasi Data"
            buttonHref="#katalog-gempa"
            features={realFeatures}
          />

          <ScenarioModeCard
            title="Skenario Hipotetik"
            description="Rancang simulasi gempa kustom untuk menguji kesiapsiagaan dan dampak potensial pada lokasi tertentu."
            imageSrc="/images/scenario-custom.png"
            imageAlt="Peta digital untuk pemilihan skenario hipotetik"
            badgeLabel="CUSTOM"
            badgeClassName="border-orange-600/20 bg-white/90 text-orange-600"
            icon="tune"
            buttonLabel="Lihat Opsi Custom"
            buttonHref="#buat-skenario-custom"
            buttonVariant="outline"
            details={customDetails}
          />
        </div>

        <section
          id="buat-skenario-custom"
          className="mt-8 rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-main">
                Mulai Skenario Hipotetik
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary-light">
                Klik tombol di bawah ini untuk membuat skenario custom awal.
                Setelah itu Anda akan diarahkan ke halaman parameter agar
                magnitudo, kedalaman, lokasi target, dan profil bangunan dapat
                langsung disesuaikan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleCreateCustomScenarioClick();
              }}
              className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!onCreateCustomScenario}
            >
              <MaterialIcon className="mr-2 text-[18px]">tune</MaterialIcon>
              Buat skenario custom sekarang
            </button>
          </div>
        </section>

        <div className="mt-10 text-center">
          <p className="flex items-center justify-center gap-2 text-sm text-text-secondary-light">
            <MaterialIcon className="text-[18px]">info</MaterialIcon>
            <span>
              Data historis lokal akan tampil setelah backend API, PostGIS, dan
              proses import CSV selesai dijalankan.
            </span>
          </p>
        </div>

        <div id="katalog-gempa">
          <HistoricCatalogPanel
            onSelectCatalogEvent={onSelectCatalogEvent}
          />
        </div>
      </main>
    </div>
  );
}