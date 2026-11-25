import assert from 'node:assert/strict';
import test from 'node:test';

import { getDemoLibrary } from '../src/data/demoLibrary.js';
import { classifyTrackMood, computeMoodSimilarity, scoreTrackMood } from '../src/domain/moods.js';
import {
  buildSlotTargets,
  computeTrackAffinity,
  generatePlaylist,
  resolveEffectiveBpm,
} from '../src/domain/playlistEngine.js';

test('Mood scoring ranks euphoric tracks higher for euphoric profile than melancholic tracks', () => {
  const happy = { valence: 0.85, energy: 0.80, danceability: 0.78, acousticness: 0.1 };
  const sad = { valence: 0.15, energy: 0.30, danceability: 0.40, acousticness: 0.7 };

  assert.ok(computeMoodSimilarity(happy, 'euphoric') > computeMoodSimilarity(sad, 'euphoric'));
  assert.ok(computeMoodSimilarity(sad, 'melancholic') > computeMoodSimilarity(happy, 'melancholic'));
  assert.equal(classifyTrackMood(happy).primaryMood, 'euphoric');
});

test('Tempo-first rule overrides mood even when caller tries passing low tempoWeight', () => {
  const tracks = [
    { id: 't1', name: 'Wrong Tempo Perfect Mood', artists: ['A'], bpm: 78, valence: 0.9, energy: 0.85, danceability: 0.85, acousticness: 0.05, isLiked: true, playCount: 200 },
    { id: 't2', name: 'Exact Tempo Good Mood', artists: ['B'], bpm: 124, valence: 0.75, energy: 0.78, danceability: 0.82, acousticness: 0.05, isLiked: true, playCount: 80 },
    { id: 't3', name: 'Exact Tempo Fair Mood', artists: ['C'], bpm: 123, valence: 0.65, energy: 0.72, danceability: 0.78, acousticness: 0.08, isLiked: false, playCount: 40 },
    { id: 't4', name: 'Near Tempo', artists: ['D'], bpm: 125, valence: 0.70, energy: 0.74, danceability: 0.80, acousticness: 0.06, isLiked: true, playCount: 50 },
  ];

  const result = generatePlaylist(tracks, {
    targetBpm: 124,
    toleranceBpm: 4,
    tempoCurve: 'steady',
    tempoWeight: 0.2, // Should be clamped to >= 0.50!
    moodWeight: 0.7,
    moodIds: ['euphoric'],
    trackCount: 4,
  });

  assert.ok(result.weights.tempoWeight >= 0.50);
  assert.ok(result.weights.tempoWeight > result.weights.moodWeight);
  assert.ok(!result.tracks.some((t) => t.id === 't1'), '78 BPM track must be excluded by strict 124±4 BPM gate');
  assert.equal(result.tracks.length, 3);
});

test('Mood acts as tie-breaker and second rule inside the same BPM corridor', () => {
  const tracks = [
    { id: 'sad_122', name: 'Sad 122', artists: ['A'], bpm: 122, valence: 0.14, energy: 0.35, danceability: 0.45, acousticness: 0.5, isLiked: true, playCount: 150 },
    { id: 'happy_122', name: 'Happy 122', artists: ['B'], bpm: 122, valence: 0.84, energy: 0.80, danceability: 0.82, acousticness: 0.05, isLiked: true, playCount: 90 },
    { id: 'mid_123', name: 'Mid 123', artists: ['C'], bpm: 123, valence: 0.60, energy: 0.72, danceability: 0.74, acousticness: 0.1, isLiked: true, playCount: 70 },
  ];

  const result = generatePlaylist(tracks, {
    targetBpm: 122,
    toleranceBpm: 3,
    tempoCurve: 'steady',
    moodIds: ['euphoric'],
    moodStrictness: 'off',
    trackCount: 3,
  });

  assert.equal(result.tracks[0].id, 'happy_122');
});

test('Harmonic half/double-time matching resolves 70 BPM to 140 BPM only when enabled', () => {
  const disabled = resolveEffectiveBpm(70, 140, false);
  assert.equal(disabled.effectiveBpm, 70);
  assert.equal(disabled.harmonicMatched, false);

  const enabled = resolveEffectiveBpm(70, 140, true);
  assert.equal(enabled.effectiveBpm, 140);
  assert.equal(enabled.harmonicMatched, true);
  assert.equal(enabled.ratio, 2);
});

test('Warmup -> Peak -> Cooldown curve builds monotonic climb then descent', () => {
  const targets = buildSlotTargets({
    trackCount: 10,
    tempoCurve: 'warmup_peak_cooldown',
    minBpm: 90,
    maxBpm: 140,
  });

  assert.equal(targets.length, 10);
  assert.equal(targets[0], 90);
  const peakVal = Math.max(...targets);
  const peakIdx = targets.indexOf(peakVal);
  assert.ok(peakIdx >= 5 && peakIdx <= 7);
  assert.ok(targets[9] < peakVal);
});

test('Demo library generates steady, ramp_up, and hiit_waves playlists cleanly with artist cooldown', () => {
  const { tracks } = getDemoLibrary();
  assert.ok(tracks.length >= 90);

  const steady = generatePlaylist(tracks, {
    targetBpm: 123,
    toleranceBpm: 5,
    tempoCurve: 'steady',
    moodIds: ['groove', 'euphoric'],
    trackCount: 12,
    artistCooldown: 2,
  });

  assert.equal(steady.tracks.length, 12);
  for (const t of steady.tracks) {
    assert.ok(Math.abs(t.effectiveBpm - 123) <= 5);
  }
  assert.ok(steady.metrics.beatMatchSmoothness >= 75);

  const ramp = generatePlaylist(tracks, {
    tempoCurve: 'ramp_up',
    minBpm: 88,
    maxBpm: 140,
    toleranceBpm: 8,
    moodIds: ['euphoric', 'intense'],
    trackCount: 10,
  });
  assert.equal(ramp.tracks.length, 10);
  assert.ok(ramp.tracks[ramp.tracks.length - 1].effectiveBpm > ramp.tracks[0].effectiveBpm);

  const customEval = scoreTrackMood(tracks[0], { customMood: { valence: 0.4, energy: 0.5 } });
  assert.ok(customEval.score > 0 && customEval.score <= 1);

  const affinity = computeTrackAffinity({ isLiked: true, fromAlbum: true, playCount: 100, topRank: 1 }, 100);
  assert.ok(affinity.affinityScore > 0.9);
});
