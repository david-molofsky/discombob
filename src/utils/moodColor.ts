// Pastel rainbow, red (Awful) through violet (Amazing), matching MOOD_SCALE's
// 1-7 ordering.
const MOOD_COLORS: Record<number, string> = {
  1: '#F4A6A6', // red
  2: '#F5C08A', // orange
  3: '#F0DE8A', // yellow
  4: '#A8D8B0', // green
  5: '#A8C8E8', // blue
  6: '#B8A8E0', // indigo
  7: '#D0A8DE', // violet
};

export function moodColor(moodValue: number): string {
  return MOOD_COLORS[moodValue] ?? MOOD_COLORS[4];
}
