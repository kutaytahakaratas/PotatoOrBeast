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
 * Elite tier rank names - randomly selected for variety
 */
const ELITE_TIER_NAMES = [
  { rank: 'Quantum Supercomputer', emoji: '⚛️', description: 'Kuantum seviyesinde işlem gücü!' },
  { rank: 'Silicon God Mode', emoji: '👾', description: 'Silikon tanrısı modunda çalışıyor!' },
  { rank: 'Multiverse Renderer', emoji: '🌌', description: 'Çoklu evrenleri render edebilir!' },
  { rank: 'Frame Eater', emoji: '🦖', description: 'FPS canavarı! Kare yiyen makine!' },
  { rank: 'Overkill Machine', emoji: '💀', description: 'Bu güç fazla! Overkill seviyesi!' },
  { rank: 'NASA Bilgisayarı', emoji: '🚀', description: 'Uzay üssü seviyesinde güç!' },
];

/**
 * Get a deterministic but varied rank for elite tier
 * Uses score as seed for pseudo-random selection
 */
const getEliteRank = (score: number): { rank: string; emoji: string; description: string } => {
  // Use last 3 digits of score modulo array length for pseudo-random selection
  const seed = (score % 1000) % ELITE_TIER_NAMES.length;
  return ELITE_TIER_NAMES[seed];
};

/**
 * Get rank information based on score
 */
export const getRank = (score: number): ScoreResult => {
  // ELITE TIER: 400,000+ (High-end gaming systems)
  if (score >= 400000) {
    const eliteRank = getEliteRank(score);
    return {
      score,
      rank: eliteRank.rank,
      rankEmoji: eliteRank.emoji,
      rankColor: 'text-cyber-purple',
      description: eliteRank.description,
    };
  }
  
  // HIGH TIER: 200,000 - 400,000
  if (score >= 200000) {
    return {
      score,
      rank: 'Oyun Canavarı',
      rankEmoji: '🎮',
      rankColor: 'text-neon-green',
      description: 'Hardcore gamer! AAA oyunlar için tam hazırsın.',
    };
  }
  
  // MID-HIGH TIER: 100,000 - 200,000
  if (score >= 100000) {
    return {
      score,
      rank: 'Solid Performer',
      rankEmoji: '💪',
      rankColor: 'text-electric-blue',
      description: 'Sağlam performans! Çoğu oyunu rahat kaldırırsın.',
    };
  }
  
  // MID TIER: 50,000 - 100,000
  if (score >= 50000) {
    return {
      score,
      rank: 'Ofis Savaşçısı',
      rankEmoji: '💼',
      rankColor: 'text-yellow-400',
      description: 'Günlük işler tamam. Oyun için biraz upgrade lazım.',
    };
  }
  
  // LOW TIER: Below 50,000
  return {
    score,
    rank: 'Patates PC',
    rankEmoji: '🥔',
    rankColor: 'text-orange-500',
    description: 'Sabır erdemdir. Chrome açmak bile kahramanlık!',
  };
};

/**
 * Get performance tier color for gradient backgrounds
 */
export const getScoreGradient = (score: number): string => {
  if (score >= 400000) {
    return 'from-cyber-purple via-pink-500 to-neon-green';
  }
  if (score >= 200000) {
    return 'from-neon-green via-electric-blue to-neon-green';
  }
  if (score >= 100000) {
    return 'from-electric-blue via-cyber-purple to-electric-blue';
  }
  if (score >= 50000) {
    return 'from-yellow-400 via-orange-400 to-yellow-400';
  }
  return 'from-orange-500 via-red-500 to-orange-500';
};
