import { useEffect, useState } from 'react'
import { SystemCard } from './components/SystemCard'
import { BenchmarkScene } from './components/BenchmarkScene'
import { CPUBenchmark } from './components/CPUBenchmark'
import { ResultModal } from './components/ResultModal'
import { GamePerformanceEstimator } from './components/GamePerformanceEstimator'
import { BottleneckIndicator } from './components/BottleneckIndicator'
import { ScoreComparisonCard } from './components/ScoreComparisonCard'
import { UpgradeAdvisor } from './components/UpgradeAdvisor'
import { ScoreCard } from './components/ScoreCard'

// Test modes
type TestMode = 'none' | 'gpu' | 'cpu' | 'full';

interface GPUResults {
  avgFps: number;
  minFps: number;
  maxFps: number;
  totalObjects: number;
}

interface CPUResults {
  score: number;
  duration: number;
  ops: number;
}

function App() {
  const [loadTime, setLoadTime] = useState(0)
  const [testMode, setTestMode] = useState<TestMode>('none')
  const [showResults, setShowResults] = useState(false)
  const [gpuResults, setGpuResults] = useState<GPUResults | null>(null)
  const [cpuResults, setCpuResults] = useState<CPUResults | null>(null)
  const [fullTestPhase, setFullTestPhase] = useState<'gpu' | 'cpu' | 'done'>('gpu')

  useEffect(() => {
    if (performance.timing) {
      const perfData = performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      setLoadTime(pageLoadTime)
    }
  }, [])

  // GPU Test Complete Handler
  const handleGPUComplete = (avgFps: number, minFps: number, maxFps: number, totalObjects: number) => {
    const results = { avgFps, minFps, maxFps, totalObjects };
    setGpuResults(results);
    
    if (testMode === 'full') {
      // Move to CPU test in full mode
      setFullTestPhase('cpu');
    } else {
      // Single GPU test - show results
      setTestMode('none');
      setShowResults(true);
    }
  }

  // CPU Test Complete Handler
  const handleCPUComplete = (score: number, duration: number, ops: number) => {
    const results = { score, duration, ops };
    setCpuResults(results);
    
    if (testMode === 'full') {
      setFullTestPhase('done');
    }
    
    setTestMode('none');
    setShowResults(true);
  }

  // Start individual tests
  const startGPUTest = () => {
    setGpuResults(null);
    setCpuResults(null);
    setShowResults(false);
    setTestMode('gpu');
  }

  const startCPUTest = () => {
    setGpuResults(null);
    setCpuResults(null);
    setShowResults(false);
    setTestMode('cpu');
  }

  // Start full system scan
  const startFullTest = () => {
    setGpuResults(null);
    setCpuResults(null);
    setShowResults(false);
    setFullTestPhase('gpu');
    setTestMode('full');
  }

  const closeResults = () => {
    setShowResults(false);
  }

  // ========== RENDER TEST SCREENS ==========
  
  // GPU Test Mode
  if (testMode === 'gpu') {
    return <BenchmarkScene onComplete={handleGPUComplete} />
  }

  // CPU Test Mode
  if (testMode === 'cpu') {
    return <CPUBenchmark onComplete={handleCPUComplete} />
  }

  // Full System Scan Mode
  if (testMode === 'full') {
    if (fullTestPhase === 'gpu') {
      return <BenchmarkScene onComplete={handleGPUComplete} />
    }
    if (fullTestPhase === 'cpu') {
      return <CPUBenchmark onComplete={handleCPUComplete} />
    }
  }

  // Show Results Modal
  if (showResults && gpuResults) {
    return (
      <ResultModal 
        avgFps={gpuResults.avgFps}
        minFps={gpuResults.minFps}
        maxFps={gpuResults.maxFps}
        totalObjects={gpuResults.totalObjects}
        cpuScore={cpuResults?.score}
        onRestart={startFullTest}
        onClose={closeResults}
      />
    )
  }

  // ========== MAIN PAGE ==========
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Grid Background */}
      <div className="cyber-grid-bg"></div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <header className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-orbitron text-7xl md:text-8xl font-black mb-6 neon-text tracking-tight">
            POTATO
            <br />
            <span className="text-electric-blue neon-text-blue">OR</span>
            <br />
            BEAST
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Tarayıcınızın gerçek gücünü keşfedin. 
            <span className="text-neon-green font-bold"> Profesyonel testler</span>, 
            <span className="text-electric-blue font-bold"> detaylı analizler</span>, 
            ve donanımınızın sınırlarını zorlayan 
            <span className="text-cyber-purple font-bold"> 3D benchmark testleri</span>.
          </p>

          <button 
            onClick={startFullTest}
            className="group relative px-10 py-5 bg-gradient-to-r from-neon-green via-electric-blue to-cyber-purple text-cyber-darker font-orbitron font-bold text-xl rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-neon-green"
          >
            <span className="relative z-10">🚀 TAM SİSTEM TARAMASI</span>
          </button>
          
          <p className="mt-4 text-sm text-gray-500 font-space-mono">
            GPU + CPU testlerini sırayla çalıştırır
          </p>
        </header>

        {/* System Card */}
        <SystemCard />

        {/* Akıllı Yükseltme Tavsiyesi - Sanal Satış Danışmanı */}
        <UpgradeAdvisor />

        {/* Bottleneck Analysis - Danışman Özelliği */}
        <BottleneckIndicator 
          gpuScore={gpuResults?.totalObjects ?? null} 
          cpuScore={cpuResults?.score ?? null} 
        />

        {/* Score Card with Fun Commentary - Eğlenceli Yorumlar */}
        <ScoreCard
          gpuScore={gpuResults?.totalObjects ?? null}
          cpuScore={cpuResults?.score ?? null}
        />

        {/* Score History Comparison - Kendi Kendine Yarış */}
        <ScoreComparisonCard
          gpuScore={gpuResults?.totalObjects ?? null}
          cpuScore={cpuResults?.score ?? null}
        />

        {/* Test Suites - Clickable Cards */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-orbitron text-4xl font-bold text-center mb-4 neon-text">
              TEST SÜİTLERİ
            </h2>
            <p className="text-center text-gray-400 mb-12 font-space-mono text-sm">
              Tek bir testi seç veya tam sistem taraması yap
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GPU Test Card - Clickable */}
              <button 
                onClick={startGPUTest}
                className="group bg-gradient-to-br from-cyber-dark/60 to-cyber-darker/60 backdrop-blur-sm p-6 rounded-lg border-2 border-neon-green/30 hover:border-neon-green transition-all duration-300 hover:scale-105 hover:shadow-neon-green text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-xl font-bold text-neon-green">
                    🎮 3D Performance
                  </h3>
                  <span className="px-2 py-1 bg-neon-green/20 text-neon-green text-xs rounded font-orbitron">
                    GPU
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Three.js tabanlı gerçek zamanlı 3D render testleri ile GPU performansınızı ölçün.
                </p>
                <div className="flex items-center gap-2 text-neon-green text-sm font-space-mono group-hover:translate-x-2 transition-transform">
                  <span>Testi Başlat</span>
                  <span>→</span>
                </div>
              </button>

              {/* CPU Test Card - Clickable */}
              <button 
                onClick={startCPUTest}
                className="group bg-gradient-to-br from-cyber-dark/60 to-cyber-darker/60 backdrop-blur-sm p-6 rounded-lg border-2 border-electric-blue/30 hover:border-electric-blue transition-all duration-300 hover:scale-105 hover:shadow-neon-blue text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-xl font-bold text-electric-blue">
                    ⚡ JavaScript Speed
                  </h3>
                  <span className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs rounded font-orbitron">
                    CPU
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  Algoritmik testler ve hesaplama yoğun işlemlerle JS motor hızını analiz edin.
                </p>
                <div className="flex items-center gap-2 text-electric-blue text-sm font-space-mono group-hover:translate-x-2 transition-transform">
                  <span>Testi Başlat</span>
                  <span>→</span>
                </div>
              </button>

              {/* Memory Test Card - Coming Soon */}
              <div className="bg-gradient-to-br from-cyber-dark/40 to-cyber-darker/40 backdrop-blur-sm p-6 rounded-lg border border-cyber-purple/20 opacity-60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-xl font-bold text-cyber-purple">
                    🧠 Memory Test
                  </h3>
                  <span className="px-2 py-1 bg-cyber-purple/20 text-cyber-purple text-xs rounded font-orbitron">
                    YAKINDA
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Bellek yönetimi ve garbage collection verimliliğini detaylı raporlayın.
                </p>
              </div>

              {/* DOM Test Card - Coming Soon */}
              <div className="bg-gradient-to-br from-cyber-dark/40 to-cyber-darker/40 backdrop-blur-sm p-6 rounded-lg border border-neon-green/10 opacity-60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-orbitron text-xl font-bold text-gray-400">
                    📊 DOM Manipulation
                  </h3>
                  <span className="px-2 py-1 bg-gray-600/20 text-gray-500 text-xs rounded font-orbitron">
                    YAKINDA
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  DOM operasyonlarında tarayıcınızın rendering pipeline'ını strese sokun.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Game Performance Estimator (Viral Feature) */}
        <GamePerformanceEstimator 
          gpuTestScore={gpuResults?.totalObjects ?? null}
          cpuTestScore={cpuResults?.score ?? null}
        />

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* FPS Card */}
            <div className="neon-border bg-cyber-dark/80 backdrop-blur-sm p-8 rounded-lg hover:shadow-neon-green transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron text-sm text-gray-400 uppercase tracking-wider">
                  Son Test - GPU
                </h3>
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              </div>
              <p className="font-orbitron text-5xl font-bold text-neon-green mb-2">
                {gpuResults ? gpuResults.totalObjects.toLocaleString() : '—'}
              </p>
              <p className="text-sm text-gray-400">Obje Render</p>
            </div>

            {/* Load Time Card */}
            <div className="neon-border bg-cyber-dark/80 backdrop-blur-sm p-8 rounded-lg hover:shadow-neon-blue transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron text-sm text-gray-400 uppercase tracking-wider">
                  Yükleme Süresi
                </h3>
                <div className="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></div>
              </div>
              <p className="font-orbitron text-5xl font-bold text-electric-blue mb-2">
                {loadTime}
              </p>
              <p className="text-sm text-gray-400">Milisaniye</p>
            </div>

            {/* CPU Score Card */}
            <div className="neon-border bg-cyber-dark/80 backdrop-blur-sm p-8 rounded-lg hover:shadow-neon-purple transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron text-sm text-gray-400 uppercase tracking-wider">
                  Son Test - CPU
                </h3>
                <div className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse"></div>
              </div>
              <p className="font-orbitron text-5xl font-bold text-cyber-purple mb-2">
                {cpuResults ? cpuResults.score.toLocaleString() : '—'}
              </p>
              <p className="text-sm text-gray-400">Puan</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 mt-20 border-t border-neon-green/20">
          <p className="text-center text-gray-500 font-space-mono text-sm">
            Powered by <span className="text-neon-green">React</span> + <span className="text-electric-blue">Vite</span> + <span className="text-cyber-purple">Three.js</span>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
