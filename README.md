# FBK-Indmeldelse

Automatiseret medlemsadministration for Billardklubben

## 🎯 Features

- **Automatisk indmelding**: Godkendelsesflow via email magic links
- **Fortløbende medlemsnumre**: PostgreSQL sequence sikrer unikke numre
- **Unifi Access integration**: Automatisk oprettelse og deaktivering af adgangskoder
- **Dinero integration**: Synkronisering af medlemmer som kunder og bogføring
- **Betalingsservice**: Webhooks og CSV-import til betalingsafstemning
- **Udmeldingsflow**: Stopper betalinger, fjerner adgang og sender kvittering
- **Admin UI**: Oversigt over ansøgninger, medlemmer, betalinger og logs

## 🏗️ Arkitektur

Dette er et monorepo med følgende struktur:

```
repo/
├── apps/
│   ├── api/          # NestJS (Fastify) REST API
│   └── web/          # Next.js 15 (App Router)
├── packages/
│   ├── db/           # Prisma schema & migrations
│   ├── email/        # React Email templates
│   └── config/       # Shared configuration & env validation
└── scripts/          # Utility scripts
```

## 🚀 Kom i gang

### Forudsætninger

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Redis (optional)

### Installation

1. Klon repositoriet:
```bash
git clone https://github.com/CarbonDEA/FBK-Indmeldelse.git
cd FBK-Indmeldelse
```

2. Installer dependencies:
```bash
pnpm install
```

3. Kopier `.env.example` til `.env` og udfyld:
```bash
cp .env.example .env
```

4. Start PostgreSQL og Redis (via Docker):
```bash
docker-compose up -d
```

5. Kør database migrations:
```bash
cd packages/db
pnpm prisma migrate dev
pnpm db:seed
```

6. Start udviklings-servere:
```bash
# I root directory
pnpm dev
```

Dette starter:
- API på http://localhost:4000
- Web på http://localhost:3000
- Swagger docs på http://localhost:4000/api

## 📚 Dokumentation

### API Endpoints

- `POST /applications` - Opret ny ansøgning
- `POST /applications/:id/approve?token=...` - Godkend ansøgning
- `POST /applications/:id/reject?token=...` - Afvis ansøgning
- `GET /members` - List medlemmer
- `GET /members/:id` - Hent medlem
- `POST /members/:id/terminate` - Udmeld medlem
- `POST /payments/webhooks` - Payment provider webhook
- `POST /payments/csv/import` - Importer betalinger fra CSV
- `GET /health` - Health check

### Scripts

Importer betalinger fra CSV:
```bash
cd scripts
tsx import-payments.ts path/to/payments.csv
```

## 🔒 Sikkerhed

- JWT magic links med 48 timers udløb
- Webhook signature verification
- Krypterede adgangskoder (AES-256-GCM)
- Role-based admin access
- Rate limiting på offentlige endpoints

## 🧪 Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

## 📦 Build & Deploy

```bash
# Build alt
pnpm build

# Eller individuelt
cd apps/api && pnpm build
cd apps/web && pnpm build
```

## 🛠️ Teknologier

- **Backend**: NestJS, Fastify, Prisma, PostgreSQL
- **Frontend**: Next.js 15, React, TailwindCSS
- **Email**: React Email, Nodemailer/Resend
- **Integrationer**: Unifi Access, Dinero, Payment Provider
- **DevOps**: Docker, GitHub Actions, Turborepo

## 📝 Licens

Private - Billardklubben
