Fase 3 - sim-core dan integrasi run simulasi

Urutan setelah menyalin file:
1. npm install
2. npm run db:migrate
3. npm run dev

Validasi yang sudah dilakukan di container:
- npm run build:shared-types -> OK
- npm run build:sim-core -> OK
- npm run build:api -> OK
- tsc -p apps/web/tsconfig.json --noEmit -> OK
- node ../../node_modules/vite/bin/vite.js build (di apps/web) -> OK
