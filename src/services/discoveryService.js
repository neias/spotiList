import { fetchReccoBeatsFeatures, estimateAudioFeatures } from './audioFeaturesService.js';

/**
 * Curated out-of-library discovery tracks spanning 68-174 BPM and all 6 moods,
 * used when offline or when library tracks do not have Spotify 22-char IDs.
 */
const DISCOVERY_CATALOG = [
  { id: 'disc_01', name: 'Midnight Groove', artists: ['Parcels'], albumName: 'Day/Night', bpm: 120, valence: 0.79, energy: 0.76, danceability: 0.85, acousticness: 0.11, instrumentalness: 0.18, musicalKey: 9, musicalMode: 0, durationMs: 245000, genres: ['nu-disco', 'indie dance'] },
  { id: 'disc_02', name: 'Tieduprightnow', artists: ['Parcels'], albumName: 'Parcels', bpm: 104, valence: 0.84, energy: 0.73, danceability: 0.82, acousticness: 0.08, instrumentalness: 0.05, musicalKey: 4, musicalMode: 0, durationMs: 249000, genres: ['nu-disco'] },
  { id: 'disc_03', name: 'Yalan Dünya', artists: ['Mirkelam'], albumName: 'Mirkelam', bpm: 124, valence: 0.74, energy: 0.81, danceability: 0.79, acousticness: 0.10, instrumentalness: 0.01, musicalKey: 9, musicalMode: 0, durationMs: 221000, genres: ['turkish pop'] },
  { id: 'disc_04', name: 'Geceyi Sana Yazdım', artists: ['Onur Özdemir'], albumName: 'Gece', bpm: 92, valence: 0.28, energy: 0.45, danceability: 0.54, acousticness: 0.36, instrumentalness: 0.03, musicalKey: 2, musicalMode: 0, durationMs: 232000, genres: ['turkish indie'] },
  { id: 'disc_05', name: 'Kısır Döngü', artists: ['Lin Pesto'], albumName: 'Son', bpm: 114, valence: 0.24, energy: 0.69, danceability: 0.71, acousticness: 0.09, instrumentalness: 0.14, musicalKey: 11, musicalMode: 0, durationMs: 204000, genres: ['turkish darkwave', 'synthpop'] },
  { id: 'disc_06', name: 'Atlas', artists: ['Bicep'], albumName: 'Isles', bpm: 128, valence: 0.36, energy: 0.83, danceability: 0.74, acousticness: 0.03, instrumentalness: 0.84, musicalKey: 7, musicalMode: 0, durationMs: 294000, genres: ['breakbeat', 'electronic'] },
  { id: 'disc_07', name: 'Opus', artists: ['Eric Prydz'], albumName: 'Opus', bpm: 126, valence: 0.45, energy: 0.82, danceability: 0.69, acousticness: 0.02, instrumentalness: 0.94, musicalKey: 6, musicalMode: 0, durationMs: 543000, genres: ['progressive house'] },
  { id: 'disc_08', name: 'Kirlian', artists: ['Kiasmos'], albumName: 'Kiasmos', bpm: 122, valence: 0.34, energy: 0.56, danceability: 0.67, acousticness: 0.21, instrumentalness: 0.91, musicalKey: 4, musicalMode: 0, durationMs: 312000, genres: ['minimal techno', 'ambient'] },
  { id: 'disc_09', name: 'Ghosts', artists: ['Ólafur Arnalds'], albumName: 're:member', bpm: 78, valence: 0.31, energy: 0.34, danceability: 0.39, acousticness: 0.86, instrumentalness: 0.89, musicalKey: 0, musicalMode: 1, durationMs: 256000, genres: ['neoclassical'] },
  { id: 'disc_10', name: 'Wait', artists: ['M83'], albumName: 'Hurry Up, We\'re Dreaming', bpm: 72, valence: 0.21, energy: 0.41, danceability: 0.34, acousticness: 0.44, instrumentalness: 0.27, musicalKey: 7, musicalMode: 1, durationMs: 343000, genres: ['dream pop', 'ambient'] },
  { id: 'disc_11', name: 'Bana Bir Masal Anlat Baba', artists: ['Yeni Türkü'], albumName: 'Süper Baba', bpm: 80, valence: 0.52, energy: 0.33, danceability: 0.49, acousticness: 0.78, instrumentalness: 0.06, musicalKey: 5, musicalMode: 1, durationMs: 218000, genres: ['turkish folk pop', 'acoustic'] },
  { id: 'disc_12', name: 'Rüya', artists: ['Ezginin Günlüğü'], albumName: 'Aşk Yüzünden', bpm: 84, valence: 0.49, energy: 0.35, danceability: 0.47, acousticness: 0.81, instrumentalness: 0.04, musicalKey: 0, musicalMode: 1, durationMs: 229000, genres: ['turkish acoustic'] },
  { id: 'disc_13', name: 'Run Boy Run', artists: ['Woodkid'], albumName: 'The Golden Age', bpm: 162, valence: 0.37, energy: 0.91, danceability: 0.54, acousticness: 0.14, instrumentalness: 0.08, musicalKey: 2, musicalMode: 0, durationMs: 213000, genres: ['indie pop', 'cinematic'] },
  { id: 'disc_14', name: 'Dog Days Are Over', artists: ['Florence + The Machine'], albumName: 'Lungs', bpm: 150, valence: 0.76, energy: 0.88, danceability: 0.59, acousticness: 0.12, instrumentalness: 0.00, musicalKey: 7, musicalMode: 1, durationMs: 252000, genres: ['indie rock'] },
  { id: 'disc_15', name: 'Witchcraft', artists: ['Pendulum'], albumName: 'Immersion', bpm: 174, valence: 0.41, energy: 0.96, danceability: 0.62, acousticness: 0.01, instrumentalness: 0.12, musicalKey: 4, musicalMode: 0, durationMs: 253000, genres: ['drum and bass'] },
  { id: 'disc_16', name: 'Geceler', artists: ['Ezhel'], albumName: 'Müptezhel', bpm: 134, valence: 0.29, energy: 0.78, danceability: 0.75, acousticness: 0.06, instrumentalness: 0.01, musicalKey: 9, musicalMode: 0, durationMs: 217000, genres: ['turkish trap', 'hip hop'] },
  { id: 'disc_17', name: 'Kendine İyi Bak', artists: ['Pinhani'], albumName: 'İnandığın Masallar', bpm: 96, valence: 0.46, energy: 0.48, danceability: 0.54, acousticness: 0.52, instrumentalness: 0.02, musicalKey: 2, musicalMode: 1, durationMs: 263000, genres: ['turkish rock', 'acoustic'] },
  { id: 'disc_18', name: 'Lose Yourself to Dance', artists: ['Daft Punk', 'Pharrell Williams'], albumName: 'Random Access Memories', bpm: 100, valence: 0.78, energy: 0.71, danceability: 0.87, acousticness: 0.05, instrumentalness: 0.02, musicalKey: 5, musicalMode: 0, durationMs: 353000, genres: ['nu-disco', 'funk'] },
  { id: 'disc_19', name: 'Odessa', artists: ['Caribou'], albumName: 'Swim', bpm: 120, valence: 0.64, energy: 0.77, danceability: 0.81, acousticness: 0.08, instrumentalness: 0.24, musicalKey: 0, musicalMode: 0, durationMs: 315000, genres: ['indietronica', 'house'] },
  { id: 'disc_20', name: 'Everything In Its Right Place', artists: ['Radiohead'], albumName: 'Kid A', bpm: 124, valence: 0.23, energy: 0.51, danceability: 0.49, acousticness: 0.34, instrumentalness: 0.39, musicalKey: 0, musicalMode: 1, durationMs: 251000, genres: ['electronic', 'art rock'] },
  { id: 'disc_21', name: 'Gülümse', artists: ['Sezen Aksu'], albumName: 'Gülümse', bpm: 88, valence: 0.55, energy: 0.44, danceability: 0.52, acousticness: 0.58, instrumentalness: 0.01, musicalKey: 7, musicalMode: 0, durationMs: 298000, genres: ['turkish pop'] },
  { id: 'disc_22', name: 'Midnight Mirage', artists: ['Röyksopp'], albumName: 'Profound Mysteries', bpm: 118, valence: 0.43, energy: 0.74, danceability: 0.77, acousticness: 0.05, instrumentalness: 0.42, musicalKey: 11, musicalMode: 0, durationMs: 268000, genres: ['synthpop', 'electronic'] },
  { id: 'disc_23', name: 'Breathe Deeper', artists: ['Tame Impala'], albumName: 'The Slow Rush', bpm: 109, valence: 0.79, energy: 0.78, danceability: 0.79, acousticness: 0.04, instrumentalness: 0.05, musicalKey: 10, musicalMode: 1, durationMs: 372000, genres: ['psychedelic pop'] },
  { id: 'disc_24', name: 'Karanlıkta', artists: ['Şebnem Ferah'], albumName: 'Kelimeler Yetse', bpm: 138, valence: 0.25, energy: 0.87, danceability: 0.48, acousticness: 0.05, instrumentalness: 0.01, musicalKey: 4, musicalMode: 0, durationMs: 246000, genres: ['turkish rock'] },
  { id: 'disc_25', name: 'A Moment Apart', artists: ['ODESZA'], albumName: 'A Moment Apart', bpm: 92, valence: 0.57, energy: 0.64, danceability: 0.56, acousticness: 0.22, instrumentalness: 0.74, musicalKey: 9, musicalMode: 1, durationMs: 234000, genres: ['chillwave', 'electronic'] },
  { id: 'disc_26', name: 'Hyperballad', artists: ['Björk'], albumName: 'Post', bpm: 130, valence: 0.44, energy: 0.73, danceability: 0.67, acousticness: 0.14, instrumentalness: 0.11, musicalKey: 5, musicalMode: 1, durationMs: 321000, genres: ['art pop', 'electronic'] },
  { id: 'disc_27', name: 'Sunset', artists: ['The Midnight'], albumName: 'Endless Summer', bpm: 110, valence: 0.69, energy: 0.75, danceability: 0.68, acousticness: 0.04, instrumentalness: 0.09, musicalKey: 2, musicalMode: 1, durationMs: 277000, genres: ['synthwave'] },
  { id: 'disc_28', name: 'Sonbahar', artists: ['Teoman'], albumName: 'Gönülçelen', bpm: 90, valence: 0.26, energy: 0.54, danceability: 0.48, acousticness: 0.39, instrumentalness: 0.02, musicalKey: 9, musicalMode: 0, durationMs: 251000, genres: ['turkish rock'] },
];

