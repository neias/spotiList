/**
 * Resolves real 30-second audio preview URLs for tracks using:
 * 1. Existing Spotify previewUrl (if present)
 * 2. iTunes Search API (Turkey store first, then global; tries exact query then cleaned title)
 * 3. Deezer Public Search API (tries exact query then cleaned title)
 * 4. Spotify Embed fallback URL when a valid 22-char Spotify Track ID is available
 */

export function cleanTrackTitleForSearch(title) {
  return String(title || '')
    .replace(/\s*\([^)]*\)/g, ' ') // remove (feat. ...), (Remix), (Remastered)
    .replace(/\s*\[[^\]]*\]/g, ' ') // remove [Radio Edit]
    .replace(/\s+-\s+.*$/, '') // remove " - ... Remix / Remastered"
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchItunes(query, country, fetchImpl) {
  const params = new URLSearchParams({
    term: query,
    entity: 'song',
    limit: '6',
  });
  if (country) params.set('country', country);

  const res = await fetchImpl(`https://itunes.apple.com/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];
  return results.find((r) => r.previewUrl) || null;
}

async function searchDeezer(query, fetchImpl) {
  const res = await fetchImpl(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=6`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const results = Array.isArray(data?.data) ? data.data : [];
  return results.find((r) => r.preview) || null;
}

export async function resolveRealAudioPreview(
  { trackId = '', trackName, artistName, existingUrl = null },
  fetchImpl = fetch
) {
  const isSpotifyId = /^[A-Za-z0-9]{22}$/.test(String(trackId || ''));
  const spotifyEmbedUrl = isSpotifyId
    ? `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`
    : null;

  if (existingUrl && /^https?:\/\//i.test(existingUrl)) {
    return { previewUrl: existingUrl, spotifyEmbedUrl, source: 'spotify' };
  }

  const cleanTrack = String(trackName || '').trim();
  const cleanArtist = String(artistName || '').trim();
  if (!cleanTrack) {
    return { previewUrl: null, spotifyEmbedUrl, source: spotifyEmbedUrl ? 'spotify_embed' : 'none' };
  }

  const strippedTrack = cleanTrackTitleForSearch(cleanTrack);
  const queries = [
    `${cleanArtist} ${cleanTrack}`.trim(),
    strippedTrack && strippedTrack !== cleanTrack ? `${cleanArtist} ${strippedTrack}`.trim() : null,
    cleanTrack,
  ].filter((q, idx, arr) => q && arr.indexOf(q) === idx);

  // 1. iTunes Search API (TR store first for Turkish & regional catalogs, then global)
  for (const q of queries) {
    for (const country of ['TR', 'US']) {
      try {
        const hit = await searchItunes(q, country, fetchImpl);
        if (hit?.previewUrl) {
          return {
            previewUrl: hit.previewUrl,
            artworkUrl: hit.artworkUrl100 || null,
            spotifyEmbedUrl,
            source: 'itunes',
          };
        }
      } catch {
        // continue
      }
    }
  }

  // 2. Deezer Public Search API
  for (const q of queries) {
    try {
      const hit = await searchDeezer(q, fetchImpl);
      if (hit?.preview) {
        return {
          previewUrl: hit.preview,
          artworkUrl: hit.album?.cover_medium || null,
          spotifyEmbedUrl,
          source: 'deezer',
        };
      }
    } catch {
      // continue
    }
  }

  // 3. Fallback to official Spotify Embed Player (works for 100% of real Spotify tracks!)
  return {
    previewUrl: null,
    spotifyEmbedUrl,
    source: spotifyEmbedUrl ? 'spotify_embed' : 'none',
  };
}
