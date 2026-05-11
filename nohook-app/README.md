# Nohook MVP

Deployable Next.js MVP for `Nohook`, a Vietnam street-risk mapping product that
helps first-time travelers spot aggressive touting, fake taxi pressure, cyclo
overcharge, and forced-tip hotspots before they walk in.

## What is implemented

- Public traveler map with road-segment risk overlays for:
  - Ho Chi Minh City District 1
  - Hanoi Old Quarter
- Segment detail panel with risk reasoning and nearby place signals
- Anonymous quick-report form wired to a mock moderation API
- Admin moderation preview page at `/admin`
- Route handlers for:
  - `GET /api/segments`
  - `GET /api/segments/:id`
  - `POST /api/reports`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

The app is designed to deploy to Vercel without environment variables.

## Notes

- Current map and report data are mocked so the MVP can ship without external
  API keys.
- Google Places ingestion, persistent report storage, and moderation auth are
  the next implementation steps after this first deployable vertical slice.
