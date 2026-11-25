import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDemoLibrary } from './data/demoLibrary.js';
import { createDatabase } from './db/database.js';
import { GENRE_CATEGORIES } from './domain/genres.js';
import { MOOD_PROFILES } from './domain/moods.js';
import { TEMPO_CURVES, generatePlaylist } from './domain/playlistEngine.js';
import { SCENARIO_PRESETS } from './domain/scenarios.js';
import { analyzeLibrary } from './services/analyticsService.js';
import { enrichTracksAudioFeatures } from './services/audioFeaturesService.js';
import { getDiscoveryCandidates } from './services/discoveryService.js';
import { exportPlaylistAs, importFromCsv, importFromSpotifyJson } from './services/importers.js';
import { buildListeningCalendar } from './services/listeningCalendarService.js';
import { resolveRealAudioPreview } from './services/previewResolver.js';
import {
  buildSpotifyAuthUrl,
  createPkcePair,
  createSpotifyPlaylist,
  exchangeSpotifyCode,
  refreshSpotifyToken,
  syncSpotifyUserLibrary,
} from './services/spotifyClient.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PUBLIC_DIR = resolve(join(__dirname, '..', 'public'));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function readRequestBody(req, maxBytes = 10 * 1024 * 1024) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        rejectBody(new Error('Request payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', rejectBody);
  });
}

