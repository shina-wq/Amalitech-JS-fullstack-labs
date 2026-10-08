// ==========================================================================
// Text analysis (pure functions)
// ==========================================================================

const WORDS_PER_MINUTE = 200;

const countWords = (text) => text.match(/\S+/g)?.length ?? 0;

// Fragments between ., ! or ? — an unfinished last sentence still counts
const countSentences = (text) => text.split(/[.!?]+/).filter((part) => part.trim()).length;

const padCount = (count) => String(count).padStart(2, "0");

function readingTime(words) {
  const minutes = Math.round(words / WORDS_PER_MINUTE);
  if (!words) return "0 minute";
  if (!minutes) return "<1 minute";
  return `${minutes} minute${minutes > 1 ? "s" : ""}`;
}

/** Letter frequencies, most common first, as { letter, count, percent }. */
function letterDensity(text) {
  const letters = text.toUpperCase().match(/\p{L}/gu) ?? [];
  const counts = new Map();
  for (const letter of letters) counts.set(letter, (counts.get(letter) ?? 0) + 1);

  return [...counts]
    .map(([letter, count]) => ({ letter, count, percent: (count / letters.length) * 100 }))
    .sort((a, b) => b.count - a.count || a.letter.localeCompare(b.letter));
}
