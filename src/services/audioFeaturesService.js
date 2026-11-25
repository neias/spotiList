/**
 * Multi-layer Tempo (BPM) & Audio Feature enrichment service.
 *
 * Layer 1: ReccoBeats API (works with Spotify track IDs even when Spotify /audio-features returns 403)
 * Layer 2: Optional Spotify /v1/audio-features (for grandfathered Developer apps)
 * Layer 3: Deterministic genre + metadata heuristic estimator (explicitly tagged 'estimated')
 */

const GENRE_TEMPO_PRIORS = [
  { match: /drum and bass|dnb|jungle/i, bpm: 172, valence: 0.45, energy: 0.92, danceability: 0.62, acousticness: 0.03, instrumentalness: 0.35 },
  { match: /dubstep|trap/i, bpm: 140, valence: 0.32, energy: 0.80, danceability: 0.72, acousticness: 0.05, instrumentalness: 0.15 },
  { match: /techno|trance|hardstyle/i, bpm: 134, valence: 0.34, energy: 0.88, danceability: 0.75, acousticness: 0.02, instrumentalness: 0.70 },
  { match: /house|uk garage|disco|dance/i, bpm: 123, valence: 0.66, energy: 0.78, danceability: 0.82, acousticness: 0.06, instrumentalness: 0.18 },
  { match: /synthwave|synthpop|electropop|darkwave/i, bpm: 116, valence: 0.48, energy: 0.72, danceability: 0.71, acousticness: 0.07, instrumentalness: 0.12 },
  { match: /metal|punk|hardcore|ska/i, bpm: 142, valence: 0.30, energy: 0.90, danceability: 0.48, acousticness: 0.04, instrumentalness: 0.06 },
  { match: /turkish rock|anatolian rock|indie rock|alternative rock|rock/i, bpm: 114, valence: 0.44, energy: 0.72, danceability: 0.54, acousticness: 0.14, instrumentalness: 0.05 },
  { match: /turkish pop|pop/i, bpm: 112, valence: 0.64, energy: 0.68, danceability: 0.72, acousticness: 0.16, instrumentalness: 0.02 },
  { match: /r&b|soul|funk/i, bpm: 96, valence: 0.54, energy: 0.58, danceability: 0.71, acousticness: 0.24, instrumentalness: 0.05 },
  { match: /hip hop|rap/i, bpm: 94, valence: 0.48, energy: 0.66, danceability: 0.76, acousticness: 0.12, instrumentalness: 0.02 },
  { match: /folk|acoustic|singer-songwriter/i, bpm: 84, valence: 0.42, energy: 0.34, danceability: 0.46, acousticness: 0.80, instrumentalness: 0.08 },
  { match: /ambient|neoclassical|classical|jazz|lo-fi|chill/i, bpm: 78, valence: 0.44, energy: 0.32, danceability: 0.44, acousticness: 0.72, instrumentalness: 0.78 },
];

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function estimateAudioFeatures(track) {
  const genresJoined = Array.isArray(track.genres) ? track.genres.join(' ') : '';
  const seed = hashString(`${track.name || ''}|${(track.artists || []).join(',')}|${genresJoined}`);
  const jitter = (seed - 0.5) * 2; // [-1, 1]

  const matched = GENRE_TEMPO_PRIORS.find((p) => p.match.test(genresJoined));
  if (matched) {
    const val = Math.max(0.05, Math.min(0.95, matched.valence + jitter * 0.12));
    return {
      bpm: Math.round(matched.bpm + jitter * 8),
      valence: val,
      energy: Math.max(0.08, Math.min(0.96, matched.energy + jitter * 0.10)),
      danceability: Math.max(0.15, Math.min(0.95, matched.danceability + jitter * 0.09)),
      acousticness: Math.max(0.01, Math.min(0.95, matched.acousticness - jitter * 0.08)),
      instrumentalness: matched.instrumentalness,
      musicalKey: Math.floor(seed * 12) % 12,
      musicalMode: val >= 0.52 ? 1 : 0,
      featureSource: 'estimated',
    };
  }

  const val = Math.round((0.50 + jitter * 0.18) * 100) / 100;
  return {
    bpm: Math.round(110 + jitter * 20),
    valence: val,
    energy: Math.round((0.58 + jitter * 0.18) * 100) / 100,
    danceability: Math.round((0.58 + jitter * 0.15) * 100) / 100,
    acousticness: 0.22,
    instrumentalness: 0.05,
    musicalKey: Math.floor(seed * 12) % 12,
    musicalMode: val >= 0.52 ? 1 : 0,
    featureSource: 'estimated',
  };
}

