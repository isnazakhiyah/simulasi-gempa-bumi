# Fase 1 Backend — Katalog Gempa Historis

Dokumen ini menyiapkan backend awal agar screen **Pilih Skenario** dan **Parameter Gempa** bisa memakai data nyata dari `data/seed/katalog_gempa.csv`.

## Ringkasan target fase 1

- backend `apps/api` hidup di `http://localhost:3001`
- PostgreSQL + PostGIS aktif
- migrasi database jalan
- dataset `data/seed/katalog_gempa.csv` berhasil di-import
- endpoint katalog siap:
  - `GET /api/v1/health`
  - `GET /api/v1/catalog/events`
  - `GET /api/v1/catalog/events/:id`
- frontend screen `/simulasi` memuat daftar gempa historis
- frontend screen `/simulasi/parameter?eventId=...` melakukan prefill dari event terpilih

## File penting yang ditambahkan

- `apps/api` → backend Express + TypeScript
- `apps/api/sql/migrations` → SQL migration fase 1
- `apps/api/scripts/import-katalog-gempa.ts` → importer CSV
- `data/seed/katalog_gempa.csv` → seed katalog historis
- `packages/shared-types` → contract type antara web dan api
- `infra/docker/docker-compose.postgis.yml` → opsi cepat menjalankan PostGIS via Docker

## Variabel environment backend

Salin file contoh:

```bash
copy apps\api\.env.example apps\api\.env
```

atau di macOS/Linux:

```bash
cp apps/api/.env.example apps/api/.env
```

Isi default yang sudah cocok untuk PostgreSQL lokal:

```env
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/simulasi_gempa
CORS_ORIGIN=http://localhost:5173
DEFAULT_CATALOG_LIMIT=12
MAX_CATALOG_LIMIT=50
```

Kalau memakai Docker PostGIS bawaan proyek, ganti port menjadi `5433`.

## Perintah inti yang akan sering dipakai

Install dependency:

```bash
npm install
```

Jalankan migrasi database:

```bash
npm run db:migrate
```

Import katalog gempa:

```bash
npm run db:seed:katalog
```

Jalankan frontend + backend bersamaan:

```bash
npm run dev
```

## Endpoint yang tersedia

### Health check

```http
GET /api/v1/health
```

### List katalog

```http
GET /api/v1/catalog/events?search=java&minMag=5&yearFrom=2020&page=1&limit=8
```

### Detail event

```http
GET /api/v1/catalog/events/:id
```

## Struktur tabel fase 1

### `import_batches`
Menyimpan audit import CSV.

### `earthquake_events`
Menyimpan katalog gempa historis hasil normalisasi.

Kolom yang dipakai pada fase 1:
- `source`
- `source_event_key`
- `event_time_raw`
- `event_time_local`
- `event_date`
- `latitude`
- `longitude`
- `geom`
- `depth_km`
- `magnitude`
- `region_label`
- `remark`
- `strike1/dip1/rake1`
- `strike2/dip2/rake2`
- `has_focal_mechanism`

## Cara kerja importer

Importer akan:
1. membaca `data/seed/katalog_gempa.csv`
2. menormalisasi kolom dasar (`tgl`, `ot`, `lat`, `lon`, `depth`, `mag`, `remark`)
3. membuat `source_event_key` berbasis hash untuk deduplikasi
4. menggabungkan baris duplikat yang hanya menambah focal mechanism
5. menyimpan titik geografis ke kolom `geom`
6. mencatat hasil import ke tabel `import_batches`

## Catatan implementasi

- fase 1 belum menghitung simulasi fisika gempa
- data waktu UTC belum dipaksakan; backend menyimpan `event_time_raw`, `event_time_local`, dan `event_date`
- frontend tetap bisa dibuka meski database belum siap, tetapi katalog akan menampilkan pesan error sampai migrasi + import selesai
