import { computeHarmonicCompatibility, toCamelot } from './camelot.js';
import {
  classifyTrackGenreCategories,
  computeSonicCohesion,
  detectTrackLanguage,
  matchesGenreRules,
  matchesVocalMode,
} from './genres.js';
import {
  classifyTrackMood,
  computeMoodTransitionContinuity,
  scoreTrackMood,
} from './moods.js';

export const TEMPO_CURVES = {
  steady: {
    id: 'steady',
    labelTr: 'Sabit Tempo (Beat-Lock)',
    labelEn: 'Steady Tempo (Beat-Lock)',
    descTr: 'Tüm parçaları hedef BPM etrafında kilitler, geçiş farkını en aza indirir.',
    descEn: 'Locks tracks tightly around target BPM and minimizes step jumps.',
  },
  warmup_peak_cooldown: {
    id: 'warmup_peak_cooldown',
    labelTr: 'Isınma → Zirve → Soğuma',
    labelEn: 'Warm-Up → Peak → Cool-Down',
    descTr: 'Düşük tempodan zirveye tırmanır, son bölümde yumuşakça soğur.',
    descEn: 'Builds gradually to a peak around two-thirds in, then eases down.',
  },
  ramp_up: {
    id: 'ramp_up',
    labelTr: 'Yükselen Tempo (Ramp Up)',
    labelEn: 'Progressive Ramp Up',
    descTr: 'Minimum BPM’den maksimum BPM’e kesintisiz ivme kazandırır.',
    descEn: 'Climbs continuously from minimum BPM to maximum BPM.',
  },
  hiit_waves: {
    id: 'hiit_waves',
    labelTr: 'Dalgalı Tempo (Interval)',
    labelEn: 'Interval Waves (HIIT)',
    descTr: 'Yüksek tempo zirveleri ile toparlanma bloklarını sırayla değiştirir.',
    descEn: 'Alternates high-tempo peak blocks with mid-tempo recovery slots.',
  },
};

export function resolveEffectiveBpm(trackBpm, targetBpm, allowHarmonicTempo = false) {
  const bpm = Number(trackBpm);
  if (!Number.isFinite(bpm) || bpm <= 0) {
    return { effectiveBpm: 0, ratio: 1, harmonicMatched: false };
  }
  if (!allowHarmonicTempo) {
    return { effectiveBpm: bpm, ratio: 1, harmonicMatched: false };
  }

  const candidates = [
    { effectiveBpm: bpm, ratio: 1, harmonicMatched: false },
    { effectiveBpm: bpm * 2, ratio: 2, harmonicMatched: true },
    { effectiveBpm: bpm * 0.5, ratio: 0.5, harmonicMatched: true },
  ].filter((c) => c.effectiveBpm >= 45 && c.effectiveBpm <= 220);

  candidates.sort(
    (a, b) => Math.abs(a.effectiveBpm - targetBpm) - Math.abs(b.effectiveBpm - targetBpm)
  );
  return candidates[0];
}

export function buildSlotTargets({
  trackCount,
  tempoCurve = 'steady',
  targetBpm = 120,
  minBpm = 114,
  maxBpm = 126,
}) {
  const count = Math.max(1, Math.round(trackCount));
  const lo = Math.min(minBpm, maxBpm);
  const hi = Math.max(minBpm, maxBpm);
  const mid = tempoCurve === 'steady' ? targetBpm : (lo + hi) / 2;

  const targets = [];
  for (let i = 0; i < count; i += 1) {
    const progress = count === 1 ? 0.5 : i / (count - 1);

    if (tempoCurve === 'steady') {
      targets.push(Math.round(mid));
    } else if (tempoCurve === 'ramp_up') {
      targets.push(Math.round(lo + (hi - lo) * progress));
    } else if (tempoCurve === 'warmup_peak_cooldown') {
      const peakPos = 0.65;
      if (progress <= peakPos) {
        const up = progress / peakPos;
        targets.push(Math.round(lo + (hi - lo) * up));
      } else {
        const down = (progress - peakPos) / (1 - peakPos);
        const endBpm = lo + (hi - lo) * 0.25;
        targets.push(Math.round(hi - (hi - endBpm) * down));
      }
    } else if (tempoCurve === 'hiit_waves') {
      const isPeak = i % 3 !== 2;
      targets.push(Math.round(isPeak ? hi : lo));
    } else {
      targets.push(Math.round(mid));
    }
  }
  return targets;
}

