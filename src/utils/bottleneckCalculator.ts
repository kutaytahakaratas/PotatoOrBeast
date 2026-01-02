import { getGPUTier } from './gamePrediction';

export type BottleneckStatus = 'balanced' | 'cpu_bottleneck' | 'gpu_bottleneck' | 'unknown';

export interface BottleneckResult {
  status: BottleneckStatus;
  severity: 'none' | 'mild' | 'severe';
  gpuUtilization: number; // Predicted GPU usage percentage
  cpuUtilization: number; // Predicted CPU usage percentage
  title: string;
  description: string;
  recommendation?: string;
}

/**
 * GPU Tier to numeric score mapping
 * Higher = more powerful GPU
 */
const GPU_TIER_SCORES: { [key: string]: number } = {
  'Ultra': 5,
  'High': 4,
  'Mid-High': 3,
  'Mid': 2,
  'Entry': 1,
};

/**
 * CPU Core count to score mapping
 * Considers modern multi-core efficiency
 */
const getCPUScore = (cores: number): number => {
  if (cores >= 16) return 5;      // High-end (i9, Ryzen 9, Threadripper)
  if (cores >= 12) return 4.5;    // Upper-mid (i7 12th+, Ryzen 7)
  if (cores >= 8) return 4;       // Mid-high (i7, Ryzen 5)
  if (cores >= 6) return 3;       // Mid (i5, older Ryzen 5)
  if (cores >= 4) return 2;       // Entry (i3, older CPUs)
  return 1;                       // Low-end (Dual-core, Atom)
};

/**
 * Calculates bottleneck between GPU and CPU
 * Returns detailed analysis of system balance
 */
export const calculateBottleneck = (
  gpuName: string,
  cpuCores: number | string
): BottleneckResult => {
  // Handle unknown/string CPU cores
  const cores = typeof cpuCores === 'number' ? cpuCores : 4; // Default to 4 if unknown
  
  // Get GPU tier info
  const gpuInfo = getGPUTier(gpuName);
  const gpuScore = GPU_TIER_SCORES[gpuInfo.tier] || 2;
  
  // Calculate CPU score
  const cpuScore = getCPUScore(cores);
  
  // Calculate balance ratio
  // Ratio > 1 means GPU is more powerful relative to CPU (potential CPU bottleneck)
  // Ratio < 1 means CPU is more powerful relative to GPU (potential GPU bottleneck)
  const balanceRatio = gpuScore / cpuScore;
  
  // Determine bottleneck status and severity
  let status: BottleneckStatus = 'balanced';
  let severity: 'none' | 'mild' | 'severe' = 'none';
  let gpuUtilization = 100;
  let cpuUtilization = 100;
  
  if (balanceRatio >= 2.0) {
    // Severe CPU bottleneck - GPU is way more powerful than CPU
    status = 'cpu_bottleneck';
    severity = 'severe';
    gpuUtilization = Math.round(50 + (cpuScore / gpuScore) * 30); // GPU underutilized
    cpuUtilization = 100; // CPU maxed out
  } else if (balanceRatio >= 1.5) {
    // Mild CPU bottleneck
    status = 'cpu_bottleneck';
    severity = 'mild';
    gpuUtilization = Math.round(70 + (cpuScore / gpuScore) * 20);
    cpuUtilization = 95;
  } else if (balanceRatio <= 0.5) {
    // Severe GPU bottleneck - CPU is way more powerful than GPU
    status = 'gpu_bottleneck';
    severity = 'severe';
    gpuUtilization = 100; // GPU maxed out
    cpuUtilization = Math.round(40 + (gpuScore / cpuScore) * 30);
  } else if (balanceRatio <= 0.7) {
    // Mild GPU bottleneck
    status = 'gpu_bottleneck';
    severity = 'mild';
    gpuUtilization = 100;
    cpuUtilization = Math.round(60 + (gpuScore / cpuScore) * 25);
  } else {
    // Balanced system (ratio between 0.7 and 1.5)
    status = 'balanced';
    severity = 'none';
    gpuUtilization = Math.round(90 + Math.random() * 8);
    cpuUtilization = Math.round(85 + Math.random() * 10);
  }
  
  // Generate human-readable messages
  const { title, description, recommendation } = generateMessages(
    status,
    severity,
    gpuUtilization,
    cpuScore,
    gpuScore,
    cores
  );
  
  return {
    status,
    severity,
    gpuUtilization,
    cpuUtilization,
    title,
    description,
    recommendation,
  };
};

/**
 * Generates user-friendly messages based on bottleneck analysis
 */
const generateMessages = (
  status: BottleneckStatus,
  severity: 'none' | 'mild' | 'severe',
  gpuUtilization: number,
  _cpuScore: number,
  _gpuScore: number,
  cores: number
): { title: string; description: string; recommendation?: string } => {
  switch (status) {
    case 'cpu_bottleneck':
      if (severity === 'severe') {
        return {
          title: '⚠️ Kritik Darboğaz Tespit Edildi!',
          description: `Ekran kartınız çok güçlü ama ${cores} çekirdekli işlemciniz onu frenliyor. GPU kullanımı ~%${gpuUtilization}'da kalabilir.`,
          recommendation: 'İşlemci yükseltmesi düşünün. Minimum 8 çekirdekli modern bir CPU bu sistemi dengeleyebilir.',
        };
      } else {
        return {
          title: '⚡ Hafif Darboğaz',
          description: `İşlemciniz ekran kartınızı tam besleyemiyor. GPU kullanımı ~%${gpuUtilization} civarında kalabilir.`,
          recommendation: 'Çoğu oyunda sorun yaşamazsınız, ama CPU yoğun oyunlarda performans düşebilir.',
        };
      }
    
    case 'gpu_bottleneck':
      if (severity === 'severe') {
        return {
          title: '🎮 Ekran Kartı Yetersiz',
          description: `${cores} çekirdekli güçlü işlemciniz var ama ekran kartınız onu yakalayamıyor.`,
          recommendation: 'Daha güçlü bir ekran kartı ile sistemin tam potansiyelini açığa çıkarabilirsiniz.',
        };
      } else {
        return {
          title: '📊 GPU Limitli Sistem',
          description: 'Ekran kartınız sistemin limitleyici faktörü. Bu normal ve beklenen bir durum.',
          recommendation: 'Oyunlarda grafik ayarlarını düşürerek daha yüksek FPS elde edebilirsiniz.',
        };
      }
    
    case 'balanced':
    default:
      return {
        title: '✅ Mükemmel Denge!',
        description: 'İşlemciniz ve ekran kartınız birbirini tam besliyor. Maksimum performans alıyorsunuz.',
      };
  }
};

/**
 * Quick check if system has any bottleneck
 */
export const hasBottleneck = (gpuName: string, cpuCores: number | string): boolean => {
  const result = calculateBottleneck(gpuName, cpuCores);
  return result.status !== 'balanced';
};
