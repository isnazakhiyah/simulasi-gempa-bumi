import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImpactAnalysisPage as ImpactLayout } from '@simulasi-gempa/ui';
import type { ImpactCellSummary, ScenarioDetail, SimulationRunDetail } from '@simulasi-gempa/shared-types';
import ImpactGridMap from '../components/ImpactGridMap';
import { getLatestSimulationRun, getScenarioById, getSimulationRunById } from '../api/scenarios';

function formatDamageLabel(value: string) {
  const map: Record<string, string> = {
    negligible: 'Sangat Ringan / Nyaris Tidak Ada',
    light: 'Ringan',
    moderate: 'Sedang',
    heavy: 'Berat',
    severe: 'Sangat Berat',
    collapse_prone: 'Rawan Runtuh',
  };

  return map[value] ?? value;
}

function buildZoneTitle(cell: ImpactCellSummary, targetCellId: string, targetLabel: string) {
  if (cell.id === targetCellId) {
    return targetLabel;
  }

  return `Zona ${cell.lat.toFixed(3)}, ${cell.lon.toFixed(3)}`;
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4">
      <div className="w-full max-w-md rounded-3xl border border-border-light bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-[30px]">hourglass_top</span>
        </div>
        <h1 className="text-xl font-bold text-text-main">Memuat analisis dampak...</h1>
        <p className="mt-3 text-sm leading-7 text-text-secondary-light">
          Sistem sedang mengambil hasil run tersimpan dan menyiapkan grid dampak spasial.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, backHref }: { message: string; backHref?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light px-4">
      <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="mb-4 flex items-center gap-3 text-red-600">
          <span className="material-symbols-outlined text-[30px]">error</span>
          <h1 className="text-xl font-bold">Analisis dampak belum bisa dibuka</h1>
        </div>
        <p className="text-sm leading-7 text-slate-700">{message}</p>
        {backHref ? (
          <a
            href={backHref}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke halaman simulasi
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function ImpactAnalysisPageContainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');
  const runIdFromQuery = searchParams.get('runId');

  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [run, setRun] = useState<SimulationRunDetail | null>(null);
  const [selectedCell, setSelectedCell] = useState<ImpactCellSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenarioId) {
      setError('scenarioId tidak ditemukan di URL. Jalankan simulasi terlebih dahulu.');
      setLoading(false);
      return;
    }

    const currentScenarioId = scenarioId;
    let cancelled = false;

    async function loadPage() {
      try {
        setLoading(true);
        setError(null);

        const nextScenario = await getScenarioById(currentScenarioId);
        const nextRun = runIdFromQuery
          ? await getSimulationRunById(runIdFromQuery)
          : await getLatestSimulationRun(currentScenarioId);

        if (cancelled) {
          return;
        }

        if (!nextRun.summary) {
          throw new Error('Run terbaru belum memiliki summary hasil simulasi.');
        }

        setScenario(nextScenario);
        setRun(nextRun);
        setSelectedCell(nextRun.summary.targetCell);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat analisis dampak.');
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

  const summary = run?.summary ?? null;
  const activeCell = selectedCell ?? summary?.targetCell ?? null;

  const selectedZoneFactors = useMemo(() => {
    if (!activeCell) {
      return [];
    }

    return [
      `MMI numerik ${activeCell.mmiNumeric.toFixed(1)} dengan label ${activeCell.intensityLabel.toLowerCase()}.`,
      `Estimasi damage kelas ${formatDamageLabel(activeCell.damageClass).toLowerCase()}.`,
      `Jarak episentral sekitar ${activeCell.epicentralDistanceKm.toFixed(1)} km dari pusat gempa.`,
    ];
  }, [activeCell]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !scenarioId || !scenario || !run || !summary || !activeCell) {
    return (
      <ErrorState
        message={error ?? 'Hasil analisis tidak tersedia. Jalankan simulasi terlebih dahulu.'}
        backHref={scenarioId ? `/simulasi/jalankan?scenarioId=${scenarioId}` : '/simulasi'}
      />
    );
  }

  return (
    <ImpactLayout
      scenarioTitle={scenario.title}
      targetLabel={summary.target.label}
      runLabel={`Run ${new Date(run.startedAt ?? Date.now()).toLocaleString('id-ID')}`}
      summaryMmiRoman={summary.target.mmiRoman}
      summaryMmiNumeric={summary.target.mmiNumeric}
      intensityLabel={summary.target.intensityLabel}
      damageLabel={formatDamageLabel(summary.buildingImpact.damageClass)}
      riskLevel={summary.risk.level}
      riskSummary={summary.risk.summary}
      pedagogicalNotes={summary.pedagogicalNotes}
      selectedZoneName={buildZoneTitle(activeCell, summary.targetCell.id, summary.target.label)}
      selectedZoneMmiRoman={activeCell.mmiRoman}
      selectedZoneMmiNumeric={activeCell.mmiNumeric}
      selectedZoneIntensityLabel={activeCell.intensityLabel}
      selectedZoneDamageLabel={formatDamageLabel(activeCell.damageClass)}
      selectedZoneRiskLevel={activeCell.riskLevel}
      selectedZoneFactors={selectedZoneFactors}
      mapPanel={
        <ImpactGridMap
          epicenterLat={scenario.parameters.epicenterLat}
          epicenterLon={scenario.parameters.epicenterLon}
          targetLat={summary.target.lat}
          targetLon={summary.target.lon}
          targetLabel={summary.target.label}
          stepKm={summary.impactGrid.stepKm}
          cells={summary.impactGrid.cells}
          selectedCellId={activeCell.id}
          onSelectCell={setSelectedCell}
        />
      }
      onBack={() => navigate(`/simulasi/jalankan?scenarioId=${scenarioId}&runId=${run.id}`)}
      onNext={() => navigate(`/simulasi/refleksi?scenarioId=${scenarioId}&runId=${run.id}`)}
      backHref={`/simulasi/jalankan?scenarioId=${scenarioId}&runId=${run.id}`}
      nextHref={`/simulasi/refleksi?scenarioId=${scenarioId}&runId=${run.id}`}
    />
  );
}
