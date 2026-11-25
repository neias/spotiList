# SpotiList — Tempo-First & Mood-Cohesive Spotify Playlist Studio

SpotiList analyzes your **Spotify Liked Tracks**, **Saved Albums**, **Top/Most-Listened Tracks**, and **Recently Played** history to generate playlists where **Tempo (BPM)** is Rule #1, **Mood & Sonic Cohesion** are Rule #2–3, and **Harmonic Camelot Key Mixing** refines track-to-track flow.

Built with zero external npm dependencies using **Node.js 22+ (`node:sqlite`, `node:http`, `node:test`)**.

## Key Features

- **Rule #1 — Tempo (BPM) Control & Progression Curves**:
  - Strict BPM gate (`±3 Strict`, `±6 Balanced`, `±12 Flexible`) with guaranteed primary tempo weight (`50%–85%`).
  - 4 progression curves: **Steady Beat-Lock**, **Warm-Up → Peak → Cool-Down**, **Progressive Ramp Up**, and **Interval Waves (HIIT)**.
  - Optional Half/Double-time equivalence (`70 ↔ 140 BPM`) and **Camelot Wheel (`1A–12B`)** harmonic key transition scoring.
- **Rule #2 — Mood & Emotional Continuity**:
  - 6 curated mood profiles (*Euphoric*, *Groove & Dance*, *Deep Focus*, *Serene & Acoustic*, *Melancholic*, *Dark & Intense*) + custom Valence / Energy / Danceability / Acousticness sliders.
- **Rule #3 — Genre, Language Universe, Vocal Density & Sonic Cohesion**:
  - Include/Exclude music genres, lock language universe (*Auto / Turkish / International / Mixed*), filter vocal vs. instrumental density, and prevent jarring sonic/valence jumps between consecutive tracks.
- **Smart Duration & Activity Scenarios (CRUD)**:
  - One-click presets (45m Tempo Run, 90m Deep Focus, 60m Night Drive, 35m HIIT, 30m Morning Acoustic) + add/delete custom scenarios.
- **Configurable Out-of-Library Discovery (`0%–50%`)**:
  - Fetches fresh recommendations via **ReccoBeats API** using BPM-matched seeds from your Liked/Top tracks, filtered through the exact same tempo, mood, and genre rules.
- **Real 30s Audio Preview, Crossfade Deck & Spotify Embed**:
  - Resolves real 30-second previews (Spotify / iTunes TR+US / Deezer) for instant playback and crossfade testing, with automatic official **Spotify Embed Player** fallback.
- **Analytics, 2D Tempo × Mood Map & 28-Day Mood Calendar**:
  - Interactive 2D BPM × Valence scatter map with numbered active playlist route, BPM histogram, album tempo insights, and time-of-day listening profile.
- **Live Spotify OAuth PKCE + Data Export Importer**:
  - Connects directly to Spotify (`/v1/me/tracks`, `/v1/me/albums`, `/v1/me/top/tracks`, `/v1/me/player/recently-played`, `POST /v1/me/playlists`) or imports Spotify Privacy Export JSON / Exportify CSV.

## Quick Start

```bash
npm start
# Open http://127.0.0.1:4173
```

### Connecting Live Spotify (OAuth PKCE)
1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add Redirect URI: `http://127.0.0.1:4173/api/auth/spotify/callback`
3. Open **Spotify & Yükle** in SpotiList, paste your **Client ID**, sign in, and click **Kütüphaneyi Senkronize Et**.

## Tests

```bash
npm test
```
