import { useEffect, type RefObject } from 'react';
import { MaterialIcon } from './MaterialIcon';

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

type ReflectionMitigationPageProps = {
  exportRef: RefObject<HTMLDivElement | null>;
  scenarioTitle: string;
  targetLabel: string;
  buildingProfileLabel: string;
  magnitude: number;
  depthKm: number;
  durationSec: number;
  mmiRoman: string;
  mmiNumeric: number;
  intensityLabel: string;
  damageLabel: string;
  structureStatus: string;
  driftRatio: number;
  collapseRisk: string;
  riskSummary: string;
  pedagogicalExplanation: string;
  pedagogicalNotes: string[];
  aiMessages: ChatMessage[];
  aiSuggestions: string[];
  aiInput: string;
  isAiLoading: boolean;
  isExportingPdf: boolean;
  onAiInputChange: (value: string) => void;
  onAiSubmit: () => void;
  onAiSuggestionClick: (value: string) => void;
  onDownloadPdf: () => void;
  onBack?: () => void;
  backHref?: string;
};

function getRiskBadgeClass(level: string) {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-700';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-700';
    case 'high':
      return 'bg-orange-100 text-orange-700';
    case 'very_high':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function ReflectionMitigationPage({
  exportRef,
  scenarioTitle,
  targetLabel,
  buildingProfileLabel,
  magnitude,
  depthKm,
  durationSec,
  mmiRoman,
  mmiNumeric,
  intensityLabel,
  damageLabel,
  structureStatus,
  driftRatio,
  collapseRisk,
  riskSummary,
  pedagogicalExplanation,
  pedagogicalNotes,
  aiMessages,
  aiSuggestions,
  aiInput,
  isAiLoading,
  isExportingPdf,
  onAiInputChange,
  onAiSubmit,
  onAiSuggestionClick,
  onDownloadPdf,
  onBack,
  backHref = '/simulasi/dampak',
}: ReflectionMitigationPageProps) {
  useEffect(() => {
    document.title = 'Simulasi Gempa - Refleksi & Mitigasi';
  }, []);

  return (
    <div className="min-h-screen bg-background-light text-slate-900">
      <div
        ref={exportRef}
        className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-6 md:px-8"
      >
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-tight md:text-3xl">
                Refleksi & Mitigasi Bencana
              </h1>
              <p className="text-sm text-slate-500">
                Hasil refleksi otomatis berdasarkan skenario dan run simulasi yang baru saja
                dijalankan.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-bold">Langkah 5/5</p>
              <p className="text-xs text-slate-500">Selesai</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-full w-full rounded-full bg-primary" />
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <MaterialIcon className="text-primary">domain</MaterialIcon>
                Ringkasan Skenario
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Judul</span>
                  <span className="text-right font-medium">{scenarioTitle}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Target</span>
                  <span className="text-right font-medium">{targetLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Tipe Bangunan</span>
                  <span className="text-right font-medium">{buildingProfileLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Magnitudo</span>
                  <span className="font-medium">{magnitude.toFixed(1)} SR</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Kedalaman</span>
                  <span className="font-medium">{depthKm.toFixed(0)} km</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Durasi</span>
                  <span className="font-medium">{durationSec.toFixed(1)} detik</span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <h4 className="mb-3 text-sm font-semibold">Intensitas & Risiko</h4>
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">MMI</p>
                    <p className="text-lg font-bold">
                      {mmiRoman}{' '}
                      <span className="text-sm font-medium text-slate-500">
                        ({mmiNumeric.toFixed(1)})
                      </span>
                    </p>
                    <p className="text-sm text-slate-500">{intensityLabel}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Damage</p>
                    <p className="text-lg font-bold">{damageLabel}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Collapse Risk</p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${getRiskBadgeClass(collapseRisk)}`}
                    >
                      {collapseRisk}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 p-4">
                <h3 className="flex items-center gap-2 text-base font-bold">
                  <MaterialIcon className="text-orange-500">grid_view</MaterialIcon>
                  Visualisasi Dampak
                </h3>
              </div>

              <div className="flex-1 p-5">
                <div className="relative overflow-hidden rounded-xl bg-[radial-gradient(circle_at_top,_rgba(19,91,236,0.18),_transparent_40%),linear-gradient(135deg,_#dbeafe,_#f8fafc)] p-8 shadow-inner">
                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getRiskBadgeClass(collapseRisk)}`}
                    >
                      {collapseRisk}
                    </span>
                  </div>

                  <div className="mx-auto flex aspect-video max-w-xl items-center justify-center rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MaterialIcon className="text-[40px]">apartment</MaterialIcon>
                      </div>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Status Struktur
                      </p>
                      <p className="mt-1 text-2xl font-bold">{structureStatus}</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Drift Ratio: {driftRatio.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Interpretasi pedagogis</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {pedagogicalExplanation}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Ringkasan risiko</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{riskSummary}</p>
                  </div>
                </div>

                {pedagogicalNotes.length > 0 ? (
                  <div className="mt-5 rounded-lg border border-primary/10 bg-primary/5 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      Catatan untuk kelas
                    </p>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
                      {pedagogicalNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
              <div className="border-b border-primary/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <MaterialIcon className="text-lg">psychology</MaterialIcon>
                  </div>
                  <div>
                    <h3 className="text-base font-bold">AI Analisis Pedagogi</h3>
                    <p className="text-xs font-medium text-primary">Asisten Guru Sains</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {aiMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-lg p-4 text-sm leading-7 shadow-sm ${
                      message.role === 'assistant'
                        ? 'rounded-tl-none border border-slate-100 bg-white text-slate-700'
                        : 'rounded-tr-none bg-primary text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}

                {isAiLoading ? (
                  <div className="rounded-lg rounded-tl-none border border-slate-100 bg-white p-4 text-sm text-slate-500 shadow-sm">
                    AI sedang menyiapkan jawaban...
                  </div>
                ) : null}
              </div>

              <div className="border-t border-primary/10 p-5">
                <div className="mb-3 flex flex-wrap gap-2">
                  {aiSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onAiSuggestionClick(item)}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <textarea
                  value={aiInput}
                  onChange={(event) => onAiInputChange(event.target.value)}
                  rows={4}
                  placeholder="Tulis pertanyaan tentang hasil simulasi..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-primary"
                />

                <button
                  type="button"
                  onClick={onAiSubmit}
                  disabled={isAiLoading}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-60"
                >
                  <MaterialIcon className="text-[18px]">send</MaterialIcon>
                  Kirim ke AI
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse justify-end gap-4 border-t border-slate-200 pt-6 md:flex-row">
          <a
            href={backHref}
            onClick={
              onBack
                ? (event) => {
                    event.preventDefault();
                    onBack();
                  }
                : undefined
            }
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            <MaterialIcon className="text-xl">arrow_back</MaterialIcon>
            Kembali
          </a>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-60"
          >
            <MaterialIcon className="text-xl">
              {isExportingPdf ? 'hourglass_top' : 'download'}
            </MaterialIcon>
            {isExportingPdf ? 'Membuat PDF...' : 'Simpan Refleksi'}
          </button>
        </div>
      </div>
    </div>
  );
}