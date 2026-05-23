import type {
  CreateCustomScenarioRequest,
  CreateScenarioFromEventRequest,
  ScenarioDetail,
  SimulationRunDetail,
  UpdateScenarioParametersRequest,
} from '@simulasi-gempa/shared-types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim() !== '') {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const maybePayload = payload as {
      message?: unknown;
      error?: {
        message?: unknown;
      };
    };

    if (typeof maybePayload.message === 'string' && maybePayload.message.trim() !== '') {
      return maybePayload.message;
    }

    if (
      maybePayload.error &&
      typeof maybePayload.error.message === 'string' &&
      maybePayload.error.message.trim() !== ''
    ) {
      return maybePayload.error.message;
    }
  }

  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error(
      'Tidak bisa terhubung ke backend API. Pastikan server backend berjalan dan URL API benar.',
    );
  }

  const rawText = await response.text();
  const parsed = rawText ? safeParseJson(rawText) : null;

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(parsed, rawText || `Request gagal dengan status ${response.status}`),
    );
  }

  if (!rawText) {
    throw new Error('Server mengembalikan response kosong.');
  }

  if (parsed === null || typeof parsed !== 'object') {
    throw new Error('Response server bukan JSON yang valid.');
  }

  return parsed as T;
}

export type PedagogyAssistantReply = {
  provider: 'openai' | 'fallback';
  model: string;
  answer: string;
  suggestions: string[];
};

export async function createScenarioFromEvent(payload: CreateScenarioFromEventRequest) {
  return request<ScenarioDetail>('/api/v1/scenarios/from-event', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createCustomScenario(payload: CreateCustomScenarioRequest) {
  return request<ScenarioDetail>('/api/v1/scenarios/custom', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getScenarioById(scenarioId: string) {
  return request<ScenarioDetail>(`/api/v1/scenarios/${scenarioId}`);
}

export async function updateScenarioParameters(
  scenarioId: string,
  payload: UpdateScenarioParametersRequest,
) {
  return request<ScenarioDetail>(`/api/v1/scenarios/${scenarioId}/parameters`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function runScenarioSimulation(scenarioId: string) {
  return request<SimulationRunDetail>(`/api/v1/scenarios/${scenarioId}/run`, {
    method: 'POST',
  });
}

export async function getLatestSimulationRun(scenarioId: string) {
  return request<SimulationRunDetail>(`/api/v1/scenarios/${scenarioId}/runs/latest`);
}

export async function getSimulationRunById(runId: string) {
  return request<SimulationRunDetail>(`/api/v1/scenarios/runs/${runId}`);
}

export async function askPedagogyAssistant(runId: string, question: string) {
  return request<PedagogyAssistantReply>(`/api/v1/scenarios/runs/${runId}/pedagogy-chat`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
}