import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BubbleProps {
  initialPosition: [number, number, number];
  radius: number;
  speed: number;
  allBubbles: React.MutableRefObject<THREE.Mesh[]>;
  index: number;
  colorType: number;
}

const Bubble: React.FC<BubbleProps> = ({ initialPosition, radius, speed, allBubbles, index, colorType }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const time = useRef(Math.random() * 100);
  const baseRadius = useRef(radius);
  const sizePhase = useRef(Math.random() * Math.PI * 2);
  const sizeSpeed = useRef(0.1 + Math.random() * 0.15);
  const velocity = useRef({
    x: (Math.random() - 0.5) * 0.01,
    y: (Math.random() - 0.5) * 0.01,
    z: (Math.random() - 0.5) * 0.005,
  });

  const material = useMemo(() => {
    // Color variations: 0=dark purple, 1=pink/magenta, 2=orange, 3=blue/teal
    let coreR = 0.25, coreG = 0.1, coreB = 0.5;
    let edgeR = 0.8, edgeG = 0.4, edgeB = 1.0;
    
    if (colorType === 1) {
      // Pink/magenta - brighter
      coreR = 0.5; coreG = 0.12; coreB = 0.35;
      edgeR = 1.0; edgeG = 0.45; edgeB = 0.75;
    } else if (colorType === 2) {
      // Orange - brighter and more vibrant
      coreR = 0.85; coreG = 0.4; coreB = 0.15;
      edgeR = 1.0; edgeG = 0.65; edgeB = 0.3;
    } else if (colorType === 3) {
      coreR = 0.05; coreG = 0.15; coreB = 0.35;
      edgeR = 0.15; edgeG = 0.55; edgeB = 0.85;
    }

    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        fusionFactor: { value: 0 },
        coreColor: { value: new THREE.Vector3(coreR, coreG, coreB) },
        edgeColor: { value: new THREE.Vector3(edgeR, edgeG, edgeB) },
        deformTime: { value: Math.random() * 100 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float fusionFactor;
        uniform vec3 coreColor;
        uniform vec3 edgeColor;
        void main() {
          float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          
          vec3 finalColor = mix(coreColor, edgeColor, fresnel * (1.0 + fusionFactor * 0.5));
          float alpha = 0.9;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: false,
    });
  }, [colorType]);

  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(1, 48, 48);
  }, []);

  useEffect(() => {
    if (mesh.current) {
      allBubbles.current[index] = mesh.current;
    }
  }, [allBubbles, index]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    time.current += delta * speed;

    const pos = mesh.current.position;
    pos.x += velocity.current.x + Math.sin(time.current * 0.4) * 0.002;
    pos.y += velocity.current.y + Math.cos(time.current * 0.25) * 0.003;
    pos.z += velocity.current.z;

    if (Math.abs(pos.x) > 12) velocity.current.x *= -1;
    if (Math.abs(pos.y) > 7) velocity.current.y *= -1;
    if (pos.z > 1 || pos.z < -12) velocity.current.z *= -1;

    // Check for nearby bubbles and create fusion effect
    let fusionScale = 0;
    for (let i = 0; i < allBubbles.current.length; i++) {
      if (i === index || !allBubbles.current[i]) continue;
      const other = allBubbles.current[i];
      const dist = pos.distanceTo(other.position);
      const combinedRadius = (baseRadius.current + 1.5) * 1.5;
      
      if (dist < combinedRadius) {
        fusionScale += Math.max(0, 1 - dist / combinedRadius) * 0.3;
      }
    }

    // Slow random size pulsing
    const sizePulse = Math.sin(time.current * sizeSpeed.current + sizePhase.current) * 0.15;
    const scale = baseRadius.current * (1 + sizePulse + fusionScale);
    mesh.current.scale.setScalar(scale);
    
    // Update fusion factor and deform time in shader
    (material.uniforms.fusionFactor as any).value = fusionScale;
    (material.uniforms.deformTime as any).value = time.current * 0.3;
  });

  return (
    <mesh
      ref={mesh}
      position={initialPosition}
      geometry={geometry}
      material={material}
    />
  );
};

interface BubbleClusterProps {
  count?: number;
}

const FIXED_BUBBLES: Array<{
  id: number;
  position: [number, number, number];
  radius: number;
  speed: number;
  colorType: number;
}> = [
  { id: 0, position: [-5, 2, -3], radius: 3.5, speed: 0.12, colorType: 0 },   // large purple
  { id: 1, position: [4, -1, -5], radius: 2.2, speed: 0.18, colorType: 1 },    // medium pink
  { id: 2, position: [7, 3, -4], radius: 4.0, speed: 0.1, colorType: 2 },      // extra large orange
  { id: 3, position: [-3, -3, -6], radius: 1.5, speed: 0.22, colorType: 3 },   // small blue
  { id: 4, position: [1, 1, -7], radius: 2.8, speed: 0.15, colorType: 0 },     // medium-large purple
];

const BubbleCluster: React.FC<BubbleClusterProps> = () => {
  const allBubbles = useRef<THREE.Mesh[]>([]);

  const bubbles = useMemo(() => FIXED_BUBBLES, []);

  return (
    <>
      {bubbles.map((bubble, index) => (
        <Bubble
          key={bubble.id}
          initialPosition={bubble.position}
          radius={bubble.radius}
          speed={bubble.speed}
          allBubbles={allBubbles}
          index={index}
          colorType={bubble.colorType}
        />
      ))}
    </>
  );
};

const WhiteBackground: React.FC = () => (
  <div className="absolute inset-0 bg-white" />
);

const Scene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-10, -10, 5]} intensity={0.4} color="#f84b91" />

      <BubbleCluster />
    </>
  );
};

const checkWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl !== null;
  } catch (e) {
    return false;
  }
};

export const ThreeHeroBackground: React.FC = () => {
  const [shouldRender, setShouldRender] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const webglSupported = checkWebGLSupport();
    setHasWebGL(webglSupported);

    if (!webglSupported) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const loadScene = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(
          () => setShouldRender(true),
          { timeout: 2000 }
        );
      } else {
        setTimeout(() => setShouldRender(true), 300);
      }
    };

    if (document.readyState === 'complete') {
      setTimeout(loadScene, 200);
    } else {
      window.addEventListener('load', () => setTimeout(loadScene, 200));
    }
  }, []);

  if (!hasWebGL || !shouldRender) {
    return <WhiteBackground />;
  }

  return (
    <Suspense fallback={<WhiteBackground />}>
      <div className="absolute inset-0">
        <WhiteBackground />
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          <Scene />
        </Canvas>
      </div>
    </Suspense>
  );
};

export default ThreeHeroBackground;
