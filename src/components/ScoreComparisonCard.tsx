import { useEffect, useState, useRef } from 'react';
import { 
  getPreviousScore,
  saveScore, 
  clearHistory,
  type ScoreEntry 
} from '../utils/scoreHistory';

interface ScoreComparisonCardProps {
  gpuScore: number | null;
  cpuScore: number | null;
}

// Format date for display
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ScoreComparisonCard = ({ gpuScore, cpuScore }: ScoreComparisonCardProps) => {
  // Previous score from localStorage (read ONCE on mount)
  const [previousScore, setPreviousScore] = useState<ScoreEntry | null>(null);
  const [hasReadHistory, setHasReadHistory] = useState(false);
  const [hasSavedNewScore, setHasSavedNewScore] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Ref to track if we've processed the current scores
  const processedScoresRef = useRef<string | null>(null);

  // === STEP 1: Read previous score from localStorage ONCE on mount ===
  useEffect(() => {
    if (!hasReadHistory) {
      const previous = getPreviousScore();
      setPreviousScore(previous);
      setHasReadHistory(true);
      console.log('📖 Read previous score from localStorage:', previous);
    }
  }, [hasReadHistory]);

  // === STEP 2: After comparison is shown, save new score with delay ===
  useEffect(() => {
    if (gpuScore === null || cpuScore === null) return;
    if (!hasReadHistory) return; // Wait for history to be read first
    if (hasSavedNewScore) return; // Already saved
    
    // Create a unique key for this score combination
    const scoreKey = `${gpuScore}-${cpuScore}`;
    if (processedScoresRef.current === scoreKey) return; // Already processed
    
    // Mark as processed
    processedScoresRef.current = scoreKey;
    
    // Trigger animation
    setTimeout(() => setShowAnimation(true), 100);
    
    // === SAVE AFTER SHOWING COMPARISON ===
    // Wait 2 seconds to ensure user sees the comparison, then save
    const saveTimer = setTimeout(() => {
      console.log('💾 Saving new score to localStorage:', { gpuScore, cpuScore });
      saveScore(gpuScore, cpuScore);
      setHasSavedNewScore(true);
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [gpuScore, cpuScore, hasReadHistory, hasSavedNewScore]);

  // Don't render if no scores yet
  if (gpuScore === null || cpuScore === null || !hasReadHistory) {
    return null;
  }

  // Calculate current score data
  const currentDate = new Date();
  const currentCombinedScore = Math.round((gpuScore + cpuScore) / 2);
  
  // Calculate differences
  const hasHistory = previousScore !== null;
  const gpuDiff = hasHistory ? gpuScore - previousScore.gpuScore : 0;
  const cpuDiff = hasHistory ? cpuScore - previousScore.cpuScore : 0;
  const combinedDiff = hasHistory ? currentCombinedScore - previousScore.combinedScore : 0;
  
  const gpuDiffPercent = hasHistory && previousScore.gpuScore > 0 
    ? Math.round((gpuDiff / previousScore.gpuScore) * 100) : 0;
  const cpuDiffPercent = hasHistory && previousScore.cpuScore > 0 
    ? Math.round((cpuDiff / previousScore.cpuScore) * 100) : 0;
  const combinedDiffPercent = hasHistory && previousScore.combinedScore > 0 
    ? Math.round((combinedDiff / previousScore.combinedScore) * 100) : 0;

  // Determine trend and message
  let trend: 'improved' | 'regressed' | 'stable' | 'first';
  let message: string;
  
  if (!hasHistory) {
    trend = 'first';
    message = '🎉 İlk Testiniz Tamamlandı! Bir sonraki testte önceki skorunuzla karşılaştırma göreceksiniz.';
  } else if (combinedDiffPercent > 5) {
    trend = 'improved';
    if (combinedDiffPercent > 20) {
      message = `🚀 Muhteşem! Performans %${combinedDiffPercent} arttı. Ciddi bir gelişme kaydettiniz!`;
    } else if (combinedDiffPercent > 10) {
      message = `🔥 Harika İlerleme! %${combinedDiffPercent} artış. Driver veya optimizasyon etkili olmuş.`;
    } else {
      message = `📈 Güzel! Sisteminiz %${combinedDiffPercent} daha hızlı çalışıyor.`;
    }
  } else if (combinedDiffPercent < -5) {
    trend = 'regressed';
    if (combinedDiffPercent < -20) {
      message = `⚠️ Performans Kaybı: %${Math.abs(combinedDiffPercent)} düşüş. Arka planda çalışan uygulama olabilir.`;
    } else if (combinedDiffPercent < -10) {
      message = `📉 Düşüş Tespit Edildi: %${Math.abs(combinedDiffPercent)} yavaşlama. Termal throttling kontrol edin.`;
    } else {
      message = `↘️ Hafif düşüş (%${Math.abs(combinedDiffPercent)}). Normal varyasyon olabilir.`;
    }
  } else {
    trend = 'stable';
    const stableMessages = [
      '⚖️ Stabilite Mükemmel: Sistem tutarlı çalışıyor. Güvenilir sonuçlar.',
      '🎯 Tutarlı Performans! Fark minimal. Bu iyi bir işaret.',
      '💎 Kararlı Sistem: Her testte benzer sonuç alıyorsunuz.',
      '🔒 Güvenilir: Performans sapması yok.',
    ];
    message = stableMessages[Math.floor(Math.random() * stableMessages.length)];
  }

  // Styling based on trend
  const getTrendStyles = () => {
    switch (trend) {
      case 'improved':
        return {
          borderColor: 'border-neon-green/50',
          bgGradient: 'from-neon-green/10 via-transparent to-neon-green/5',
          iconBg: 'bg-neon-green/20',
          iconGlow: 'shadow-[0_0_30px_rgba(0,255,136,0.3)]',
          textColor: 'text-neon-green',
          icon: '🚀',
        };
      case 'regressed':
        return {
          borderColor: 'border-red-500/50',
          bgGradient: 'from-red-500/10 via-transparent to-red-500/5',
          iconBg: 'bg-red-500/20',
          iconGlow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
          textColor: 'text-red-400',
          icon: '📉',
        };
      case 'stable':
        return {
          borderColor: 'border-electric-blue/50',
          bgGradient: 'from-electric-blue/10 via-transparent to-electric-blue/5',
          iconBg: 'bg-electric-blue/20',
          iconGlow: 'shadow-[0_0_30px_rgba(0,212,255,0.3)]',
          textColor: 'text-electric-blue',
          icon: '⚖️',
        };
      case 'first':
      default:
        return {
          borderColor: 'border-cyber-purple/50',
          bgGradient: 'from-cyber-purple/10 via-transparent to-cyber-purple/5',
          iconBg: 'bg-cyber-purple/20',
          iconGlow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
          textColor: 'text-cyber-purple',
          icon: '🎉',
        };
    }
  };

  const styles = getTrendStyles();

  const formatDiff = (diff: number, percent: number) => {
    if (!hasHistory) return '—';
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toLocaleString()} (${sign}${percent}%)`;
  };

  // Reset history handler
  const handleResetHistory = () => {
    clearHistory();
    setPreviousScore(null);
    setHasSavedNewScore(false);
    processedScoresRef.current = null;
    console.log('🗑️ History cleared');
  };

  return (
    <div 
      className={`max-w-6xl mx-auto border ${styles.borderColor} bg-gradient-to-r ${styles.bgGradient} backdrop-blur-sm rounded-lg overflow-hidden my-6`}
      style={{ 
        animation: showAnimation ? 'fadeInScale 0.6s ease-out' : 'none',
        opacity: showAnimation ? 1 : 0,
      }}
    >
      {/* Header */}
      <div className="bg-cyber-darker/50 py-4 px-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-orbitron text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <span className="text-lg">📊</span>
          PERFORMANS GEÇMİŞİ
        </h3>
        <div className="flex items-center gap-3">
          {hasSavedNewScore && (
            <span className="text-[10px] font-space-mono text-neon-green/60">✓ Kaydedildi</span>
          )}
          {/* Dev: Reset History Button */}
          <button
            onClick={handleResetHistory}
            className="px-2 py-1 rounded text-[10px] font-space-mono bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            title="Geçmişi sıfırla (Geliştirme için)"
          >
            🗑️ Sıfırla
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Message Row */}
        <div className="flex items-start gap-4 mb-6">
          <div 
            className={`w-14 h-14 rounded-2xl ${styles.iconBg} ${styles.iconGlow} flex items-center justify-center text-2xl shrink-0`}
          >
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className={`font-space-mono text-sm ${styles.textColor} leading-relaxed`}>
              {message}
            </p>
          </div>
        </div>

        {/* Score Comparison: LEFT = NOW, RIGHT = PREVIOUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GPU Score */}
          <div className="bg-cyber-darker/50 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎮</span>
              <span className="font-space-mono text-xs text-gray-500 uppercase">3D Performance</span>
            </div>
            <div className="flex items-end justify-between">
              {/* LEFT: Current (Now) */}
              <div>
                <p className="font-space-mono text-[10px] text-neon-green/70 mb-1">ŞİMDİ</p>
                <p className="font-orbitron text-xl font-bold text-neon-green">
                  {gpuScore.toLocaleString()}
                </p>
                <p className="font-space-mono text-[8px] text-gray-600 mt-1">
                  {formatDate(currentDate)}
                </p>
              </div>
              {/* RIGHT: Previous (Old) */}
              <div className="text-right">
                <p className="font-space-mono text-[10px] text-gray-500 mb-1">ÖNCEKİ</p>
                <p className="font-orbitron text-lg text-gray-400">
                  {hasHistory ? previousScore!.gpuScore.toLocaleString() : 'İlk Test'}
                </p>
                {hasHistory && (
                  <p className="font-space-mono text-[8px] text-gray-600 mt-1">
                    {previousScore!.date}
                  </p>
                )}
              </div>
            </div>
            {hasHistory && (
              <div className={`mt-2 pt-2 border-t border-white/5 text-center font-space-mono text-xs ${
                gpuDiff > 0 ? 'text-neon-green' : gpuDiff < 0 ? 'text-red-400' : 'text-gray-500'
              }`}>
                {formatDiff(gpuDiff, gpuDiffPercent)}
              </div>
            )}
          </div>

          {/* CPU Score */}
          <div className="bg-cyber-darker/50 rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚡</span>
              <span className="font-space-mono text-xs text-gray-500 uppercase">JavaScript Speed</span>
            </div>
            <div className="flex items-end justify-between">
              {/* LEFT: Current (Now) */}
              <div>
                <p className="font-space-mono text-[10px] text-electric-blue/70 mb-1">ŞİMDİ</p>
                <p className="font-orbitron text-xl font-bold text-electric-blue">
                  {cpuScore.toLocaleString()}
                </p>
                <p className="font-space-mono text-[8px] text-gray-600 mt-1">
                  {formatDate(currentDate)}
                </p>
              </div>
              {/* RIGHT: Previous (Old) */}
              <div className="text-right">
                <p className="font-space-mono text-[10px] text-gray-500 mb-1">ÖNCEKİ</p>
                <p className="font-orbitron text-lg text-gray-400">
                  {hasHistory ? previousScore!.cpuScore.toLocaleString() : 'İlk Test'}
                </p>
                {hasHistory && (
                  <p className="font-space-mono text-[8px] text-gray-600 mt-1">
                    {previousScore!.date}
                  </p>
                )}
              </div>
            </div>
            {hasHistory && (
              <div className={`mt-2 pt-2 border-t border-white/5 text-center font-space-mono text-xs ${
                cpuDiff > 0 ? 'text-neon-green' : cpuDiff < 0 ? 'text-red-400' : 'text-gray-500'
              }`}>
                {formatDiff(cpuDiff, cpuDiffPercent)}
              </div>
            )}
          </div>

          {/* Combined Score */}
          <div className={`rounded-lg p-4 border ${styles.borderColor} bg-gradient-to-br ${styles.bgGradient}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🏆</span>
              <span className="font-space-mono text-xs text-gray-500 uppercase">Toplam Skor</span>
            </div>
            <div className="flex items-end justify-between">
              {/* LEFT: Current (Now) */}
              <div>
                <p className={`font-space-mono text-[10px] ${styles.textColor}/70 mb-1`}>ŞİMDİ</p>
                <p className={`font-orbitron text-xl font-bold ${styles.textColor}`}>
                  {currentCombinedScore.toLocaleString()}
                </p>
              </div>
              {/* RIGHT: Previous (Old) */}
              <div className="text-right">
                <p className="font-space-mono text-[10px] text-gray-500 mb-1">ÖNCEKİ</p>
                <p className="font-orbitron text-lg text-gray-400">
                  {hasHistory ? previousScore!.combinedScore.toLocaleString() : '—'}
                </p>
              </div>
            </div>
            {hasHistory && (
              <div className={`mt-2 pt-2 border-t border-white/10 text-center font-orbitron text-sm font-bold ${styles.textColor}`}>
                {combinedDiff > 0 ? '↑' : combinedDiff < 0 ? '↓' : '='} {Math.abs(combinedDiffPercent)}%
              </div>
            )}
          </div>
        </div>

        {/* Save Status */}
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <p className="font-space-mono text-[10px] text-gray-600">
            {hasSavedNewScore 
              ? `✓ Bu skor kaydedildi. Sonraki testte karşılaştırma için kullanılacak.`
              : `⏳ Skor 2 saniye içinde kaydedilecek...`
            }
          </p>
        </div>
      </div>
    </div>
  );
};
