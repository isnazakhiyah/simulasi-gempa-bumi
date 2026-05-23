import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ParameterSettingsPage as ParameterSettingsLayout } from '@simulasi-gempa/ui';
import type { BuildingProfileCode, ScenarioDetail } from '@simulasi-gempa/shared-types';
import { getScenarioById, updateScenarioParameters } from '../api/scenarios';
import TargetMapPicker from '../components/TargetMapPicker';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type FormState = {
  magnitude: number;
  depthKm: number;
  epicenterLat: number;
  epicenterLon: number;
  targetLat: number;
  targetLon: number;
  targetLabel: string;
  distanceKm: number;
  siteFactor: number;
  buildingProfileCode: BuildingProfileCode;
  targetPreset: string;
};

const TARGET_PRESETS = [
  { key: 'banda_aceh', label: 'Banda Aceh, Indonesia', lat: 5.5483, lon: 95.3238 },
  { key: 'padang', label: 'Padang, Indonesia', lat: -0.9471, lon: 100.4172 },
  { key: 'yogyakarta', label: 'Yogyakarta, Indonesia', lat: -7.7956, lon: 110.3695 },
  { key: 'palu', label: 'Palu, Indonesia', lat: -0.8986, lon: 119.8506 },
  { key: 'custom', label: 'Custom (Pilih di Peta)', lat: 0, lon: 0 },
] as const;

const BUILDING_PROFILE_LABELS: Record<BuildingProfileCode, string> = {
  non_reinforced_masonry: 'Pasangan bata tanpa tulangan',
  simple_reinforced_concrete: 'Beton bertulang sederhana',
};

function detectPresetKey(lat: number, lon: number) {
  const tolerance = 0.02;

  const preset = TARGET_PRESETS.find((item) => {
    if (item.key === 'custom') {
      return false;
    }

    return Math.abs(item.lat - lat) <= tolerance && Math.abs(item.lon - lon) <= tolerance;
  });

  return preset?.key ?? 'custom';
}

function formatSaveState(saveState: SaveState) {
  switch (saveState) {
    case 'saving':
      return 'Menyimpan...';
    case 'saved':
      return 'Tersimpan';
    case 'error':
      return 'Perlu dicek';
    case 'idle':
    default:
      return 'Siap disunting';
  }
}

function formatModeLabel(mode: ScenarioDetail['mode']) {
  return mode === 'real_event' ? 'Gempa nyata' : 'Skenario hipotetik';
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4">
      <div className="w-full max-w-md rounded-3xl border border-border-light bg-surface-light p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[30px]">hourglass_top</span>
        </div>
        <h1 className="text-xl font-bold text-text-main">Memuat parameter skenario...</h1>
        <p className="mt-3 text-sm leading-7 text-text-secondary-light">
          Sistem sedang mengambil data skenario terbaru dari backend agar panel parameter dan peta tampil sinkron.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4">
      <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-center gap-3 text-red-600">
          <span className="material-symbols-outlined text-[30px]">error</span>
          <h1 className="text-xl font-bold">Halaman parameter belum bisa dibuka</h1>
        </div>
        <p className="text-sm leading-7 text-slate-700">{message}</p>
      </div>
    </div>
  );
}

