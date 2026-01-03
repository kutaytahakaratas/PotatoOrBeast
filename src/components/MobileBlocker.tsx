import { useEffect, useState } from 'react';

/**
 * useMobileDetect Hook
 * 
 * ONLY checks for MOBILE OPERATING SYSTEMS via UserAgent.
 * Does NOT check screen width - desktop users can resize freely.
 * 
 * Returns true ONLY if device is running:
 * - Android
 * - iOS (iPhone, iPad, iPod)
 * - Windows Phone
 * - BlackBerry
 * - webOS
 * - Opera Mini (mobile browser)
 * 
 * Touchscreen laptops are NOT blocked (they run Windows/macOS/Linux, not mobile OS)
 */
export const useMobileDetect = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobileOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Regex to detect MOBILE OPERATING SYSTEMS only
      // This does NOT trigger on touchscreen laptops (they use Windows/macOS/Linux)
      const mobileOSRegex = /android|webos|iphone|ipad|ipod|blackberry|windows phone|opera mini|iemobile/i;
      
      const isMobileOS = mobileOSRegex.test(userAgent);
      
      setIsMobile(isMobileOS);
    };

    // Check once on mount - no need to listen for resize since we don't check width
    checkMobileOS();
  }, []);

  return isMobile;
};

/**
 * MobileBlocker Component
 * Full-screen cyberpunk-themed restriction screen for mobile users
 */
export const MobileBlocker = () => {
  const isMobile = useMobileDetect();
  const [isVisible, setIsVisible] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (isMobile) {
      // Fade in effect
      setTimeout(() => setIsVisible(true), 100);
      
      // Random glitch effect
      const glitchInterval = setInterval(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }, 3000 + Math.random() * 2000);

      return () => clearInterval(glitchInterval);
    }
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden select-none transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ touchAction: 'none' }}
    >
      {/* === BACKGROUND LAYERS === */}
      
      {/* Neon Grid */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 0, 60, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 60, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridPulse 4s ease-in-out infinite',
        }}
      />
      
      {/* Radial vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)',
        }}
      />

      {/* Scan lines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* === MAIN CONTENT === */}
      <div className={`relative z-10 max-w-lg w-full ${glitchActive ? 'animate-glitch' : ''}`}>
        
        {/* Phone Icon with Prohibition Sign */}
        <div className="relative flex justify-center mb-8">
          {/* Outer glow ring */}
          <div 
            className="absolute w-40 h-40 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,0,60,0.3) 0%, transparent 70%)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
          />
          
          {/* Icon container */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Phone icon */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-20 h-20 drop-shadow-[0_0_20px_rgba(255,0,60,0.8)]"
              style={{ filter: 'drop-shadow(0 0 10px #ff003c)' }}
            >
              <rect 
                x="5" y="1" width="14" height="22" rx="2" 
                fill="none" 
                stroke="#ff003c" 
                strokeWidth="1.5"
              />
              <circle cx="12" cy="20" r="1" fill="#ff003c" />
              <rect x="9" y="3" width="6" height="1" rx="0.5" fill="#ff003c" opacity="0.5" />
            </svg>
            
            {/* Prohibition overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-32 h-32">
                {/* Circle */}
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#ff003c" 
                  strokeWidth="4"
                  style={{ filter: 'drop-shadow(0 0 8px #ff003c)' }}
                />
                {/* Diagonal line */}
                <line 
                  x1="20" y1="80" x2="80" y2="20" 
                  stroke="#ff003c" 
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px #ff003c)' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 
          className="font-orbitron text-2xl sm:text-3xl font-black uppercase tracking-[0.2em] mb-4"
          style={{
            color: '#ff003c',
            textShadow: '0 0 10px #ff003c, 0 0 20px #ff003c, 0 0 40px #ff003c',
          }}
        >
          MOBİL CİHAZ TESPİT EDİLDİ
        </h1>

        {/* Subtitle */}
        <h2 
          className="font-orbitron text-sm sm:text-base font-bold uppercase tracking-widest mb-6"
          style={{
            color: '#ff6b6b',
            textShadow: '0 0 5px #ff003c',
          }}
        >
          ⚠ SİNYAL GÜCÜ YETERSİZ ⚠
        </h2>

        {/* Divider line */}
        <div 
          className="w-full h-[2px] mb-6 mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, #ff003c, transparent)',
            boxShadow: '0 0 10px #ff003c',
          }}
        />

        {/* Description */}
        <p 
          className="font-space-mono text-sm leading-relaxed mb-8 px-4"
          style={{ color: '#8a8a8a' }}
        >
          Bu benchmark testi, mobil cihazların işlem kapasitesini aşan{' '}
          <span style={{ color: '#ff003c', fontWeight: 'bold' }}>
            yüksek performanslı 3D grafikler
          </span>{' '}
          içerir.
          <br /><br />
          Lütfen gerçek gücü görmek için{' '}
          <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
            Bilgisayar (PC)
          </span>{' '}
          ile giriş yapın.
        </p>

        {/* Tech specs box */}
        <div 
          className="border px-4 py-3 mb-8 mx-4"
          style={{
            borderColor: 'rgba(255, 0, 60, 0.3)',
            background: 'rgba(255, 0, 60, 0.05)',
          }}
        >
          <div className="font-space-mono text-xs" style={{ color: '#666' }}>
            <div className="flex justify-between mb-1">
              <span>GEREKLİ:</span>
              <span style={{ color: '#00ff88' }}>DESKTOP x86/x64</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>TESPİT EDİLEN:</span>
              <span style={{ color: '#ff003c' }}>MOBILE ARM</span>
            </div>
            <div className="flex justify-between">
              <span>ERİŞİM:</span>
              <span style={{ color: '#ff003c' }} className="animate-pulse">ENGELLENDİ</span>
            </div>
          </div>
        </div>

        {/* PC Master Race tagline */}
        <p 
          className="font-space-mono text-xs italic tracking-widest"
          style={{
            color: '#444',
            textShadow: '0 0 5px rgba(255, 0, 60, 0.3)',
          }}
        >
          PC Master Race Only.
        </p>

        {/* Decorative bottom line */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 10px #ff003c' }} />
          <span className="font-space-mono text-[10px] uppercase tracking-widest" style={{ color: '#333' }}>
            POTATO OR BEAST • BENCHMARK SUITE
          </span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 10px #ff003c' }} />
        </div>
      </div>

      {/* === CSS KEYFRAMES (inline style tag) === */}
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .animate-glitch {
          animation: glitch 0.15s ease-in-out;
        }
      `}</style>
    </div>
  );
};
