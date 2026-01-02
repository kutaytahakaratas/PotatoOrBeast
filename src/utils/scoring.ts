export interface ScoreResult {
  score: number;
  rank: string;
  rankEmoji: string;
  rankColor: string;
  description: string;
}

/**
 * Calculate benchmark score from total objects rendered
 * In dynamic stress test, score = total objects GPU could handle
 */
export const calculateScore = (totalObjects: number): number => {
  return Math.round(totalObjects);
};


/**
 * Get rank information based on score
 */
export const getRank = (score: number): ScoreResult => {
  if (score >= 10000) {
    return {
      score,
      rank: 'NASA Bilgisayarı',
      rankEmoji: '🚀',
      rankColor: 'text-cyber-purple',
      description: 'Uzay üssü seviyesinde güç! Bu makine her şeyi render eder.',
    };
  }
  
  if (score >= 5000) {
    return {
      score,
      rank: 'Oyun Makinesi',
      rankEmoji: '🎮',
      rankColor: 'text-neon-green',
      description: 'Hardcore gamer! AAA oyunlar için hazırsın.',
    };
  }
  
  if (score >= 1000) {
    return {
      score,
      rank: 'Ofis Savaşçısı',
      rankEmoji: '💼',
      rankColor: 'text-electric-blue',
      description: 'Günlük işler için yeterli. Oyun oynamak istiyorsan biraz upgrade lazım.',
    };
  }
  
  return {
    score,
    rank: 'Patates PC',
    rankEmoji: '🥔',
    rankColor: 'text-yellow-500',
    description: 'Sabır bir erdemdir. Anime izleyebilirsin en azından.',
  };
};

/**
 * Get performance tier color for gradient backgrounds
 */
export const getScoreGradient = (score: number): string => {
  if (score >= 10000) {
    return 'from-cyber-purple via-electric-blue to-neon-green';
  }
  if (score >= 5000) {
    return 'from-neon-green via-electric-blue to-neon-green';
  }
  if (score >= 1000) {
    return 'from-electric-blue via-cyber-purple to-electric-blue';
  }
  return 'from-yellow-500 via-orange-500 to-yellow-500';
};
