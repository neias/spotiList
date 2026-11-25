import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';

import { createAppServer } from '../src/server.js';
import { importFromCsv, importFromSpotifyJson } from '../src/services/importers.js';

function createTestClient(requestHandler) {
  return async function callApi(method, path, body = null) {
    const req = new EventEmitter();
    req.method = method;
    req.url = path;
    req.headers = { host: '127.0.0.1:4173' };
    req.destroy = () => {};

    const chunks = [];
    let statusCode = 200;
    let headers = {};

    const resPromise = new Promise((resolve, reject) => {
      const res = {
        writeHead(code, hdrs = {}) {
          statusCode = code;
          headers = hdrs;
        },
        end(data) {
          if (data !== undefined && data !== null) {
            chunks.push(Buffer.isBuffer(data) ? data : Buffer.from(String(data)));
          }
          const raw = Buffer.concat(chunks).toString('utf8');
          resolve({
            status: statusCode,
            headers,
            text: raw,
            json() {
              return JSON.parse(raw);
            },
          });
        },
      };

      Promise.resolve(requestHandler(req, res)).catch(reject);
    });

    queueMicrotask(() => {
      if (body !== null) {
        const serialized = typeof body === 'string' ? body : JSON.stringify(body);
        req.emit('data', Buffer.from(serialized));
      }
      req.emit('end');
    });

    return resPromise;
  };
}

test('Importers parse Spotify YourLibrary.json, StreamingHistory JSON, and Exportify CSV', () => {
  const yourLib = importFromSpotifyJson({
    tracks: [{ artist: 'Duman', album: 'Duman I', track: 'Senden Daha Güzel', uri: 'spotify:track:1111111111111111111111' }],
    albums: [{ artist: 'Duman', album: 'Duman I', uri: 'spotify:album:2222222222222222222222' }],
  });
  assert.equal(yourLib.tracks.length, 1);
  assert.equal(yourLib.tracks[0].isLiked, true);
  assert.equal(yourLib.albums.length, 1);

  const streaming = importFromSpotifyJson([
    { artistName: 'Jakuzi', trackName: 'Koca Bir Saçmalık', msPlayed: 210000 },
    { artistName: 'Jakuzi', trackName: 'Koca Bir Saçmalık', msPlayed: 210000 },
    { artistName: 'Skip', trackName: 'Too Short', msPlayed: 5000 },
  ]);
  assert.equal(streaming.tracks.length, 1);
  assert.equal(streaming.tracks[0].playCount, 2);

  const csv = [
    'Track URI,Track Name,Artist Name(s),Album Name,Tempo,Valence,Energy,Danceability',
    'spotify:track:3333333333333333333333,Get Lucky,"Daft Punk, Pharrell",RAM,116,0.86,0.81,0.87',
  ].join('\n');
  const parsedCsv = importFromCsv(csv, { sourceType: 'top' });
  assert.equal(parsedCsv.tracks.length, 1);
  assert.equal(parsedCsv.tracks[0].bpm, 116);
  assert.equal(parsedCsv.tracks[0].featureSource, 'measured');
});

