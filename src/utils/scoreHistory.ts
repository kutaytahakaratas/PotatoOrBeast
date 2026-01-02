/**
 * Local Score History Manager
 * 
 * Stores and retrieves benchmark scores from localStorage.
 * Enables "race against yourself" feature - users can compare
 * current results with their previous performance.
 * 
 * Architecture:
 * - Stores last 10 test results to avoid localStorage bloat
 * - Each entry includes: scores, timestamp, and test metadata
 * - Gracefully degrades if localStorage is unavailable
 */

export interface ScoreEntry {
  gpuScore: number;
  cpuScore: number;
  combinedScore: number;
  timestamp: number;
  date: string;
  browserInfo?: string;
}

export interface ScoreComparison {
  current: ScoreEntry;
  previous: ScoreEntry | null;
  gpuDiff: number;
  cpuDiff: number;
  combinedDiff: number;
  gpuDiffPercent: number;
  cpuDiffPercent: number;
  combinedDiffPercent: number;
  trend: 'improved' | 'regressed' | 'stable' | 'first';
  message: string;
}

const STORAGE_KEY = 'benchmark_arena_history';
const MAX_ENTRIES = 10;

/**
 * Check if localStorage is available
 */
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get all stored score entries
 */
export const getScoreHistory = (): ScoreEntry[] => {
  if (!isStorageAvailable()) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ScoreEntry[];
  } catch (error) {
    console.error('Failed to parse score history:', error);
    return [];
  }
};

/**
 * Get the most recent score entry (previous test)
 */
export const getPreviousScore = (): ScoreEntry | null => {
  const history = getScoreHistory();
  return history.length > 0 ? history[0] : null;
};

/**
 * Save a new score entry
 */
export const saveScore = (gpuScore: number, cpuScore: number): ScoreEntry => {
  const now = new Date();
  const entry: ScoreEntry = {
    gpuScore,
    cpuScore,
    combinedScore: Math.round((gpuScore + cpuScore) / 2),
    timestamp: now.getTime(),
    date: now.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    browserInfo: navigator.userAgent.split(' ').pop() || 'Unknown'
  };

  if (!isStorageAvailable()) return entry;

  try {
    const history = getScoreHistory();
    // Add new entry at the beginning (most recent first)
    history.unshift(entry);
    // Keep only last MAX_ENTRIES
    const trimmed = history.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save score:', error);
  }

  return entry;
};

/**
 * Compare current score with previous score
 */
export const compareScores = (
  gpuScore: number,
  cpuScore: number
): ScoreComparison => {
  const previous = getPreviousScore();
  const combinedScore = Math.round((gpuScore + cpuScore) / 2);
  
  const now = new Date();
  const current: ScoreEntry = {
    gpuScore,
    cpuScore,
    combinedScore,
    timestamp: now.getTime(),
    date: now.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  };

  // First time user
  if (!previous) {
    return {
      current,
      previous: null,
      gpuDiff: 0,
      cpuDiff: 0,
      combinedDiff: 0,
      gpuDiffPercent: 0,
      cpuDiffPercent: 0,
      combinedDiffPercent: 0,
      trend: 'first',
      message: '🎉 İlk Testiniz! Bir sonraki testte önceki skorunuzla karşılaştırma yapılacak.'
    };
  }

  // Calculate differences
  const gpuDiff = gpuScore - previous.gpuScore;
  const cpuDiff = cpuScore - previous.cpuScore;
  const combinedDiff = combinedScore - previous.combinedScore;
  
  // Calculate percentage differences (avoid division by zero)
  const gpuDiffPercent = previous.gpuScore > 0 
    ? Math.round((gpuDiff / previous.gpuScore) * 100) 
    : 0;
  const cpuDiffPercent = previous.cpuScore > 0 
    ? Math.round((cpuDiff / previous.cpuScore) * 100) 
    : 0;
  const combinedDiffPercent = previous.combinedScore > 0 
    ? Math.round((combinedDiff / previous.combinedScore) * 100) 
    : 0;

  // Determine trend (using combined score as main indicator)
  let trend: 'improved' | 'regressed' | 'stable';
  let message: string;

  if (combinedDiffPercent > 5) {
    trend = 'improved';
    if (combinedDiffPercent > 20) {
      message = `🚀 Muhteşem Performans Artışı! Sisteminiz geçen sefere göre %${combinedDiffPercent} daha hızlı. Büyük bir iyileştirme!`;
    } else if (combinedDiffPercent > 10) {
      message = `🔥 Harika! Performans %${combinedDiffPercent} arttı. Driver güncellemesi veya optimizasyon işe yaramış.`;
    } else {
      message = `📈 Güzel İlerleme! Sisteminiz %${combinedDiffPercent} daha hızlı çalışıyor.`;
    }
  } else if (combinedDiffPercent < -5) {
    trend = 'regressed';
    if (combinedDiffPercent < -20) {
      message = `⚠️ Dikkat! Performans %${Math.abs(combinedDiffPercent)} düştü. Arka plan uygulamalarını kontrol edin.`;
    } else if (combinedDiffPercent < -10) {
      message = `📉 Performans Düşüşü: %${Math.abs(combinedDiffPercent)} yavaşlama tespit edildi. Termal throttling olabilir.`;
    } else {
      message = `↘️ Hafif düşüş (%${Math.abs(combinedDiffPercent)}). Normal varyasyon olabilir.`;
    }
  } else {
    trend = 'stable';
    // Multiple message variations for stable performance
    const stableMessages = [
      '⚖️ Stabilite Mükemmel: Sistem performansı tutarlı. Donanımınız güvenilir şekilde çalışıyor.',
      '🎯 Tutarlı Performans! Skorunuz öncekiyle neredeyse aynı. Bu güvenilirlik işareti.',
      '💎 Kararlı Sistem: Performans sapması minimal. Optimizasyonlarınız etkili.',
      '🔒 Güvenilir Sonuçlar: Sistem stabilitesi mükemmel seviyede. Her testte aynı performans.',
      '⚡ Sabit Güç: Performansta sapma yok. Donanım-yazılım uyumu ideal.'
    ];
    message = stableMessages[Math.floor(Math.random() * stableMessages.length)];
  }

  return {
    current,
    previous,
    gpuDiff,
    cpuDiff,
    combinedDiff,
    gpuDiffPercent,
    cpuDiffPercent,
    combinedDiffPercent,
    trend,
    message
  };
};

/**
 * Get formatted time since last test
 */
export const getTimeSinceLastTest = (): string | null => {
  const previous = getPreviousScore();
  if (!previous) return null;

  // Return the full date instead of relative time
  return previous.date;
};

/**
 * Clear all score history
 */
export const clearHistory = (): void => {
  if (isStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEY);
  }
};
