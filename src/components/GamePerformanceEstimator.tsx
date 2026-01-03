import { useEffect, useState } from 'react';
import { getSystemSpecs } from '../utils/systemDetection';
import { predictGamePerformance, type GamePrediction } from '../utils/gamePrediction';

const getRatingColor = (tier: string): string => {
  switch (tier) {
    case 'perfect': return 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]'; // Bright Green + Glow
    case 'smooth': return 'text-green-500'; // Green
    case 'playable': return 'text-yellow-500'; // Yellow
    case 'poor': return 'text-red-500'; // Red
    default: return 'text-gray-400';
  }
};

const getRatingBadge = (tier: string): string => {
  switch (tier) {
    case 'perfect': return '🟢 Mükemmel';
    case 'smooth': return '🟢 Akıcı'; // Changed from Blue to Green per request
    case 'playable': return '🟡 Oynanabilir';
    case 'poor': return '🔴 Düşük';
    default: return '⚪ Bilinmiyor';
  }
};

const getGameIcon = (id: string): string => {
  switch (id) {
    case 'valorant': return '🎯';
    case 'cs2': return '💣';
    case 'cyberpunk': return '🌃';
    case 'gta5': return '🚗';
    case 'fortnite': return '🏗️';
    case 'lol': return '⚔️';
    case 'eldenring': return '💍';
    case 'rdr2': return '🤠';
    default: return '🎮';
  }
};

interface GamePerformanceEstimatorProps {
  gpuTestScore?: number | null;  // 3D Performance test score
  cpuTestScore?: number | null;  // JavaScript Speed test score
}

export const GamePerformanceEstimator = ({ gpuTestScore, cpuTestScore }: GamePerformanceEstimatorProps) => {
  const [predictions, setPredictions] = useState<GamePrediction[]>([]);
  const [gpuName, setGpuName] = useState<string>('');
  const [gpuTier, setGpuTier] = useState<string>('');
  const [cpuCores, setCpuCores] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPredictions = async () => {
      // 1. Get real system specs
      const specs = await getSystemSpecs();
      
      // 2. Run prediction engine
      // Parse CPU cores to number (e.g. "12 (P-Cores)" -> 12)
      const coreCount = parseInt(specs.cpuCores.toString()) || 4;
      
      const result = predictGamePerformance(specs.gpu, coreCount);
      
      setGpuName(specs.gpu);
      setGpuTier(result.gpuTier);
      setCpuCores(coreCount);
      setPredictions(result.predictions);
      setIsLoading(false);
    };

    // Simulate "analyzing" delay for effect
    setTimeout(loadPredictions, 800);
  }, []);

  if (isLoading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="neon-border bg-cyber-dark/80 backdrop-blur-md rounded-2xl p-8 text-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-8 bg-neon-green/20 rounded w-64"></div>
              <div className="h-4 bg-gray-700 rounded w-48"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-8">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="h-40 bg-white/5 rounded-xl"></div>
                 ))}
              </div>
            </div>
            <p className="mt-4 font-orbitron text-neon-green animate-pulse">DONANIM ANALİZ EDİLİYOR...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold neon-text mb-4">
            🎮 AKILLI FPS MOTORU
          </h2>
          <p className="text-gray-400 font-space-mono text-sm mb-6">
            Sistemine özel analiz: GPU Gücü + CPU Çekirdek Kombinasyonu
          </p>
          
          {/* GPU Badge */}
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-cyber-dark/80 to-cyber-darker/80 rounded-full border border-neon-green/30 shadow-[0_0_30px_rgba(57,255,20,0.1)]">
            <span className="text-3xl">🖥️</span>
            <div className="text-left">
              <p className="font-orbitron text-lg font-bold text-white tracking-wide">{gpuName || 'GPU Tespit Edilemedi'}</p>
              <div className="flex items-center gap-2">
                 <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                   gpuTier === 'Ultra' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                   gpuTier === 'High' ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' :
                   gpuTier === 'Mid-High' ? 'bg-blue-400/20 text-blue-400 border border-blue-400/50' :
                   gpuTier === 'Mid' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                   'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                 }`}>
                   {gpuTier} Tier
                 </span>
                 <span className="text-xs text-gray-500 font-space-mono">Algılandı</span>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {predictions.map((game, index) => (
            <div 
              key={game.id}
              className="group neon-border bg-gradient-to-br from-cyber-dark/60 to-cyber-darker/80 backdrop-blur-sm rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-neon-green"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Game Header */}
              <div className="p-4 border-b border-neon-green/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-md">{getGameIcon(game.id)}</span>
                  <div>
                    <h3 className="font-orbitron text-sm font-bold text-white group-hover:text-neon-green transition-colors">{game.title}</h3>
                    <p className="text-[10px] text-gray-400 font-space-mono uppercase">{game.settings}</p>
                  </div>
                </div>
              </div>
              
              {/* FPS Display */}
              <div className="p-5 text-center relative">
                <p className={`font-orbitron text-2xl font-black ${getRatingColor(game.tier)} tracking-wider`}>
                  {game.fpsRange}
                </p>
                <div className="absolute top-2 right-2 opacity-20">
                    {/* Background number watermark could go here */}
                </div>
              </div>
              
              {/* Settings & Rating */}
              <div className="px-4 pb-2">
                <div className="flex items-center justify-between text-xs bg-black/20 p-2 rounded-lg">
                  <span className="text-gray-500 font-space-mono">Tahmin</span>
                  <span className={`font-bold flex items-center gap-1 ${getRatingColor(game.tier)}`}>
                    {getRatingBadge(game.tier)}
                  </span>
                </div>
              </div>
              
              {/* Reference Info - Data Source */}
              <div className="px-4 pb-3">
                <div className="bg-cyber-darker/50 rounded-lg p-2 border border-white/5">
                  <p className="text-[8px] text-gray-600 font-space-mono leading-relaxed">
                    📊 <span className="text-gray-500">Dayanak:</span>{' '}
                    {gpuTestScore ? (
                      <>GPU Benchmark: <span className="text-neon-green/70">{gpuTestScore.toLocaleString()} puan</span></>
                    ) : (
                      <>GPU Model: <span className="text-neon-green/70">{gpuTier} Tier</span></>
                    )}
                    {' + '}
                    {cpuTestScore ? (
                      <>CPU Test: <span className="text-electric-blue/70">{cpuTestScore.toLocaleString()} puan</span></>
                    ) : (
                      <><span className="text-electric-blue/70">{cpuCores} Çekirdek</span> İşlemci</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-space-mono text-gray-400 bg-cyber-darker/50 p-4 rounded-full border border-white/5 inline-block mx-auto w-full md:w-auto">
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-neon-green rounded-full shadow-[0_0_10px_#39ff14]"></span> Mükemmel (100+)</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-electric-blue rounded-full shadow-[0_0_10px_#00d9ff]"></span> Akıcı (60+)</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Oynanabilir (30+)</span>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-gray-600 text-[10px] mt-6 font-space-mono">
          ⚠️ Bu değerler GPU modelinize ({gpuName}) ve işlemci çekirdeğinize dayalı tahmini verilerdir. Sürücü sürümü ve arka plan uygulamaları performansı etkileyebilir.
        </p>
      </div>
    </section>
  );
};
