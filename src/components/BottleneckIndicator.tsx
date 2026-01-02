import { useMemo, useState, useEffect } from 'react';

export type BottleneckStatus = 'waiting' | 'balanced' | 'cpu_bottleneck' | 'gpu_bottleneck';

export interface BottleneckAnalysisProps {
  gpuScore: number | null; // 3D Performance test score
  cpuScore: number | null; // JavaScript Speed test score
}

interface AnalysisResult {
  status: BottleneckStatus;
  severity: 'none' | 'mild' | 'severe';
  gpuPercentage: number;
  cpuPercentage: number;
  ratio: number;
  title: string;
  description: string;
  recommendation?: string;
}

// Expected maximum scores for percentage calculation
// These are calibrated based on high-end system benchmarks
const MAX_EXPECTED_GPU_SCORE = 15000; // High-end GPU target
const MAX_EXPECTED_CPU_SCORE = 20000; // High-end CPU target

/**
 * Analyzes bottleneck based on actual test scores
 */
const analyzeScores = (gpuScore: number, cpuScore: number): AnalysisResult => {
  // Calculate percentages based on max expected scores
  const gpuPercentage = Math.min(100, Math.round((gpuScore / MAX_EXPECTED_GPU_SCORE) * 100));
  const cpuPercentage = Math.min(100, Math.round((cpuScore / MAX_EXPECTED_CPU_SCORE) * 100));
  
  // Normalize scores to same scale for ratio calculation
  const normalizedGpu = gpuScore / MAX_EXPECTED_GPU_SCORE;
  const normalizedCpu = cpuScore / MAX_EXPECTED_CPU_SCORE;
  
  // Calculate ratio
  // ratio < 0.8: GPU is weaker relative to CPU (GPU bottleneck / CPU too powerful)
  // ratio > 1.2: GPU is stronger relative to CPU (CPU bottleneck)
  // 0.8 - 1.2: Balanced
  const ratio = normalizedGpu / normalizedCpu;
  
  let status: BottleneckStatus = 'balanced';
  let severity: 'none' | 'mild' | 'severe' = 'none';
  let title = '';
  let description = '';
  let recommendation: string | undefined;
  
  if (ratio < 0.5) {
    // Severe GPU bottleneck - CPU is way more powerful
    status = 'gpu_bottleneck';
    severity = 'severe';
    title = '🎮 GPU Darboğazı Tespit Edildi';
    description = `İşlemciniz çok güçlü ama ekran kartınız yetişemiyor. GPU skoru (${gpuScore.toLocaleString()}) CPU skorunun (${cpuScore.toLocaleString()}) çok gerisinde.`;
    recommendation = 'Daha güçlü bir ekran kartı ile dramatik performans artışı elde edebilirsiniz.';
  } else if (ratio < 0.8) {
    // Mild GPU bottleneck
    status = 'gpu_bottleneck';
    severity = 'mild';
    title = '📊 GPU Limitli Sistem';
    description = `Ekran kartınız sistemin limitleyici faktörü. Bu oyunlar için normal ve beklenen bir durum.`;
    recommendation = 'Grafik ayarlarını optimize ederek daha yüksek FPS elde edebilirsiniz.';
  } else if (ratio > 2.0) {
    // Severe CPU bottleneck - GPU is way more powerful
    status = 'cpu_bottleneck';
    severity = 'severe';
    title = '⚠️ Kritik CPU Darboğazı!';
    description = `Ekran kartınız çok güçlü ama işlemciniz fren yapıyor! GPU skoru (${gpuScore.toLocaleString()}) CPU skorundan (${cpuScore.toLocaleString()}) çok yüksek.`;
    recommendation = 'İşlemci yükseltmesi ile ekran kartınızın tam potansiyelini açığa çıkarabilirsiniz.';
  } else if (ratio > 1.2) {
    // Mild CPU bottleneck
    status = 'cpu_bottleneck';
    severity = 'mild';
    title = '⚡ Hafif CPU Darboğazı';
    description = `İşlemciniz ekran kartınızı tam besleyemiyor. Bazı CPU yoğun oyunlarda performans düşüşü yaşayabilirsiniz.`;
    recommendation = 'Arka plan uygulamalarını kapatarak işlemci yükünü azaltabilirsiniz.';
  } else {
    // Balanced (0.8 - 1.2)
    status = 'balanced';
    severity = 'none';
    title = '✅ Mükemmel Denge!';
    description = `GPU (${gpuScore.toLocaleString()}) ve CPU (${cpuScore.toLocaleString()}) skorlarınız mükemmel uyum içinde. Sistemden maksimum verim alıyorsunuz.`;
  }
  
  return {
    status,
    severity,
    gpuPercentage,
    cpuPercentage,
    ratio,
    title,
    description,
    recommendation,
  };
};

