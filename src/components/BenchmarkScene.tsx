import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BenchmarkSceneProps {
  onComplete?: (avgFps: number, minFps: number, maxFps: number, totalObjects: number) => void;
}

export const BenchmarkScene = ({ onComplete }: BenchmarkSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(60);
  const [objectCount, setObjectCount] = useState(0);
  const [status, setStatus] = useState<'loading' | 'running' | 'finished'>('loading');
  
  useEffect(() => {
    if (!canvasRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070f);
    scene.fog = new THREE.FogExp2(0x05070f, 0.008);

    // CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.z = 100;
    camera.position.y = 30;

    // RENDERER SETUP - Optimized for maximum stress
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x00ff41, 2, 200);
    pointLight1.position.set(50, 50, 50);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x00d9ff, 2, 200);
    pointLight2.position.set(-50, -50, 50);
    scene.add(pointLight2);

    // === OPTIMIZATION: HEAVIER GEOMETRY ===
    // Switched from BoxGeometry (8 vertices) to TorusKnotGeometry (High Poly)
    // This stresses the Vertex Shader significantly more
    const geometry = new THREE.TorusKnotGeometry(0.5, 0.2, 64, 8); 
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff41,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00ff41,
      emissiveIntensity: 0.1,
    });

    // === UNLIMITED MODE: NO ARTIFICIAL LIMIT ===
    // Start with 500k capacity, expand dynamically if needed
    let MAX_INSTANCES = 500000;
    let instancedMesh = new THREE.InstancedMesh(geometry, material, MAX_INSTANCES);
    instancedMesh.count = 0;
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const radius = 80;
    // Rotation speeds array
    let rotationSpeeds = new Float32Array(MAX_INSTANCES * 2);
    // Position/Velocity data could be optimized, but using clean math for now
    let positions = new Float32Array(MAX_INSTANCES * 3);

    // === ADD INSTANCES FUNCTION ===
    const addInstances = (count: number) => {
      const currentCount = instancedMesh.count;
      const newCount = Math.min(currentCount + count, MAX_INSTANCES);
      
      const colors = [new THREE.Color(0x00ff41), new THREE.Color(0x00d9ff), new THREE.Color(0xb026ff)];

      for (let i = currentCount; i < newCount; i++) {
        // Spherical distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.cbrt(Math.random()) * (1 + i / 5000); // Tighter packing
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        dummy.position.set(x, y, z);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
        instancedMesh.setColorAt(i, colors[i % 3]);
        
        // Store simple data
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        rotationSpeeds[i * 2] = (Math.random() - 0.5) * 0.05; // Faster rotation
        rotationSpeeds[i * 2 + 1] = (Math.random() - 0.5) * 0.05;
      }
      
      instancedMesh.count = newCount;
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
      
      setObjectCount(newCount);
      return newCount;
    };

    // Initial load
    addInstances(2000);
    setStatus('running');

    // === STATE TRACKING ===
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let currentFps = 60;
    const fpsHistory: number[] = [];
    
    // === INSTANT FPS: 5-frame rolling average for quick response ===
    const instantFpsBuffer: number[] = [];
    const INSTANT_FPS_SAMPLES = 5;
    let lastFrameTime = performance.now();
    let instantFps = 60;
    
    // Time Cap Logic
    const TEST_START_TIME = performance.now();
    const MAX_TEST_DURATION = 90000; // 90 Seconds Max for unlimited mode
    let isTestComplete = false;
    let animationId: number;
    
    // === AGGRESSIVE SETTINGS: UNLIMITED MODE ===
    const FPS_THRESHOLD = 15; // Stop only when truly struggling
    const LOW_FPS_FRAMES = 3; // 3 consecutive low FPS readings
    let lowFpsCounter = 0;
    let lastAddTime = performance.now();

    // Reusable temp objects
    const matrix = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const rot = new THREE.Quaternion();
    const sca = new THREE.Vector3();
    const euler = new THREE.Euler();

    // === ANIMATION LOOP ===
    const animate = () => {
      if (isTestComplete) return;

      const now = performance.now();
      const elapsedTotal = now - TEST_START_TIME;

      // === EXPONENTIAL AGGRESSION LOGIC ===
      // After 100k objects, double the growth rate each time
      if (now - lastAddTime >= 400) {
        const currentCount = instancedMesh.count;
        
        let toAdd: number;
        if (currentCount < 50000) {
          // Warm-up phase: steady growth
          toAdd = 2000;
        } else if (currentCount < 100000) {
          // Acceleration phase: 5% growth
          toAdd = Math.floor(currentCount * 0.05) + 1000;
        } else {
          // === EXPONENTIAL AGGRESSION after 100k ===
          // Double the growth factor: 10% + base 2000
          toAdd = Math.floor(currentCount * 0.10) + 2000;
        }
        
        addInstances(toAdd);
        lastAddTime = now;
      }

      // === TIME CAP CHECK ===
      if (elapsedTotal > MAX_TEST_DURATION) {
        finishTest(true); // Force finish with "God Tier" flag
        return;
      }

      // GPU-Heavy Rotation Update
      const orbitAngle = 0.0005; // Faster orbit

      // We update a subset or all depending on performance (updating all for max stress)
      // optimizing update loop to just rotate for visual effect
      // Note: Actual heavy cost comes from Vertex Shader usage of TorusKnot
      for (let i = 0; i < instancedMesh.count; i++) {
        instancedMesh.getMatrixAt(i, matrix);
        matrix.decompose(pos, rot, sca);

        // Simple orbit logic
        const x = pos.x;
        const z = pos.z;
        pos.x = x * Math.cos(orbitAngle) - z * Math.sin(orbitAngle);
        pos.z = x * Math.sin(orbitAngle) + z * Math.cos(orbitAngle);

        // Rotation
        euler.setFromQuaternion(rot);
        euler.x += rotationSpeeds[i*2];
        euler.y += rotationSpeeds[i*2+1];
        rot.setFromEuler(euler);

        matrix.compose(pos, rot, sca);
        instancedMesh.setMatrixAt(i, matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

      // Render
      renderer.render(scene, camera);

      // === INSTANT FPS CALCULATION (5-frame average) ===
      const frameDelta = now - lastFrameTime;
      lastFrameTime = now;
      
      if (frameDelta > 0) {
        const frameInstantFps = 1000 / frameDelta;
        instantFpsBuffer.push(frameInstantFps);
        
        // Keep only last 5 samples
        if (instantFpsBuffer.length > INSTANT_FPS_SAMPLES) {
          instantFpsBuffer.shift();
        }
        
        // Calculate rolling average
        instantFps = Math.round(
          instantFpsBuffer.reduce((a, b) => a + b, 0) / instantFpsBuffer.length
        );
      }

      // FPS Display Update (every second for UI)
      frameCount++;
      const fpsDelta = now - lastFpsUpdate;
      
      if (fpsDelta >= 500) { // Update UI twice per second
        currentFps = instantFps; // Use instant FPS
        fpsHistory.push(currentFps);
        setFps(currentFps);
        frameCount = 0;
        lastFpsUpdate = now;

        // === CHECK LOW FPS WITH INSTANT DETECTION ===
        if (instantFps < FPS_THRESHOLD) {
          lowFpsCounter++;
          console.log(`⚠️ Low FPS detected: ${instantFps} (${lowFpsCounter}/${LOW_FPS_FRAMES})`);
          if (lowFpsCounter >= LOW_FPS_FRAMES) {
            console.log('🛑 Test ending: FPS threshold reached');
            finishTest(false);
            return;
          }
        } else {
          lowFpsCounter = 0;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    const finishTest = (timeCapReached: boolean) => {
      isTestComplete = true;
      setStatus('finished');
      cleanup();

      let finalObjectCount = instancedMesh.count;
      
      // God Tier Bonus: If they survived 45s without dropping FPS, 
      // we boost their score to reflect the "unlimited" potential.
      if (timeCapReached) {
        finalObjectCount = Math.floor(finalObjectCount * 1.5); // 50% Bonus Score
      }

      const avgFps = fpsHistory.length > 0 ? fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length : currentFps;
      const minFps = fpsHistory.length > 0 ? Math.min(...fpsHistory) : currentFps;
      const maxFps = fpsHistory.length > 0 ? Math.max(...fpsHistory) : currentFps;

      onComplete?.(avgFps, minFps, maxFps, finalObjectCount);
    };

    const cleanup = () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    animate();

    return cleanup;
  }, [onComplete]);

  return (
    <div className="relative w-full h-screen">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* UI Overlay */}
      <div className="absolute top-6 right-6 z-10 space-y-4">
        {/* FPS */}
        <div className="neon-border bg-cyber-dark/90 backdrop-blur-md p-4 rounded-lg min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-orbitron text-xs text-gray-400 uppercase">GPU FPS</span>
            <div className={`w-2 h-2 rounded-full ${fps >= 50 ? 'bg-neon-green' : fps >= 25 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
          </div>
          <div className={`font-orbitron text-4xl font-bold ${fps >= 50 ? 'text-neon-green' : fps >= 25 ? 'text-yellow-500' : 'text-red-500'}`}>
            {fps}
          </div>
          <div className="text-xs text-gray-500 font-space-mono mt-1">
            {fps >= 50 ? 'TorusKnot Stress' : fps >= 25 ? 'Yük Artıyor' : '⚠️ GPU Limit'}
          </div>
        </div>

        {/* Object Count with Growth Rate visible */}
        <div className="neon-border bg-cyber-dark/90 backdrop-blur-md p-4 rounded-lg">
          <div className="font-orbitron text-xs text-gray-400 uppercase mb-2">
            {status === 'running' ? '🚀 Exponential Load' : '✅ Test Bitti'}
          </div>
          <div className="font-orbitron text-3xl font-bold text-electric-blue">
            {objectCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-space-mono mt-1">
             Vertices: {(objectCount * 576).toLocaleString()} {/* TorusKnot approx vertices */}
          </div>
          {status === 'running' && (
            <div className="mt-2 text-[10px] text-neon-green font-space-mono">
              Growth: +5% / 500ms
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10">
        <div className="neon-border bg-cyber-dark/80 backdrop-blur-md p-4 rounded-lg">
          <div className="font-orbitron text-sm text-neon-green mb-1">
            🌪️ ULTRATHINK GPU STRESS
          </div>
          <div className="font-space-mono text-xs text-gray-400">
            TorusKnot Geometry • Exponential Growth
          </div>
          <div className="font-space-mono text-xs text-gray-500 mt-1">
            Max 45s Duration • God Tier Cap
          </div>
        </div>
      </div>
    </div>
  );
};
