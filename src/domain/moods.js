/**
 * Mood definitions and multi-dimensional audio-feature mood scoring.
 *
 * Moods are secondary to Tempo (BPM) in playlist generation, but govern
 * emotional cohesion and track ordering within the tempo envelope.
 */

export const MOOD_PROFILES = {
  euphoric: {
    id: 'euphoric',
    labelTr: 'Enerjik & Mutlu',
    labelEn: 'Euphoric & Upbeat',
    descTr: 'Yüksek pozitiflik, canlı ritim ve yükselten enerji.',
    descEn: 'High positivity, bright energy, and uplifting momentum.',
    color: '#F59E0B',
    target: {
      valence: 0.80,
      energy: 0.78,
      danceability: 0.74,
      acousticness: 0.14,
      instrumentalness: 0.06,
    },
    weights: {
      valence: 0.42,
      energy: 0.30,
      danceability: 0.18,
      acousticness: 0.10,
    },
  },
  groove: {
    id: 'groove',
    labelTr: 'Dans & Ritim',
    labelEn: 'Groove & Dance',
    descTr: 'Akıcı bas yürüyüşleri, dans edilebilir ritim ve kulüp enerjisi.',
    descEn: 'Infectious pocket, steady danceability, and rhythmic flow.',
    color: '#10B981',
    target: {
      valence: 0.62,
      energy: 0.72,
      danceability: 0.84,
      acousticness: 0.12,
      instrumentalness: 0.12,
    },
    weights: {
      danceability: 0.42,
      energy: 0.28,
      valence: 0.18,
      acousticness: 0.12,
    },
  },
  focus: {
    id: 'focus',
    labelTr: 'Odak & Akış',
    labelEn: 'Deep Focus & Flow',
    descTr: 'Dikkati dağıtmayan dengeli doku, derin akış ve istikrarlı tempo.',
    descEn: 'Balanced, non-intrusive texture built for deep flow and concentration.',
    color: '#38BDF8',
    target: {
      valence: 0.46,
      energy: 0.50,
      danceability: 0.54,
      acousticness: 0.34,
      instrumentalness: 0.58,
    },
    weights: {
      instrumentalness: 0.34,
      energy: 0.26,
      valence: 0.20,
      acousticness: 0.20,
    },
  },
  chill: {
    id: 'chill',
    labelTr: 'Huzurlu & Akustik',
    labelEn: 'Serene & Acoustic',
    descTr: 'Sıcak akustik enstrümanlar, yumuşak dinamikler ve sakin ruh hali.',
    descEn: 'Warm acoustic textures, gentle dynamics, and calm atmosphere.',
    color: '#34D399',
    target: {
      valence: 0.56,
      energy: 0.30,
      danceability: 0.48,
      acousticness: 0.74,
      instrumentalness: 0.20,
    },
    weights: {
      acousticness: 0.36,
      energy: 0.34,
      valence: 0.20,
      danceability: 0.10,
    },
  },
  melancholic: {
    id: 'melancholic',
    labelTr: 'Melankolik & Gece',
    labelEn: 'Melancholic & Nocturnal',
    descTr: 'İçe dönük duygular, gece atmosferi ve derin armoniler.',
    descEn: 'Introspective emotion, late-night atmosphere, and bittersweet depth.',
    color: '#818CF8',
    target: {
      valence: 0.22,
      energy: 0.42,
      danceability: 0.44,
      acousticness: 0.46,
      instrumentalness: 0.18,
    },
    weights: {
      valence: 0.44,
      energy: 0.28,
      acousticness: 0.18,
      danceability: 0.10,
    },
  },
  intense: {
    id: 'intense',
    labelTr: 'Karanlık & Yoğun',
    labelEn: 'Dark & Intense',
    descTr: 'Sert vuruşlar, yüksek gerilim ve güçlü antrenman/sahne enerjisi.',
    descEn: 'Driving impact, high tension, and adrenaline-heavy intensity.',
    color: '#F43F5E',
    target: {
      valence: 0.26,
      energy: 0.88,
      danceability: 0.56,
      acousticness: 0.06,
      instrumentalness: 0.14,
    },
    weights: {
      energy: 0.42,
      valence: 0.32,
      acousticness: 0.16,
      danceability: 0.10,
    },
  },
};

export const MOOD_IDS = Object.keys(MOOD_PROFILES);

export function clamp01(value, fallback = 0.5) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(1, num));
}

/**
 * Computes similarity [0..1] between a track's audio features and a mood target.
 * Accepts either a mood profile ID (string) or a custom target object
 * { valence, energy, danceability, acousticness, instrumentalness }.
 */