function normalizeFeaturePayload(raw, featureSource) {
  if (!raw || !Number.isFinite(Number(raw.tempo)) || Number(raw.tempo) <= 0) {
    return null;
  }
  const keyVal = Number(raw.key);
  const modeVal = Number(raw.mode);
  return {
    bpm: Math.round(Number(raw.tempo) * 10) / 10,
    valence: Number(raw.valence ?? 0.5),
    energy: Number(raw.energy ?? 0.5),
    danceability: Number(raw.danceability ?? 0.5),
    acousticness: Number(raw.acousticness ?? 0.2),
    instrumentalness: Number(raw.instrumentalness ?? 0.05),
    musicalKey: Number.isInteger(keyVal) && keyVal >= 0 && keyVal <= 11 ? keyVal : null,
    musicalMode: modeVal === 0 || modeVal === 1 ? modeVal : null,
    featureSource,
  };
}

/**
 * Fetches audio features from ReccoBeats API in batches of up to 40 Spotify IDs.
 */
export async function fetchReccoBeatsFeatures(spotifyTrackIds, fetchImpl = fetch) {
  const results = new Map();
  const validIds = spotifyTrackIds.filter((id) => /^[A-Za-z0-9]{22}$/.test(id));
  if (validIds.length === 0) return results;

  const chunkSize = 40;
  for (let i = 0; i < validIds.length; i += chunkSize) {
    const chunk = validIds.slice(i, i + chunkSize);
    const url = `https://api.reccobeats.com/v1/audio-features?ids=${encodeURIComponent(chunk.join(','))}`;
    try {
      const res = await fetchImpl(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      for (const item of items) {
        const spotifyId =
          item.href?.match(/track\/([A-Za-z0-9]{22})/)?.[1] ||
          item.spotifyId ||
          item.id;
        const normalized = normalizeFeaturePayload(item, 'reccobeats');
        if (spotifyId && normalized) {
          results.set(spotifyId, normalized);
        }
      }
    } catch {
      // Network/timeout fallback handled gracefully by caller
    }
  }
  return results;
}

/**
 * Optional Spotify legacy audio-features endpoint (for grandfathered apps).
 */
export async function fetchSpotifyAudioFeatures(spotifyTrackIds, accessToken, fetchImpl = fetch) {
  const results = new Map();
  const validIds = spotifyTrackIds.filter((id) => /^[A-Za-z0-9]{22}$/.test(id));
  if (!accessToken || validIds.length === 0) return results;

  const chunkSize = 100;
  for (let i = 0; i < validIds.length; i += chunkSize) {
    const chunk = validIds.slice(i, i + chunkSize);
    const url = `https://api.spotify.com/v1/audio-features?ids=${encodeURIComponent(chunk.join(','))}`;
    try {
      const res = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 403 || res.status === 401) {
        // Expected on post-2024 Development Mode Spotify apps
        break;
      }
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data?.audio_features || []) {
        if (!item?.id) continue;
        const normalized = normalizeFeaturePayload(item, 'spotify');
        if (normalized) {
          results.set(item.id, normalized);
        }
      }
    } catch {
      break;
    }
  }
  return results;
}

/**
 * Enriches an array of tracks with measured BPM/mood features when available,
 * falling back to deterministic metadata/genre heuristics where needed.
 */
export async function enrichTracksAudioFeatures(tracks, { accessToken = null, fetchImpl = fetch } = {}) {
  const needsEnrichment = tracks.filter(
    (t) => !t.manualOverride && (t.featureSource === 'estimated' || !t.bpm)
  );
  const ids = needsEnrichment.map((t) => t.id);

  let spotifyMap = new Map();
  if (accessToken && ids.length > 0) {
    spotifyMap = await fetchSpotifyAudioFeatures(ids, accessToken, fetchImpl);
  }

  const remainingIds = ids.filter((id) => !spotifyMap.has(id));
  const reccoMap = remainingIds.length > 0
    ? await fetchReccoBeatsFeatures(remainingIds, fetchImpl)
    : new Map();

  let measuredCount = 0;
  let estimatedCount = 0;

  const enriched = tracks.map((track) => {
    if (track.manualOverride) return track;
    if (track.featureSource === 'measured' || track.featureSource === 'reccobeats' || track.featureSource === 'spotify') {
      measuredCount += 1;
      return track;
    }

    const fromSpotify = spotifyMap.get(track.id);
    if (fromSpotify) {
      measuredCount += 1;
      return { ...track, ...fromSpotify };
    }

    const fromRecco = reccoMap.get(track.id);
    if (fromRecco) {
      measuredCount += 1;
      return { ...track, ...fromRecco };
    }

    estimatedCount += 1;
    const est = estimateAudioFeatures(track);
    return { ...track, ...est };
  });

  return {
    tracks: enriched,
    stats: {
      total: enriched.length,
      measuredCount,
      estimatedCount,
    },
  };
}