export default function SimulationParameterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');

  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  const skipAutoSaveRef = useRef(false);

  useEffect(() => {
    if (!scenarioId) {
      setError('scenarioId tidak ditemukan di URL. Kembali ke halaman simulasi lalu buat atau pilih skenario terlebih dahulu.');
      setLoading(false);
      return;
    }

    const currentScenarioId = scenarioId;
    let cancelled = false;

    async function loadScenario() {
      try {
        setLoading(true);
        setError(null);
        setSaveState('idle');

        const data = await getScenarioById(currentScenarioId);

        if (cancelled) {
          return;
        }

        const presetKey = detectPresetKey(data.parameters.targetLat, data.parameters.targetLon);

        skipAutoSaveRef.current = true;
        setScenario(data);
        setForm({
          magnitude: data.parameters.magnitude,
          depthKm: data.parameters.depthKm,
          epicenterLat: data.parameters.epicenterLat,
          epicenterLon: data.parameters.epicenterLon,
          targetLat: data.parameters.targetLat,
          targetLon: data.parameters.targetLon,
          targetLabel: data.parameters.targetLabel,
          distanceKm: data.parameters.distanceKm,
          siteFactor: data.parameters.siteFactor,
          buildingProfileCode: data.parameters.buildingProfileCode,
          targetPreset: presetKey,
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat skenario.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadScenario();

    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  useEffect(() => {
    if (!scenarioId || !form) {
      return;
    }

    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setSaveState('saving');

        const updated = await updateScenarioParameters(scenarioId, {
          epicenter: {
            lat: form.epicenterLat,
            lon: form.epicenterLon,
          },
          target: {
            lat: form.targetLat,
            lon: form.targetLon,
            label: form.targetLabel,
          },
          magnitude: form.magnitude,
          depthKm: form.depthKm,
          siteFactor: form.siteFactor,
          buildingProfile: form.buildingProfileCode,
        });

        setScenario(updated);
        setForm((previousForm) =>
          previousForm
            ? {
                ...previousForm,
                distanceKm: updated.parameters.distanceKm,
              }
            : previousForm,
        );
        setError(null);
        setSaveState('saved');
      } catch (saveError) {
        setSaveState('error');
        setError(saveError instanceof Error ? saveError.message : 'Gagal menyimpan perubahan parameter.');
      }
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    scenarioId,
    form?.magnitude,
    form?.depthKm,
    form?.epicenterLat,
    form?.epicenterLon,
    form?.targetLat,
    form?.targetLon,
    form?.targetLabel,
    form?.siteFactor,
    form?.buildingProfileCode,
  ]);

  function handlePresetChange(presetKey: string) {
    if (!form) {
      return;
    }

    if (presetKey === 'custom') {
      const presetLabels = new Set<string>(
        TARGET_PRESETS.filter((item) => item.key !== 'custom').map((item) => item.label),
      );

      const shouldReplaceLabel = form.targetLabel.trim() === '' || presetLabels.has(form.targetLabel);

      setForm({
        ...form,
        targetPreset: 'custom',
        targetLabel: shouldReplaceLabel ? 'Titik peta custom' : form.targetLabel,
      });
      return;
    }

    const preset = TARGET_PRESETS.find((item) => item.key === presetKey);
    if (!preset) {
      return;
    }

    setForm({
      ...form,
      targetPreset: preset.key,
      targetLat: preset.lat,
      targetLon: preset.lon,
      targetLabel: preset.label,
    });
  }

  function handleMapTargetChange(next: { lat: number; lon: number }) {
    if (!form) {
      return;
    }

    const presetLabels = new Set<string>(
      TARGET_PRESETS.filter((item) => item.key !== 'custom').map((item) => item.label),
    );

    const shouldReplaceLabel = form.targetLabel.trim() === '' || presetLabels.has(form.targetLabel);

    setForm({
      ...form,
      targetPreset: 'custom',
      targetLat: next.lat,
      targetLon: next.lon,
      targetLabel: shouldReplaceLabel ? 'Titik peta custom' : form.targetLabel,
    });
  }

  const datasetDescription = useMemo(() => {
    if (!scenario || !form) {
      return 'Menunggu data skenario dimuat.';
    }

    if (scenario.mode === 'real_event') {
      return `Skenario ini berasal dari event historis. Nilai awal magnitudo, kedalaman, episenter, dan target dapat Anda sesuaikan ulang untuk eksperimen pembelajaran tanpa mengubah data sumber asli.`;
    }

    return 'Skenario ini dibuat secara hipotetik. Gunakan slider dan peta untuk membandingkan beberapa kemungkinan kondisi gempa secara interaktif.';
  }, [scenario, form]);

  const statusMessage = useMemo(() => {
    if (!scenario || !form) {
      return null;
    }

    return (
      <>
        <p>
          Episenter berada pada koordinat <span className="font-semibold text-text-main">{form.epicenterLat.toFixed(3)}, {form.epicenterLon.toFixed(3)}</span>.
        </p>
        <p>
          Klik peta di panel kanan kapan saja untuk mengubah target menjadi mode custom. Dropdown lokasi preset akan otomatis kembali ke mode custom saat titik target dipindah manual.
        </p>
      </>
    );
  }, [scenario, form]);

  if (loading) {
    return <LoadingState />;
  }

  if (error && !form) {
    return <ErrorState message={error} />;
  }

  if (!scenario || !form || !scenarioId) {
    return <ErrorState message="Data skenario tidak ditemukan atau belum lengkap." />;
  }

  return (
    <ParameterSettingsLayout
      progressStepText="Langkah 2 dari 5"
      progressTitle="Parameter Gempa"
      progressPercent={40}
      scenarioTitle={scenario.title}
      modeLabel={formatModeLabel(scenario.mode)}
      saveStateLabel={formatSaveState(saveState)}
      datasetLabel="Skenario aktif"
      datasetDescription={datasetDescription}
      errorMessage={error}
      presetOptions={TARGET_PRESETS.map((item) => ({
        value: item.key,
        label: item.label,
      }))}
      selectedPreset={form.targetPreset}
      onPresetChange={handlePresetChange}
      magnitude={form.magnitude}
      onMagnitudeChange={(value) => {
        setForm({
          ...form,
          magnitude: value,
        });
      }}
      depthKm={form.depthKm}
      onDepthChange={(value) => {
        setForm({
          ...form,
          depthKm: value,
        });
      }}
      targetLabel={form.targetLabel}
      distanceKm={form.distanceKm}
      siteFactor={form.siteFactor}
      buildingProfileLabel={BUILDING_PROFILE_LABELS[form.buildingProfileCode]}
      statusMessage={statusMessage}
      mapPanel={
        <TargetMapPicker
          lat={form.targetLat}
          lon={form.targetLon}
          epicenterLat={form.epicenterLat}
          epicenterLon={form.epicenterLon}
          onChange={handleMapTargetChange}
        />
      }
      backHref="/simulasi"
      nextHref={`/simulasi/jalankan?scenarioId=${scenarioId}`}
      onBack={() => navigate('/simulasi')}
      onNext={() => navigate(`/simulasi/jalankan?scenarioId=${scenarioId}`)}
      nextDisabled={saveState === 'saving'}
    />
  );
}
