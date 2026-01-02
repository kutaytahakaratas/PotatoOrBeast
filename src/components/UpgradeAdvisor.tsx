import { useEffect, useState } from 'react';
import { getSystemSpecs } from '../utils/systemDetection';
import { 
  getGPUTier, 
  analyzeBottleneck, 
  analyzeUpgradeNeeds,
  type BottleneckAnalysis,
  type UpgradeRecommendation
} from '../utils/gamePrediction';

export const UpgradeAdvisor = () => {
  const [bottleneck, setBottleneck] = useState<BottleneckAnalysis | null>(null);
  const [upgrade, setUpgrade] = useState<UpgradeRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gpuName, setGpuName] = useState('');
  const [cpuCores, setCpuCores] = useState(0);

  useEffect(() => {
    const analyze = async () => {
      const specs = await getSystemSpecs();
      
      // Parse data
      const cores = parseInt(specs.cpuCores.toString()) || 4;
      const ramMatch = specs.ram.match(/(\d+)/);
      const ramGB = ramMatch ? parseInt(ramMatch[1]) : 8;
      
      // Get GPU tier
      const gpuInfo = getGPUTier(specs.gpu);
      
      // Run analysis
      const bottleneckResult = analyzeBottleneck(gpuInfo.tier, cores);
      const upgradeResult = analyzeUpgradeNeeds(gpuInfo.tier, cores, ramGB);
      
      setGpuName(specs.gpu);
      setCpuCores(cores);
      setBottleneck(bottleneckResult);
      setUpgrade(upgradeResult);
      setIsLoading(false);
    };

    setTimeout(analyze, 300);
  }, []);

  if (isLoading) {
    return null; // Don't show loading state, just wait
  }

  if (!bottleneck || !upgrade) {
    return null;
  }

  // Get colors based on bottleneck status
  const getBottleneckStyles = () => {
    switch (bottleneck.color) {
      case 'green':
        return {
          borderColor: 'border-neon-green/50',
          bgColor: 'bg-neon-green/10',
          textColor: 'text-neon-green',
          iconBg: 'bg-neon-green/20',
          glow: 'shadow-[0_0_20px_rgba(0,255,136,0.2)]'
        };
      case 'yellow':
        return {
          borderColor: 'border-yellow-500/50',
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20',
          glow: 'shadow-[0_0_20px_rgba(234,179,8,0.2)]'
        };
      case 'orange':
        return {
          borderColor: 'border-orange-500/50',
          bgColor: 'bg-orange-500/10',
          textColor: 'text-orange-400',
          iconBg: 'bg-orange-500/20',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.2)]'
        };
      case 'red':
        return {
          borderColor: 'border-red-500/50',
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-400',
          iconBg: 'bg-red-500/20',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]'
        };
      default:
        return {
          borderColor: 'border-gray-500/50',
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-400',
          iconBg: 'bg-gray-500/20',
          glow: ''
        };
    }
  };

  const getUpgradeStyles = () => {
    switch (upgrade.priority) {
      case 'high':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      case 'medium':
        return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' };
      case 'low':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
      default:
        return { bg: 'bg-neon-green/10', border: 'border-neon-green/30', text: 'text-neon-green' };
    }
  };

  const bottleneckStyles = getBottleneckStyles();
  const upgradeStyles = getUpgradeStyles();

  return (
    <div className="max-w-6xl mx-auto space-y-4 my-6">
      {/* Bottleneck Alert Bar */}
      <div 
        className={`border ${bottleneckStyles.borderColor} ${bottleneckStyles.bgColor} ${bottleneckStyles.glow} backdrop-blur-sm rounded-lg overflow-hidden`}
        style={{ animation: 'fadeInScale 0.5s ease-out' }}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${bottleneckStyles.iconBg} flex items-center justify-center text-2xl shrink-0`}>
            {bottleneck.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-orbitron text-sm font-bold ${bottleneckStyles.textColor}`}>
                {bottleneck.title}
              </h4>
              <span className="font-space-mono text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded">
                Darboğaz Dedektifi
              </span>
            </div>
            <p className="font-space-mono text-xs text-gray-400 leading-relaxed">
              {bottleneck.description}
            </p>
          </div>

          {/* System Badge */}
          <div className="hidden md:block text-right shrink-0">
            <p className="font-space-mono text-[10px] text-gray-500 mb-1">
              {gpuName.split(' ').slice(0, 3).join(' ')}
            </p>
            <p className="font-space-mono text-[10px] text-gray-600">
              {cpuCores} Çekirdek
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Recommendation */}
      {upgrade.priority !== 'none' && (
        <div 
          className={`border ${upgradeStyles.border} ${upgradeStyles.bg} backdrop-blur-sm rounded-lg overflow-hidden`}
          style={{ animation: 'fadeInScale 0.5s ease-out 0.1s both' }}
        >
          <div className="flex items-start gap-4 p-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-cyber-darker/50 flex items-center justify-center text-xl shrink-0">
              {upgrade.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-orbitron text-sm font-bold ${upgradeStyles.text}`}>
                  {upgrade.title}
                </h4>
                <span className={`font-space-mono text-[10px] px-2 py-0.5 rounded ${
                  upgrade.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  upgrade.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {upgrade.priority === 'high' ? 'Yüksek Öncelik' :
                   upgrade.priority === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                </span>
              </div>
              <p className="font-space-mono text-xs text-gray-400 mb-2">
                {upgrade.description}
              </p>
              <div className="bg-cyber-darker/30 rounded-lg p-2 border-l-2 border-neon-green/50">
                <p className="font-space-mono text-[10px] text-gray-500">
                  💡 <span className="text-gray-400">{upgrade.impact}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balanced System - Positive Feedback */}
      {upgrade.priority === 'none' && (
        <div 
          className="border border-neon-green/30 bg-neon-green/5 backdrop-blur-sm rounded-lg overflow-hidden"
          style={{ animation: 'fadeInScale 0.5s ease-out 0.1s both' }}
        >
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center text-xl shrink-0">
              🏆
            </div>
            <div className="flex-1">
              <h4 className="font-orbitron text-sm font-bold text-neon-green mb-1">
                {upgrade.title}
              </h4>
              <p className="font-space-mono text-xs text-gray-400">
                {upgrade.description} <span className="text-neon-green/70">{upgrade.impact}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