export const BottleneckIndicator = ({ gpuScore, cpuScore }: BottleneckAnalysisProps) => {
  // Animated bar values - start at 0
  const [animatedGpuPercent, setAnimatedGpuPercent] = useState(0);
  const [animatedCpuPercent, setAnimatedCpuPercent] = useState(0);
  
  // Memoize analysis to avoid recalculation
  const analysis = useMemo(() => {
    if (gpuScore === null || cpuScore === null) {
      return null;
    }
    return analyzeScores(gpuScore, cpuScore);
  }, [gpuScore, cpuScore]);

  // Animate bars when analysis is ready
  useEffect(() => {
    if (analysis) {
      // Small delay before starting animation for dramatic effect
      const timer = setTimeout(() => {
        setAnimatedGpuPercent(analysis.gpuPercentage);
        setAnimatedCpuPercent(analysis.cpuPercentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Reset when analysis is null
      setAnimatedGpuPercent(0);
      setAnimatedCpuPercent(0);
    }
  }, [analysis]);

  // Calculate efficiency difference for dynamic comment
  const getEfficiencyComment = () => {
    if (!analysis) return '';
    const diff = Math.abs(analysis.gpuPercentage - analysis.cpuPercentage);
    if (analysis.gpuPercentage > analysis.cpuPercentage) {
      return `Test sonuçlarına göre GPU'nuz işlemcinizden %${diff} daha verimli çalışıyor.`;
    } else if (analysis.cpuPercentage > analysis.gpuPercentage) {
      return `Test sonuçlarına göre işlemciniz GPU'nuzdan %${diff} daha verimli çalışıyor.`;
    }
    return `Test sonuçlarına göre GPU ve CPU neredeyse eşit verimlilik gösteriyor.`;
  };

  // Waiting state - tests not completed
  if (!analysis) {
    return (
      <div className="max-w-6xl mx-auto border border-gray-600/30 bg-gradient-to-r from-gray-800/20 via-transparent to-gray-800/20 backdrop-blur-sm rounded-lg overflow-hidden my-6">
        {/* Header */}
        <div className="bg-cyber-darker/50 py-4 px-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-orbitron text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">🔬</span>
            SİSTEM DENGE ANALİZİ
          </h3>
          <div className="px-3 py-1 rounded-full text-xs font-space-mono bg-gray-700/30 text-gray-500">
            Bekliyor
          </div>
        </div>

        {/* Waiting Content */}
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-700/20 mb-4">
            <span className="text-4xl opacity-50">🔒</span>
          </div>
          <h4 className="font-orbitron text-lg font-bold text-gray-500 mb-2">
            Analiz İçin Testleri Tamamlayın
          </h4>
          <p className="font-space-mono text-sm text-gray-600 max-w-md mx-auto">
            GPU ve CPU testlerini çalıştırdıktan sonra gerçek skorlarınıza dayalı detaylı darboğaz analizi burada görünecek.
          </p>
          
          {/* Test Status Indicators */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${gpuScore !== null ? 'border-neon-green/50 bg-neon-green/10' : 'border-gray-600/30 bg-gray-800/20'}`}>
              <span className="text-lg">{gpuScore !== null ? '✅' : '⏳'}</span>
              <span className={`font-space-mono text-xs ${gpuScore !== null ? 'text-neon-green' : 'text-gray-500'}`}>
                3D Test {gpuScore !== null ? `(${gpuScore.toLocaleString()})` : ''}
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${cpuScore !== null ? 'border-electric-blue/50 bg-electric-blue/10' : 'border-gray-600/30 bg-gray-800/20'}`}>
              <span className="text-lg">{cpuScore !== null ? '✅' : '⏳'}</span>
              <span className={`font-space-mono text-xs ${cpuScore !== null ? 'text-electric-blue' : 'text-gray-500'}`}>
                CPU Test {cpuScore !== null ? `(${cpuScore.toLocaleString()})` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic styling based on status
  const getStatusStyles = () => {
    switch (analysis.status) {
      case 'balanced':
        return {
          borderColor: 'border-neon-green/40',
          bgGradient: 'from-neon-green/5 via-transparent to-neon-green/5',
          iconBg: 'bg-neon-green/20',
          iconGlow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
          titleColor: 'text-neon-green',
        };
      case 'cpu_bottleneck':
        return {
          borderColor: analysis.severity === 'severe' ? 'border-red-500/50' : 'border-yellow-500/40',
          bgGradient: analysis.severity === 'severe' 
            ? 'from-red-500/5 via-transparent to-red-500/5'
            : 'from-yellow-500/5 via-transparent to-yellow-500/5',
          iconBg: analysis.severity === 'severe' ? 'bg-red-500/20' : 'bg-yellow-500/20',
          iconGlow: analysis.severity === 'severe' 
            ? 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            : 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
          titleColor: analysis.severity === 'severe' ? 'text-red-400' : 'text-yellow-400',
        };
      case 'gpu_bottleneck':
        return {
          borderColor: analysis.severity === 'severe' ? 'border-orange-500/50' : 'border-orange-500/40',
          bgGradient: 'from-orange-500/5 via-transparent to-orange-500/5',
          iconBg: 'bg-orange-500/20',
          iconGlow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
          titleColor: 'text-orange-400',
        };
      default:
        return {
          borderColor: 'border-gray-500/40',
          bgGradient: 'from-gray-500/5 via-transparent to-gray-500/5',
          iconBg: 'bg-gray-500/20',
          iconGlow: '',
          titleColor: 'text-gray-400',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div 
      className={`max-w-6xl mx-auto border ${styles.borderColor} bg-gradient-to-r ${styles.bgGradient} backdrop-blur-sm rounded-lg overflow-hidden my-6`}
      style={{ animation: 'fadeInScale 0.5s ease-out' }}
    >
      {/* Header */}
      <div className="bg-cyber-darker/50 py-4 px-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-orbitron text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <span className="text-lg">🔬</span>
          SİSTEM DENGE ANALİZİ
        </h3>
        <div className="flex items-center gap-3">
          <span className="font-space-mono text-xs text-gray-500">
            Oran: {analysis.ratio.toFixed(2)}
          </span>
          <div className={`px-3 py-1 rounded-full text-xs font-space-mono ${styles.iconBg} ${styles.titleColor}`}>
            {analysis.status === 'balanced' ? 'Dengeli' : analysis.status === 'cpu_bottleneck' ? 'CPU Darboğazı' : 'GPU Darboğazı'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Status Icon & Title Row */}
        <div className="flex items-start gap-5 mb-6">
          {/* Animated Icon */}
          <div 
            className={`w-16 h-16 rounded-2xl ${styles.iconBg} ${styles.iconGlow} flex items-center justify-center text-3xl shrink-0 transition-all duration-300`}
          >
            {analysis.status === 'balanced' && '✅'}
            {analysis.status === 'cpu_bottleneck' && (analysis.severity === 'severe' ? '🚨' : '⚠️')}
            {analysis.status === 'gpu_bottleneck' && '🎮'}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-orbitron text-lg font-bold ${styles.titleColor} mb-2`}>
              {analysis.title}
            </h4>
            <p className="font-space-mono text-sm text-gray-400 leading-relaxed">
              {analysis.description}
            </p>
          </div>
        </div>

        {/* Score Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* GPU Score Bar */}
          <div className="bg-cyber-darker/50 rounded-lg p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎮</span>
                <span className="font-space-mono text-xs text-gray-500 uppercase">3D Performance</span>
              </div>
              <div className="text-right">
                <span className="font-orbitron text-sm font-bold text-neon-green">
                  {gpuScore?.toLocaleString()}
                </span>
                <span className="font-space-mono text-xs text-gray-500 ml-2">
                  ({analysis.gpuPercentage}%)
                </span>
              </div>
            </div>
            <div className="h-3 bg-cyber-darker rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-green to-electric-blue rounded-full"
                style={{ 
                  width: `${animatedGpuPercent}%`,
                  boxShadow: animatedGpuPercent > 0 ? '0 0 15px rgba(0, 255, 136, 0.4)' : 'none',
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>

          {/* CPU Score Bar */}
          <div className="bg-cyber-darker/50 rounded-lg p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span className="font-space-mono text-xs text-gray-500 uppercase">JavaScript Speed</span>
              </div>
              <div className="text-right">
                <span className="font-orbitron text-sm font-bold text-electric-blue">
                  {cpuScore?.toLocaleString()}
                </span>
                <span className="font-space-mono text-xs text-gray-500 ml-2">
                  ({analysis.cpuPercentage}%)
                </span>
              </div>
            </div>
            <div className="h-3 bg-cyber-darker rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-electric-blue to-cyber-purple rounded-full"
                style={{ 
                  width: `${animatedCpuPercent}%`,
                  boxShadow: animatedCpuPercent > 0 ? '0 0 15px rgba(0, 212, 255, 0.4)' : 'none',
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Efficiency Comment */}
        <div className="bg-cyber-darker/30 rounded-lg p-3 mb-4 border border-white/5">
          <p className="text-center font-space-mono text-xs text-gray-400">
            📈 {getEfficiencyComment()}
          </p>
        </div>

        {/* Recommendation (if any) */}
        {analysis.recommendation && (
          <div className={`bg-cyber-darker/30 rounded-lg p-4 border-l-4 ${
            analysis.status === 'balanced' ? 'border-neon-green' : 
            analysis.severity === 'severe' ? 'border-red-500' : 
            analysis.status === 'gpu_bottleneck' ? 'border-orange-500' : 'border-yellow-500'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-lg">💡</span>
              <p className="font-space-mono text-xs text-gray-400 leading-relaxed">
                <span className="text-gray-300 font-semibold">Öneri: </span>
                {analysis.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Score Comparison Visual */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-center gap-4 text-xs font-space-mono text-gray-500">
            <span>GPU/CPU Oranı:</span>
            <span className={`font-bold ${styles.titleColor}`}>
              {analysis.ratio.toFixed(2)}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-600">
              {analysis.ratio < 0.8 ? '< 0.80 → GPU Yavaş' : 
               analysis.ratio > 1.2 ? '> 1.20 → CPU Yavaş' : 
               '0.80 - 1.20 → Dengeli'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
