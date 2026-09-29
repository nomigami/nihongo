
export type LearningCategory =
  | "kotoba"
  | "kata-kerja"
  | "kata-sifat"
  | "kanji";

const storageKey = (category: LearningCategory) =>
  `nihongo-progress-${category}`;

export type LevelProgress = Record<number, boolean>;

export function getLevelProgress(
  category: LearningCategory
): LevelProgress {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(
      localStorage.getItem(storageKey(category)) || "{}"
    ) as LevelProgress;
  } catch {
    return {};
  }
}

export function saveLevelPassed(
  category: LearningCategory,
  level: number
) {
  if (typeof window === "undefined") return;

  const progress = getLevelProgress(category);
  progress[level] = true;

  localStorage.setItem(storageKey(category), JSON.stringify(progress));
}

export function isLevelUnlocked(
  levels: number[],
  level: number,
  progress: LevelProgress
): boolean {
  const sortedLevels = [...levels].sort((a, b) => a - b);
  const index = sortedLevels.indexOf(level);

  if (index === -1) return false;
  if (index === 0) return true;

  return progress[sortedLevels[index - 1]] === true;
}

export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}