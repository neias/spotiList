import { estimateAudioFeatures } from './audioFeaturesService.js';

function makeTrackId(name, artist) {
  const slug = `${name}|${artist}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 48);
  return `imp_${slug || Math.random().toString(36).slice(2, 10)}`;
}

function parseCsvRows(csvText) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field.trim());
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(field.trim());
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }
  return rows;
}

/**
 * Parses Exportify CSV or generic track CSV exports.
 */
export function importFromCsv(csvText, { sourceType = 'liked' } = {}) {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    throw new Error('CSV must include a header row and at least one track row.');
  }

  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, ' ').trim());
  const col = (aliases) => headers.findIndex((h) => aliases.some((a) => h === a || h.includes(a)));

  const idxUri = col(['track uri', 'spotify uri', 'uri']);
  const idxId = col(['track id', 'spotify id', 'id']);
  const idxName = col(['track name', 'title', 'song', 'name']);
  const idxArtist = col(['artist name(s)', 'artist name', 'artists', 'artist']);
  const idxAlbum = col(['album name', 'album']);
  const idxDuration = col(['duration (ms)', 'duration_ms', 'duration']);
  const idxGenres = col(['genres', 'artist genres']);
  const idxBpm = col(['tempo', 'bpm']);
  const idxValence = col(['valence']);
  const idxEnergy = col(['energy']);
  const idxDance = col(['danceability']);
  const idxAcoustic = col(['acousticness']);
  const idxInstr = col(['instrumentalness']);
  const idxKey = col(['key']);
  const idxMode = col(['mode']);
  const idxPlays = col(['play count', 'plays', 'streams']);

  if (idxName === -1) {
    throw new Error('CSV missing a track name column (e.g., "Track Name" or "name").');
  }

  const tracks = [];
  const albumMap = new Map();
  const listeningEvents = [];

  for (let i = 1; i < rows.length; i += 1) {
    const r = rows[i];
    const name = r[idxName];
    if (!name) continue;

    const rawArtist = idxArtist >= 0 ? r[idxArtist] : 'Unknown Artist';
    const artists = rawArtist.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const albumName = idxAlbum >= 0 ? r[idxAlbum] : '';
    const uri = idxUri >= 0 ? r[idxUri] : '';
    const extractedId =
      (idxId >= 0 && r[idxId]) ||
      uri.match(/spotify:track:([A-Za-z0-9]+)/)?.[1] ||
      makeTrackId(name, artists[0] || '');

    const genres =
      idxGenres >= 0 && r[idxGenres]
        ? r[idxGenres].split(/[,;]/).map((g) => g.trim()).filter(Boolean)
        : [];

    const hasMeasuredBpm = idxBpm >= 0 && Number.isFinite(Number(r[idxBpm])) && Number(r[idxBpm]) > 0;
    const base = {
      id: extractedId,
      uri: uri || `spotify:track:${extractedId}`,
      name,
      artists: artists.length ? artists : ['Unknown Artist'],
      albumId: albumName ? `alb_${makeTrackId(albumName, artists[0] || '')}` : null,
      albumName,
      durationMs: idxDuration >= 0 ? Number(r[idxDuration]) || 210000 : 210000,
      genres,
      isLiked: sourceType === 'liked',
      fromAlbum: sourceType === 'album',
      playCount: idxPlays >= 0 ? Number(r[idxPlays]) || 0 : sourceType === 'top' ? 60 : 0,
      topRank: null,
    };

    const estimated = estimateAudioFeatures(base);
    tracks.push({
      ...base,
      bpm: hasMeasuredBpm ? Number(r[idxBpm]) : estimated.bpm,
      valence: idxValence >= 0 && r[idxValence] !== '' ? Number(r[idxValence]) : estimated.valence,
      energy: idxEnergy >= 0 && r[idxEnergy] !== '' ? Number(r[idxEnergy]) : estimated.energy,
      danceability: idxDance >= 0 && r[idxDance] !== '' ? Number(r[idxDance]) : estimated.danceability,
      acousticness: idxAcoustic >= 0 && r[idxAcoustic] !== '' ? Number(r[idxAcoustic]) : estimated.acousticness,
      instrumentalness: idxInstr >= 0 && r[idxInstr] !== '' ? Number(r[idxInstr]) : estimated.instrumentalness,
      musicalKey: idxKey >= 0 && r[idxKey] !== '' && Number.isInteger(Number(r[idxKey])) ? Number(r[idxKey]) : estimated.musicalKey,
      musicalMode: idxMode >= 0 && r[idxMode] !== '' && (Number(r[idxMode]) === 0 || Number(r[idxMode]) === 1) ? Number(r[idxMode]) : estimated.musicalMode,
      featureSource: hasMeasuredBpm ? 'measured' : 'estimated',
      manualOverride: false,
      addedAt: new Date().toISOString(),
    });

    if (sourceType === 'album' && albumName && !albumMap.has(base.albumId)) {
      albumMap.set(base.albumId, {
        id: base.albumId,
        name: albumName,
        artist: artists[0] || 'Unknown Artist',
        totalTracks: 1,
        savedAt: new Date().toISOString(),
      });
    } else if (base.albumId && albumMap.has(base.albumId)) {
      albumMap.get(base.albumId).totalTracks += 1;
    }
  }

  return { tracks, albums: Array.from(albumMap.values()), listeningEvents };
}

/**
 * Parses Spotify Privacy Data Export JSON files:
 * - YourLibrary.json ({ tracks: [...], albums: [...] })
 * - StreamingHistory_music_*.json ([{ artistName, trackName, msPlayed }])
 * - Extended Streaming History ([{ master_metadata_track_name, master_metadata_album_artist_name, spotify_track_uri, ms_played }])
 * - Generic array of track objects
 */
export function importFromSpotifyJson(jsonInput) {
  const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
  const trackMap = new Map();
  const albumMap = new Map();
  const listeningEvents = [];

  function upsert(item) {
    const existing = trackMap.get(item.id);
    if (!existing) {
      const est = estimateAudioFeatures(item);
      trackMap.set(item.id, {
        ...est,
        ...item,
        bpm: item.bpm ?? est.bpm,
        valence: item.valence ?? est.valence,
        energy: item.energy ?? est.energy,
        danceability: item.danceability ?? est.danceability,
        acousticness: item.acousticness ?? est.acousticness,
        instrumentalness: item.instrumentalness ?? est.instrumentalness,
        featureSource: item.bpm ? item.featureSource || 'measured' : 'estimated',
      });
    } else {
      existing.isLiked = existing.isLiked || item.isLiked;
      existing.fromAlbum = existing.fromAlbum || item.fromAlbum;
      existing.playCount = (existing.playCount || 0) + (item.playCount || 0);
    }
  }

  if (data && !Array.isArray(data) && (Array.isArray(data.tracks) || Array.isArray(data.albums))) {
    // Spotify YourLibrary.json format
    for (const t of data.tracks || []) {
      const id = t.uri?.match(/spotify:track:([A-Za-z0-9]+)/)?.[1] || makeTrackId(t.track, t.artist);
      upsert({
        id,
        uri: t.uri || `spotify:track:${id}`,
        name: t.track || t.name || 'Unknown Track',
        artists: [t.artist || 'Unknown Artist'],
        albumName: t.album || '',
        isLiked: true,
        fromAlbum: false,
        playCount: 0,
      });
    }
    for (const a of data.albums || []) {
      const albumId = a.uri?.match(/spotify:album:([A-Za-z0-9]+)/)?.[1] || makeTrackId(a.album, a.artist);
      albumMap.set(albumId, {
        id: albumId,
        name: a.album || a.name,
        artist: a.artist || 'Unknown Artist',
        totalTracks: 1,
        savedAt: new Date().toISOString(),
      });
    }
  } else if (Array.isArray(data)) {
    // Streaming history or generic track array
    for (const row of data) {
      if (row.trackName || row.master_metadata_track_name) {
        const name = row.trackName || row.master_metadata_track_name;
        const artist = row.artistName || row.master_metadata_album_artist_name || 'Unknown Artist';
        const msPlayed = Number(row.msPlayed ?? row.ms_played ?? 0);
        if (msPlayed > 0 && msPlayed < 20000) continue; // skip accidental <20s skips
        const uri = row.spotify_track_uri || '';
        const id = uri.match(/spotify:track:([A-Za-z0-9]+)/)?.[1] || makeTrackId(name, artist);
        const rawTs = row.endTime || row.ts || row.playedAt;
        if (rawTs) {
          const parsedDate = new Date(String(rawTs).includes('T') ? rawTs : String(rawTs).replace(' ', 'T') + ':00Z');
          if (!Number.isNaN(parsedDate.getTime())) {
            listeningEvents.push({
              trackId: id,
              trackName: name,
              artistName: artist,
              playedAt: parsedDate.toISOString(),
              msPlayed: msPlayed || 210000,
            });
          }
        }
        upsert({
          id,
          uri: uri || `spotify:track:${id}`,
          name,
          artists: [artist],
          albumName: row.master_metadata_album_album_name || '',
          durationMs: 210000,
          isLiked: false,
          fromAlbum: false,
          playCount: 1,
        });
      } else if (row.name) {
        const artists = Array.isArray(row.artists) ? row.artists : [row.artist || 'Unknown Artist'];
        const id = row.id || makeTrackId(row.name, artists[0]);
        upsert({
          id,
          uri: row.uri || `spotify:track:${id}`,
          name: row.name,
          artists,
          albumName: row.albumName || row.album || '',
          durationMs: row.durationMs || 210000,
          genres: row.genres || [],
          isLiked: Boolean(row.isLiked),
          fromAlbum: Boolean(row.fromAlbum),
          playCount: Number(row.playCount || 0),
          topRank: row.topRank ?? null,
          bpm: row.bpm ? Number(row.bpm) : undefined,
          valence: row.valence !== undefined ? Number(row.valence) : undefined,
          energy: row.energy !== undefined ? Number(row.energy) : undefined,
          danceability: row.danceability !== undefined ? Number(row.danceability) : undefined,
          acousticness: row.acousticness !== undefined ? Number(row.acousticness) : undefined,
          instrumentalness: row.instrumentalness !== undefined ? Number(row.instrumentalness) : undefined,
          featureSource: row.bpm ? 'measured' : 'estimated',
        });
      }
    }
  } else {
    throw new Error('Unrecognized JSON format. Expected Spotify YourLibrary.json, StreamingHistory JSON, or track array.');
  }

  // Assign synthetic topRank to top-played imported tracks
  const tracks = Array.from(trackMap.values()).sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  tracks.forEach((t, idx) => {
    if (t.playCount > 0 && idx < 50 && !t.topRank) {
      t.topRank = idx + 1;
    }
  });

  return { tracks, albums: Array.from(albumMap.values()), listeningEvents };
}

export function exportPlaylistAs(playlist, format = 'json') {
  const tracks = playlist.tracks || [];
  if (format === 'csv') {
    const header = 'Slot,Track Name,Artist(s),Album,BPM,Delta BPM,Mood,Tempo Score,Mood Score,Source Score,Spotify URI';
    const lines = tracks.map((t, i) => {
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      return [
        i + 1,
        esc(t.name),
        esc((t.artists || []).join('; ')),
        esc(t.albumName || ''),
        t.effectiveBpm ?? t.bpm,
        t.deltaBpmFromPrev ?? 0,
        esc(t.matchedMood || t.primaryMood || ''),
        t.scores?.tempo ?? '',
        t.scores?.mood ?? '',
        t.scores?.affinity ?? '',
        esc(t.uri || ''),
      ].join(',');
    });
    return {
      contentType: 'text/csv; charset=utf-8',
      filename: `${playlist.name || 'spotilist'}.csv`,
      body: [header, ...lines].join('\n'),
    };
  }

  if (format === 'm3u') {
    const lines = ['#EXTM3U', `#PLAYLIST:${playlist.name || 'SpotiList'}`];
    for (const t of tracks) {
      const secs = Math.round((t.durationMs || 200000) / 1000);
      lines.push(`#EXTINF:${secs},${(t.artists || []).join(', ')} - ${t.name} [${t.effectiveBpm ?? t.bpm} BPM]`);
      lines.push(t.uri || t.id);
    }
    return {
      contentType: 'audio/x-mpegurl; charset=utf-8',
      filename: `${playlist.name || 'spotilist'}.m3u8`,
      body: lines.join('\n'),
    };
  }

  return {
    contentType: 'application/json; charset=utf-8',
    filename: `${playlist.name || 'spotilist'}.json`,
    body: JSON.stringify(playlist, null, 2),
  };
}
