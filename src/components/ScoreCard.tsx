import { useMemo } from 'react';
import { getFullAnalysis } from '../utils/commentaryEngine';
import { getPreviousScore } from '../utils/scoreHistory';

interface ScoreCardProps {
  gpuScore: number | null;
  cpuScore: number | null;
}

export const ScoreCard = ({ gpuScore, cpuScore }: ScoreCardProps) => {
  // Get previous score for comparison
  const previousScore = useMemo(() => getPreviousScore(), []);
  
  // Get commentary analysis
  const analysis = useMemo(() => {
    if (gpuScore === null || cpuScore === null) return null;
    return getFullAnalysis(
      gpuScore, 
      cpuScore, 
      previousScore?.combinedScore
    );
  }, [gpuScore, cpuScore, previousScore]);

  if (!analysis || gpuScore === null || cpuScore === null) {
    return null;
  }

  const combinedScore = Math.round((gpuScore + cpuScore) / 2);

  return (
    <div className="max-w-6xl mx-auto my-6 space-y-4">
      {/* Main Score Card */}
      <div 
        className="neon-border bg-cyber-dark/80 backdrop-blur-md rounded-2xl p-6 overflow-hidden"
        style={{ animation: 'fadeInScale 0.5s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron text-xl font-bold text-white flex items-center gap-2">
            🎮 Benchmark Sonuçları
          </h2>
          <div className="font-space-mono text-xs text-gray-500">
            Eğlenceli Analiz
          </div>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* GPU Score */}
          <div className="bg-gradient-to-br from-neon-green/10 to-transparent rounded-xl p-4 border border-neon-green/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{analysis.gpu.emoji}</span>
              <div>
                <p className="font-space-mono text-[10px] text-gray-500 uppercase">3D Performance</p>
                <p className="font-orbitron text-sm font-bold text-neon-green">{analysis.gpu.tier}</p>
              </div>
            </div>
            <p className="font-orbitron text-3xl font-black text-white mb-3">
              {gpuScore.toLocaleString()}
            </p>
            <p className="font-space-mono text-xs text-gray-400 italic leading-relaxed border-t border-white/10 pt-3">
              "{analysis.gpu.comment}"
            </p>
          </div>

          {/* CPU Score */}
          <div className="bg-gradient-to-br from-electric-blue/10 to-transparent rounded-xl p-4 border border-electric-blue/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{analysis.cpu.emoji}</span>
              <div>
                <p className="font-space-mono text-[10px] text-gray-500 uppercase">JavaScript Speed</p>
                <p className="font-orbitron text-sm font-bold text-electric-blue">{analysis.cpu.tier}</p>
              </div>
            </div>
            <p className="font-orbitron text-3xl font-black text-white mb-3">
              {cpuScore.toLocaleString()}
            </p>
            <p className="font-space-mono text-xs text-gray-400 italic leading-relaxed border-t border-white/10 pt-3">
              "{analysis.cpu.comment}"
            </p>
          </div>

          {/* Combined Score */}
          <div className="bg-gradient-to-br from-cyber-purple/10 to-transparent rounded-xl p-4 border border-cyber-purple/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-space-mono text-[10px] text-gray-500 uppercase">Toplam Skor</p>
                <p className="font-orbitron text-sm font-bold text-cyber-purple">Kombine</p>
              </div>
            </div>
            <p className="font-orbitron text-3xl font-black text-white mb-3">
              {combinedScore.toLocaleString()}
            </p>
            {analysis.comparison && (
              <p className="font-space-mono text-xs text-gray-400 italic leading-relaxed border-t border-white/10 pt-3">
                "{analysis.comparison.comment}"
              </p>
            )}
          </div>
        </div>

        {/* Bottleneck Analysis Row */}
        <div className={`rounded-xl p-4 border ${
          analysis.bottleneck.culprit === 'none' 
            ? 'border-neon-green/30 bg-neon-green/5' 
            : analysis.bottleneck.culprit === 'cpu'
              ? 'border-yellow-500/30 bg-yellow-500/5'
              : analysis.bottleneck.culprit === 'gpu'
                ? 'border-orange-500/30 bg-orange-500/5'
                : 'border-red-500/30 bg-red-500/5'
        }`}>
          <div className="flex items-start gap-4">
            <div className="text-3xl shrink-0">{analysis.bottleneck.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-orbitron text-sm font-bold ${
                  analysis.bottleneck.culprit === 'none' 
                    ? 'text-neon-green' 
                    : analysis.bottleneck.culprit === 'cpu'
                      ? 'text-yellow-400'
                      : analysis.bottleneck.culprit === 'gpu'
                        ? 'text-orange-400'
                        : 'text-red-400'
                }`}>
                  {analysis.bottleneck.status}
                </h4>
                <span className="font-space-mono text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded">
                  Darboğaz Dedektifi
                </span>
              </div>
              <p className="font-space-mono text-sm text-gray-300 italic">
                "{analysis.bottleneck.comment}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Comparison Note (if available) */}
      {analysis.comparison && (
        <div 
          className="bg-cyber-darker/50 rounded-lg p-4 border border-white/5"
          style={{ animation: 'fadeInScale 0.5s ease-out 0.2s both' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{analysis.comparison.emoji}</span>
            <div>
              <span className="font-orbitron text-sm font-bold text-gray-300">
                Geçmişle Kıyaslama: 
              </span>
              <span className="font-space-mono text-sm text-gray-400 ml-2 italic">
                {analysis.comparison.comment}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
