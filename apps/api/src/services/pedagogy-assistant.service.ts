import OpenAI from 'openai';
import type { ScenarioDetail, SimulationRunDetail } from '@simulasi-gempa/shared-types';
import { config } from '../lib/config.js';
import { getScenarioById } from './scenario.service.js';
import { getSimulationRunById } from './simulation-run.service.js';

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode });
}

export interface PedagogyAssistantReply {
  provider: 'openai' | 'fallback';
  model: string;
  answer: string;
  suggestions: string[];
}

function buildPrompt(scenario: ScenarioDetail, run: SimulationRunDetail, question: string) {
  const summary = run.summary;

  if (!summary) {
    throw httpError(400, 'Run simulasi belum memiliki summary hasil.');
  }

  return `
Anda adalah Asisten Guru Sains untuk platform simulasi gempa.

Aturan kerja:
1. Jawab dalam Bahasa Indonesia.
2. Jelaskan hasil simulasi dengan bahasa ilmiah yang mudah dipahami mahasiswa calon guru sains.
3. Bedakan magnitudo, intensitas, gelombang P, gelombang S, damage bangunan, dan risiko.
4. Tegaskan bahwa ini adalah simulator pembelajaran, bukan sistem operasional BMKG/USGS.
5. Akhiri jawaban dengan 2-3 pertanyaan diskusi kelas.

Data skenario:
- Judul: ${scenario.title}
- Mode: ${scenario.mode}
- Episentrum: ${scenario.parameters.epicenterLat}, ${scenario.parameters.epicenterLon}
- Target: ${scenario.parameters.targetLabel} (${scenario.parameters.targetLat}, ${scenario.parameters.targetLon})
- Magnitudo: ${scenario.parameters.magnitude}
- Kedalaman: ${scenario.parameters.depthKm} km
- Site factor: ${scenario.parameters.siteFactor}
- Profil bangunan: ${scenario.parameters.buildingProfileCode}

Data hasil run:
- MMI target: ${summary.target.mmiRoman} (${summary.target.mmiNumeric.toFixed(1)})
- Label intensitas: ${summary.target.intensityLabel}
- Jarak episentral: ${summary.target.epicentralDistanceKm.toFixed(1)} km
- Jarak hiposentral: ${summary.target.hypocentralDistanceKm.toFixed(1)} km
- Ground Motion Index: ${summary.target.groundMotionIndex.toFixed(2)}
- P-wave tiba: ${summary.waveTimeline.pArrivalSec.toFixed(1)} detik
- S-wave tiba: ${summary.waveTimeline.sArrivalSec.toFixed(1)} detik
- Durasi: ${summary.waveTimeline.durationSec.toFixed(1)} detik
- Damage class: ${summary.buildingImpact.damageClass}
- Drift ratio estimate: ${summary.buildingImpact.driftRatioEstimate.toFixed(2)}%
- Collapse risk: ${summary.buildingImpact.collapseRisk}
- Risk level: ${summary.risk.level}
- Ringkasan risiko: ${summary.risk.summary}
- Penjelasan pedagogis: ${summary.buildingImpact.pedagogicalExplanation}
- Catatan pedagogis: ${summary.pedagogicalNotes.join(' | ')}

Pertanyaan pengguna:
${question}
`.trim();
}

function buildFallbackAnswer(scenario: ScenarioDetail, run: SimulationRunDetail, question: string): PedagogyAssistantReply {
  const summary = run.summary;

  if (!summary) {
    throw httpError(400, 'Run simulasi belum memiliki summary hasil.');
  }

  const answer = [
    `Pertanyaan Anda: ${question}`,
    `Pada skenario "${scenario.title}", target ${scenario.parameters.targetLabel} menerima intensitas sekitar MMI ${summary.target.mmiRoman} (${summary.target.mmiNumeric.toFixed(1)}).`,
    `Gelombang P diperkirakan tiba pada ${summary.waveTimeline.pArrivalSec.toFixed(1)} detik dan gelombang S pada ${summary.waveTimeline.sArrivalSec.toFixed(1)} detik.`,
    `Kelas kerusakan bangunan saat ini adalah ${summary.buildingImpact.damageClass} dengan drift ratio sekitar ${summary.buildingImpact.driftRatioEstimate.toFixed(2)}%.`,
    `Hasil ini berasal dari model pedagogis internal, sehingga cocok untuk pembelajaran perbandingan skenario, bukan prediksi operasional lapangan.`,
    `Diskusikan bagaimana perubahan magnitudo, jarak, kedalaman, dan jenis bangunan akan mengubah hasil ini.`
  ].join(' ');

  return {
    provider: 'fallback',
    model: 'internal-fallback',
    answer,
    suggestions: [
      'Apa arti MMI pada target ini?',
      'Mengapa gelombang P datang lebih dulu daripada gelombang S?',
      'Bagaimana hasil akan berubah jika target lebih dekat ke episentrum?',
    ],
  };
}

export async function askPedagogyAssistant(runId: string, question: string): Promise<PedagogyAssistantReply> {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    throw httpError(400, 'Pertanyaan tidak boleh kosong.');
  }

  const run = await getSimulationRunById(runId);
  const scenario = await getScenarioById(run.scenarioId);

  if (!config.OPENAI_API_KEY) {
    return buildFallbackAnswer(scenario, run, trimmedQuestion);
  }

  const client = new OpenAI({ apiKey: config.OPENAI_API_KEY });

  const response = await client.responses.create({
    model: config.OPENAI_MODEL,
    input: [
      {
        role: 'developer',
        content: [
          {
            type: 'input_text',
            text: 'Anda adalah asisten pedagogi untuk simulasi gempa. Jawab singkat, jelas, faktual, dan dalam Bahasa Indonesia.',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: buildPrompt(scenario, run, trimmedQuestion),
          },
        ],
      },
    ],
    max_output_tokens: 900,
  });

  const answer = response.output_text?.trim();

  if (!answer) {
    return buildFallbackAnswer(scenario, run, trimmedQuestion);
  }

  return {
    provider: 'openai',
    model: config.OPENAI_MODEL,
    answer,
    suggestions: [
      'Apa arti nilai MMI pada hasil ini?',
      'Mengapa damage bangunan bisa berbeda walau magnitudo sama?',
      'Apa diskusi kelas yang cocok dari hasil simulasi ini?',
    ],
  };
}