export function computeTrackAffinity(
  track,
  maxPlayCount,
  sourceWeights = { liked: 1.0, album: 0.85, top: 1.15 }
) {
  if (track.isDiscovery) {
    return { affinityScore: 0.65, likedSignal: 0, albumSignal: 0, topSignal: 0 };
  }

  const wLiked = Math.max(0, Number(sourceWeights.liked ?? 1.0));
  const wAlbum = Math.max(0, Number(sourceWeights.album ?? 0.85));
  const wTop = Math.max(0, Number(sourceWeights.top ?? 1.15));
  const maxWeightSum = Math.max(wLiked + wAlbum + wTop, 1e-6);

  const likedSignal = track.isLiked ? 1 : 0;
  const albumSignal = track.fromAlbum ? 1 : 0;

  let topSignal = 0;
  const plays = Math.max(0, Number(track.playCount || 0));
  if (maxPlayCount > 0 && plays > 0) {
    topSignal = Math.log1p(plays) / Math.log1p(maxPlayCount);
  }
  if (Number.isFinite(track.topRank) && track.topRank > 0) {
    const rankBonus = Math.max(0, 1 - (track.topRank - 1) / 50);
    topSignal = Math.max(topSignal, 0.45 + 0.55 * rankBonus);
  }

  const raw = (likedSignal * wLiked + albumSignal * wAlbum + topSignal * wTop) / maxWeightSum;
  return {
    affinityScore: Math.max(0, Math.min(1, raw)),
    likedSignal,
    albumSignal,
    topSignal,
  };
}

function normalizeWeights(tempoWeight = 0.65, moodWeight = 0.25, affinityWeight = 0.10) {
  // Enforce the core rule: Tempo must stay primary (>= 0.50 and strictly > moodWeight).
  const t = Math.max(0.50, Math.min(0.88, Number(tempoWeight) || 0.65));
  const rawM = Math.max(0.05, Number(moodWeight) || 0.25);
  const rawA = Math.max(0.02, Number(affinityWeight) || 0.10);
  const remaining = 1 - t;
  const subSum = rawM + rawA;
  let m = (rawM / subSum) * remaining;
  let a = (rawA / subSum) * remaining;
  if (m >= t) {
    m = t - 0.05;
    a = Math.max(0.01, 1 - t - m);
  }
  return { tempoWeight: t, moodWeight: m, affinityWeight: a };
}

function passesSourceFilter(track, sourceFilter) {
  if (track.isDiscovery) return true;
  if (!sourceFilter || sourceFilter === 'all') return true;
  if (sourceFilter === 'liked') return Boolean(track.isLiked);
  if (sourceFilter === 'album') return Boolean(track.fromAlbum);
  if (sourceFilter === 'top') {
    return (Number(track.playCount) || 0) > 0 || (Number.isFinite(track.topRank) && track.topRank > 0);
  }
  return true;
}

function computeTempoScore(effectiveBpm, slotTargetBpm, toleranceBpm, harmonicMatched) {
  const scale = Math.max(toleranceBpm, 4);
  const diff = Math.abs(effectiveBpm - slotTargetBpm);
  let score = Math.exp(-((diff / scale) ** 2) * 0.75);
  if (harmonicMatched) {
    score *= 0.88;
  }
  return Math.max(0, Math.min(1, score));
}

/**
 * Generates a Tempo-First, Mood-Second playlist from the user's library,
 * with optional Camelot harmonic key ordering, duration targeting, and out-of-library discovery.
 */
