import { useEffect, useState } from 'react';

export const MobileBlocker = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for mobile user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      
      // Check for small screen width (standard mobile breakpoint)
      const isSmallScreen = window.innerWidth < 1024; // Blocking tablets and below intentionally for "PC ONLY" feel

      // We block if it's strictly a mobile device OR if the screen is too narrow
      if (isMobileDevice || isSmallScreen) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Add a small delay for dramatic effect if it is mobile
    if (isMobile) {
      setTimeout(() => setShowWarning(true), 100);
    } else {
        setShowWarning(true); // Immediate update if resizing back to desktop
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden transition-opacity duration-1000 ${showWarning ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Glitch & Grid */}
      <div className="absolute inset-0 cyber-grid-bg opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse"></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-md w-full border-2 border-red-600 bg-black/90 p-8 shadow-[0_0_50px_rgba(220,38,38,0.5)] backdrop-blur-xl">
        
        {/* Warning Icon/Header */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center animate-ping-slow relative">
            <span className="text-6xl absolute animate-none">⚠️</span>
            <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        <h1 className="font-orbitron font-black text-4xl text-red-500 mb-2 tracking-widest uppercase glitch-text" data-text="ERİŞİM ENGELLENDİ">
          ERİŞİM ENGELLENDİ
        </h1>
        
        <div className="h-0.5 w-full bg-red-600 mb-6 shadow-[0_0_10px_#dc2626]"></div>

        <h2 className="font-orbitron text-xl text-white mb-6 font-bold">
          SİSTEM UYUMSUZ
        </h2>

        <p className="font-space-mono text-gray-300 mb-8 leading-relaxed text-sm">
          <span className="text-red-400 font-bold block mb-2">[HATA_KODU: MOBİL_TESPİT_EDİLDİ]</span>
          Bu benchmark, yalnızca yüksek performanslı <span className="text-white font-bold">MASAÜSTÜ (PC)</span> donanımları için tasarlanmıştır. Mobil cihaz mimarisi bu testleri çalıştırmak için yetersizdir.
        </p>

        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded mb-8">
          <p className="font-space-mono text-xs text-red-300">
             GEREKLİ_PLATFORM: MASAÜSTÜ_WIN/MAC/LINUX<br/>
             TESPİT_EDİLEN_PLATFORM: MOBİL_ARM<br/>
             DURUM: <span className="animate-pulse font-bold">KİLİTLENDİ</span>
          </p>
        </div>

        <div className="text-xs font-space-mono text-gray-500 uppercase tracking-widest">
          Potato Or Beast Benchmark Suite
        </div>
      </div>

      {/* Scan lines overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
    </div>
  );
};