export function computeMoodSimilarity(track, moodSpec) {
  const profile =
    typeof moodSpec === 'string'
      ? MOOD_PROFILES[moodSpec]
      : null;

  const target = profile
    ? profile.target
    : {
        valence: clamp01(moodSpec?.valence, 0.5),
        energy: clamp01(moodSpec?.energy, 0.5),
        danceability: clamp01(moodSpec?.danceability, 0.5),
        acousticness: clamp01(moodSpec?.acousticness, 0.3),
        instrumentalness: clamp01(moodSpec?.instrumentalness, 0.1),
      };

  const weights = profile
    ? profile.weights
    : {
        valence: 0.36,
        energy: 0.34,
        danceability: 0.16,
        acousticness: 0.14,
      };

  let weightedSqDist = 0;
  let totalWeight = 0;

  for (const [axis, weight] of Object.entries(weights)) {
    const trackVal = clamp01(track?.[axis], target[axis] ?? 0.5);
    const targetVal = clamp01(target[axis], 0.5);
    const diff = trackVal - targetVal;
    weightedSqDist += weight * diff * diff;
    totalWeight += weight;
  }

  const rmsDistance = Math.sqrt(weightedSqDist / Math.max(totalWeight, 1e-6));
  // Smooth Gaussian-like decay: 0 distance -> 1.0, 0.5 rms -> ~0.37, 0.8 rms -> ~0.08
  return Math.exp(-(rmsDistance * rmsDistance) / 0.18);
}

/**
 * Scores a track against one or more selected moods (plus optional custom sliders).
 * When multiple moods are selected, uses the best matching mood among them so
 * combining e.g. ["euphoric", "groove"] acts as a curated emotional corridor.
 */
export function scoreTrackMood(track, { moodIds = [], customMood = null } = {}) {
  const activeMoods = Array.isArray(moodIds)
    ? moodIds.filter((id) => Boolean(MOOD_PROFILES[id]))
    : [];

  if (customMood && typeof customMood === 'object') {
    const customScore = computeMoodSimilarity(track, customMood);
    if (activeMoods.length === 0) {
      return { score: customScore, matchedMood: 'custom' };
    }
    const presetBest = activeMoods.reduce(
      (best, id) => {
        const s = computeMoodSimilarity(track, id);
        return s > best.score ? { score: s, matchedMood: id } : best;
      },
      { score: 0, matchedMood: activeMoods[0] }
    );
    return customScore >= presetBest.score
      ? { score: 0.55 * customScore + 0.45 * presetBest.score, matchedMood: presetBest.matchedMood }
      : { score: 0.65 * presetBest.score + 0.35 * customScore, matchedMood: presetBest.matchedMood };
  }

  if (activeMoods.length === 0) {
    // Neutral mode: classify naturally without penalizing any mood
    const primary = classifyTrackMood(track);
    return { score: 0.85, matchedMood: primary.primaryMood };
  }

  let best = { score: 0, matchedMood: activeMoods[0] };
  for (const id of activeMoods) {
    const s = computeMoodSimilarity(track, id);
    if (s > best.score) {
      best = { score: s, matchedMood: id };
    }
  }
  return best;
}

/**
 * Classifies a track into its primary and secondary mood profiles.
 */
export function classifyTrackMood(track) {
  const ranked = MOOD_IDS.map((id) => ({
    id,
    score: computeMoodSimilarity(track, id),
  })).sort((a, b) => b.score - a.score);

  return {
    primaryMood: ranked[0].id,
    primaryScore: ranked[0].score,
    secondaryMood: ranked[1].id,
    secondaryScore: ranked[1].score,
    profile: MOOD_PROFILES[ranked[0].id],
  };
}

/**
 * Measures emotional transition continuity [0..1] between two consecutive tracks
 * so mood transitions remain smooth inside a tempo-locked playlist.
 */
export function computeMoodTransitionContinuity(prevTrack, nextTrack) {
  if (!prevTrack || !nextTrack) return 1;
  const dv = clamp01(prevTrack.valence) - clamp01(nextTrack.valence);
  const de = clamp01(prevTrack.energy) - clamp01(nextTrack.energy);
  const dd = clamp01(prevTrack.danceability) - clamp01(nextTrack.danceability);
  const da = clamp01(prevTrack.acousticness) - clamp01(nextTrack.acousticness);
  const dist = Math.sqrt(0.38 * dv * dv + 0.34 * de * de + 0.16 * dd * dd + 0.12 * da * da);
  return Math.exp(-(dist * dist) / 0.16);
}
