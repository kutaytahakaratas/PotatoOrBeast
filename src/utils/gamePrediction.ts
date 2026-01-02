export interface GamePrediction {
  id: string;
  title: string;
  fpsRange: string;
  settings: string;
  tier: 'perfect' | 'smooth' | 'playable' | 'poor';
}

export interface GPUScore {
  tier: string;
  multiplier: number;
}

const GPU_TIERS: { [key: string]: GPUScore } = {
  // ULTRA (Multiplier: 4.5)
  '4090': { tier: 'Ultra', multiplier: 4.5 },
  '4080': { tier: 'Ultra', multiplier: 4.2 },
  '7900 XTX': { tier: 'Ultra', multiplier: 4.3 },
  '7900 XT': { tier: 'Ultra', multiplier: 4.0 },
  '3090': { tier: 'Ultra', multiplier: 3.8 },

  // HIGH (Multiplier: 3.5)
  '4070': { tier: 'High', multiplier: 3.5 },
  '3080': { tier: 'High', multiplier: 3.4 },
  '7800': { tier: 'High', multiplier: 3.5 },
  '6800': { tier: 'High', multiplier: 3.2 },
  '3070': { tier: 'High', multiplier: 2.8 },

  // MID-HIGH (Multiplier: 2.2 - 2.5)
  '4060': { tier: 'Mid-High', multiplier: 2.4 },
  '3060': { tier: 'Mid-High', multiplier: 2.2 },
  '4050': { tier: 'Mid-High', multiplier: 2.0 },
  '7600': { tier: 'Mid-High', multiplier: 2.3 },
  '2080': { tier: 'Mid-High', multiplier: 2.5 },
  '6700': { tier: 'Mid-High', multiplier: 2.4 },

  // MID (Multiplier: 1.5)
  '3050': { tier: 'Mid', multiplier: 1.5 },
  '2060': { tier: 'Mid', multiplier: 1.6 },
  '1660': { tier: 'Mid', multiplier: 1.4 },
  '1080': { tier: 'Mid', multiplier: 1.5 },
  '5700': { tier: 'Mid', multiplier: 1.6 },
  '6600': { tier: 'Mid', multiplier: 1.6 },

  // ENTRY (Multiplier: 0.6)
  '1050': { tier: 'Entry', multiplier: 0.6 },
  '1650': { tier: 'Entry', multiplier: 0.8 },
  '1060': { tier: 'Entry', multiplier: 1.0 },
  'Intel': { tier: 'Entry', multiplier: 0.4 }, // Generic Intel
  'Iris': { tier: 'Entry', multiplier: 0.3 },
  'UHD': { tier: 'Entry', multiplier: 0.2 },
  'Vega': { tier: 'Entry', multiplier: 0.5 },
};

interface GameBase {
  id: string;
  title: string;
  baseFps: number; // FPS on a standardized "Base" system (approx weak entry level)
  cpuDependent?: boolean;
  color: string; // Tailwind color class stub or hex
  fpsCap?: number;
}

const GAMES_DB: GameBase[] = [
  { id: 'valorant', title: 'Valorant', baseFps: 60, cpuDependent: true, color: 'text-red-500' },
  { id: 'cs2', title: 'Counter-Strike 2', baseFps: 45, cpuDependent: true, color: 'text-yellow-500' },
  { id: 'cyberpunk', title: 'Cyberpunk 2077', baseFps: 15, color: 'text-yellow-400' },
  { id: 'gta5', title: 'GTA V', baseFps: 40, color: 'text-green-500' },
  { id: 'fortnite', title: 'Fortnite', baseFps: 50, color: 'text-blue-500' },
  { id: 'lol', title: 'League of Legends', baseFps: 80, cpuDependent: true, color: 'text-blue-400' },
  { id: 'eldenring', title: 'Elden Ring', baseFps: 20, fpsCap: 60, color: 'text-yellow-600' },
  { id: 'rdr2', title: 'Red Dead Redemption 2', baseFps: 25, color: 'text-red-700' },
];

export const getGPUTier = (gpuName: string): GPUScore => {
  // Normalize string
  const normalized = gpuName.toUpperCase();

  // Find matching key
  for (const [key, score] of Object.entries(GPU_TIERS)) {
    if (normalized.includes(key.toUpperCase())) {
      return score;
    }
  }

  // Fallback defaults
  if (normalized.includes('NVIDIA')) return { tier: 'Mid', multiplier: 1.5 };
  if (normalized.includes('AMD')) return { tier: 'Mid', multiplier: 1.5 };
  
  // Absolute fallback (Integrated/Unknown)
  return { tier: 'Entry', multiplier: 0.5 };
};

