import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SimulationPlaybackPage as PlaybackLayout } from '@simulasi-gempa/ui';
import type { ScenarioDetail, SimulationRunDetail } from '@simulasi-gempa/shared-types';
import {
  getLatestSimulationRun,
  getScenarioById,
  getSimulationRunById,
  runScenarioSimulation,
} from '../api/scenarios';
import WavePropagationMap from '../components/WavePropagationMap';

function buildEpicenterLabel(scenario: ScenarioDetail) {
  return `${scenario.parameters.epicenterLat.toFixed(3)}, ${scenario.parameters.epicenterLon.toFixed(3)}`;
}

function isNoRunYetError(message: string) {
  return message.toLowerCase().includes('belum ada hasil run');
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4">
      <div className="w-full max-w-md rounded-3xl border border-border-light bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[30px]">hourglass_top</span>
        </div>
        <h1 className="text-xl font-bold text-text-main">Memuat halaman simulasi...</h1>
        <p className="mt-3 text-sm leading-7 text-text-secondary-light">
          Sistem sedang mengambil parameter skenario dan hasil run terbaru dari backend.
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
          <h1 className="text-xl font-bold">Halaman simulasi belum bisa dibuka</h1>
        </div>
        <p className="text-sm leading-7 text-slate-700">{message}</p>
      </div>
    </div>
  );
}

export default function SimulationPlaybackPageContainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');
  const runIdFromQuery = searchParams.get('runId');

  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [run, setRun] = useState<SimulationRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRunningRequest, setIsRunningRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenarioId) {
      setError('scenarioId tidak ditemukan di URL. Kembali ke langkah parameter untuk memilih skenario.');
      setLoading(false);
      return;
    }

    const currentScenarioId = scenarioId;
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const scenarioPromise = getScenarioById(currentScenarioId);
        const runPromise = runIdFromQuery
          ? getSimulationRunById(runIdFromQuery)
          : getLatestSimulationRun(currentScenarioId);

        const nextScenario = await scenarioPromise;
        let nextRun: SimulationRunDetail | null = null;

        try {
          nextRun = await runPromise;
        } catch (runError) {
          const message = runError instanceof Error ? runError.message : 'Gagal mengambil hasil run.';
          if (!isNoRunYetError(message)) {
            throw runError;
          }
        }

        if (cancelled) return;

        setScenario(nextScenario);
        setRun(nextRun);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat halaman simulasi.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [runIdFromQuery, scenarioId]);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [run?.id]);

  useEffect(() => {
    if (!isPlaying || !run?.summary) return;

    const totalDuration = run.summary.waveTimeline.durationSec;

    const intervalId = window.setInterval(() => {
      setCurrentTime((previous) => {
        const nextValue = Math.min(totalDuration, previous + 0.2);

        if (nextValue >= totalDuration) {
          window.clearInterval(intervalId);
          setIsPlaying(false);
        }

        return nextValue;
      });
    }, 150);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, run?.summary]);

  const summary = run?.summary ?? null;
  const canGoNext = Boolean(run && summary);

  const errorBanner = useMemo(() => {
    if (!error || !scenario) return null;
    return error;
  }, [error, scenario]);

  async function handleRunSimulation() {
    if (!scenarioId) return;

    try {
      setIsRunningRequest(true);
      setError(null);
      setIsPlaying(false);
      setCurrentTime(0);

      const nextRun = await runScenarioSimulation(scenarioId);
      setRun(nextRun);
      navigate(`/simulasi/jalankan?scenarioId=${scenarioId}&runId=${nextRun.id}`, { replace: true });
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Gagal menjalankan simulasi.');
    } finally {
      setIsRunningRequest(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error && !scenario) {
    return <ErrorState message={error} />;
  }

  if (!scenarioId || !scenario) {
    return <ErrorState message="Data scenario tidak tersedia." />;
  }

  return (
    <PlaybackLayout
      scenarioTitle={scenario.title}
      epicenterLabel={buildEpicenterLabel(scenario)}
      targetLabel={scenario.parameters.targetLabel}
      magnitude={scenario.parameters.magnitude}
      depthKm={scenario.parameters.depthKm}
      distanceKm={scenario.parameters.distanceKm}
      targetMmiRoman={summary?.target.mmiRoman}
      targetIntensityLabel={summary?.target.intensityLabel}
      waveTimeline={summary?.waveTimeline ?? null}
      pedagogicalNotes={summary?.pedagogicalNotes ?? []}
      currentTime={currentTime}
      isPlaying={isPlaying}
      isRunningRequest={isRunningRequest}
      hasRunResult={Boolean(summary)}
      errorMessage={errorBanner}
      mapPanel={
        <WavePropagationMap
          epicenterLat={scenario.parameters.epicenterLat}
          epicenterLon={scenario.parameters.epicenterLon}
          targetLat={scenario.parameters.targetLat}
          targetLon={scenario.parameters.targetLon}
          targetLabel={scenario.parameters.targetLabel}
          currentTime={currentTime}
          waveTimeline={summary?.waveTimeline ?? null}
        />
      }
      onTogglePlayback={() => setIsPlaying((previous) => !previous)}
      onReset={() => {
        setIsPlaying(false);
        setCurrentTime(0);
      }}
      onRunSimulation={handleRunSimulation}
      onSeek={(value) => {
        setIsPlaying(false);
        setCurrentTime(value);
      }}
      onBack={() => navigate(`/simulasi/parameter?scenarioId=${scenarioId}`)}
      onNext={() => {
        if (!run) return;
        navigate(`/simulasi/dampak?scenarioId=${scenarioId}&runId=${run.id}`);
      }}
      backHref={`/simulasi/parameter?scenarioId=${scenarioId}`}
      nextHref={run ? `/simulasi/dampak?scenarioId=${scenarioId}&runId=${run.id}` : '#'}
      nextDisabled={!canGoNext || isRunningRequest}
    />
  );
}