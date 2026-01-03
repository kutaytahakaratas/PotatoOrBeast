import { useEffect, useState, useMemo } from 'react';
import { calculateScore, getRank, getScoreGradient } from '../utils/scoring';
import { getSystemSpecs, type SystemSpecs } from '../utils/systemDetection';
import { getGPUComment, getCPUComment, getBottleneckComment } from '../utils/commentaryEngine';

interface ResultModalProps {
  avgFps: number;
  minFps: number;
  maxFps: number;
  totalObjects: number;
  cpuScore?: number;
  onRestart: () => void;
  onClose: () => void;
}

export const ResultModal = ({ avgFps, minFps: _minFps, maxFps: _maxFps, totalObjects, cpuScore, onRestart, onClose }: ResultModalProps) => {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);

  const finalScore = calculateScore(totalObjects);
  const rankInfo = getRank(finalScore);
  const gradient = getScoreGradient(finalScore);

  // Random commentary
  const gpuCommentary = useMemo(() => getGPUComment(totalObjects), [totalObjects]);
  const cpuCommentary = useMemo(() => cpuScore ? getCPUComment(cpuScore) : null, [cpuScore]);
  const bottleneckCommentary = useMemo(() => 
    cpuScore ? getBottleneckComment(totalObjects, cpuScore) : null, 
    [totalObjects, cpuScore]
  );

  // Score animation
  useEffect(() => {
    let start = 0;
    const end = finalScore;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayedScore(end);
        clearInterval(timer);
        setShowContent(true);
      } else {
        setDisplayedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [finalScore]);

  // Loading system specs
  useEffect(() => {
    const loadSpecs = async () => {
      const s = await getSystemSpecs();
      setSpecs(s);
    };
    loadSpecs();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />

      {/* === COMPACT DASHBOARD LAYOUT === */}
      <div 
        className="relative w-full max-w-4xl bg-cyber-dark border border-neon-green/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header Gradient */}
        <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors z-20 p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Two Column Layout */}
        <div className="flex flex-col md:flex-row">
          
          {/* LEFT SIDE - Score & Rank (40%) */}
          <div className="md:w-2/5 p-4 md:p-6 flex flex-col items-center justify-center bg-gradient-to-br from-cyber-darker/50 to-transparent border-b md:border-b-0 md:border-r border-white/5">
            
            {/* Rank Emoji */}
            <span className="text-5xl md:text-6xl mb-2 animate-bounce-slow">
              {rankInfo.rankEmoji}
            </span>
            
            {/* Score */}
            <h3 className={`font-orbitron text-3xl md:text-4xl font-black bg-gradient-to-r ${gradient} text-transparent bg-clip-text mb-1`}>
              {displayedScore.toLocaleString()}
            </h3>
            
            {/* Rank Name */}
            <p className={`font-orbitron text-sm md:text-base ${rankInfo.rankColor} font-bold tracking-wider uppercase text-center`}>
              {rankInfo.rank}
            </p>
            
            {/* Description */}
            <p className="text-[10px] text-gray-500 text-center mt-2 max-w-[180px]">
              {rankInfo.description}
            </p>
          </div>

          {/* RIGHT SIDE - Details (60%) */}
          <div className="md:w-3/5 p-3 md:p-4">
            
            {/* Stats Grid - 2x2 */}
            <div className={`grid grid-cols-2 gap-2 mb-3 transition-all duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* GPU FPS */}
              <div className="bg-cyber-darker/60 p-2 rounded-lg border border-white/5">
                <p className="text-[9px] text-gray-500 uppercase">GPU FPS</p>
                <p className="font-orbitron text-lg font-bold text-neon-green">{Math.round(avgFps)}</p>
              </div>
              
              {/* Render Objects */}
              <div className="bg-cyber-darker/60 p-2 rounded-lg border border-white/5">
                <p className="text-[9px] text-gray-500 uppercase">Render</p>
                <p className="font-orbitron text-lg font-bold text-electric-blue">{(totalObjects/1000).toFixed(0)}K</p>
              </div>
              
              {/* CPU Score */}
              <div className="bg-cyber-darker/60 p-2 rounded-lg border border-white/5">
                <p className="text-[9px] text-gray-500 uppercase">CPU Skoru</p>
                <p className="font-orbitron text-lg font-bold text-cyber-purple">{cpuScore ? (cpuScore/1000).toFixed(0) + 'K' : '-'}</p>
              </div>
              
              {/* Hardware - Full Text - Centered */}
              <div className="bg-cyber-darker/60 p-2 rounded-lg border border-white/5 text-center">
                <p className="text-[9px] text-gray-500 uppercase">Donanım</p>
                <p 
                  className="font-space-mono text-[10px] font-bold text-gray-300 leading-tight"
                  style={{ 
                    whiteSpace: 'normal', 
                    wordBreak: 'break-word',
                    textWrap: 'balance' 
                  }}
                >
                  {specs?.gpu || 'Yükleniyor...'}
                </p>
              </div>
            </div>

            {/* Commentary Section - Compact */}
            <div className={`space-y-2 mb-3 transition-all duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* GPU Comment */}
              <div className="bg-cyber-darker/40 p-2 rounded border border-neon-green/10 flex items-center gap-2">
                <span className="text-base">{gpuCommentary.emoji}</span>
                <p className="text-[10px] text-gray-400 italic leading-tight">"{gpuCommentary.comment}"</p>
              </div>

              {/* CPU Comment (if available) */}
              {cpuCommentary && (
                <div className="bg-cyber-darker/40 p-2 rounded border border-electric-blue/10 flex items-center gap-2">
                  <span className="text-base">{cpuCommentary.emoji}</span>
                  <p className="text-[10px] text-electric-blue/80 italic leading-tight">"{cpuCommentary.comment}"</p>
                </div>
              )}

              {/* Bottleneck (if available) */}
              {bottleneckCommentary && (
                <div className={`p-2 rounded border flex items-center gap-2 ${
                  bottleneckCommentary.culprit === 'none' 
                    ? 'bg-neon-green/5 border-neon-green/20' 
                    : 'bg-yellow-500/5 border-yellow-500/20'
                }`}>
                  <span className="text-base">{bottleneckCommentary.emoji}</span>
                  <p className={`text-[10px] italic leading-tight ${
                    bottleneckCommentary.culprit === 'none' ? 'text-neon-green/80' : 'text-yellow-400/80'
                  }`}>
                    "{bottleneckCommentary.comment}"
                  </p>
                </div>
              )}
            </div>

            {/* Single Action Button - Centered */}
            <div className={`pt-2 border-t border-white/5 transition-all duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                onClick={onRestart}
                className="w-full px-4 py-3 bg-gradient-to-r from-neon-green/20 to-electric-blue/20 border border-neon-green/40 hover:border-neon-green hover:bg-neon-green/30 rounded-lg text-neon-green font-orbitron font-bold transition-all text-sm hover:scale-[1.02]"
              >
                ↺ YENİDEN TEST ET
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-2 border-t border-white/5 bg-cyber-darker/30">
          <p className="font-space-mono text-[9px] text-gray-600">
            System Engineered by Kutay
          </p>
        </div>
      </div>
    </div>
  );
};
