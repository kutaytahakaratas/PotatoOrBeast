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
  cpuScore?: number;
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

  const copyScore = () => {
    const rank = getRank(finalScore).rank;
    const text = `🚀 Potato Or Beast Skorum: ${finalScore.toLocaleString()}!
    
🏆 Rank: ${rank}
🎮 GPU: ${specs?.gpu || 'Bilinmiyor'}
🧠 CPU Score: ${cpuScore ? cpuScore.toLocaleString() : 'N/A'}
    
Senin sistemin kaç puan alacak?
#PotatoOrBeast #Benchmark`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadStoryCard = async () => {
    if (!storyRef.current) return;
    
    try {
      setIsGeneratingStory(true);
      await new Promise(r => setTimeout(r, 100));

      const canvas = await html2canvas(storyRef.current, {
        scale: 2,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      
      {/* Hidden Result Card Template - CLEAN INLINE STYLES for html2canvas */}
      <div 
        ref={storyRef}
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
          width: '600px',
          height: '800px',
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '40px',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '14px', 
              letterSpacing: '8px', 
              color: '#666',
              marginBottom: '8px',
            }}>
              POTATO OR BEAST
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: '#00ff88',
              letterSpacing: '4px',
            }}>
              BENCHMARK
            </div>
          </div>

          {/* Score Section */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '80px', 
              marginBottom: '4px',
            }}>
              {rankInfo.rankEmoji}
            </div>
            <div style={{ 
              fontSize: '72px', 
              fontWeight: 'bold',
              color: '#00ff88',
              letterSpacing: '2px',
            }}>
              {finalScore.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#00d4ff',
              marginTop: '8px',
              letterSpacing: '2px',
            }}>
              {rankInfo.rank}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#888',
              marginTop: '4px',
            }}>
              {rankInfo.description}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            {/* GPU FPS */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>GPU FPS</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ff88' }}>{Math.round(avgFps)}</div>
            </div>
            
            {/* Render */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>RENDER</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00d4ff' }}>{(totalObjects/1000).toFixed(0)}K</div>
            </div>
            
            {/* CPU */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>CPU SKORU</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#b026ff' }}>{cpuScore ? (cpuScore/1000).toFixed(0) + 'K' : '-'}</div>
            </div>
            
            {/* Hardware */}
            <div style={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>DONANIM</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ccc', lineHeight: '1.3' }}>{specs?.gpu || 'GPU'}</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#555', marginBottom: '4px' }}>
              • Potato Or Beast ? •
            </div>
            <div style={{ fontSize: '11px', color: '#444' }}>
              System Engineered by Kutay
            </div>
          </div>
        </div>
      </div>

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
              
              {/* Hardware - Full Text */}
              <div className="bg-cyber-darker/60 p-2 rounded-lg border border-white/5">
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

            {/* Action Buttons - Compact Row */}
            <div className={`flex gap-2 pt-2 border-t border-white/5 transition-all duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
              <button 
                onClick={downloadStoryCard}
                disabled={isGeneratingStory}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded font-orbitron font-bold text-white text-xs hover:scale-105 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <span>📸</span>
                <span>{isGeneratingStory ? '...' : 'SONUÇ KARTI'}</span>
              </button>

              <button 
                onClick={copyScore}
                className={`flex-1 px-3 py-2 border rounded font-orbitron font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                  copied 
                    ? 'border-neon-green bg-neon-green/10 text-neon-green' 
                    : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                }`}
              >
                {copied ? '✓' : '📋'} {copied ? 'OK' : 'KOPYALA'}
              </button>
              
              <button 
                onClick={onRestart}
                className="px-3 py-2 bg-neon-green/10 border border-neon-green/30 hover:bg-neon-green/20 rounded text-neon-green font-bold transition-all text-xs"
                title="Yeniden Test"
              >
                ↺ YENİDEN
              </button>

              <button 
                onClick={onClose}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white font-bold transition-all text-xs"
              >
                ✕
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
