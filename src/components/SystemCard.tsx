import { useEffect, useState } from 'react';
import { getSystemSpecs, type SystemSpecs } from '../utils/systemDetection';

export const SystemCard = () => {
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpecs = async () => {
      setLoading(true);
      try {
        const systemSpecs = await getSystemSpecs();
        setSpecs(systemSpecs);
      } catch (error) {
        console.error('Failed to load system specs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpecs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto neon-border bg-cyber-dark/80 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex flex-row items-center justify-center space-x-3">
          <div className="relative w-6 h-6">
            {/* Spinning loader */}
            <div className="absolute inset-0 border-2 border-neon-green/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-neon-green rounded-full animate-spin"></div>
          </div>
          <p className="font-orbitron text-xs text-neon-green uppercase tracking-wider animate-pulse">
            Sistem Taranıyor...
          </p>
        </div>
      </div>
    );
  }

  if (!specs) {
    return (
      <div className="max-w-6xl mx-auto neon-border bg-cyber-dark/80 backdrop-blur-sm p-4 rounded-lg">
        <p className="font-orbitron text-center text-red-500 text-sm">
          ⚠️ Sistem bilgileri alınamadı
        </p>
      </div>
    );
  }

  const specItems = [
    {
      icon: '🎮',
      label: 'GPU',
      value: specs.gpu,
      color: 'text-neon-green',
      borderColor: 'border-neon-green/20',
    },
    {
      icon: '⚡',
      label: 'CPU',
      value: typeof specs.cpuCores === 'number' ? `${specs.cpuCores} Mantıksal Çekirdek` : specs.cpuCores,
      color: 'text-electric-blue',
      borderColor: 'border-electric-blue/20',
    },
    {
      icon: '🧠',
      label: 'RAM',
      value: specs.ram,
      color: 'text-cyber-purple',
      borderColor: 'border-cyber-purple/20',
    },
    {
      icon: '🖥️',
      label: 'Çözünürlük',
      value: specs.screenResolution,
      color: 'text-neon-green',
      borderColor: 'border-neon-green/20',
    },
    {
      icon: '🌐',
      label: 'Tarayıcı',
      value: specs.browser,
      color: 'text-electric-blue',
      borderColor: 'border-electric-blue/20',
    },
    {
      icon: '💻',
      label: 'Platform',
      value: specs.platform,
      color: 'text-cyber-purple',
      borderColor: 'border-cyber-purple/20',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto neon-border bg-gradient-to-br from-cyber-dark/90 to-cyber-darker/90 backdrop-blur-sm rounded-lg overflow-hidden my-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-neon-green/5 to-electric-blue/5 py-6 px-8 border-b border-neon-green/10 flex items-center justify-between">
        <h2 className="font-orbitron text-lg font-bold neon-text flex items-center gap-4">
          <span className="text-3xl">🔍</span>
          SİSTEM KİMLİK KARTI
        </h2>
        <div className="flex items-center gap-3 text-sm text-gray-500 font-space-mono">
          <div className="w-2.5 h-2.5 bg-neon-green rounded-full animate-pulse"></div>
          <span>Tespit Edildi</span>
        </div>
      </div>

      {/* Specs Grid */}
      <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-5">
        {specItems.map((item, index) => (
          <div
            key={item.label}
            className={`bg-cyber-darker/50 p-6 rounded-lg border ${item.borderColor} hover:border-opacity-60 transition-all duration-300 group`}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: 'slideInUp 0.3s ease-out forwards',
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300 mt-1">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="font-orbitron text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className={`font-space-mono text-sm md:text-base font-bold ${item.color} truncate`} title={item.value}>
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Keyframe for slide-in animation (add to index.css later)