export function generatePlaylist(tracks, rawOptions = {}) {
  const targetBpm = Math.max(50, Math.min(200, Number(rawOptions.targetBpm) || 120));
  const toleranceBpm = Math.max(1, Math.min(35, Number(rawOptions.toleranceBpm) || 6));
  const tempoCurve = TEMPO_CURVES[rawOptions.tempoCurve] ? rawOptions.tempoCurve : 'steady';

  const minBpm =
    rawOptions.minBpm !== undefined
      ? Math.max(45, Math.min(200, Number(rawOptions.minBpm)))
      : Math.max(45, targetBpm - toleranceBpm);
  const maxBpm =
    rawOptions.maxBpm !== undefined
      ? Math.max(minBpm, Math.min(210, Number(rawOptions.maxBpm)))
      : Math.min(210, targetBpm + toleranceBpm);

  const selectionMode = rawOptions.selectionMode === 'duration' ? 'duration' : 'count';
  const targetDurationMinutes = Math.max(10, Math.min(240, Number(rawOptions.targetDurationMinutes) || 45));
  const targetDurationMs = targetDurationMinutes * 60_000;

  const avgTrackDurationMs =
    tracks.length > 0
      ? tracks.reduce((s, t) => s + (Number(t.durationMs) || 230000), 0) / tracks.length
      : 230000;

  const trackCount =
    selectionMode === 'duration'
      ? Math.max(3, Math.min(60, Math.round(targetDurationMs / Math.max(120000, avgTrackDurationMs)) + 2))
      : Math.max(3, Math.min(60, Number(rawOptions.trackCount) || 15));

  const allowHarmonicTempo = Boolean(rawOptions.allowHarmonicTempo);
  const preferHarmonicKeys = rawOptions.preferHarmonicKeys !== false;
  const discoveryRatio = Math.max(0, Math.min(0.50, Number(rawOptions.discoveryRatio) || 0));
  const discoveryTempoFlex = Math.max(0, Math.min(10, Number(rawOptions.discoveryTempoFlex) || 0));
  const discoveryPlacement = rawOptions.discoveryPlacement === 'outro' ? 'outro' : 'interleaved';
  const discoveryTracks = Array.isArray(rawOptions.discoveryTracks) ? rawOptions.discoveryTracks : [];

  const includeGenres = Array.isArray(rawOptions.includeGenres) ? rawOptions.includeGenres : [];
  const excludeGenres = Array.isArray(rawOptions.excludeGenres) ? rawOptions.excludeGenres : [];
  const excludeTrackIds = new Set(Array.isArray(rawOptions.excludeTrackIds) ? rawOptions.excludeTrackIds : []);
  const languageMode = ['auto', 'tr', 'intl', 'all'].includes(rawOptions.languageMode)
    ? rawOptions.languageMode
    : 'auto';
  const vocalMode = ['all', 'vocal', 'instrumental'].includes(rawOptions.vocalMode)
    ? rawOptions.vocalMode
    : 'all';
  const sonicCohesion = rawOptions.sonicCohesion !== false;
  const onlyMeasuredFeatures = Boolean(rawOptions.onlyMeasuredFeatures);
  const varietySeed = Number(rawOptions.varietySeed) || 0;

  const moodIds = Array.isArray(rawOptions.moodIds) ? rawOptions.moodIds : [];
  const customMood = rawOptions.customMood || null;
  const moodStrictness = rawOptions.moodStrictness || 'balanced';
  const sourceFilter = rawOptions.sourceFilter || 'all';
  const sourceWeights = rawOptions.sourceWeights || { liked: 1.0, album: 0.85, top: 1.15 };
  const artistCooldown = Math.max(0, Math.min(5, Number(rawOptions.artistCooldown ?? 2)));
  const enforceTempoGate = rawOptions.enforceTempoGate !== false;

  const weights = normalizeWeights(
    rawOptions.tempoWeight,
    rawOptions.moodWeight,
    rawOptions.affinityWeight
  );

  const maxPlayCount = tracks.reduce((max, t) => Math.max(max, Number(t.playCount) || 0), 0);
  const slotTargets = buildSlotTargets({
    trackCount,
    tempoCurve,
    targetBpm,
    minBpm,
    maxBpm,
  });

  const bandLow = Math.min(minBpm, targetBpm) - (tempoCurve === 'steady' ? 0 : Math.floor(toleranceBpm * 0.5));
  const bandHigh = Math.max(maxBpm, targetBpm) + (tempoCurve === 'steady' ? 0 : Math.floor(toleranceBpm * 0.5));

  function preparePool(rawList, isDisc) {
    const tol = isDisc ? toleranceBpm + discoveryTempoFlex : toleranceBpm;
    const low = isDisc ? bandLow - discoveryTempoFlex : bandLow;
    const high = isDisc ? bandHigh + discoveryTempoFlex : bandHigh;

    return rawList
      .filter((t) => passesSourceFilter(t, sourceFilter))
      .filter((t) => !onlyMeasuredFeatures || t.featureSource !== 'estimated')
      .filter((t) => matchesGenreRules(t, { includeGenres, excludeGenres }))
      .filter((t) => matchesVocalMode(t, vocalMode))
      .filter((t) => {
        if (languageMode === 'tr') return detectTrackLanguage(t) === 'tr';
        if (languageMode === 'intl') return detectTrackLanguage(t) === 'intl';
        return true;
      })
      .map((track) => {
        const enrichedTrack = isDisc ? { ...track, isDiscovery: true } : { ...track, isDiscovery: false };
        const affinity = computeTrackAffinity(enrichedTrack, maxPlayCount, sourceWeights);
        const moodEval = scoreTrackMood(enrichedTrack, { moodIds, customMood });
        const classification = classifyTrackMood(enrichedTrack);
        const camelot = toCamelot(enrichedTrack.musicalKey, enrichedTrack.musicalMode);
        return {
          ...enrichedTrack,
          languageUniverse: detectTrackLanguage(enrichedTrack),
          genreCategories: classifyTrackGenreCategories(enrichedTrack),
          affinityScore: affinity.affinityScore,
          moodScore: moodEval.score,
          matchedMood: moodEval.matchedMood,
          primaryMood: classification.primaryMood,
          camelotCode: camelot.code,
          keyLabel: camelot.keyLabel,
        };
      })
      .filter((track) => {
        const { effectiveBpm } = resolveEffectiveBpm(track.bpm, targetBpm, allowHarmonicTempo);
        if (!enforceTempoGate) return effectiveBpm > 0;
        if (tempoCurve === 'steady') {
          return Math.abs(effectiveBpm - targetBpm) <= tol;
        }
        return effectiveBpm >= low && effectiveBpm <= high;
      });
  }

  const tempoFilteredLib = preparePool(tracks, false);
  const tempoFilteredDisc = discoveryRatio > 0 && discoveryTracks.length > 0
    ? preparePool(discoveryTracks, true)
    : [];

  const moodThreshold = moodStrictness === 'strict' ? 0.42 : moodStrictness === 'balanced' ? 0.20 : 0;
  function applyMoodGate(pool) {
    if (moodThreshold <= 0 || (moodIds.length === 0 && !customMood)) return pool;
    const filtered = pool.filter((t) => t.moodScore >= moodThreshold);
    return filtered.length >= Math.min(trackCount, 4) || moodStrictness === 'strict' ? filtered : pool;
  }

  const candidateLibAll = applyMoodGate(tempoFilteredLib);
  const candidateDiscAll = applyMoodGate(tempoFilteredDisc);

  // Soft-exclude previously shown tracks when regenerating so user gets a genuinely fresh playlist
  const freshLib = excludeTrackIds.size > 0
    ? candidateLibAll.filter((t) => !excludeTrackIds.has(t.id))
    : candidateLibAll;
  const freshDisc = excludeTrackIds.size > 0
    ? candidateDiscAll.filter((t) => !excludeTrackIds.has(t.id))
    : candidateDiscAll;

  const candidateLib = freshLib.length >= Math.min(trackCount, 4) ? freshLib : candidateLibAll;
  const candidateDisc = freshDisc.length > 0 ? freshDisc : candidateDiscAll;

  const remainingLib = [...candidateLib];
  const remainingDisc = [...candidateDisc];
  const maxDiscoverySlots = discoveryRatio > 0 ? Math.max(1, Math.round(trackCount * discoveryRatio)) : 0;
  let discoveryUsed = 0;

  const selected = [];
  const recentArtists = [];
  let cumulativeDurationMs = 0;

  function scoreCandidateForSlot(candidate, slotTargetBpm, prevTrack) {
    const resolved = resolveEffectiveBpm(candidate.bpm, slotTargetBpm, allowHarmonicTempo);
    const slotTempoScore = computeTempoScore(
      resolved.effectiveBpm,
      slotTargetBpm,
      toleranceBpm,
      resolved.harmonicMatched
    );

    let transitionTempoScore = slotTempoScore;
    if (prevTrack) {
      const stepDiff = Math.abs(resolved.effectiveBpm - prevTrack.effectiveBpm);
      transitionTempoScore = Math.exp(-((stepDiff / Math.max(toleranceBpm, 4)) ** 2) * 0.65);
    }

    const harmonic = prevTrack
      ? computeHarmonicCompatibility(prevTrack, candidate)
      : { score: 1, relation: 'start' };

    const tempoComposite = 0.72 * slotTempoScore + 0.28 * transitionTempoScore;
    const continuity = prevTrack ? computeMoodTransitionContinuity(prevTrack, candidate) : 1;
    const cohesion = prevTrack ? computeSonicCohesion(prevTrack, candidate) : { score: 1, sameUniverse: true };
    const moodComposite = sonicCohesion && prevTrack
      ? 0.56 * candidate.moodScore + 0.16 * continuity + 0.28 * cohesion.score
      : 0.76 * candidate.moodScore + 0.24 * continuity;

    // Camelot harmonic bonus is a refinement inside transition quality; never overrides Tempo #1
    const harmonicFactor = preferHarmonicKeys && prevTrack ? 0.08 * harmonic.score : 0;
    const scaleDown = preferHarmonicKeys && prevTrack ? 0.92 : 1;

    // Prioritize real measured tracks (ReccoBeats/Spotify/Manual) over heuristic 'estimated' tracks
    const confidenceFactor = candidate.featureSource === 'estimated' && !candidate.manualOverride ? 0.84 : 1.0;

    // Extra sonic-universe penalty when languageMode === 'auto' and track jumps across TR <-> INTL or huge vocal/valence cliff
    let cohesionPenalty = 1.0;
    if (sonicCohesion && prevTrack) {
      if (languageMode === 'auto' && !cohesion.sameUniverse) cohesionPenalty *= 0.72;
      if (cohesion.valGap > 0.42) cohesionPenalty *= 0.80;
      if (cohesion.instGap > 0.50) cohesionPenalty *= 0.78;
    }

    const totalScore =
      confidenceFactor *
      cohesionPenalty *
      (scaleDown *
        (weights.tempoWeight * tempoComposite +
          weights.moodWeight * moodComposite +
          weights.affinityWeight * candidate.affinityScore) +
        harmonicFactor);

    return {
      totalScore,
      tempoComposite,
      moodComposite,
      continuity,
      harmonicScore: harmonic.score,
      harmonicRelation: harmonic.relation,
      effectiveBpm: resolved.effectiveBpm,
      harmonicMatched: resolved.harmonicMatched,
      harmonicRatio: resolved.ratio,
    };
  }

  for (let slot = 0; slot < trackCount; slot += 1) {
    if (selectionMode === 'duration' && cumulativeDurationMs >= targetDurationMs * 0.94 && selected.length >= 3) {
      break;
    }

    const slotTargetBpm = slotTargets[slot] ?? targetBpm;
    const prevTrack = selected.length > 0 ? selected[selected.length - 1] : null;

    // Place discovery slots either interleaved or toward the second half (outro)
    const outroStartSlot = Math.max(1, Math.floor(trackCount * 0.5));
    const wantsDiscoverySlot =
      discoveryUsed < maxDiscoverySlots &&
      remainingDisc.length > 0 &&
      (remainingLib.length === 0 ||
        (discoveryPlacement === 'outro'
          ? slot >= outroStartSlot && slot % 2 === 1
          : slot > 0 && slot % Math.max(2, Math.floor(trackCount / Math.max(1, maxDiscoverySlots))) === 0));

    const activePool = wantsDiscoverySlot ? remainingDisc : remainingLib.length > 0 ? remainingLib : remainingDisc;
    if (activePool.length === 0) break;

    let eligible = activePool.filter((t) => {
      const primaryArtist = String(t.artists?.[0] || '').toLowerCase();
      return !primaryArtist || !recentArtists.includes(primaryArtist);
    });
    if (eligible.length === 0) eligible = activePool;

    const scoredList = eligible
      .map((candidate) => ({
        candidate,
        metrics: scoreCandidateForSlot(candidate, slotTargetBpm, prevTrack),
      }))
      .sort((a, b) => b.metrics.totalScore - a.metrics.totalScore);

    if (scoredList.length === 0) break;

    let chosen = scoredList[0];
    if (varietySeed > 0 && scoredList.length > 1) {
      const topScore = scoredList[0].metrics.totalScore;
      const nearTop = scoredList.filter((x) => topScore - x.metrics.totalScore <= 0.09).slice(0, 8);
      if (nearTop.length > 1) {
        const pickIdx = Math.abs((varietySeed * 31 + slot * 17) % nearTop.length);
        chosen = nearTop[pickIdx];
      }
    }

    const bestItem = chosen.candidate;
    const bestMetrics = chosen.metrics;

    const idx = activePool.findIndex((t) => t.id === bestItem.id);
    if (idx !== -1) activePool.splice(idx, 1);
    if (bestItem.isDiscovery) discoveryUsed += 1;

    const primaryArtist = String(bestItem.artists?.[0] || '').toLowerCase();
    if (artistCooldown > 0 && primaryArtist) {
      recentArtists.push(primaryArtist);
      if (recentArtists.length > artistCooldown) recentArtists.shift();
    }

    const deltaBpmFromPrev = prevTrack
      ? Math.round((bestMetrics.effectiveBpm - prevTrack.effectiveBpm) * 10) / 10
      : 0;

    cumulativeDurationMs += Number(bestItem.durationMs) || 210000;

    selected.push({
      ...bestItem,
      slotIndex: selected.length,
      slotTargetBpm,
      effectiveBpm: Math.round(bestMetrics.effectiveBpm * 10) / 10,
      harmonicMatched: bestMetrics.harmonicMatched,
      harmonicRatio: bestMetrics.harmonicRatio,
      harmonicTransition: bestMetrics.harmonicRelation,
      deltaBpmFromPrev,
      scores: {
        total: Math.round(bestMetrics.totalScore * 1000) / 1000,
        tempo: Math.round(bestMetrics.tempoComposite * 1000) / 1000,
        mood: Math.round(bestMetrics.moodComposite * 1000) / 1000,
        affinity: Math.round(bestItem.affinityScore * 1000) / 1000,
        continuity: Math.round(bestMetrics.continuity * 1000) / 1000,
        harmonic: Math.round(bestMetrics.harmonicScore * 1000) / 1000,
      },
    });
  }

  const metrics = computePlaylistDiagnostics(selected, slotTargets);

  return {
    tracks: selected,
    slotTargets: slotTargets.slice(0, selected.length),
    weights,
    candidatePoolCount: candidateLib.length + candidateDisc.length,
    tempoPoolCount: tempoFilteredLib.length + tempoFilteredDisc.length,
    metrics,
    appliedConfig: {
      targetBpm,
      minBpm,
      maxBpm,
      toleranceBpm,
      tempoCurve,
      allowHarmonicTempo,
      preferHarmonicKeys,
      discoveryRatio,
      discoveryTempoFlex,
      discoveryPlacement,
      includeGenres,
      excludeGenres,
      selectionMode,
      targetDurationMinutes,
      moodIds,
      moodStrictness,
      sourceFilter,
      trackCount: selected.length,
      artistCooldown,
      enforceTempoGate,
    },
  };
}

