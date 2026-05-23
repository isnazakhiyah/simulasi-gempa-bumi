import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { getCatalogEventById, listCatalogEvents } from '../services/catalog.service.js';
import { sendError } from '../lib/http.js';

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  minMag: z.coerce.number().optional(),
  maxMag: z.coerce.number().optional(),
  minDepth: z.coerce.number().optional(),
  maxDepth: z.coerce.number().optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  page: z.coerce.number().int().optional(),
  limit: z.coerce.number().int().optional(),
});

const paramsSchema = z.object({
  id: z.string().uuid('ID event tidak valid'),
});

export function createCatalogRouter(): Router {
  const router = createRouter();

  router.get('/events', async (request, response) => {
    const parsedQuery = listQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return sendError(response, 400, 'INVALID_QUERY', 'Parameter filter katalog tidak valid.', parsedQuery.error.flatten());
    }

    try {
      const payload = await listCatalogEvents(parsedQuery.data);
      return response.json(payload);
    } catch (error) {
      console.error('Gagal mengambil katalog gempa:', error);
      return response.status(500).json({
        error: String(error),
      });
    }
  });

  router.get('/events/:id', async (request, response) => {
    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      return sendError(response, 400, 'INVALID_EVENT_ID', 'ID event tidak valid.', parsedParams.error.flatten());
    }

    try {
      const event = await getCatalogEventById(parsedParams.data.id);

      if (!event) {
        return sendError(response, 404, 'EVENT_NOT_FOUND', 'Event gempa tidak ditemukan.');
      }

      return response.json(event);
    } catch (error) {
      console.error('Gagal mengambil detail event:', error);
      return sendError(response, 500, 'EVENT_FETCH_FAILED', 'Gagal mengambil detail event gempa.');
    }
  });

  return router;
}
