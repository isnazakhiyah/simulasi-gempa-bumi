# Simulasi Gempa Monorepo

Monorepo React + Vite + Express untuk platform pembelajaran **Simulasi Gempa**.

Versi ini sudah memuat:
- frontend 6 screen UI
- backend awal `apps/api` untuk **fase 1**
- migrasi PostgreSQL + PostGIS
- importer katalog gempa historis dari `data/seed/katalog_gempa.csv`
- integrasi awal frontend ke katalog event nyata

## Struktur proyek

```txt
apps/
  web/                 # React Vite frontend
  api/                 # Express + TypeScript backend
packages/
  ui/                  # komponen UI reusable
  shared-types/        # contract type untuk web dan api
infra/
  docker/              # docker compose PostGIS opsional
data/
  seed/                # seed CSV katalog gempa
```

## Prasyarat

- Node.js 18+
- npm 9+
- PostgreSQL
- PostGIS **atau** Docker Desktop untuk menjalankan PostGIS terpisah

## Jalur cepat menjalankan fase 1

### 1) Install dependency

```bash
npm install
```

### 2) Siapkan environment backend

Windows PowerShell:

```powershell
Copy-Item apps\api\.env.example apps\api\.env
```

Lalu sesuaikan `DATABASE_URL` di `apps/api/.env`.

### 3) Jalankan migrasi

```bash
npm run db:migrate
```

### 4) Import katalog gempa

```bash
npm run db:seed:katalog
```

### 5) Jalankan frontend + backend

```bash
npm run dev
```

Frontend:
- `http://localhost:5173`

Backend:
- `http://localhost:3001`
- `http://localhost:3001/api/v1/health`

## Script yang tersedia

```bash
npm run dev            # web + api sekaligus
npm run dev:web        # hanya frontend
npm run dev:api        # hanya backend
npm run build          # build web + api
npm run build:web
npm run build:api
npm run db:migrate
npm run db:seed:katalog
```

## Opsi database

### Opsi A — PostgreSQL lokal yang ditambah PostGIS
Gunakan PostgreSQL lokal Anda sendiri, lalu enable extension `postgis` pada database proyek.

Contoh koneksi default:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/simulasi_gempa
```

### Opsi B — Docker PostGIS terpisah
File siap pakai:

```txt
infra/docker/docker-compose.postgis.yml
```

Jalankan:

```bash
docker compose -f infra/docker/docker-compose.postgis.yml up -d
```

Koneksi default Docker ini memakai port `5433` agar tidak bentrok dengan PostgreSQL lokal:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5433/simulasi_gempa
```

## Integrasi frontend fase 1

- `/simulasi` sekarang memuat panel **Katalog Gempa Historis**
- panel ini mengambil data dari `GET /api/v1/catalog/events`
- klik salah satu event akan menuju:

```txt
/simulasi/parameter?eventId=<uuid>
```

- halaman parameter akan melakukan prefill magnitudo, kedalaman, dan label lokasi berdasarkan event tersebut

## Endpoint fase 1

### Health

```http
GET /api/v1/health
```

### List katalog event

```http
GET /api/v1/catalog/events?search=java&minMag=5&yearFrom=2020&page=1&limit=8
```

### Detail event

```http
GET /api/v1/catalog/events/:id
```

## File penting fase 1

- `apps/api/sql/migrations/001_enable_postgis.sql`
- `apps/api/sql/migrations/002_create_import_batches.sql`
- `apps/api/sql/migrations/003_create_earthquake_events.sql`
- `apps/api/scripts/import-katalog-gempa.ts`
- `docs/fase-1-backend.md`

## Catatan

- file `data/seed/katalog_gempa.csv` sudah disertakan di ZIP
- proyek ini sengaja **tidak** menyertakan `package-lock.json` agar instalasi memakai registry publik npm biasa
- fase 1 baru sampai katalog event nyata dan prefill parameter, belum sampai engine simulasi penuh
