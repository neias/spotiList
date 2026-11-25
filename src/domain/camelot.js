/**
 * Camelot Wheel harmonic mixing helpers.
 * Converts Spotify/ReccoBeats pitch class (0=C .. 11=B) and mode (0=minor, 1=major)
 * into Camelot codes (1A..12A minor, 1B..12B major) and computes DJ-grade key compatibility.
 */

const PITCH_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// Index = pitch class 0..11
const MAJOR_CAMELOT = [8, 3, 10, 5, 12, 7, 2, 9, 4, 11, 6, 1]; // C=8B, C#=3B, D=10B, ...
const MINOR_CAMELOT = [5, 12, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10]; // Cm=5A, C#m=12A, ..., Am=8A

export function toCamelot(key, mode) {
  const k = Number(key);
  const m = Number(mode);
  if (!Number.isInteger(k) || k < 0 || k > 11 || (m !== 0 && m !== 1)) {
    return {
      code: null,
      number: null,
      letter: null,
      keyLabel: '—',
    };
  }
  const number = m === 1 ? MAJOR_CAMELOT[k] : MINOR_CAMELOT[k];
  const letter = m === 1 ? 'B' : 'A';
  const keyLabel = `${PITCH_NAMES[k]}${m === 0 ? 'm' : ''}`;
  return {
    code: `${number}${letter}`,
    number,
    letter,
    keyLabel,
  };
}

function circularDiff12(a, b) {
  const d = Math.abs(a - b) % 12;
  return Math.min(d, 12 - d);
}

/**
 * Computes harmonic key compatibility [0..1] between two tracks.
 */
export function computeHarmonicCompatibility(trackA, trackB) {
  const cA = toCamelot(trackA?.musicalKey ?? trackA?.key, trackA?.musicalMode ?? trackA?.mode);
  const cB = toCamelot(trackB?.musicalKey ?? trackB?.key, trackB?.musicalMode ?? trackB?.mode);

  if (!cA.code || !cB.code) {
    return { score: 0.65, relation: 'unknown', fromCode: cA.code, toCode: cB.code };
  }

  const diff = circularDiff12(cA.number, cB.number);
  const sameLetter = cA.letter === cB.letter;

  if (diff === 0 && sameLetter) {
    return { score: 1.0, relation: 'same', fromCode: cA.code, toCode: cB.code };
  }
  if (diff === 1 && sameLetter) {
    return { score: 0.92, relation: 'adjacent', fromCode: cA.code, toCode: cB.code };
  }
  if (diff === 0 && !sameLetter) {
    return { score: 0.90, relation: 'relative', fromCode: cA.code, toCode: cB.code };
  }
  if ((diff === 2 || diff === 7) && sameLetter) {
    return { score: 0.72, relation: 'energy_boost', fromCode: cA.code, toCode: cB.code };
  }
  if (diff === 1 && !sameLetter) {
    return { score: 0.56, relation: 'diagonal', fromCode: cA.code, toCode: cB.code };
  }
  return { score: 0.25, relation: 'clash', fromCode: cA.code, toCode: cB.code };
}