/**
 * Fetches out-of-library discovery candidates via ReccoBeats Recommendation API
 * when library contains Spotify track IDs, and supplements with curated discovery tracks.
 */
export async function getDiscoveryCandidates(
  libraryTracks,
  { size = 25, seedSource = 'mixed', targetBpm = 120, varietySeed = 0, fetchImpl = fetch } = {}
) {
  const existingKeys = new Set(
    libraryTracks.map((t) => `${t.name.toLowerCase()}::${(t.artists?.[0] || '').toLowerCase()}`)
  );
  const existingIds = new Set(libraryTracks.map((t) => t.id));

  const eligibleSeeds = libraryTracks
    .filter((t) => {
      if (!/^[A-Za-z0-9]{22}$/.test(t.id)) return false;
      if (seedSource === 'liked') return Boolean(t.isLiked);
      if (seedSource === 'top') return (t.playCount || 0) > 0 || Number.isFinite(t.topRank);
      return Boolean(t.isLiked) || (t.playCount || 0) > 0;
    })
    .sort((a, b) => Math.abs((a.bpm || 120) - targetBpm) - Math.abs((b.bpm || 120) - targetBpm));

  const offset = eligibleSeeds.length > 5 ? (Math.abs(Number(varietySeed) || 0) * 3) % Math.max(1, eligibleSeeds.length - 5) : 0;
  const spotifySeeds = eligibleSeeds.slice(offset, offset + 5).map((t) => t.id);

  const discovered = [];

  if (spotifySeeds.length > 0) {
    try {
      const params = new URLSearchParams();
      for (const seed of spotifySeeds) params.append('seeds', seed);
      params.set('size', String(Math.min(40, size)));
      const url = `https://api.reccobeats.com/v1/track/recommendation?${params.toString()}`;
      const res = await fetchImpl(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(7000),
      });

      if (res.ok) {
        const payload = await res.json();
        const items = Array.isArray(payload) ? payload : payload?.content || [];
        const rawTracks = items
          .map((item) => {
            const spId = item.href?.match(/track\/([A-Za-z0-9]{22})/)?.[1] || item.id;
            const artists = (item.artists || []).map((a) => a.name).filter(Boolean);
            return {
              id: spId,
              uri: `spotify:track:${spId}`,
              name: item.trackTitle || item.name || 'Recommended Track',
              artists: artists.length ? artists : ['Unknown Artist'],
              albumName: item.album?.name || 'Discovery',
              durationMs: item.durationMs || 220000,
              genres: [],
              isLiked: false,
              fromAlbum: false,
              playCount: 0,
              topRank: null,
              isDiscovery: true,
              featureSource: 'reccobeats',
            };
          })
          .filter((t) => t.id && !existingIds.has(t.id));

        const featureMap = await fetchReccoBeatsFeatures(
          rawTracks.map((t) => t.id),
          fetchImpl
        );

        for (const t of rawTracks) {
          const f = featureMap.get(t.id);
          const fallback = f || estimateAudioFeatures(t);
          discovered.push({
            ...t,
            ...fallback,
          });
        }
      }
    } catch {
      // Gracefully fall back to curated catalog
    }
  }

  for (const item of DISCOVERY_CATALOG) {
    const key = `${item.name.toLowerCase()}::${(item.artists?.[0] || '').toLowerCase()}`;
    if (existingIds.has(item.id) || existingKeys.has(key)) continue;
    discovered.push({
      ...item,
      uri: `spotify:track:${item.id}`,
      isLiked: false,
      fromAlbum: false,
      playCount: 0,
      topRank: null,
      isDiscovery: true,
      featureSource: 'curated',
    });
  }

  return discovered;
}
