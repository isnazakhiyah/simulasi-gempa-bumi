import type { Router } from 'express';
import { Router as createRouter } from 'express';
import type { HealthResponse } from '@simulasi-gempa/shared-types';

export function createHealthRouter(): Router {
  const router = createRouter();

  router.get('/', (_request, response) => {
    const payload: HealthResponse = {
      ok: true,
      service: '@simulasi-gempa/api',
      timestamp: new Date().toISOString(),
    };

    response.json(payload);
  });

  return router;
}
