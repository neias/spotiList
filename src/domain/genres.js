/**
 * Macro music genre taxonomy & matching helpers.
 * Maps granular Spotify/artist genres (e.g. "turkish darkwave", "french house", "anatolian rock")
 * into intuitive selectable categories while also supporting exact genre tag matching.
 */

export const GENRE_CATEGORIES = [
  { id: 'rock', labelTr: 'Rock & Alternatif', labelEn: 'Rock & Alternative', pattern: /rock|alt|grunge|punk|post-punk|shoegaze|progressive/i },
  { id: 'pop', labelTr: 'Pop & Türkçe Pop', labelEn: 'Pop & Turkish Pop', pattern: /\bpop\b|turkish pop|dance pop|chamber pop|art pop/i },
  { id: 'electronic', labelTr: 'Elektronik / House / Techno', labelEn: 'Electronic / House / Techno', pattern: /electronic|house|techno|garage|disco|electro|breakbeat|dubstep|drum and bass|dnb|edm|trance/i },
  { id: 'indie', labelTr: 'Indie & Synthwave', labelEn: 'Indie & Synthwave', pattern: /indie|synth|darkwave|chillwave|dream pop|electropop/i },
  { id: 'anatolian', labelTr: 'Anadolu & Psikedelik', labelEn: 'Anatolian & Psychedelic', pattern: /anatolian|psychedelic|turkish folk/i },
  { id: 'hiphop_rnb', labelTr: 'Hip-Hop / Rap / R&B', labelEn: 'Hip-Hop / Rap / R&B', pattern: /hip hop|rap|trap|r&b|soul|funk/i },
  { id: 'acoustic', labelTr: 'Akustik / Folk / Klasik', labelEn: 'Acoustic / Folk / Classical', pattern: /acoustic|folk|neoclassical|classical|ambient|jazz|singer-songwriter/i },
  { id: 'metal', labelTr: 'Metal & Sert', labelEn: 'Metal & Heavy', pattern: /metal|industrial|hardcore|ska/i },
];

export function classifyTrackGenreCategories(track) {
  const genres = Array.isArray(track?.genres) ? track.genres : [];
  if (genres.length === 0) return [];
  const joined = genres.join(' | ');
  const matched = [];
  for (const cat of GENRE_CATEGORIES) {
    if (cat.pattern.test(joined)) {
      matched.push(cat.id);
    }
  }
  return matched;
}

export function matchesGenreRules(track, { includeGenres = [], excludeGenres = [] } = {}) {
  const inc = Array.isArray(includeGenres) ? includeGenres.filter(Boolean) : [];
  const exc = Array.isArray(excludeGenres) ? excludeGenres.filter(Boolean) : [];
  if (inc.length === 0 && exc.length === 0) return true;

  const trackCats = classifyTrackGenreCategories(track);
  const rawLower = (track.genres || []).map((g) => String(g).toLowerCase());

  const hasMatch = (targetList) =>
    targetList.some((g) => {
      const gl = String(g).toLowerCase();
      return trackCats.includes(gl) || rawLower.some((rg) => rg.includes(gl));
    });

  if (exc.length > 0 && hasMatch(exc)) return false;
  if (inc.length > 0 && !hasMatch(inc)) return false;
  return true;
}

const TURKISH_GENRE_RE = /turkish|anatolian|karadeniz|arabesk|türk|turkce|oyun havas|fasil|ozgun|anadolu/i;
const TURKISH_UNIQUE_CHARS_RE = /[ğĞşŞıİ]/;

/**
 * Detects whether a track belongs to the Turkish ('tr') or International ('intl') musical universe.
 */
export function detectTrackLanguage(track) {
  const genres = Array.isArray(track?.genres) ? track.genres.join(' ') : '';
  if (TURKISH_GENRE_RE.test(genres)) return 'tr';

  const text = `${track?.name || ''} ${(track?.artists || []).join(' ')} ${track?.albumName || ''}`;
  if (TURKISH_UNIQUE_CHARS_RE.test(text)) return 'tr';

  return 'intl';
}

export function matchesVocalMode(track, vocalMode = 'all') {
  const inst = Number(track?.instrumentalness ?? 0.05);
  if (vocalMode === 'vocal') return inst < 0.35;
  if (vocalMode === 'instrumental') return inst >= 0.35;
  return true;
}

/**
 * Computes Sonic / Aesthetic Cohesion [0..1] between two consecutive tracks:
 * - Genre & texture overlap (prevents Pop/Rock -> Trip-Hop/Electronica whiplash)
 * - Valence proximity (prevents 94% cheerful -> 37% dark whiplash)
 * - Vocal vs Instrumental consistency (prevents full-vocal -> 84% instrumental whiplash)
 * - Language/cultural universe alignment
 */
export function computeSonicCohesion(trackA, trackB) {
  if (!trackA || !trackB) return { score: 1, sameUniverse: true, genreOverlap: 1 };

  const catsA = new Set(classifyTrackGenreCategories(trackA));
  const catsB = new Set(classifyTrackGenreCategories(trackB));
  let genreOverlap = 0.55;
  if (catsA.size > 0 && catsB.size > 0) {
    let inter = 0;
    for (const c of catsA) {
      if (catsB.has(c)) inter += 1;
    }
    const union = new Set([...catsA, ...catsB]).size;
    genreOverlap = union > 0 ? inter / union : 0;
  }

  const valGap = Math.abs((trackA.valence ?? 0.5) - (trackB.valence ?? 0.5));
  const valScore = valGap <= 0.25 ? 1.0 : Math.exp(-(((valGap - 0.15) / 0.28) ** 2));

  const instGap = Math.abs((trackA.instrumentalness ?? 0.05) - (trackB.instrumentalness ?? 0.05));
  const instScore = instGap <= 0.25 ? 1.0 : Math.exp(-(((instGap - 0.15) / 0.35) ** 2));

  const langA = detectTrackLanguage(trackA);
  const langB = detectTrackLanguage(trackB);
  const sameUniverse = langA === langB;
  const langScore = sameUniverse ? 1.0 : 0.28;

  const score = Math.max(
    0,
    Math.min(1, 0.34 * genreOverlap + 0.26 * valScore + 0.22 * instScore + 0.18 * langScore)
  );

  return {
    score,
    sameUniverse,
    genreOverlap,
    valGap,
    instGap,
  };
}

