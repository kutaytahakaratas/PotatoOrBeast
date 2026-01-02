export interface SystemSpecs {
  gpu: string;
  cpuCores: number | string;
  ram: string;
  screenResolution: string;
  browser: string;
  platform: string;
}

/**
 * Cleans GPU name from ANGLE wrapper and extracts model name
 * Example: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU (0x000028E0) Direct3D11...)"
 * Returns: "NVIDIA GeForce RTX 4060 Laptop GPU"
 */
const cleanGPUName = (rawGPU: string): string => {
  if (!rawGPU || rawGPU === 'Gizli Donanım') return rawGPU;
  
  // If it starts with ANGLE, extract the GPU model
  if (rawGPU.startsWith('ANGLE')) {
    // Pattern: ANGLE (VENDOR, GPU_MODEL (ID) Driver...)
    // Extract the second part after vendor comma
    const angleMatch = rawGPU.match(/ANGLE\s*\([^,]+,\s*([^(]+)/);
    if (angleMatch && angleMatch[1]) {
      return angleMatch[1].trim();
    }
  }
  
  // Remove common suffixes like Direct3D11, OpenGL, Vulkan, etc.
  let cleaned = rawGPU
    .replace(/\s*Direct3D\d*\s*/gi, '')
    .replace(/\s*OpenGL\s*/gi, '')
    .replace(/\s*Vulkan\s*/gi, '')
    .replace(/\s*vs_\d+_\d+\s*/gi, '')
    .replace(/\s*ps_\d+_\d+\s*/gi, '')
    .replace(/\s*D3D\d+\s*/gi, '')
    .replace(/\s*\(0x[0-9A-Fa-f]+\)\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned || rawGPU;
};

/**
 * Checks if GPU is a high-performance discrete GPU
 */
const isHighPerformanceGPU = (gpuName: string): boolean => {
  const highPerfPatterns = [
    /RTX\s*\d/i,    // NVIDIA RTX series
    /GTX\s*\d/i,    // NVIDIA GTX series
    /RX\s*\d/i,     // AMD RX series
    /Radeon\s*(Pro|VII|RX)/i, // AMD Radeon Pro
    /Quadro/i,      // NVIDIA Quadro
    /Tesla/i,       // NVIDIA Tesla
    /Arc\s*A\d/i,   // Intel Arc
  ];
  
  return highPerfPatterns.some(pattern => pattern.test(gpuName));
};

/**
 * Checks if GPU is integrated graphics
 */
const isIntegratedGPU = (gpuName: string): boolean => {
  const integratedPatterns = [
    /Intel.*UHD/i,
    /Intel.*HD\s*Graphics/i,
    /Intel.*Iris/i,
    /AMD.*Vega/i,
    /AMD.*Radeon\s*Graphics/i, // APU integrated
  ];
  
  return integratedPatterns.some(pattern => pattern.test(gpuName));
};

/**
 * Detects GPU model using WebGL debug renderer info
 */
export const detectGPU = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'Gizli Donanım';
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    
    if (debugInfo) {
      const rawRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Clean the GPU name before returning
      return cleanGPUName(rawRenderer) || 'Gizli Donanım';
    }
    
    return 'Gizli Donanım';
  } catch (error) {
    console.error('GPU detection failed:', error);
    return 'Gizli Donanım';
  }
};

/**
 * Detects CPU core count using navigator.hardwareConcurrency
 */
export const detectCPUCores = (): number | string => {
  try {
    const cores = navigator.hardwareConcurrency;
    return cores || 'Gizli Donanım';
  } catch (error) {
    console.error('CPU detection failed:', error);
    return 'Gizli Donanım';
  }
};

/**
 * Detects RAM amount using navigator.deviceMemory with smart estimation
 * Browser limits visibility to deviceMemory, so we estimate based on GPU tier
 */
export const detectRAM = (gpuName?: string): string => {
  try {
    // @ts-ignore - deviceMemory is not in all TypeScript definitions
    const reportedMemory = navigator.deviceMemory;
    
    // If no GPU info, just return what browser reports
    if (!gpuName) {
      return reportedMemory ? `${reportedMemory} GB` : 'Gizli Donanım';
    }
    
    // Smart estimation based on GPU tier
    if (isHighPerformanceGPU(gpuName)) {
      // RTX/GTX/RX users typically have 16GB+ RAM
      if (!reportedMemory || reportedMemory < 8) {
        return '16 GB+ (Tahmini)';
      }
      // If browser reports 8GB and high-end GPU, estimate higher
      if (reportedMemory === 8) {
        return '16 GB+ (Tahmini)';
      }
    }
    
    if (isIntegratedGPU(gpuName)) {
      // Integrated GPU users typically have 8-16GB
      if (!reportedMemory || reportedMemory < 4) {
        return '8 GB (Tahmini)';
      }
    }
    
    // Return reported value if it seems reasonable
    if (reportedMemory && reportedMemory >= 4) {
      return `${reportedMemory} GB`;
    }
    
    // Fallback for low reported values with unknown GPU
    if (reportedMemory && reportedMemory < 4) {
      return 'Yeterli Bellek';
    }
    
    return 'Gizli Donanım';
  } catch (error) {
    console.error('RAM detection failed:', error);
    return 'Gizli Donanım';
  }
};

/**
 * Gets actual physical monitor resolution (compensates for Windows DPI scaling)
 */
export const getScreenResolution = (): string => {
  try {
    // Multiply by devicePixelRatio to get physical pixels (not logical)
    // Example: 1536×864 at 125% scaling → 1920×1080 physical
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(window.screen.width * dpr);
    const height = Math.round(window.screen.height * dpr);
    return `${width} × ${height}`;
  } catch (error) {
    console.error('Screen resolution detection failed:', error);
    return 'Gizli Donanım';
  }
};

/**
 * Detects browser name (clean, without version numbers)
 */
export const detectBrowser = (): string => {
  try {
    const userAgent = navigator.userAgent;
    
    // Order matters: Check Edge before Chrome (Edge includes Chrome in UA)
    if (userAgent.includes('Edg/')) {
      return 'Microsoft Edge';
    }
    
    if (userAgent.includes('Firefox/')) {
      return 'Mozilla Firefox';
    }
    
    if (userAgent.includes('Chrome/')) {
      return 'Google Chrome';
    }
    
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
      return 'Apple Safari';
    }
    
    if (userAgent.includes('Opera') || userAgent.includes('OPR/')) {
      return 'Opera';
    }
    
    return 'Tarayıcı';
  } catch (error) {
    console.error('Browser detection failed:', error);
    return 'Tarayıcı';
  }
};

/**
 * Detects platform/OS
 */
export const detectPlatform = (): string => {
  try {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;
    
    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'macOS';
    if (platform.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return 'iOS';
    
    return 'Gizli Platform';
  } catch (error) {
    console.error('Platform detection failed:', error);
    return 'Gizli Platform';
  }
};

/**
 * Gets all system specifications
 */
export const getSystemSpecs = async (): Promise<SystemSpecs> => {
  // Simulate async detection with small delay for loading animation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Detect GPU first for smart RAM estimation
  const gpu = detectGPU();
  
  return {
    gpu,
    cpuCores: detectCPUCores(),
    ram: detectRAM(gpu), // Pass GPU name for smart estimation
    screenResolution: getScreenResolution(),
    browser: detectBrowser(),
    platform: detectPlatform(),
  };
};
