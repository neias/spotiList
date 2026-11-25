import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';

import { getDemoLibrary } from '../src/data/demoLibrary.js';
import { computeHarmonicCompatibility, toCamelot } from '../src/domain/camelot.js';
import { generatePlaylist } from '../src/domain/playlistEngine.js';
import { SCENARIO_PRESETS } from '../src/domain/scenarios.js';
import { createAppServer } from '../src/server.js';
import { getDiscoveryCandidates } from '../src/services/discoveryService.js';
import { importFromSpotifyJson } from '../src/services/importers.js';
import { buildListeningCalendar } from '../src/services/listeningCalendarService.js';

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
          resolve({ status: statusCode, headers, text: raw, json: () => JSON.parse(raw) });
        },
      };
      Promise.resolve(requestHandler(req, res)).catch(reject);
    });

    queueMicrotask(() => {
      if (body !== null) {
        req.emit('data', Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
      }
      req.emit('end');
    });

    return resPromise;
  };
}

test('Feature 1: Camelot Wheel converts musical keys accurately and boosts harmonic transitions', () => {
  assert.equal(toCamelot(9, 0).code, '8A'); // A minor
  assert.equal(toCamelot(0, 1).code, '8B'); // C major (relative major of Am)
  assert.equal(toCamelot(4, 0).code, '9A'); // E minor (adjacent to Am)

  const same = computeHarmonicCompatibility({ musicalKey: 9, musicalMode: 0 }, { musicalKey: 9, musicalMode: 0 });
  const relative = computeHarmonicCompatibility({ musicalKey: 9, musicalMode: 0 }, { musicalKey: 0, musicalMode: 1 });
  const adjacent = computeHarmonicCompatibility({ musicalKey: 9, musicalMode: 0 }, { musicalKey: 4, musicalMode: 0 });
  const clash = computeHarmonicCompatibility({ musicalKey: 9, musicalMode: 0 }, { musicalKey: 3, musicalMode: 0 });

  assert.equal(same.relation, 'same');
  assert.equal(relative.relation, 'relative');
  assert.equal(adjacent.relation, 'adjacent');
  assert.equal(clash.relation, 'clash');
  assert.ok(adjacent.score > clash.score);

  const { tracks } = getDemoLibrary();
  const gen = generatePlaylist(tracks, {
    targetBpm: 122,
    toleranceBpm: 6,
    tempoCurve: 'steady',
    preferHarmonicKeys: true,
    trackCount: 10,
  });
  assert.ok(gen.tracks.every((t) => Boolean(t.camelotCode)));
  assert.ok(gen.metrics.harmonicCompatibility >= 50);
});

test('Feature 2: Duration-target mode and smart scenario presets generate right-sized playlists', () => {
  const { tracks } = getDemoLibrary();
  assert.ok(SCENARIO_PRESETS.length >= 5);

  const running = SCENARIO_PRESETS.find((s) => s.id === 'running_45');
  assert.ok(running);

  const res = generatePlaylist(tracks, {
    ...running.config,
    targetDurationMinutes: 30,
    selectionMode: 'duration',
  });
  assert.ok(res.tracks.length >= 5);
  const mins = res.metrics.totalDurationMs / 60000;
  assert.ok(mins >= 22 && mins <= 42, `Expected ~30 min playlist, got ${mins.toFixed(1)} min`);
});

test('Feature 3: Out-of-library discovery injects tempo-valid discovery tracks and supports adding to library', async () => {
  const { store, requestHandler } = createAppServer({ dbPath: ':memory:', seedDemoIfEmpty: true });
  const callApi = createTestClient(requestHandler);

  try {
    const gen = (
      await callApi('POST', '/api/playlists/generate', {
        targetBpm: 122,
        toleranceBpm: 8,
        tempoCurve: 'steady',
        moodIds: ['groove', 'euphoric'],
        trackCount: 12,
        discoveryRatio: 0.25,
      })
    ).json();

    const discTracks = gen.tracks.filter((t) => t.isDiscovery);
    assert.ok(discTracks.length >= 1, 'Expected at least 1 discovery track when discoveryRatio=0.25');
    for (const dt of discTracks) {
      assert.ok(Math.abs(dt.effectiveBpm - 122) <= 8, 'Discovery track must still obey Tempo #1 gate');
    }

    // Add discovered track to user's library
    const addRes = await callApi('POST', '/api/library/tracks', discTracks[0]);
    assert.equal(addRes.status, 201);
    assert.equal(addRes.json().track.isLiked, true);
  } finally {
    store.close();
  }
});

test('Feature 4 & 5: Crossfade preview deck module is served and Listening History Mood Calendar analyzes time blocks', async () => {
  const imported = importFromSpotifyJson([
    { artistName: 'Kalben', trackName: 'Sadece', msPlayed: 220000, endTime: '2026-11-20 08:15' },
    { artistName: 'Daft Punk', trackName: 'Get Lucky', msPlayed: 240000, endTime: '2026-11-20 20:30' },
    { artistName: 'Jakuzi', trackName: 'Koca Bir Saçmalık', msPlayed: 210000, endTime: '2026-11-20 23:45' },
  ]);
  assert.equal(imported.listeningEvents.length, 3);

  const cal = buildListeningCalendar(imported.listeningEvents, imported.tracks);
  assert.equal(cal.totalEvents, 3);
  assert.equal(cal.timeOfDay.find((b) => b.id === 'morning').eventCount, 1);
  assert.equal(cal.timeOfDay.find((b) => b.id === 'evening').eventCount, 1);
  assert.equal(cal.timeOfDay.find((b) => b.id === 'night').eventCount, 1);
  assert.equal(cal.calendarDays.length, 1);

  const { store, requestHandler } = createAppServer({ dbPath: ':memory:', seedDemoIfEmpty: true });
  const callApi = createTestClient(requestHandler);
  try {
    const previewJs = await callApi('GET', '/audioPreview.js');
    assert.equal(previewJs.status, 200);
    assert.ok(previewJs.text.includes('CrossfadePreviewDeck'));

    const lib = (await callApi('GET', '/api/library')).json();
    assert.ok(lib.listeningCalendar.totalEvents > 100);
    assert.equal(lib.listeningCalendar.timeOfDay.length, 4);
    assert.ok(lib.listeningCalendar.calendarDays.length >= 20);

    const discList = await getDiscoveryCandidates(lib.tracks, { fetchImpl: async () => new Response('{}', { status: 500 }) });
    assert.ok(discList.length >= 15);
  } finally {
    store.close();
  }
});

