import { MOOD_PROFILES, classifyTrackMood } from '../domain/moods.js';

/**
 * Computes comprehensive Tempo, Mood, Source, Artist, and Album analytics
 * for the user's Spotify library.
 */
export function analyzeLibrary(tracks, albums = []) {
  if (!tracks || tracks.length === 0) {
    return {
      summary: {
        totalTracks: 0,
        likedCount: 0,
        albumTrackCount: 0,
        savedAlbumsCount: albums.length,
        topListenedCount: 0,
        measuredCount: 0,
        avgBpm: 0,
        medianBpm: 0,
        dominantBpmZone: null,
        dominantMood: null,
      },
      tempoHistogram: [],
      moodDistribution: [],
      topArtists: [],
      albumInsights: [],
      scatterPoints: [],
    };
  }

  const bpms = tracks.map((t) => Number(t.bpm) || 120).sort((a, b) => a - b);
  const avgBpm = Math.round((bpms.reduce((s, b) => s + b, 0) / bpms.length) * 10) / 10;
  const medianBpm = bpms[Math.floor(bpms.length / 2)];

  // 10-BPM buckets from 60 to 180+
  const buckets = [];
  for (let start = 60; start <= 170; start += 10) {
    buckets.push({
      label: `${start}-${start + 9}`,
      min: start,
      max: start + 9,
      total: 0,
      liked: 0,
      album: 0,
      top: 0,
    });
  }

  const moodCounts = Object.fromEntries(Object.keys(MOOD_PROFILES).map((id) => [id, 0]));
  const artistStats = new Map();
  const albumTracksMap = new Map();

  const scatterPoints = tracks.map((t) => {
    const bpm = Number(t.bpm) || 120;
    const moodInfo = classifyTrackMood(t);
    moodCounts[moodInfo.primaryMood] = (moodCounts[moodInfo.primaryMood] || 0) + 1;

    const bucket = buckets.find((b) => bpm >= b.min && bpm <= b.max) || (bpm < 60 ? buckets[0] : buckets[buckets.length - 1]);
    bucket.total += 1;
    if (t.isLiked) bucket.liked += 1;
    if (t.fromAlbum) bucket.album += 1;
    if ((t.playCount || 0) > 0 || Number.isFinite(t.topRank)) bucket.top += 1;

    const primaryArtist = t.artists?.[0] || 'Unknown Artist';
    const prevArtist = artistStats.get(primaryArtist) || {
      artist: primaryArtist,
      trackCount: 0,
      totalPlays: 0,
      bpmSum: 0,
      likedCount: 0,
    };
    prevArtist.trackCount += 1;
    prevArtist.totalPlays += Number(t.playCount) || 0;
    prevArtist.bpmSum += bpm;
    if (t.isLiked) prevArtist.likedCount += 1;
    artistStats.set(primaryArtist, prevArtist);

    if (t.albumName) {
      const key = `${t.albumName}::${primaryArtist}`;
      const list = albumTracksMap.get(key) || [];
      list.push(t);
      albumTracksMap.set(key, list);
    }

    return {
      id: t.id,
      name: t.name,
      artist: primaryArtist,
      albumName: t.albumName || '',
      bpm: Math.round(bpm * 10) / 10,
      valence: Math.round((t.valence ?? 0.5) * 100) / 100,
      energy: Math.round((t.energy ?? 0.5) * 100) / 100,
      primaryMood: moodInfo.primaryMood,
      moodColor: moodInfo.profile.color,
      isLiked: Boolean(t.isLiked),
      fromAlbum: Boolean(t.fromAlbum),
      playCount: Number(t.playCount) || 0,
      featureSource: t.featureSource || 'estimated',
    };
  });

  const dominantBucket = [...buckets].sort((a, b) => b.total - a.total)[0];
  const moodDistribution = Object.entries(moodCounts)
    .map(([id, count]) => ({
      id,
      labelTr: MOOD_PROFILES[id].labelTr,
      labelEn: MOOD_PROFILES[id].labelEn,
      color: MOOD_PROFILES[id].color,
      count,
      percent: Math.round((count / tracks.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topArtists = Array.from(artistStats.values())
    .map((a) => ({
      ...a,
      avgBpm: Math.round((a.bpmSum / a.trackCount) * 10) / 10,
    }))
    .sort((a, b) => b.totalPlays - a.totalPlays || b.trackCount - a.trackCount)
    .slice(0, 12);

  const albumInsights = Array.from(albumTracksMap.entries())
    .map(([key, list]) => {
      const [albumName, artist] = key.split('::');
      const albumBpms = list.map((t) => Number(t.bpm) || 120);
      const minBpm = Math.min(...albumBpms);
      const maxBpm = Math.max(...albumBpms);
      const avgAlbBpm = Math.round((albumBpms.reduce((s, b) => s + b, 0) / albumBpms.length) * 10) / 10;
      const topMood = classifyTrackMood(list[0]).primaryMood;
      return {
        albumName,
        artist,
        trackCount: list.length,
        avgBpm: avgAlbBpm,
        bpmSpan: Math.round(maxBpm - minBpm),
        fromSavedAlbum: list.some((t) => t.fromAlbum),
        dominantMood: topMood,
      };
    })
    .filter((a) => a.fromSavedAlbum || a.trackCount >= 2)
    .sort((a, b) => b.trackCount - a.trackCount)
    .slice(0, 12);

  return {
    summary: {
      totalTracks: tracks.length,
      likedCount: tracks.filter((t) => t.isLiked).length,
      albumTrackCount: tracks.filter((t) => t.fromAlbum).length,
      savedAlbumsCount: albums.length || albumInsights.filter((a) => a.fromSavedAlbum).length,
      topListenedCount: tracks.filter((t) => (t.playCount || 0) > 0 || Number.isFinite(t.topRank)).length,
      measuredCount: tracks.filter((t) => t.featureSource !== 'estimated').length,
      avgBpm,
      medianBpm,
      dominantBpmZone: dominantBucket ? `${dominantBucket.label} BPM` : null,
      dominantMood: moodDistribution[0] || null,
    },
    tempoHistogram: buckets,
    moodDistribution,
    topArtists,
    albumInsights,
    scatterPoints,
  };
}