export const predictGamePerformance = (gpuName: string, cpuCores: number): { predictions: GamePrediction[], gpuTier: string } => {
  const gpuInfo = getGPUTier(gpuName);
  const predictions: GamePrediction[] = [];

  const cpuBonus = cpuCores >= 8;

  for (const game of GAMES_DB) {
    let estimatedFps = game.baseFps * gpuInfo.multiplier;

    // CPU Bonus Rules
    if (game.cpuDependent && cpuBonus) {
      estimatedFps += 40; // Significant boost for CPU bound games
    } else if (game.cpuDependent) {
      estimatedFps += 10; // Moderate boost
    }

    // FPS Cap Rules
    if (game.id === 'eldenring' && estimatedFps > 60) {
      estimatedFps = 60;
    }

    // Add some realistic variance/range
    const lowerBound = Math.floor(estimatedFps * 0.9);
    const upperBound = Math.floor(estimatedFps * 1.1);

    // If capped
    let rangeString = `${lowerBound}-${upperBound} FPS`;
    if (game.fpsCap && upperBound >= game.fpsCap) {
      rangeString = `${game.fpsCap} FPS (Kilitli)`;
      if (lowerBound >= game.fpsCap) estimatedFps = game.fpsCap; // Ensure logic treats it as maxed
    }

    // Determine Tier Rating
    let rating: 'perfect' | 'smooth' | 'playable' | 'poor' = 'poor';
    if (estimatedFps >= 100) rating = 'perfect';
    else if (estimatedFps >= 60) rating = 'smooth';
    else if (estimatedFps >= 30) rating = 'playable';

    // Settings estimate based on Tier
    let qualitySettings = 'Low';
    if (gpuInfo.tier === 'Ultra') qualitySettings = 'Ultra 4K';
    else if (gpuInfo.tier === 'High') qualitySettings = 'High 1440p';
    else if (gpuInfo.tier === 'Mid-High') qualitySettings = 'High 1080p';
    else if (gpuInfo.tier === 'Mid') qualitySettings = 'Medium 1080p';
    else qualitySettings = 'Low 720p';

    predictions.push({
      id: game.id,
      title: game.title,
      fpsRange: rangeString,
      settings: qualitySettings,
      tier: rating,
    });
  }

  return { predictions, gpuTier: gpuInfo.tier };
};

/**
 * Bottleneck Analysis Result
 */
export interface BottleneckAnalysis {
  status: 'balanced' | 'cpu_bottleneck' | 'gpu_bottleneck' | 'severe_bottleneck';
  severity: 'none' | 'mild' | 'severe';
  icon: string;
  title: string;
  description: string;
  color: string;
}

/**
 * Upgrade Recommendation
 */
export interface UpgradeRecommendation {
  priority: 'high' | 'medium' | 'low' | 'none';
  component: 'ram' | 'gpu' | 'cpu' | 'none';
  icon: string;
  title: string;
  description: string;
  impact: string;
}

/**
 * Analyzes system bottleneck based on GPU tier and CPU cores
 */
export const analyzeBottleneck = (gpuTier: string, cpuCores: number): BottleneckAnalysis => {
  // High-end GPU with weak CPU = CPU Bottleneck
  if ((gpuTier === 'Ultra' || gpuTier === 'High') && cpuCores < 6) {
    return {
      status: 'severe_bottleneck',
      severity: 'severe',
      icon: '🚨',
      title: 'Ciddi CPU Darboğazı',
      description: `${gpuTier} sınıfı ekran kartınız ${cpuCores} çekirdekli işlemciniz tarafından frenleniyor! Oyunlarda ciddi performans kaybı yaşarsınız.`,
      color: 'red'
    };
  }

  if ((gpuTier === 'Ultra' || gpuTier === 'High') && cpuCores < 8) {
    return {
      status: 'cpu_bottleneck',
      severity: 'mild',
      icon: '⚠️',
      title: 'Hafif CPU Darboğazı',
      description: `Güçlü ${gpuTier} ekran kartınız var ama ${cpuCores} çekirdekli işlemciniz bazı oyunlarda limit oluşturabilir.`,
      color: 'yellow'
    };
  }

  // Mid-tier GPU with very weak CPU
  if (gpuTier === 'Mid-High' && cpuCores < 4) {
    return {
      status: 'cpu_bottleneck',
      severity: 'mild',
      icon: '⚠️',
      title: 'CPU Limitli Sistem',
      description: 'İşlemciniz ekran kartınızı tam besleyemiyor. CPU yoğun oyunlarda takılmalar olabilir.',
      color: 'yellow'
    };
  }

  // Weak GPU with strong CPU = GPU Bottleneck
  if ((gpuTier === 'Entry' || gpuTier === 'Mid') && cpuCores >= 8) {
    return {
      status: 'gpu_bottleneck',
      severity: 'mild',
      icon: '🎮',
      title: 'GPU Limitli Sistem',
      description: 'İşlemciniz güçlü ama ekran kartınız sistemin zayıf halkası. Bu oyunlar için normal bir durum.',
      color: 'orange'
    };
  }

  // Very weak GPU
  if (gpuTier === 'Entry' && cpuCores < 4) {
    return {
      status: 'severe_bottleneck',
      severity: 'severe',
      icon: '📉',
      title: 'Düşük Performanslı Sistem',
      description: 'Hem işlemci hem ekran kartı başlangıç seviyesinde. Güncel oyunlarda zorlanırsınız.',
      color: 'red'
    };
  }

  // Balanced system
  return {
    status: 'balanced',
    severity: 'none',
    icon: '✅',
    title: 'Dengeli Sistem',
    description: 'İşlemci ve ekran kartınız güzel bir uyum içinde. Maksimum performans alıyorsunuz!',
    color: 'green'
  };
};

