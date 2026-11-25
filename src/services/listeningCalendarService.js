import { MOOD_PROFILES, classifyTrackMood } from '../domain/moods.js';

const TIME_BLOCKS = [
  { id: 'morning', labelTr: 'Sabah (06–12)', labelEn: 'Morning (06–12)', start: 6, end: 11 },
  { id: 'afternoon', labelTr: 'Öğlen (12–18)', labelEn: 'Afternoon (12–18)', start: 12, end: 17 },
  { id: 'evening', labelTr: 'Akşam (18–23)', labelEn: 'Evening (18–23)', start: 18, end: 22 },
  { id: 'night', labelTr: 'Gece (23–06)', labelEn: 'Late Night (23–06)', start: 23, end: 5 },
];

function getTimeBlockId(hour) {
  if (hour >= 6 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  if (hour >= 18 && hour <= 22) return 'evening';
  return 'night';
}

/**
 * Analyzes listening history events into:
 * - Time-of-day BPM & Mood profiles (Sabah / Öğlen / Akşam / Gece)
 * - 28-day Mood Calendar (dominant mood + avg BPM + minutes per day)
 */
export function buildListeningCalendar(events, tracks) {
  if (!events || events.length === 0) {
    return {
      totalEvents: 0,
      totalMinutes: 0,
      timeOfDay: TIME_BLOCKS.map((b) => ({
        ...b,
        eventCount: 0,
        minutes: 0,
        avgBpm: 0,
        dominantMood: null,
        moodColor: '#64748b',
      })),
      calendarDays: [],
    };
  }

  const byId = new Map(tracks.map((t) => [t.id, t]));
  const byNameKey = new Map(
    tracks.map((t) => [`${t.name.toLowerCase()}::${(t.artists?.[0] || '').toLowerCase()}`, t])
  );

  const blockAgg = Object.fromEntries(
    TIME_BLOCKS.map((b) => [b.id, { ...b, eventCount: 0, msTotal: 0, bpmSum: 0, moodCounts: {} }])
  );
  const dayAgg = new Map();

  let totalMinutes = 0;

  for (const ev of events) {
    const dt = new Date(ev.playedAt);
    if (Number.isNaN(dt.getTime())) continue;

    const matchedTrack =
      (ev.trackId && byId.get(ev.trackId)) ||
      byNameKey.get(`${String(ev.trackName || '').toLowerCase()}::${String(ev.artistName || '').toLowerCase()}`);

    const bpm = Number(matchedTrack?.bpm) || 112;
    const moodInfo = matchedTrack
      ? classifyTrackMood(matchedTrack)
      : { primaryMood: 'groove', profile: MOOD_PROFILES.groove };

    const hour = dt.getUTCHours();
    const blockId = getTimeBlockId(hour);
    const b = blockAgg[blockId];
    const ms = Number(ev.msPlayed) || 210000;

    b.eventCount += 1;
    b.msTotal += ms;
    b.bpmSum += bpm;
    b.moodCounts[moodInfo.primaryMood] = (b.moodCounts[moodInfo.primaryMood] || 0) + 1;

    const dayKey = dt.toISOString().slice(0, 10);
    const d = dayAgg.get(dayKey) || { date: dayKey, eventCount: 0, msTotal: 0, bpmSum: 0, moodCounts: {} };
    d.eventCount += 1;
    d.msTotal += ms;
    d.bpmSum += bpm;
    d.moodCounts[moodInfo.primaryMood] = (d.moodCounts[moodInfo.primaryMood] || 0) + 1;
    dayAgg.set(dayKey, d);

    totalMinutes += ms / 60000;
  }

  function topMoodFrom(counts) {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;
    const id = entries[0][0];
    return {
      id,
      labelTr: MOOD_PROFILES[id]?.labelTr || id,
      labelEn: MOOD_PROFILES[id]?.labelEn || id,
      color: MOOD_PROFILES[id]?.color || '#38bdf8',
    };
  }

  const timeOfDay = TIME_BLOCKS.map((meta) => {
    const b = blockAgg[meta.id];
    const dom = topMoodFrom(b.moodCounts);
    return {
      id: meta.id,
      labelTr: meta.labelTr,
      labelEn: meta.labelEn,
      eventCount: b.eventCount,
      minutes: Math.round(b.msTotal / 60000),
      avgBpm: b.eventCount ? Math.round((b.bpmSum / b.eventCount) * 10) / 10 : 0,
      dominantMood: dom,
      moodColor: dom?.color || '#64748b',
    };
  });

  const calendarDays = Array.from(dayAgg.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-28)
    .map((d) => {
      const dom = topMoodFrom(d.moodCounts);
      return {
        date: d.date,
        eventCount: d.eventCount,
        minutes: Math.round(d.msTotal / 60000),
        avgBpm: d.eventCount ? Math.round((d.bpmSum / d.eventCount) * 10) / 10 : 0,
        dominantMood: dom,
        moodColor: dom?.color || '#64748b',
      };
    });

  return {
    totalEvents: events.length,
    totalMinutes: Math.round(totalMinutes),
    timeOfDay,
    calendarDays,
  };
}
