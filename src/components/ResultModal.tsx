import { useRef, useEffect, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { calculateScore, getRank, getScoreGradient } from '../utils/scoring';
import { getSystemSpecs, type SystemSpecs } from '../utils/systemDetection';
import { getGPUComment, getCPUComment, getBottleneckComment } from '../utils/commentaryEngine';

interface ResultModalProps {
  avgFps: number;
  minFps: number;
  maxFps: number;
  totalObjects: number;
  cpuScore?: number; // Optional CPU score for full system scan
  onRestart: () => void;
  onClose: () => void;
}

export const ResultModal = ({ avgFps, minFps: _minFps, maxFps: _maxFps, totalObjects, cpuScore, onRestart, onClose }: ResultModalProps) => {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  // Score is now based on total objects rendered
  const finalScore = calculateScore(totalObjects);
  const rankInfo = getRank(finalScore);
  const gradient = getScoreGradient(finalScore);

  // Random commentary - useMemo ensures it stays stable during re-renders but unique per mount
  const gpuCommentary = useMemo(() => getGPUComment(totalObjects), [totalObjects]);
  const cpuCommentary = useMemo(() => cpuScore ? getCPUComment(cpuScore) : null, [cpuScore]);
  const bottleneckCommentary = useMemo(() => 
    cpuScore ? getBottleneckComment(totalObjects, cpuScore) : null, 
    [totalObjects, cpuScore]
  );

  // Score animation efffect
  useEffect(() => {
    let start = 0;
    const end = finalScore;
    const duration = 2000;
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

  // Loading system specs for share text
  useEffect(() => {
    const loadSpecs = async () => {
      const s = await getSystemSpecs();
      setSpecs(s);
    };
    loadSpecs();
  }, []);

  const copyScore = () => {
    const rank = getRank(finalScore).rank;
    const text = `🚀 Browser Benchmark Arena Skorum: ${finalScore.toLocaleString()}!
    
🏆 Rank: ${rank}
🎮 GPU: ${specs?.gpu || 'Bilinmiyor'}
🧠 CPU Score: ${cpuScore ? cpuScore.toLocaleString() : 'N/A'}
    
Senin tarayıcın kaç puan alacak?
#BrowserBenchmark #WebGPU #ThreeJS`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadStoryCard = async () => {
    if (!storyRef.current) return;
    
    try {
      setIsGeneratingStory(true);
      
      // Wait a bit for images/fonts if needed
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(storyRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#0a0a0a',
        useCORS: true,
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `benchmark-score-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Story generation failed:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      {/* Hidden Story Card Template (Off-screen rendering) */}
      <div className="fixed top-0 left-[-9999px] w-[1080px] h-[1920px] bg-black text-white overflow-hidden" ref={storyRef}>
        <div className="relative w-full h-full flex flex-col items-center justify-between p-20 bg-gradient-to-br from-gray-900 via-black to-blue-900">
           {/* Background Grid */}
           <div className="absolute inset-0 cyber-grid-bg opacity-30"></div>
           
           {/* Top Section */}
           <div className="relative z-10 text-center space-y-8 mt-20">
             <div className="font-orbitron text-4xl tracking-[0.5em] text-gray-400 opacity-60">BROWSER BENCHMARK</div>
             <h1 className="font-orbitron text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-electric-blue drop-shadow-[0_0_30px_rgba(57,255,20,0.5)]">
               ARENA
             </h1>
           </div>

           {/* Center Score */}
           <div className="relative z-10 flex flex-col items-center gap-10">
             <div className="text-4xl font-space-mono text-electric-blue uppercase tracking-widest border border-electric-blue/30 px-8 py-2 rounded-full bg-black/40 backdrop-blur-md">
               Sistem Performans Skoru
             </div>
             <div className="font-orbitron text-[280px] leading-none font-bold text-white drop-shadow-[0_0_100px_rgba(57,255,20,0.4)]">
               {finalScore.toLocaleString()}
             </div>
             <div className="flex items-center gap-6 px-12 py-6 bg-gradient-to-r from-neon-green/20 to-transparent border-l-8 border-neon-green backdrop-blur-xl rounded-r-3xl">
               <span className="text-8xl">{rankInfo.rankEmoji}</span>
               <div className="text-left">
                 <div className="font-orbitron text-6xl font-bold text-neon-green text-shadow-glow">
                   {rankInfo.rank}
                 </div>
                 <div className="font-space-mono text-3xl text-gray-300 mt-2">GPU EFSANESİ</div>
               </div>
             </div>
           </div>

           {/* Hardware Specs */}
           <div className="relative z-10 w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 space-y-8">
              <div className="flex items-center gap-8">
                <div className="p-6 bg-blue-500/20 rounded-2xl text-5xl">🎮</div>
                <div>
                  <div className="text-2xl text-gray-400 font-space-mono uppercase">Grafik Kartı</div>
                  <div className="text-4xl font-bold text-white font-orbitron mt-2">{specs?.gpu || 'Tespit Ediliyor...'}</div>
                </div>
              </div>
              
              <div className="w-full h-px bg-white/10"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="p-6 bg-purple-500/20 rounded-2xl text-5xl">⚡</div>
                  <div>
                    <div className="text-2xl text-gray-400 font-space-mono uppercase">CPU Skoru</div>
                    <div className="text-4xl font-bold text-white font-orbitron mt-2">{cpuScore ? cpuScore.toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="p-6 bg-green-500/20 rounded-2xl text-5xl">🧠</div>
                  <div>
                    <div className="text-2xl text-gray-400 font-space-mono uppercase">RAM</div>
                    <div className="text-4xl font-bold text-white font-orbitron mt-2">{specs?.ram || '...'}</div>
                  </div>
                </div>
              </div>
           </div>

           {/* Footer */}
           <div className="relative z-10 text-center opacity-60 mb-10">
              <p className="font-space-mono text-3xl text-gray-400">BENCHMARK SENİN GÜCÜN</p>
              <p className="font-orbitron text-2xl text-neon-green mt-4">BrowserBenchmarkArena.com</p>
           </div>
        </div>
      </div>

      <div className="relative w-full max-w-[95vw] md:max-w-xl bg-cyber-dark border border-neon-green/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header Gradient */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
        
        <div className="p-4 md:p-8 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center relative z-10">
            <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white mb-1 uppercase tracking-wide">
              Level Tamamlandı
            </h2>
            <div className="h-0.5 w-16 mx-auto bg-gradient-to-r from-transparent via-neon-green to-transparent mb-4" />
            
            <div className={`transform transition-all duration-1000 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="mb-4">
                <span className="text-5xl md:text-6xl mb-2 block animate-bounce-slow">
                  {rankInfo.rankEmoji}
                </span>
                <h3 className={`font-orbitron text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r ${gradient} text-transparent bg-clip-text`}>
                  {displayedScore.toLocaleString()}
                </h3>
                <p className={`font-space-mono text-lg ${rankInfo.rankColor} font-bold tracking-widest uppercase`}>
                  {rankInfo.rank}
                </p>
              </div>

              <div className="bg-cyber-darker/50 p-3 rounded-lg border border-neon-green/10 backdrop-blur-sm mb-4 max-w-sm mx-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{gpuCommentary.emoji}</span>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 font-space-mono uppercase leading-tight">Sistem Raporu</p>
                    <h4 className="font-bold text-white text-xs md:text-sm leading-tight italic">
                      "{gpuCommentary.comment}"
                    </h4>
                  </div>
                </div>
              </div>

              {/* CPU Commentary (if available) */}
              {cpuCommentary && (
                <div className="bg-cyber-darker/50 p-3 rounded-lg border border-electric-blue/10 backdrop-blur-sm mb-4 max-w-sm mx-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cpuCommentary.emoji}</span>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-space-mono uppercase leading-tight">CPU Analizi</p>
                      <h4 className="font-bold text-electric-blue text-xs md:text-sm leading-tight italic">
                        "{cpuCommentary.comment}"
                      </h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottleneck Commentary (if both scores available) */}
              {bottleneckCommentary && (
                <div className={`p-3 rounded-lg border backdrop-blur-sm mb-4 max-w-sm mx-auto ${
                  bottleneckCommentary.culprit === 'none' 
                    ? 'bg-neon-green/5 border-neon-green/20' 
                    : 'bg-yellow-500/5 border-yellow-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{bottleneckCommentary.emoji}</span>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-space-mono uppercase leading-tight">Darboğaz Analizi</p>
                      <h4 className={`font-bold text-xs md:text-sm leading-tight italic ${
                        bottleneckCommentary.culprit === 'none' ? 'text-neon-green' : 'text-yellow-400'
                      }`}>
                        "{bottleneckCommentary.comment}"
                      </h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Score Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-cyber-darker/50 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">GPU ORT. FPS</p>
                      <p className="font-orbitron text-xl font-bold text-neon-green">{Math.round(avgFps)}</p>
                   </div>
                   <div className="bg-cyber-darker/50 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">RENDER MİKTARI</p>
                      <p className="font-orbitron text-xl font-bold text-electric-blue">{(totalObjects/1000).toFixed(1)}K</p>
                   </div>
                   <div className="bg-cyber-darker/50 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">CPU PUANI</p>
                      <p className="font-orbitron text-xl font-bold text-cyber-purple">{cpuScore ? cpuScore.toLocaleString() : '-'}</p>
                   </div>
                   <div className="bg-cyber-darker/50 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-gray-500 mb-0.5">DONANIM</p>
                      <p className="font-orbitron text-[10px] font-bold text-gray-300 truncate leading-tight" title={specs?.gpu}>{specs?.gpu ? specs.gpu.split(' ').slice(0,2).join(' ') : '...'}</p>
                   </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4 pt-4 border-t border-white/5">
                <button 
                  onClick={downloadStoryCard}
                  disabled={isGeneratingStory}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-orbitron font-bold text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <span className="text-lg group-hover:rotate-12 transition-transform">📸</span>
                  <span>{isGeneratingStory ? '...' : 'HİKAYE İNDİR'}</span>
                </button>

                <button 
                  onClick={copyScore}
                  className={`flex-1 px-4 py-3 border-2 font-orbitron font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                    copied 
                      ? 'border-neon-green bg-neon-green/10 text-neon-green' 
                      : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                  }`}
                >
                  <span>{copied ? 'KOPYALANDI' : 'KOPYALA'}</span>
                </button>
                
                <button 
                  onClick={onRestart}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white font-bold transition-all"
                  title="Yeniden Başlat"
                >
                  ↺
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
