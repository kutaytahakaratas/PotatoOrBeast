import { useEffect, useRef, useState } from 'react';

interface CPUBenchmarkProps {
  onComplete?: (score: number, duration: number, ops: number) => void;
}

export const CPUBenchmark = ({ onComplete }: CPUBenchmarkProps) => {
  const [status, setStatus] = useState<'ready' | 'running' | 'complete'>('ready');
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [opsPerSec, setOpsPerSec] = useState(0);
  const testResultsRef = useRef<{ test: string; score: number }[]>([]);

  useEffect(() => {
    runBenchmark();
  }, []);

  const runBenchmark = async () => {
    setStatus('running');
    testResultsRef.current = [];
    
    const tests = [
      { name: 'Fibonacci Hesaplama', fn: fibonacciTest, weight: 25 },
      { name: 'Prime Sayı Bulma', fn: primeTest, weight: 25 },
      { name: 'Matrix Çarpımı', fn: matrixTest, weight: 25 },
      { name: 'Sorting Algoritması', fn: sortTest, weight: 25 },
    ];

    let totalProgress = 0;
    const startTime = performance.now();

    for (const test of tests) {
      setCurrentTest(test.name);
      const result = await test.fn();
      testResultsRef.current.push({ test: test.name, score: result });
      setOpsPerSec(Math.round(result));
      totalProgress += test.weight;
      setProgress(totalProgress);
      await new Promise(r => setTimeout(r, 200)); // Brief pause between tests
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Calculate final score (average ops/sec across all tests, scaled)
    const totalOps = testResultsRef.current.reduce((sum, t) => sum + t.score, 0);
    const finalScore = Math.round(totalOps / 1000); // Scale down for readability
    
    setStatus('complete');
    onComplete?.(finalScore, duration, totalOps);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <div className="cyber-grid-bg"></div>
      
      <div className="relative z-10 max-w-2xl w-full">
        <div className="neon-border bg-gradient-to-br from-cyber-dark/95 to-cyber-darker/95 backdrop-blur-md rounded-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-electric-blue to-cyber-purple p-1">
            <div className="bg-cyber-dark px-6 py-4">
              <h2 className="font-orbitron text-xl font-bold text-center text-white uppercase tracking-wider">
                ⚡ CPU Benchmark
              </h2>
            </div>
          </div>

          <div className="p-8">
            {/* Status */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-darker/60 rounded-full">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'running' ? 'bg-electric-blue animate-pulse' : 
                  status === 'complete' ? 'bg-neon-green' : 'bg-gray-500'
                }`}></div>
                <span className="font-space-mono text-sm text-gray-300">
                  {status === 'ready' && 'Hazırlanıyor...'}
                  {status === 'running' && currentTest}
                  {status === 'complete' && 'Tamamlandı!'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-500 mb-2 font-space-mono">
                <span>İlerleme</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-cyber-darker rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-electric-blue via-cyber-purple to-neon-green transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Operations */}
            <div className="text-center mb-8">
              <p className="font-orbitron text-xs text-gray-500 uppercase mb-2">Operasyon/Saniye</p>
              <div className="font-orbitron text-5xl font-bold text-electric-blue">
                {opsPerSec.toLocaleString()}
              </div>
            </div>

            {/* Test List */}
            <div className="space-y-3">
              {testResultsRef.current.map((result, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 bg-cyber-darker/40 rounded-lg border border-neon-green/10"
                >
                  <span className="font-space-mono text-sm text-gray-300">{result.test}</span>
                  <span className="font-orbitron text-sm font-bold text-neon-green">
                    {result.score.toLocaleString()} ops/s
                  </span>
                </div>
              ))}
            </div>

            {/* Test Info */}
            <div className="mt-6 p-3 bg-cyber-darker/30 rounded-lg text-center">
              <p className="font-space-mono text-xs text-gray-500">
                Matematiksel hesaplamalar • Saf JavaScript performansı
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== CPU TEST FUNCTIONS ==========

// Fibonacci recursive (intensive)
const fibonacciTest = (): Promise<number> => {
  return new Promise(resolve => {
    const start = performance.now();
    let iterations = 0;
    
    const fib = (n: number): number => {
      if (n <= 1) return n;
      return fib(n - 1) + fib(n - 2);
    };

    // Run for ~1 second
    while (performance.now() - start < 1000) {
      fib(25);
      iterations++;
    }
    
    const elapsed = (performance.now() - start) / 1000;
    resolve(Math.round(iterations / elapsed));
  });
};

// Prime number calculation
const primeTest = (): Promise<number> => {
  return new Promise(resolve => {
    const start = performance.now();
    let primeCount = 0;
    
    const isPrime = (n: number): boolean => {
      if (n < 2) return false;
      for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    // Find primes for ~1 second
    let num = 2;
    while (performance.now() - start < 1000) {
      if (isPrime(num)) primeCount++;
      num++;
    }
    
    resolve(primeCount);
  });
};

// Matrix multiplication
const matrixTest = (): Promise<number> => {
  return new Promise(resolve => {
    const start = performance.now();
    const size = 50;
    let multiplications = 0;

    const createMatrix = (s: number): number[][] => {
      return Array(s).fill(0).map(() => 
        Array(s).fill(0).map(() => Math.random())
      );
    };

    const multiply = (a: number[][], b: number[][]): number[][] => {
      const result = Array(size).fill(0).map(() => Array(size).fill(0));
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          for (let k = 0; k < size; k++) {
            result[i][j] += a[i][k] * b[k][j];
          }
        }
      }
      return result;
    };

    // Run for ~1 second
    while (performance.now() - start < 1000) {
      const a = createMatrix(size);
      const b = createMatrix(size);
      multiply(a, b);
      multiplications++;
    }
    
    const elapsed = (performance.now() - start) / 1000;
    resolve(Math.round(multiplications * size * size * size / elapsed));
  });
};

// Sorting algorithm test
const sortTest = (): Promise<number> => {
  return new Promise(resolve => {
    const start = performance.now();
    const arraySize = 10000;
    let sortOperations = 0;

    // Run for ~1 second
    while (performance.now() - start < 1000) {
      const arr = Array(arraySize).fill(0).map(() => Math.random());
      arr.sort((a, b) => a - b);
      sortOperations++;
    }
    
    const elapsed = (performance.now() - start) / 1000;
    resolve(Math.round(sortOperations * arraySize / elapsed));
  });
};
