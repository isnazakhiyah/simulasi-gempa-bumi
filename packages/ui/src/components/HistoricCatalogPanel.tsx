import { useEffect, useMemo, useState } from 'react';
import type { CatalogEventSummary } from '@simulasi-gempa/shared-types';
import { fetchCatalogEvents } from '../data/catalogApi';
import { MaterialIcon } from './MaterialIcon';

type FiltersState = {
  search: string;
  minMag: string;
  yearFrom: string;
};

type HistoricCatalogPanelProps = {
  onSelectCatalogEvent?: (
    eventItem: CatalogEventSummary
  ) => void | Promise<void>;
};

const yearOptions = ['2022', '2020', '2018', '2015', '2010', '2008'];
const minMagOptions = ['3.0', '4.0', '5.0', '6.0'];

function formatEventTime(event: CatalogEventSummary) {
  if (event.eventTimeLocal) {
    const [date, time = ''] = event.eventTimeLocal.split('T');
    return `${date} ${time.slice(0, 8)}`;
  }

  return event.eventDate ?? 'Waktu tidak tersedia';
}

function magnitudeBadgeClass(magnitude: number) {
  if (magnitude >= 6) return 'bg-red-50 text-red-600 border-red-200';
  if (magnitude >= 5) return 'bg-orange-50 text-orange-600 border-orange-200';
  return 'bg-blue-50 text-primary border-blue-200';
}

export function HistoricCatalogPanel({
  onSelectCatalogEvent,
}: HistoricCatalogPanelProps) {
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    minMag: '4.0',
    yearFrom: '2020',
  });
  const [events, setEvents] = useState<CatalogEventSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectingEventId, setSelectingEventId] = useState<string | null>(null);

  const queryFilters = useMemo(
    () => ({
      search: filters.search || undefined,
      minMag: filters.minMag ? Number(filters.minMag) : undefined,
      yearFrom: filters.yearFrom ? Number(filters.yearFrom) : undefined,
      page: 1,
      limit: 8,
    }),
    [filters],
  );

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        setLoading(true);
        setError(null);

        const payload = await fetchCatalogEvents(queryFilters);

        if (!active) return;

        setEvents(payload.items);
        setTotal(payload.total);
      } catch (loadError) {
        if (!active) return;

        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Katalog gempa belum bisa dimuat.';

        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      active = false;
    };
  }, [queryFilters]);

  async function handleSelectEvent(event: CatalogEventSummary) {
    if (!onSelectCatalogEvent) {
      setSelectionError(
        'Aksi pemilihan skenario belum terhubung ke aplikasi web.',
      );
      return;
    }

    try {
      setSelectionError(null);
      setSelectingEventId(event.id);
      await onSelectCatalogEvent(event);
    } catch (selectionLoadError) {
      const message =
        selectionLoadError instanceof Error
          ? selectionLoadError.message
          : 'Gagal membuat skenario dari event katalog.';

      setSelectionError(message);
    } finally {
      setSelectingEventId(null);
    }
  }

  return (
    <section
      id="katalog-gempa"
      className="mt-12 rounded-[28px] border border-border-light bg-surface-light shadow-sm"
    >
      <div className="border-b border-border-light px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <MaterialIcon className="text-[16px]">database</MaterialIcon>
              Katalog Gempa Historis Indonesia
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-main">
              Eksplorasi data gempa nyata
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-text-secondary-light">
              Data di bawah ini berasal dari seed historis katalog gempa yang
              dapat Anda impor ke backend. Pilih satu kejadian untuk
              melanjutkan ke pengaturan parameter.
            </p>
          </div>

          <div className="rounded-2xl bg-background-light px-4 py-3 text-sm text-text-secondary-light">
            <span className="font-semibold text-text-main">
              {total.toLocaleString('id-ID')}
            </span>{' '}
            event cocok dengan filter saat ini
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr,2fr] lg:px-8">
        <aside className="rounded-2xl border border-border-light bg-background-light p-5">
          <h3 className="mb-4 text-base font-bold text-text-main">
            Filter katalog
          </h3>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-main">
                Cari wilayah / kata kunci
              </span>
              <div className="relative">
                <MaterialIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </MaterialIcon>
                <input
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Java, Banda, Sumba"
                  className="w-full rounded-xl border border-border-light bg-white py-3 pl-10 pr-4 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-main">
                Magnitudo minimum
              </span>
              <select
                value={filters.minMag}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    minMag: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {minMagOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} SR
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-main">
                Tahun mulai
              </span>
              <select
                value={filters.yearFrom}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    yearFrom: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {yearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-4 text-sm leading-7 text-text-secondary-light">
              <p className="font-semibold text-text-main">Butuh backend aktif</p>
              <p className="mt-1">
                Jalankan migrasi dan import CSV lebih dulu agar daftar event
                muncul. Detail perintah sudah saya siapkan di README fase 1.
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          {selectionError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Gagal memilih event katalog.</p>
              <p className="mt-1 leading-7">{selectionError}</p>
            </div>
          ) : null}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-border-light bg-background-light p-5"
                >
                  <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
                  <div className="mb-2 h-6 w-3/4 rounded bg-slate-200" />
                  <div className="mb-4 h-4 w-full rounded bg-slate-200" />
                  <div className="h-10 w-full rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <p className="font-semibold">Katalog belum tersedia.</p>
              <p className="mt-2 leading-7">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-border-light bg-background-light p-6 text-sm text-text-secondary-light">
              Tidak ada event yang cocok dengan filter saat ini.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {events.map((event) => {
                const isSelecting = selectingEventId === event.id;
                const isDisabled =
                  selectingEventId !== null || !onSelectCatalogEvent;

                return (
                  <article
                    key={event.id}
                    className="flex h-full flex-col rounded-2xl border border-border-light bg-background-light p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary-light">
                          {formatEventTime(event)}
                        </p>
                        <h3 className="mt-2 text-lg font-bold leading-tight text-text-main">
                          {event.regionLabel}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${magnitudeBadgeClass(
                          event.magnitude,
                        )}`}
                      >
                        M {event.magnitude.toFixed(1)}
                      </span>
                    </div>

                    <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-border-light bg-white p-3">
                        <dt className="text-text-secondary-light">
                          Kedalaman
                        </dt>
                        <dd className="mt-1 font-semibold text-text-main">
                          {event.depthKm.toFixed(0)} km
                        </dd>
                      </div>

                      <div className="rounded-xl border border-border-light bg-white p-3">
                        <dt className="text-text-secondary-light">
                          Mekanisme fokus
                        </dt>
                        <dd className="mt-1 font-semibold text-text-main">
                          {event.hasFocalMechanism ? 'Tersedia' : 'Belum ada'}
                        </dd>
                      </div>
                    </dl>

                    <button
                      type="button"
                      onClick={() => {
                        void handleSelectEvent(event);
                      }}
                      disabled={isDisabled}
                      className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-md transition ${
                        isDisabled
                          ? 'cursor-not-allowed bg-primary/60'
                          : 'bg-primary hover:bg-primary-dark'
                      }`}
                    >
                      <span>
                        {isSelecting
                          ? 'Membuat skenario...'
                          : 'Pilih skenario ini'}
                      </span>
                      <MaterialIcon className="text-[18px]">
                        arrow_forward
                      </MaterialIcon>
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}