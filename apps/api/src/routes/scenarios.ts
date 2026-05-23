import { Router, type Response } from 'express';
import {
  createCustomScenario,
  createScenarioFromEvent,
  getScenarioById,
  updateScenarioParameters,
} from '../services/scenario.service.js';
import {
  getLatestSimulationRun,
  getSimulationRunById,
  runScenarioSimulation,
} from '../services/simulation-run.service.js';
import { askPedagogyAssistant } from '../services/pedagogy-assistant.service.js';
import {
  validateCreateCustomPayload,
  validateCreateFromEventPayload,
  validateUpdateScenarioParametersPayload,
} from '../validators/scenario.validator.js';

const router = Router();

function sendError(res: Response, error: unknown) {
  const statusCode =
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? ((error as { statusCode: number }).statusCode ?? 500)
      : 500;

  const message = error instanceof Error ? error.message : 'Internal server error';
  return res.status(statusCode).json({ message });
}

router.get('/ping', (_req, res) => {
  return res.json({ ok: true, route: 'scenarios' });
});

router.get('/runs/:runId', async (req, res) => {
  try {
    const run = await getSimulationRunById(req.params.runId);
    return res.json(run);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/runs/:runId/pedagogy-chat', async (req, res) => {
  try {
    const question = typeof req.body?.question === 'string' ? req.body.question : '';
    const reply = await askPedagogyAssistant(req.params.runId, question);
    return res.json(reply);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/from-event', async (req, res) => {
  try {
    const payload = validateCreateFromEventPayload(req.body);
    const scenario = await createScenarioFromEvent(payload);
    return res.status(201).json(scenario);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/custom', async (req, res) => {
  try {
    const payload = validateCreateCustomPayload(req.body);
    const scenario = await createCustomScenario(payload);
    return res.status(201).json(scenario);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/:id/run', async (req, res) => {
  try {
    const run = await runScenarioSimulation(req.params.id);
    return res.status(201).json(run);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/:id/runs/latest', async (req, res) => {
  try {
    const run = await getLatestSimulationRun(req.params.id);
    return res.json(run);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const scenario = await getScenarioById(req.params.id);
    return res.json(scenario);
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch('/:id/parameters', async (req, res) => {
  try {
    const payload = validateUpdateScenarioParametersPayload(req.body);
    const scenario = await updateScenarioParameters(req.params.id, payload);
    return res.json(scenario);
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;