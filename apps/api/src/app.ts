import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';

import { config } from './lib/config.js';
import { sendError } from './lib/http.js';
import { createCatalogRouter } from './routes/catalog.js';
import { createHealthRouter } from './routes/health.js';
import scenariosRouter from './routes/scenarios.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function createApp() {
  const app = express();

  // =========================================
  // CORS (FIXED - PRODUCTION SAFE)
  // =========================================
  const allowedOrigins = [
    'http://localhost:5173',
    'https://simulasi-gempa-bumi-web.vercel.app',
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // allow tools like Postman / server-to-server (no origin)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  app.use(express.json());

  // =========================================
  // ROOT
  // =========================================
  app.get('/', (_request, response) => {
    response.json({
      ok: true,
      message: 'Simulasi Gempa API siap digunakan.',
      docs: {
        health: '/api/v1/health',
        catalog: '/api/v1/catalog/events',
        scenarios: '/api/v1/scenarios',
      },
    });
  });

  // =========================================
  // ROUTES
  // =========================================
  app.use('/api/v1/health', createHealthRouter());
  app.use('/api/v1/catalog', createCatalogRouter());
  app.use('/api/v1/scenarios', scenariosRouter);

  // =========================================
  // AI CHAT
  // =========================================
  app.post('/api/v1/chat', async (request, response) => {
    try {
      const { message } = request.body;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `
Anda adalah AI pedagogis simulasi bencana gempa bumi.

Jelaskan dengan bahasa sederhana dan edukatif.

Bantu mahasiswa memahami:
- mitigasi gempa bumi
- kesiapsiagaan bencana
- prosedur evakuasi
- dampak gempa bumi
- keselamatan masyarakat
            `,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      response.json({
        reply: completion.choices[0].message.content,
      });
    } catch (error) {
      console.error(error);

      response.status(500).json({
        error: 'Gagal mengambil respons AI.',
      });
    }
  });

  // =========================================
  // 404 HANDLER
  // =========================================
  app.use((_request, response) => {
    sendError(response, 404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
  });

  return app;
}