async function readJsonBody(req) {
  const raw = await readRequestBody(req);
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export function createAppServer({
  dbPath = join(process.cwd(), 'data', 'spotilist.db'),
  fetchImpl = fetch,
  seedDemoIfEmpty = false,
} = {}) {
  const store = createDatabase(dbPath);
  const pkceSessions = new Map();

  if (seedDemoIfEmpty && store.getAllTracks().length === 0) {
    store.upsertLibrary(getDemoLibrary());
    store.setSetting('libraryMode', 'demo');
  }

  async function getValidSpotifyToken() {
    const auth = store.getSetting('spotifyAuth', null);
    const config = store.getSetting('spotifyConfig', {});
    if (!auth?.accessToken) return null;
    if (Date.now() < (auth.expiresAt || 0) - 60_000) {
      return auth.accessToken;
    }
    if (auth.refreshToken && config.clientId) {
      const refreshed = await refreshSpotifyToken({
        clientId: config.clientId,
        refreshToken: auth.refreshToken,
        fetchImpl,
      });
      store.setSetting('spotifyAuth', refreshed);
      return refreshed.accessToken;
    }
    return null;
  }

  const requestHandler = async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);
    const pathname = url.pathname;
    const method = (req.method || 'GET').toUpperCase();

    try {
      // --- API Routes ---
      if (pathname === '/api/health' && method === 'GET') {
        const tracks = store.getAllTracks();
        return sendJson(res, 200, {
          ok: true,
          tracksCount: tracks.length,
          libraryMode: store.getSetting('libraryMode', 'demo'),
        });
      }

      if (pathname === '/api/meta' && method === 'GET') {
        return sendJson(res, 200, {
          moods: Object.values(MOOD_PROFILES),
          tempoCurves: Object.values(TEMPO_CURVES),
          genres: GENRE_CATEGORIES,
          scenarios: store.getScenarios(SCENARIO_PRESETS),
        });
      }

      if (pathname === '/api/scenarios' && method === 'GET') {
        return sendJson(res, 200, { scenarios: store.getScenarios(SCENARIO_PRESETS) });
      }

      if (pathname === '/api/scenarios' && method === 'POST') {
        const body = await readJsonBody(req);
        if (!body?.labelTr && !body?.name) {
          return sendJson(res, 400, { error: 'Scenario name is required.' });
        }
        const result = store.addScenario(body, SCENARIO_PRESETS);
        return sendJson(res, 201, result);
      }

      if (pathname === '/api/scenarios/reset' && method === 'POST') {
        return sendJson(res, 200, { scenarios: store.resetScenarios(SCENARIO_PRESETS) });
      }

      const scenarioIdMatch = pathname.match(/^\/api\/scenarios\/([^/]+)$/);
      if (scenarioIdMatch && method === 'DELETE') {
        const id = decodeURIComponent(scenarioIdMatch[1]);
        const result = store.deleteScenario(id, SCENARIO_PRESETS);
        return sendJson(res, result.deleted ? 200 : 404, result);
      }

      if (pathname === '/api/preview/resolve' && method === 'GET') {
        const trackId = url.searchParams.get('id') || '';
        const trackName = url.searchParams.get('track') || '';
        const artistName = url.searchParams.get('artist') || '';
        const existing = trackId ? store.getTrackById(trackId) : null;
        const resolved = await resolveRealAudioPreview(
          {
            trackId,
            trackName: trackName || existing?.name || '',
            artistName: artistName || existing?.artists?.[0] || '',
            existingUrl: existing?.previewUrl || null,
          },
          fetchImpl
        );
        if (trackId && resolved.previewUrl && existing && !existing.previewUrl) {
          store.updateTrackPreviewUrl(trackId, resolved.previewUrl);
        }
        return sendJson(res, 200, resolved);
      }

      if (pathname === '/api/library' && method === 'GET') {
        const tracks = store.getAllTracks();
        const albums = store.getAllAlbums();
        const events = store.getListeningEvents();
        const analytics = analyzeLibrary(tracks, albums);
        const listeningCalendar = buildListeningCalendar(events, tracks);
        return sendJson(res, 200, {
          libraryMode: tracks.length === 0 ? 'empty' : store.getSetting('libraryMode', 'demo'),
          tracks,
          albums,
          analytics,
          listeningCalendar,
        });
      }

      if (pathname === '/api/library/clear' && method === 'POST') {
        store.clearLibrary();
        store.setSetting('libraryMode', 'empty');
        return sendJson(res, 200, {
          libraryMode: 'empty',
          tracks: [],
          albums: [],
          analytics: analyzeLibrary([], []),
          listeningCalendar: buildListeningCalendar([], []),
        });
      }

      if (pathname === '/api/library/tracks' && method === 'POST') {
        const track = await readJsonBody(req);
        if (!track?.id || !track?.name) {
          return sendJson(res, 400, { error: 'Track id and name are required.' });
        }
        store.upsertLibrary({ tracks: [{ ...track, isLiked: true, isDiscovery: false }], albums: [] });
        return sendJson(res, 201, { track: store.getTrackById(track.id) });
      }

      if (pathname === '/api/library/load-demo' && method === 'POST') {
        store.upsertLibrary(getDemoLibrary(), { replace: true });
        store.setSetting('libraryMode', 'demo');
        const tracks = store.getAllTracks();
        const albums = store.getAllAlbums();
        const events = store.getListeningEvents();
        return sendJson(res, 200, {
          libraryMode: 'demo',
          tracks,
          albums,
          analytics: analyzeLibrary(tracks, albums),
          listeningCalendar: buildListeningCalendar(events, tracks),
        });
      }

      if (pathname === '/api/library/import' && method === 'POST') {
        const body = await readJsonBody(req);
        const { format = 'json', content, sourceType = 'liked', replace = false } = body;
        if (!content || typeof content !== 'string') {
          return sendJson(res, 400, { error: 'Import content is required.' });
        }

        const parsed =
          format === 'csv'
            ? importFromCsv(content, { sourceType })
            : importFromSpotifyJson(content);

        if (parsed.tracks.length === 0 && parsed.albums.length === 0) {
          return sendJson(res, 400, { error: 'No valid tracks or albums found in uploaded file.' });
        }

        store.upsertLibrary(parsed, { replace: Boolean(replace) });
        store.setSetting('libraryMode', 'imported');
        const tracks = store.getAllTracks();
        const albums = store.getAllAlbums();
        return sendJson(res, 200, {
          importedTracks: parsed.tracks.length,
          importedAlbums: parsed.albums.length,
          libraryMode: 'imported',
          analytics: analyzeLibrary(tracks, albums),
          tracks,
          albums,
        });
      }

      if (pathname === '/api/library/enrich' && method === 'POST') {
        const tracks = store.getAllTracks();
        const token = await getValidSpotifyToken().catch(() => null);
        const result = await enrichTracksAudioFeatures(tracks, { accessToken: token, fetchImpl });
        store.upsertLibrary({ tracks: result.tracks, albums: [] }, { replace: false });
        const updatedTracks = store.getAllTracks();
        const albums = store.getAllAlbums();
        return sendJson(res, 200, {
          stats: result.stats,
          tracks: updatedTracks,
          analytics: analyzeLibrary(updatedTracks, albums),
        });
      }

      const trackPatchMatch = pathname.match(/^\/api\/library\/tracks\/([^/]+)$/);
      if (trackPatchMatch && method === 'PATCH') {
        const trackId = decodeURIComponent(trackPatchMatch[1]);
        const body = await readJsonBody(req);
        const updated = store.updateTrackFeatures(trackId, body, { manual: true });
        if (!updated) {
          return sendJson(res, 404, { error: 'Track not found.' });
        }
        const tracks = store.getAllTracks();
        const albums = store.getAllAlbums();
        return sendJson(res, 200, {
          track: updated,
          analytics: analyzeLibrary(tracks, albums),
        });
      }

      if (pathname === '/api/playlists/generate' && method === 'POST') {
        const options = await readJsonBody(req);
        const tracks = store.getAllTracks();
        let discoveryTracks = [];
        if (Number(options.discoveryRatio) > 0) {
          discoveryTracks = await getDiscoveryCandidates(tracks, {
            seedSource: options.discoverySeedSource || 'mixed',
            targetBpm: Number(options.targetBpm) || 120,
            varietySeed: Number(options.varietySeed) || 0,
            fetchImpl,
          });
        }
        const generated = generatePlaylist(tracks, { ...options, discoveryTracks });
        return sendJson(res, 200, generated);
      }

      if (pathname === '/api/playlists' && method === 'GET') {
        return sendJson(res, 200, { playlists: store.getAllPlaylists() });
      }

      if (pathname === '/api/playlists' && method === 'POST') {
        const body = await readJsonBody(req);
        if (!body?.name || !Array.isArray(body?.tracks)) {
          return sendJson(res, 400, { error: 'Playlist name and tracks array are required.' });
        }
        const saved = store.savePlaylist(body);
        return sendJson(res, 201, { playlist: saved });
      }

      const playlistIdMatch = pathname.match(/^\/api\/playlists\/([^/]+)$/);
      if (playlistIdMatch && method === 'DELETE') {
        const id = decodeURIComponent(playlistIdMatch[1]);
        const deleted = store.deletePlaylist(id);
        return sendJson(res, deleted ? 200 : 404, deleted ? { deleted: true } : { error: 'Playlist not found.' });
      }

      const playlistExportMatch = pathname.match(/^\/api\/playlists\/([^/]+)\/export$/);
      if (playlistExportMatch && method === 'GET') {
        const id = decodeURIComponent(playlistExportMatch[1]);
        const format = url.searchParams.get('format') || 'json';
        const playlist = store.getPlaylistById(id);
        if (!playlist) {
          return sendJson(res, 404, { error: 'Playlist not found.' });
        }
        const exported = exportPlaylistAs(playlist, format);
        res.writeHead(200, {
          'Content-Type': exported.contentType,
          'Content-Disposition': `attachment; filename="${exported.filename.replace(/"/g, '')}"`,
        });
        res.end(exported.body);
        return;
      }

      if (pathname === '/api/playlists/export-inline' && method === 'POST') {
        const body = await readJsonBody(req);
        const format = url.searchParams.get('format') || body.format || 'csv';
        const exported = exportPlaylistAs(body, format);
        res.writeHead(200, {
          'Content-Type': exported.contentType,
          'Content-Disposition': `attachment; filename="${exported.filename.replace(/"/g, '')}"`,
        });
        res.end(exported.body);
        return;
      }

      // --- Spotify OAuth PKCE & Live Sync ---
      if (pathname === '/api/auth/spotify/status' && method === 'GET') {
        const config = store.getSetting('spotifyConfig', {});
        const auth = store.getSetting('spotifyAuth', null);
        const origin = `http://${req.headers.host || '127.0.0.1:4173'}`;
        return sendJson(res, 200, {
          configured: Boolean(config.clientId),
          clientId: config.clientId || '',
          redirectUri: config.redirectUri || `${origin}/api/auth/spotify/callback`,
          connected: Boolean(auth?.accessToken),
          expiresAt: auth?.expiresAt || null,
        });
      }

      if (pathname === '/api/auth/spotify/config' && method === 'POST') {
        const body = await readJsonBody(req);
        const clientId = String(body.clientId || '').trim();
        const origin = `http://${req.headers.host || '127.0.0.1:4173'}`;
        const redirectUri = String(body.redirectUri || `${origin}/api/auth/spotify/callback`).trim();
        if (!clientId) {
          return sendJson(res, 400, { error: 'Spotify Client ID is required.' });
        }
        store.setSetting('spotifyConfig', { clientId, redirectUri });
        return sendJson(res, 200, { configured: true, clientId, redirectUri });
      }

      if (pathname === '/api/auth/spotify/login' && method === 'GET') {
        const config = store.getSetting('spotifyConfig', {});
        if (!config.clientId) {
          return sendJson(res, 400, { error: 'Configure Spotify Client ID first.' });
        }
        const pkce = createPkcePair();
        pkceSessions.set(pkce.state, {
          codeVerifier: pkce.codeVerifier,
          createdAt: Date.now(),
        });
        const authUrl = buildSpotifyAuthUrl({
          clientId: config.clientId,
          redirectUri: config.redirectUri,
          codeChallenge: pkce.codeChallenge,
          state: pkce.state,
        });
        return sendJson(res, 200, { authUrl });
      }

      if (pathname === '/api/auth/spotify/callback' && method === 'GET') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const errorParam = url.searchParams.get('error');
        if (errorParam) {
          res.writeHead(302, { Location: `/?spotifyError=${encodeURIComponent(errorParam)}` });
          res.end();
          return;
        }
        const session = state ? pkceSessions.get(state) : null;
        const config = store.getSetting('spotifyConfig', {});
        if (!code || !session || !config.clientId) {
          res.writeHead(302, { Location: '/?spotifyError=invalid_state' });
          res.end();
          return;
        }
        pkceSessions.delete(state);
        const tokens = await exchangeSpotifyCode({
          clientId: config.clientId,
          code,
          redirectUri: config.redirectUri,
          codeVerifier: session.codeVerifier,
          fetchImpl,
        });
        store.setSetting('spotifyAuth', tokens);
        res.writeHead(302, { Location: '/?spotifyConnected=1' });
        res.end();
        return;
      }

      if (pathname === '/api/auth/spotify/disconnect' && method === 'POST') {
        store.setSetting('spotifyAuth', null);
        return sendJson(res, 200, { connected: false });
      }

      if (pathname === '/api/auth/spotify/sync' && method === 'POST') {
        const token = await getValidSpotifyToken();
        if (!token) {
          return sendJson(res, 401, { error: 'Not connected to Spotify. Please sign in first.' });
        }
        const body = await readJsonBody(req);
        const synced = await syncSpotifyUserLibrary(token, { fetchImpl });
        const enriched = await enrichTracksAudioFeatures(synced.tracks, {
          accessToken: token,
          fetchImpl,
        });
        store.upsertLibrary(
          {
            tracks: enriched.tracks,
            albums: synced.albums,
            listeningEvents: synced.listeningEvents || [],
          },
          { replace: Boolean(body.replace) }
        );
        store.setSetting('libraryMode', 'spotify');
        const tracks = store.getAllTracks();
        const albums = store.getAllAlbums();
        const events = store.getListeningEvents();
        return sendJson(res, 200, {
          syncedTracks: enriched.tracks.length,
          syncedAlbums: synced.albums.length,
          syncedEvents: (synced.listeningEvents || []).length,
          enrichment: enriched.stats,
          libraryMode: 'spotify',
          tracks,
          albums,
          analytics: analyzeLibrary(tracks, albums),
          listeningCalendar: buildListeningCalendar(events, tracks),
        });
      }

      if (pathname === '/api/playlists/push-spotify' && method === 'POST') {
        const token = await getValidSpotifyToken();
        if (!token) {
          return sendJson(res, 401, { error: 'Spotify account not connected.' });
        }
        const body = await readJsonBody(req);
        const uris = (body.tracks || []).map((t) => t.uri).filter(Boolean);
        const pushed = await createSpotifyPlaylist(
          token,
          {
            name: body.name || 'SpotiList Tempo Mix',
            description: body.description || 'Generated by SpotiList (Tempo-First, Mood-Second)',
            isPublic: Boolean(body.isPublic),
            trackUris: uris,
          },
          fetchImpl
        );
        if (body.id) {
          const existing = store.getPlaylistById(body.id);
          if (existing) {
            store.savePlaylist({ ...existing, ...pushed });
          }
        }
        return sendJson(res, 200, pushed);
      }

      // --- Static Frontend ---
      const safeRelPath = normalize(pathname === '/' ? '/index.html' : pathname).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = resolve(join(PUBLIC_DIR, safeRelPath));
      if (!fullPath.startsWith(PUBLIC_DIR)) {
        return sendJson(res, 403, { error: 'Forbidden' });
      }

      try {
        const content = await readFile(fullPath);
        const ext = extname(fullPath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        // Fallback to index.html for SPA routes
        const indexHtml = await readFile(join(PUBLIC_DIR, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexHtml);
      }
    } catch (err) {
      return sendJson(res, 500, { error: err?.message || 'Internal Server Error' });
    }
  };

  const server = createServer(requestHandler);

  server.on('close', () => {
    store.close();
  });

  return { server, store, requestHandler };
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const port = Number(process.env.PORT || 4173);
  const { server } = createAppServer();
  server.listen(port, '127.0.0.1', () => {
    console.log(`SpotiList running at http://127.0.0.1:${port}`);
  });
}