test('REST API generates, saves, exports CSV/M3U8, updates manual BPM, serves UI, and enriches via ReccoBeats mock', async () => {
  const mockFetch = async (url) => {
    const u = String(url);
    if (u.includes('api.reccobeats.com/v1/audio-features')) {
      return new Response(
        JSON.stringify({
          content: [
            {
              href: 'https://open.spotify.com/track/4444444444444444444444',
              tempo: 128.5,
              valence: 0.77,
              energy: 0.83,
              danceability: 0.81,
              acousticness: 0.04,
              instrumentalness: 0.02,
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('{}', { status: 404 });
  };

  const { store, requestHandler } = createAppServer({
    dbPath: ':memory:',
    fetchImpl: mockFetch,
    seedDemoIfEmpty: true,
  });
  const callApi = createTestClient(requestHandler);

  try {
    // 1. Static UI & Health
    const html = await callApi('GET', '/');
    assert.equal(html.status, 200);
    assert.ok(html.text.includes('SpotiList'));

    const health = (await callApi('GET', '/api/health')).json();
    assert.equal(health.ok, true);
    assert.ok(health.tracksCount >= 90);

    const lib = (await callApi('GET', '/api/library')).json();
    assert.ok(lib.analytics.tempoHistogram.length > 0);
    assert.ok(lib.analytics.scatterPoints.length >= 90);

    // 2. Generate playlist
    const gen = (
      await callApi('POST', '/api/playlists/generate', {
        targetBpm: 122,
        toleranceBpm: 6,
        tempoCurve: 'steady',
        moodIds: ['groove'],
        trackCount: 10,
      })
    ).json();
    assert.equal(gen.tracks.length, 10);

    // 3. Save & Export playlist
    const saved = (
      await callApi('POST', '/api/playlists', {
        name: 'Test 122 Mix',
        config: gen.appliedConfig,
        metrics: gen.metrics,
        tracks: gen.tracks,
      })
    ).json();
    assert.ok(saved.playlist.id);

    const csvRes = await callApi('GET', `/api/playlists/${saved.playlist.id}/export?format=csv`);
    assert.equal(csvRes.status, 200);
    assert.ok(csvRes.text.includes('Slot,Track Name,Artist(s)'));

    const m3uRes = await callApi('GET', `/api/playlists/${saved.playlist.id}/export?format=m3u`);
    assert.equal(m3uRes.status, 200);
    assert.ok(m3uRes.text.startsWith('#EXTM3U'));

    // 4. Manual BPM override
    const patched = (
      await callApi('PATCH', '/api/library/tracks/demo_01', {
        bpm: 125,
        valence: 0.8,
      })
    ).json();
    assert.equal(patched.track.bpm, 125);
    assert.equal(patched.track.manualOverride, true);

    // 5. Import Spotify-ID track and enrich via mocked ReccoBeats
    const imp = (
      await callApi('POST', '/api/library/import', {
        format: 'json',
        content: JSON.stringify({
          tracks: [{ artist: 'Bicep', album: 'Isles', track: 'Atlas', uri: 'spotify:track:4444444444444444444444' }],
        }),
      })
    ).json();
    assert.equal(imp.importedTracks, 1);

    const enrich = (await callApi('POST', '/api/library/enrich')).json();
    const atlas = enrich.tracks.find((t) => t.id === '4444444444444444444444');
    assert.equal(atlas.bpm, 128.5);
    assert.equal(atlas.featureSource, 'reccobeats');
  } finally {
    store.close();
  }
});

test('Spotify PKCE config, login URL, sync, and POST /me/playlists push work end-to-end with mock Spotify API', async () => {
  const mockSpotifyFetch = async (url, opts = {}) => {
    const u = String(url);
    if (u.includes('accounts.spotify.com/api/token')) {
      return new Response(
        JSON.stringify({ access_token: 'tok_abc', refresh_token: 'ref_xyz', expires_in: 3600 }),
        { status: 200 }
      );
    }
    if (u.endsWith('/v1/me/tracks?limit=50')) {
      return new Response(
        JSON.stringify({
          items: [
            {
              added_at: '2026-10-01T00:00:00Z',
              track: {
                id: '5555555555555555555555',
                uri: 'spotify:track:5555555555555555555555',
                name: 'Midnight Track',
                duration_ms: 210000,
                artists: [{ id: 'art1', name: 'Jakuzi' }],
                album: { id: 'alb1', name: 'Fantezi', images: [] },
              },
            },
          ],
          next: null,
        }),
        { status: 200 }
      );
    }
    if (u.endsWith('/v1/me/albums?limit=20')) {
      return new Response(
        JSON.stringify({
          items: [
            {
              added_at: '2026-10-02T00:00:00Z',
              album: {
                id: 'alb1',
                name: 'Fantezi',
                release_date: '2016-01-01',
                total_tracks: 1,
                artists: [{ id: 'art1', name: 'Jakuzi' }],
                images: [],
                tracks: {
                  items: [
                    {
                      id: '5555555555555555555555',
                      uri: 'spotify:track:5555555555555555555555',
                      name: 'Midnight Track',
                      duration_ms: 210000,
                      artists: [{ id: 'art1', name: 'Jakuzi' }],
                    },
                  ],
                },
              },
            },
          ],
          next: null,
        }),
        { status: 200 }
      );
    }
    if (u.includes('/v1/me/top/tracks')) {
      return new Response(
        JSON.stringify({
          items: [
            {
              id: '5555555555555555555555',
              uri: 'spotify:track:5555555555555555555555',
              name: 'Midnight Track',
              duration_ms: 210000,
              artists: [{ id: 'art1', name: 'Jakuzi' }],
              album: { id: 'alb1', name: 'Fantezi', images: [] },
            },
          ],
        }),
        { status: 200 }
      );
    }
    if (u.includes('/v1/artists?ids=')) {
      return new Response(JSON.stringify({ artists: [{ id: 'art1', genres: ['turkish darkwave'] }] }), { status: 200 });
    }
    if (u.endsWith('/v1/me/playlists') && opts.method === 'POST') {
      return new Response(
        JSON.stringify({ id: 'sp_pl_99', external_urls: { spotify: 'https://open.spotify.com/playlist/sp_pl_99' } }),
        { status: 201 }
      );
    }
    if (u.includes('/v1/playlists/sp_pl_99/items') && opts.method === 'POST') {
      return new Response(JSON.stringify({ snapshot_id: 'snap1' }), { status: 201 });
    }
    if (u.includes('api.reccobeats.com/v1/audio-features')) {
      return new Response(
        JSON.stringify({
          content: [{ spotifyId: '5555555555555555555555', tempo: 115, valence: 0.3, energy: 0.75, danceability: 0.71, acousticness: 0.08 }],
        }),
        { status: 200 }
      );
    }
    return new Response('{}', { status: 404 });
  };

  const { store, requestHandler } = createAppServer({
    dbPath: ':memory:',
    fetchImpl: mockSpotifyFetch,
    seedDemoIfEmpty: false,
  });
  const callApi = createTestClient(requestHandler);

  try {
    await callApi('POST', '/api/auth/spotify/config', {
      clientId: 'client_123',
      redirectUri: 'http://127.0.0.1:4173/api/auth/spotify/callback',
    });

    const loginRes = (await callApi('GET', '/api/auth/spotify/login')).json();
    assert.ok(loginRes.authUrl.includes('accounts.spotify.com/authorize'));
    const state = new URL(loginRes.authUrl).searchParams.get('state');

    const cbRes = await callApi('GET', `/api/auth/spotify/callback?code=auth_code_1&state=${encodeURIComponent(state)}`);
    assert.equal(cbRes.status, 302);
    assert.equal(cbRes.headers.Location, '/?spotifyConnected=1');

    const syncRes = (await callApi('POST', '/api/auth/spotify/sync', { replace: true })).json();
    assert.equal(syncRes.syncedTracks, 1);
    assert.equal(syncRes.syncedAlbums, 1);
    assert.equal(syncRes.tracks[0].isLiked, true);
    assert.equal(syncRes.tracks[0].fromAlbum, true);
    assert.equal(syncRes.tracks[0].bpm, 115);

    const pushRes = (
      await callApi('POST', '/api/playlists/push-spotify', {
        name: '115 BPM Darkwave',
        tracks: syncRes.tracks,
      })
    ).json();
    assert.equal(pushRes.spotifyPlaylistId, 'sp_pl_99');
  } finally {
    store.close();
  }
});
