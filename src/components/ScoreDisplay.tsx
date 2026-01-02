import { useEffect, useState } from 'react';
import { calculateScore, getRank, getScoreGradient, type ScoreResult } from '../utils/scoring';

interface ScoreDisplayProps {
  avgFps: number;
  minFps: number;
  maxFps: number;
  onRestart: () => void;
}

export const ScoreDisplay = ({ avgFps, minFps, maxFps, onRestart }: ScoreDisplayProps) => {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [showRank, setShowRank] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const finalScore = calculateScore(avgFps);
  const rankInfo: ScoreResult = getRank(finalScore);
  const gradientClass = getScoreGradient(finalScore);

  useEffect(() => {
    // Animated counter effect
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = finalScore / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayedScore(finalScore);
        clearInterval(timer);
        
        // Show rank after score animation
        setTimeout(() => setShowRank(true), 300);
        setTimeout(() => setShowDetails(true), 800);
      } else {
        setDisplayedScore(Math.round(increment * currentStep));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [finalScore]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="cyber-grid-bg"></div>
      
      <div className="relative z-10 max-w-2xl w-full">
        {/* Main Score Card */}
        <div className="neon-border bg-gradient-to-br from-cyber-dark/95 to-cyber-darker/95 backdrop-blur-md rounded-2xl overflow-hidden">
          
          {/* Header */}
          <div className={`bg-gradient-to-r ${gradientClass} p-1`}>
            <div className="bg-cyber-dark px-6 py-4">
              <h2 className="font-orbitron text-xl font-bold text-center text-white uppercase tracking-wider">
                🏆 Benchmark Tamamlandı
              </h2>
            </div>
          </div>

          {/* Score Section */}
          <div className="p-8 text-center">
            <p className="font-orbitron text-sm text-gray-400 uppercase tracking-wider mb-4">
              Skorunuz
            </p>
            
            {/* Animated Score Counter */}
            <div className="relative mb-6">
              <div className={`font-orbitron text-8xl md:text-9xl font-black bg-gradient-to-r ${gradientClass} text-transparent bg-clip-text animate-pulse`}>
                {displayedScore.toLocaleString()}
              </div>
              
              {/* Glow effect behind score */}
              <div 
                className={`absolute inset-0 font-orbitron text-8xl md:text-9xl font-black bg-gradient-to-r ${gradientClass} text-transparent bg-clip-text blur-2xl opacity-50 -z-10`}
              >
                {displayedScore.toLocaleString()}
              </div>
            </div>

            {/* Rank Badge */}
            <div 
              className={`transform transition-all duration-500 ${
                showRank ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <div className="inline-flex items-center gap-3 bg-cyber-darker/80 px-6 py-4 rounded-xl border border-neon-green/30">
                <span className="text-5xl animate-bounce">{rankInfo.rankEmoji}</span>
                <div className="text-left">
                  <p className={`font-orbitron text-2xl font-bold ${rankInfo.rankColor}`}>
                    {rankInfo.rank}
                  </p>
                  <p className="text-gray-400 text-sm font-space-mono max-w-xs">
                    {rankInfo.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div 
            className={`border-t border-neon-green/20 p-6 transform transition-all duration-500 ${
              showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-cyber-darker/50 rounded-lg border border-neon-green/10">
                <p className="font-orbitron text-xs text-gray-500 uppercase mb-2">Ortalama</p>
                <p className="font-orbitron text-3xl font-bold text-neon-green">
                  {Math.round(avgFps)}
                </p>
                <p className="text-xs text-gray-400">FPS</p>
              </div>
              
              <div className="text-center p-4 bg-cyber-darker/50 rounded-lg border border-electric-blue/10">
                <p className="font-orbitron text-xs text-gray-500 uppercase mb-2">Minimum</p>
                <p className="font-orbitron text-3xl font-bold text-electric-blue">
                  {minFps}
                </p>
                <p className="text-xs text-gray-400">FPS</p>
              </div>
              
              <div className="text-center p-4 bg-cyber-darker/50 rounded-lg border border-cyber-purple/10">
                <p className="font-orbitron text-xs text-gray-500 uppercase mb-2">Maksimum</p>
                <p className="font-orbitron text-3xl font-bold text-cyber-purple">
                  {maxFps}
                </p>
                <p className="text-xs text-gray-400">FPS</p>
              </div>
            </div>

            {/* Test Info */}
            <div className="mt-4 p-3 bg-cyber-darker/30 rounded-lg text-center">
              <p className="font-space-mono text-xs text-gray-500">
                5,000 Obje • 15 Saniye • Three.js Render
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-neon-green/10 p-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onRestart}
              className="group relative px-6 py-3 bg-transparent border-2 border-neon-green text-neon-green font-orbitron font-bold text-sm rounded-lg overflow-hidden transition-all duration-300 hover:shadow-neon-green hover:scale-105"
            >
              <span className="relative z-10">🔄 Tekrar Test Et</span>
              <div className="absolute inset-0 bg-neon-green opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
            
            <button 
              onClick={() => {
                const shareText = `🏆 Browser Benchmark Arena'da ${finalScore.toLocaleString()} puan aldım! ${rankInfo.rankEmoji} ${rankInfo.rank}`;
                navigator.clipboard.writeText(shareText);
                alert('Skor kopyalandı! Arkadaşlarınla paylaş.');
              }}
              className="group relative px-6 py-3 bg-transparent border-2 border-electric-blue text-electric-blue font-orbitron font-bold text-sm rounded-lg overflow-hidden transition-all duration-300 hover:shadow-neon-blue hover:scale-105"
            >
              <span className="relative z-10">📋 Skoru Kopyala</span>
              <div className="absolute inset-0 bg-electric-blue opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Rank Scale */}
        <div 
          className={`mt-6 p-4 bg-cyber-dark/60 backdrop-blur-sm rounded-lg border border-neon-green/10 transform transition-all duration-700 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="font-orbitron text-xs text-gray-500 uppercase text-center mb-3">Rütbe Skalası</p>
          <div className="flex justify-between items-center text-xs font-space-mono">
            <div className="text-center">
              <span className="text-lg">🥔</span>
              <p className="text-yellow-500">0-1K</p>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gradient-to-r from-yellow-500 via-electric-blue to-cyber-purple rounded-full"></div>
            <div className="text-center">
              <span className="text-lg">💼</span>
              <p className="text-electric-blue">1K-5K</p>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gradient-to-r from-electric-blue via-neon-green to-cyber-purple rounded-full"></div>
            <div className="text-center">
              <span className="text-lg">🎮</span>
              <p className="text-neon-green">5K-10K</p>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gradient-to-r from-neon-green to-cyber-purple rounded-full"></div>
            <div className="text-center">
              <span className="text-lg">🚀</span>
              <p className="text-cyber-purple">10K+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