export function computePlaylistDiagnostics(selected, slotTargets = []) {
  if (!selected || selected.length === 0) {
    return {
      trackCount: 0,
      totalDurationMs: 0,
      avgBpm: 0,
      minBpm: 0,
      maxBpm: 0,
      bpmStdDev: 0,
      maxStepJumpBpm: 0,
      avgStepJumpBpm: 0,
      beatMatchSmoothness: 0,
      moodCohesion: 0,
      harmonicCompatibility: 0,
      discoveryCount: 0,
      sourceBreakdown: { liked: 0, album: 0, top: 0, discovery: 0 },
    };
  }

  const bpms = selected.map((t) => t.effectiveBpm ?? t.bpm);
  const avgBpm = bpms.reduce((s, b) => s + b, 0) / bpms.length;
  const variance = bpms.reduce((s, b) => s + (b - avgBpm) ** 2, 0) / bpms.length;
  const bpmStdDev = Math.sqrt(variance);

  const jumps = [];
  const continuities = [];
  const harmonicScores = [];
  for (let i = 1; i < selected.length; i += 1) {
    jumps.push(Math.abs(bpms[i] - bpms[i - 1]));
    continuities.push(computeMoodTransitionContinuity(selected[i - 1], selected[i]));
    harmonicScores.push(computeHarmonicCompatibility(selected[i - 1], selected[i]).score);
  }

  const maxStepJumpBpm = jumps.length ? Math.max(...jumps) : 0;
  const avgStepJumpBpm = jumps.length ? jumps.reduce((s, j) => s + j, 0) / jumps.length : 0;
  const beatMatchSmoothness = Math.round(Math.max(0, Math.min(100, 100 * Math.exp(-((avgStepJumpBpm / 12) ** 2)))));

  const avgMoodScore = selected.reduce((s, t) => s + (t.scores?.mood ?? t.moodScore ?? 0.7), 0) / selected.length;
  const avgContinuity = continuities.length ? continuities.reduce((s, c) => s + c, 0) / continuities.length : 1;
  const moodCohesion = Math.round((0.65 * avgMoodScore + 0.35 * avgContinuity) * 100);
  const harmonicCompatibility = harmonicScores.length
    ? Math.round((harmonicScores.reduce((s, h) => s + h, 0) / harmonicScores.length) * 100)
    : 100;

  const targetDeviation = slotTargets.length
    ? selected.reduce((s, t, idx) => s + Math.abs((t.effectiveBpm ?? t.bpm) - (slotTargets[idx] ?? avgBpm)), 0) /
      selected.length
    : 0;

  const discoveryCount = selected.filter((t) => t.isDiscovery).length;

  return {
    trackCount: selected.length,
    totalDurationMs: selected.reduce((s, t) => s + (Number(t.durationMs) || 0), 0),
    avgBpm: Math.round(avgBpm * 10) / 10,
    minBpm: Math.round(Math.min(...bpms) * 10) / 10,
    maxBpm: Math.round(Math.max(...bpms) * 10) / 10,
    bpmStdDev: Math.round(bpmStdDev * 10) / 10,
    maxStepJumpBpm: Math.round(maxStepJumpBpm * 10) / 10,
    avgStepJumpBpm: Math.round(avgStepJumpBpm * 10) / 10,
    avgTargetDeviationBpm: Math.round(targetDeviation * 10) / 10,
    beatMatchSmoothness,
    moodCohesion,
    harmonicCompatibility,
    discoveryCount,
    sourceBreakdown: {
      liked: selected.filter((t) => t.isLiked).length,
      album: selected.filter((t) => t.fromAlbum).length,
      top: selected.filter((t) => !t.isDiscovery && ((t.playCount || 0) > 0 || Number.isFinite(t.topRank))).length,
      discovery: discoveryCount,
    },
  };
}