/**
 * Analyzes upgrade needs based on system specs
 */
export const analyzeUpgradeNeeds = (
  gpuTier: string, 
  cpuCores: number, 
  ramGB: number
): UpgradeRecommendation => {
  // Priority 1: RAM is critically low
  if (ramGB <= 4) {
    return {
      priority: 'high',
      component: 'ram',
      icon: '🧠',
      title: 'RAM Yükseltmesi Şart',
      description: `${ramGB}GB RAM modern oyunlar için yetersiz. Minimum 16GB önerilir.`,
      impact: '+8GB RAM eklemesi sistemini %50 rahatlatır ve takılmaları önler.'
    };
  }

  if (ramGB <= 8) {
    return {
      priority: 'medium',
      component: 'ram',
      icon: '💾',
      title: 'RAM Yükseltmesi Önerilir',
      description: `${ramGB}GB RAM yeterli ama 16GB'a çıkmak performansı artırır.`,
      impact: '+8GB RAM eklemesi çoklu görev ve oyun performansını %30 artırır.'
    };
  }

  // Priority 2: GPU is the bottleneck
  if (gpuTier === 'Entry' && cpuCores >= 6) {
    return {
      priority: 'high',
      component: 'gpu',
      icon: '🎮',
      title: 'Ekran Kartı Yükseltmesi',
      description: 'İşlemciniz iyi ama ekran kartınız oyunlar için yetersiz.',
      impact: 'Mid-tier bir GPU (RTX 3060/4060) ile 3-4 kat performans artışı mümkün.'
    };
  }

  if (gpuTier === 'Mid' && cpuCores >= 8) {
    return {
      priority: 'medium',
      component: 'gpu',
      icon: '📊',
      title: 'GPU Yükseltmesi Düşünün',
      description: 'Güçlü işlemciniz var. Ekran kartını yükseltmek oyun deneyimini iyileştirir.',
      impact: 'High-tier GPU ile 1440p veya 4K oyun deneyimi mümkün.'
    };
  }

  // Priority 3: CPU is the bottleneck
  if ((gpuTier === 'Ultra' || gpuTier === 'High') && cpuCores < 6) {
    return {
      priority: 'high',
      component: 'cpu',
      icon: '⚡',
      title: 'İşlemci Yükseltmesi Şart',
      description: `${gpuTier} ekran kartınız ${cpuCores} çekirdekli işlemciniz tarafından frenleniyor!`,
      impact: '8+ çekirdekli modern CPU ile GPU\'nuzun tam potansiyelini açığa çıkarın.'
    };
  }

  if ((gpuTier === 'High' || gpuTier === 'Mid-High') && cpuCores < 8) {
    return {
      priority: 'low',
      component: 'cpu',
      icon: '🔧',
      title: 'CPU Yükseltmesi İsteğe Bağlı',
      description: 'Sisteminiz dengeli ama 8+ çekirdekli CPU bazı oyunlarda fayda sağlar.',
      impact: 'CPU yoğun oyunlarda %15-20 performans artışı.'
    };
  }

  // System is well balanced
  return {
    priority: 'none',
    component: 'none',
    icon: '🏆',
    title: 'Sisteminiz Optimize!',
    description: 'Şu an için acil bir yükseltme gerekmiyor. Sisteminiz dengeli.',
    impact: 'Driver güncellemelerini takip ederek performansı koruyun.'
  };
};