test('UX & Rules Upgrades: empty default start, real iTunes preview resolver, genre include/exclude, and scenario CRUD', async () => {
  const mockItunesFetch = async (url) => {
    if (String(url).includes('itunes.apple.com/search')) {
      return new Response(
        JSON.stringify({
          results: [
            {
              trackName: 'Senden Daha Güzel',
              previewUrl: 'https://audio-ssl.itunes.apple.com/sample.m4a',
              artworkUrl100: 'https://is1-ssl.mzstatic.com/art.jpg',
            },
          ],
        }),
        { status: 200 }
      );
    }
    return new Response('{}', { status: 404 });
  };

  // Default server starts EMPTY (no mock data!)
  const { store, requestHandler } = createAppServer({
    dbPath: ':memory:',
    fetchImpl: mockItunesFetch,
  });
  const callApi = createTestClient(requestHandler);

  try {
    const initialLib = (await callApi('GET', '/api/library')).json();
    assert.equal(initialLib.tracks.length, 0);
    assert.equal(initialLib.libraryMode, 'empty');

    // Resolve real 30s audio preview
    const preview = (await callApi('GET', '/api/preview/resolve?track=Senden%20Daha%20G%C3%BCzel&artist=Duman')).json();
    assert.equal(preview.source, 'itunes');
    assert.equal(preview.previewUrl, 'https://audio-ssl.itunes.apple.com/sample.m4a');

    // Scenario CRUD: add, delete, reset
    const added = await callApi('POST', '/api/scenarios', {
      icon: '🎸',
      labelTr: '115 BPM Rock',
      config: { targetBpm: 115, includeGenres: ['rock'] },
    });
    assert.equal(added.status, 201);
    const createdId = added.json().scenario.id;

    const deleted = await callApi('DELETE', `/api/scenarios/${encodeURIComponent(createdId)}`);
    assert.equal(deleted.status, 200);
    assert.equal(deleted.json().deleted, true);

    // Genre Include & Exclude filtering
    await callApi('POST', '/api/library/load-demo');
    const rockOnly = (
      await callApi('POST', '/api/playlists/generate', {
        targetBpm: 115,
        toleranceBpm: 20,
        includeGenres: ['rock'],
        excludeGenres: ['electronic'],
        trackCount: 8,
      })
    ).json();
    assert.ok(rockOnly.tracks.length > 0);
    assert.ok(rockOnly.tracks.every((t) => t.genreCategories.includes('rock')));
    assert.ok(rockOnly.tracks.every((t) => !t.genreCategories.includes('electronic')));
  } finally {
    store.close();
  }
});

test('Sonic Cohesion, Language Universe, and Vocal Mode prevent Özlem Tekin -> Röyksopp style whiplash', async () => {
  const { computeSonicCohesion, detectTrackLanguage } = await import('../src/domain/genres.js');
  const ozlem = {
    id: 'oz',
    name: 'A) Şık',
    artists: ['Özlem Tekin'],
    bpm: 124,
    valence: 0.94,
    energy: 0.48,
    danceability: 0.83,
    instrumentalness: 0.0,
    genres: ['anatolian rock', 'turkish pop'],
  };
  const royksopp = {
    id: 'rk',
    name: 'Sombre detune',
    artists: ['Röyksopp'],
    bpm: 122.5,
    valence: 0.37,
    energy: 0.77,
    danceability: 0.79,
    instrumentalness: 0.84,
    genres: ['downtempo', 'electronica', 'trip hop'],
  };
  const trPeer = {
    id: 'tp',
    name: 'Kuzu Kuzu',
    artists: ['Tarkan'],
    bpm: 124,
    valence: 0.83,
    energy: 0.78,
    danceability: 0.85,
    instrumentalness: 0.0,
    genres: ['turkish pop'],
  };

  assert.equal(detectTrackLanguage(ozlem), 'tr');
  assert.equal(detectTrackLanguage(royksopp), 'intl');

  const badPair = computeSonicCohesion(ozlem, royksopp);
  const goodPair = computeSonicCohesion(ozlem, trPeer);
  assert.ok(goodPair.score > badPair.score + 0.4, `Expected TR peer (${goodPair.score}) >> Röyksopp (${badPair.score})`);

  const trOnly = generatePlaylist([ozlem, royksopp, trPeer], {
    targetBpm: 123,
    toleranceBpm: 5,
    languageMode: 'tr',
    trackCount: 3,
  });
  assert.ok(trOnly.tracks.every((t) => t.id !== 'rk'));

  const instOnly = generatePlaylist([ozlem, royksopp, trPeer], {
    targetBpm: 123,
    toleranceBpm: 5,
    languageMode: 'all',
    vocalMode: 'instrumental',
    trackCount: 3,
  });
  assert.equal(instOnly.tracks.length, 1);
  assert.equal(instOnly.tracks[0].id, 'rk');
});
