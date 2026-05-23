import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReflectionMitigationPage as ReflectionLayout } from '@simulasi-gempa/ui';
import type { ScenarioDetail, SimulationRunDetail } from '@simulasi-gempa/shared-types';
import {
  askPedagogyAssistant,
  getLatestSimulationRun,
  getScenarioById,
  getSimulationRunById,
  type PedagogyAssistantReply,
} from '../api/scenarios';

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

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

function formatBuildingProfileLabel(value: ScenarioDetail['parameters']['buildingProfileCode']) {
  if (value === 'non_reinforced_masonry') {
    return 'Konstruksi Tanpa Tulangan';
  }

  return 'Beton Bertulang Sederhana';
}

function buildStructureStatus(damageClass: string) {
  const map: Record<string, string> = {
    negligible: 'Hampir Tidak Ada Kerusakan',
    light: 'Kerusakan Ringan',
    moderate: 'Kerusakan Sedang',
    heavy: 'Kerusakan Berat',
    severe: 'Kerusakan Sangat Berat',
    collapse_prone: 'Rawan Runtuh',
  };

  return map[damageClass] ?? damageClass;
}

function buildInitialAssistantMessage(run: SimulationRunDetail | null) {
  if (!run?.summary) {
    return 'Hasil refleksi belum tersedia.';
  }

  return run.summary.buildingImpact.pedagogicalExplanation;
}

export default function ReflectionMitigationPageContainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');
  const runIdFromQuery = searchParams.get('runId');

  const exportRef = useRef<HTMLDivElement>(null);

  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [run, setRun] = useState<SimulationRunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    if (!scenarioId) {
      setError('scenarioId tidak ditemukan di URL.');
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

        if (cancelled) return;

        setScenario(nextScenario);
        setRun(nextRun);
        setChatMessages([
          {
            role: 'assistant',
            content: buildInitialAssistantMessage(nextRun),
          },
        ]);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : 'Gagal memuat halaman refleksi.',
          );
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
  const runId = run?.id ?? '';
  const scenarioIdValue = scenario?.id ?? '';

  const aiSuggestions = useMemo<string[]>(() => {
    if (!summary) return [];
    return [
      'Apa arti MMI pada hasil simulasi ini?',
      'Mengapa profil bangunan memengaruhi damage?',
      'Apa poin diskusi kelas yang cocok dari hasil ini?',
    ];
  }, [summary]);

  async function handleAskAi(customQuestion?: string) {
    if (!runId) return;

    const finalQuestion = (customQuestion ?? question).trim();
    if (!finalQuestion) return;

    setChatMessages((previous) => [...previous, { role: 'user', content: finalQuestion }]);
    setQuestion('');
    setIsAiLoading(true);

    try {
      const reply: PedagogyAssistantReply = await askPedagogyAssistant(runId, finalQuestion);
      setChatMessages((previous) => [...previous, { role: 'assistant', content: reply.answer }]);
    } catch (askError) {
      setChatMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content:
            askError instanceof Error
              ? askError.message
              : 'AI Analisis Pedagogi belum bisa menjawab saat ini.',
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!exportRef.current || !scenario || !summary || !runId) return;

    try {
      setIsExportingPdf(true);

      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let remainingHeight = imgHeight;
      let positionY = margin;

      pdf.addImage(imageData, 'PNG', margin, positionY, imgWidth, imgHeight);
      remainingHeight -= pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addPage();
        positionY = margin - (imgHeight - remainingHeight);
        pdf.addImage(imageData, 'PNG', margin, positionY, imgWidth, imgHeight);
        remainingHeight -= pageHeight - margin * 2;
      }

      pdf.save(
        `refleksi-${scenario.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${runId}.pdf`,
      );
    } finally {
      setIsExportingPdf(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <p className="text-slate-600">Memuat refleksi...</p>
      </div>
    );
  }

  if (error || !scenario || !run || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light px-4">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-red-600">Halaman refleksi belum bisa dibuka</h1>
          <p className="mt-3 text-sm text-slate-700">
            {error ?? 'Hasil refleksi belum tersedia.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReflectionLayout
      exportRef={exportRef}
      scenarioTitle={scenario.title}
      targetLabel={summary.target.label}
      buildingProfileLabel={formatBuildingProfileLabel(summary.buildingImpact.buildingProfileCode)}
      magnitude={scenario.parameters.magnitude}
      depthKm={scenario.parameters.depthKm}
      durationSec={summary.waveTimeline.durationSec}
      mmiRoman={summary.target.mmiRoman}
      mmiNumeric={summary.target.mmiNumeric}
      intensityLabel={summary.target.intensityLabel}
      damageLabel={formatDamageLabel(summary.buildingImpact.damageClass)}
      structureStatus={buildStructureStatus(summary.buildingImpact.damageClass)}
      driftRatio={summary.buildingImpact.driftRatioEstimate}
      collapseRisk={summary.buildingImpact.collapseRisk}
      riskSummary={summary.risk.summary}
      pedagogicalExplanation={summary.buildingImpact.pedagogicalExplanation}
      pedagogicalNotes={summary.pedagogicalNotes}
      aiMessages={chatMessages}
      aiSuggestions={aiSuggestions}
      aiInput={question}
      isAiLoading={isAiLoading}
      isExportingPdf={isExportingPdf}
      onAiInputChange={setQuestion}
      onAiSubmit={() => {
        void handleAskAi();
      }}
      onAiSuggestionClick={(text: string) => {
        void handleAskAi(text);
      }}
      onDownloadPdf={() => {
        void handleDownloadPdf();
      }}
      onBack={() => navigate(`/simulasi/dampak?scenarioId=${scenarioIdValue}&runId=${runId}`)}
      backHref={`/simulasi/dampak?scenarioId=${scenarioIdValue}&runId=${runId}`}
    />
  );
}