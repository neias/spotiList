import { createHash, randomBytes } from 'node:crypto';

const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export const SPOTIFY_SCOPES = [
  'user-library-read',
  'user-top-read',
  'user-read-recently-played',
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
].join(' ');

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function createPkcePair() {
  const codeVerifier = base64UrlEncode(randomBytes(64));
  const codeChallenge = base64UrlEncode(
    createHash('sha256').update(codeVerifier).digest()
  );
  const state = base64UrlEncode(randomBytes(16));
  return { codeVerifier, codeChallenge, state };
}

export function buildSpotifyAuthUrl({ clientId, redirectUri, codeChallenge, state }) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode({
  clientId,
  code,
  redirectUri,
  codeVerifier,
  fetchImpl = fetch,
}) {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetchImpl(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || `Spotify token error (${res.status})`);
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    scope: data.scope,
  };
}

export async function refreshSpotifyToken({
  clientId,
  refreshToken,
  fetchImpl = fetch,
}) {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetchImpl(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || `Spotify refresh error (${res.status})`);
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    scope: data.scope,
  };
}

async function spotifyFetchJson(pathOrUrl, accessToken, options = {}, fetchImpl = fetch) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${SPOTIFY_API_BASE}${pathOrUrl}`;
  const res = await fetchImpl(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data?.error?.message || `Spotify API ${res.status} on ${url}`);
  }
  return data;
}

/**
 * Fetches Liked Tracks, Saved Albums (expanded to album tracks), and Top Tracks across time ranges.
 */
export async function syncSpotifyUserLibrary(accessToken, { maxPages = 4, fetchImpl = fetch } = {}) {
  const trackMap = new Map();
  const albums = [];
  const artistIds = new Set();

  function upsertTrack(rawTrack, patch = {}) {
    if (!rawTrack?.id || rawTrack.is_local) return;
    const existing = trackMap.get(rawTrack.id);
    const artists = (rawTrack.artists || []).map((a) => a.name).filter(Boolean);
    for (const a of rawTrack.artists || []) {
      if (a.id) artistIds.add(a.id);
    }
    const imageUrl = rawTrack.album?.images?.[1]?.url || rawTrack.album?.images?.[0]?.url || existing?.imageUrl || null;

    trackMap.set(rawTrack.id, {
      id: rawTrack.id,
      uri: rawTrack.uri || `spotify:track:${rawTrack.id}`,
      name: rawTrack.name,
      artists: artists.length ? artists : existing?.artists || ['Unknown Artist'],
      primaryArtistIds: (rawTrack.artists || []).map((a) => a.id).filter(Boolean),
      albumId: rawTrack.album?.id || existing?.albumId || null,
      albumName: rawTrack.album?.name || existing?.albumName || '',
      durationMs: rawTrack.duration_ms || existing?.durationMs || 0,
      genres: existing?.genres || [],
      isLiked: Boolean(existing?.isLiked || patch.isLiked),
      fromAlbum: Boolean(existing?.fromAlbum || patch.fromAlbum),
      playCount: Math.max(existing?.playCount || 0, patch.playCount || 0),
      topRank:
        existing?.topRank && patch.topRank
          ? Math.min(existing.topRank, patch.topRank)
          : existing?.topRank ?? patch.topRank ?? null,
      featureSource: 'estimated',
      imageUrl,
      previewUrl: rawTrack.preview_url || existing?.previewUrl || null,
      addedAt: patch.addedAt || existing?.addedAt || new Date().toISOString(),
    });
  }

  // 1. Liked Tracks (/me/tracks)
  let nextUrl = '/me/tracks?limit=50';
  for (let p = 0; p < maxPages && nextUrl; p += 1) {
    const page = await spotifyFetchJson(nextUrl, accessToken, {}, fetchImpl);
    for (const item of page.items || []) {
      upsertTrack(item.track, { isLiked: true, addedAt: item.added_at });
    }
    nextUrl = page.next;
  }

  // 2. Saved Albums (/me/albums)
  let albumUrl = '/me/albums?limit=20';
  for (let p = 0; p < maxPages && albumUrl; p += 1) {
    const page = await spotifyFetchJson(albumUrl, accessToken, {}, fetchImpl);
    for (const item of page.items || []) {
      const alb = item.album;
      if (!alb?.id) continue;
      albums.push({
        id: alb.id,
        name: alb.name,
        artist: alb.artists?.[0]?.name || 'Unknown Artist',
        releaseYear: alb.release_date ? Number(alb.release_date.slice(0, 4)) : null,
        totalTracks: alb.total_tracks || alb.tracks?.total || 0,
        imageUrl: alb.images?.[1]?.url || alb.images?.[0]?.url || null,
        savedAt: item.added_at,
      });

      const albumImage = alb.images?.[1]?.url || alb.images?.[0]?.url || null;
      for (const tr of alb.tracks?.items || []) {
        upsertTrack(
          {
            ...tr,
            album: { id: alb.id, name: alb.name, images: albumImage ? [{ url: albumImage }] : [] },
          },
          { fromAlbum: true, addedAt: item.added_at }
        );
      }
    }
    albumUrl = page.next;
  }

  // 3. Most-Listened / Top Tracks across short, medium, and long term
  const ranges = [
    { key: 'short_term', weightPlays: 120 },
    { key: 'medium_term', weightPlays: 100 },
    { key: 'long_term', weightPlays: 85 },
  ];
  for (const r of ranges) {
    try {
      const topPage = await spotifyFetchJson(`/me/top/tracks?time_range=${r.key}&limit=50`, accessToken, {}, fetchImpl);
      (topPage.items || []).forEach((tr, idx) => {
        const rank = idx + 1;
        const syntheticPlays = Math.max(15, Math.round(r.weightPlays * (1 - idx / 60)));
        upsertTrack(tr, { topRank: rank, playCount: syntheticPlays });
      });
    } catch {
      // Continue if a time_range returns empty
    }
  }

  // 4. Recently Played Tracks (/me/player/recently-played) for live Mood Calendar & Time-of-Day
  const listeningEvents = [];
  try {
    const recentPage = await spotifyFetchJson('/me/player/recently-played?limit=50', accessToken, {}, fetchImpl);
    for (const item of recentPage.items || []) {
      const tr = item.track;
      if (!tr?.id) continue;
      upsertTrack(tr, { playCount: 1 });
      if (item.played_at) {
        listeningEvents.push({
          trackId: tr.id,
          trackName: tr.name,
          artistName: tr.artists?.[0]?.name || 'Unknown Artist',
          playedAt: item.played_at,
          msPlayed: tr.duration_ms || 210000,
        });
      }
    }
  } catch {
    // Non-fatal if user has no recent history
  }

  // 5. Enrich artist genres in chunks of 50
  const artistGenreMap = new Map();
  const artistList = Array.from(artistIds);
  for (let i = 0; i < artistList.length; i += 50) {
    const chunk = artistList.slice(i, i + 50);
    try {
      const data = await spotifyFetchJson(`/artists?ids=${chunk.join(',')}`, accessToken, {}, fetchImpl);
      for (const a of data.artists || []) {
        if (a?.id && Array.isArray(a.genres)) {
          artistGenreMap.set(a.id, a.genres);
        }
      }
    } catch {
      // Non-fatal
    }
  }

  const tracks = Array.from(trackMap.values()).map((t) => {
    const genres = new Set(t.genres);
    for (const aid of t.primaryArtistIds || []) {
      for (const g of artistGenreMap.get(aid) || []) {
        genres.add(g);
      }
    }
    const { primaryArtistIds, ...clean } = t;
    return { ...clean, genres: Array.from(genres) };
  });

  return { tracks, albums, listeningEvents };
}

/**
 * Creates a playlist in the user's Spotify account using current 2026 endpoints:
 * POST /v1/me/playlists followed by adding track URIs.
 */
export async function createSpotifyPlaylist(
  accessToken,
  { name, description = '', isPublic = false, trackUris = [] },
  fetchImpl = fetch
) {
  const created = await spotifyFetchJson(
    '/me/playlists',
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: Boolean(isPublic),
      }),
    },
    fetchImpl
  );

  const validUris = trackUris.filter((u) => typeof u === 'string' && u.startsWith('spotify:track:'));
  for (let i = 0; i < validUris.length; i += 100) {
    const chunk = validUris.slice(i, i + 100);
    try {
      await spotifyFetchJson(
        `/playlists/${created.id}/items`,
        accessToken,
        {
          method: 'POST',
          body: JSON.stringify({ uris: chunk }),
        },
        fetchImpl
      );
    } catch {
      await spotifyFetchJson(
        `/playlists/${created.id}/tracks`,
        accessToken,
        {
          method: 'POST',
          body: JSON.stringify({ uris: chunk }),
        },
        fetchImpl
      );
    }
  }

  return {
    spotifyPlaylistId: created.id,
    spotifyUrl: created.external_urls?.spotify || `https://open.spotify.com/playlist/${created.id}`,
  };
}
