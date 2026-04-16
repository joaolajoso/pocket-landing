import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ThreeLavaLampProps {
  colors?: string[];
  className?: string;
  style?: React.CSSProperties;
}

interface LavaLampMeshProps {
  material: THREE.ShaderMaterial;
}

const LavaLampMesh = ({ material }: LavaLampMeshProps) => {
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime * 0.4;
  });

  return (
    <mesh material={material}>
      <planeGeometry args={[10, 10]} />
    </mesh>
  );
};

const ThreeLavaLamp = ({ 
  colors = ["#7c3aed", "#a855f7", "#f97316", "#ea580c"],
  className,
  style 
}: ThreeLavaLampProps) => {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        varying vec2 vUv;

        // Smooth minimum for metaball blending
        float smin(float a, float b, float k) {
          float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
          return mix(b, a, h) - k * h * (1.0 - h);
        }

        // Circle SDF
        float sdCircle(vec2 p, vec2 center, float radius) {
          return length(p - center) - radius;
        }

        void main() {
          vec2 uv = vUv;
          float time = uTime;
          
          // Create metaballs with smooth movement
          float blob1 = sdCircle(uv, vec2(0.2 + sin(time * 0.7) * 0.3, 0.2 + cos(time * 0.5) * 0.3), 0.15 + sin(time * 0.8) * 0.02);
          float blob2 = sdCircle(uv, vec2(0.8 + cos(time * 0.6) * 0.25, 0.7 + sin(time * 0.4) * 0.25), 0.18 + cos(time * 0.6) * 0.02);
          float blob3 = sdCircle(uv, vec2(0.5 + sin(time * 0.5 + 1.0) * 0.35, 0.8 + cos(time * 0.7 + 2.0) * 0.2), 0.12 + sin(time * 0.9) * 0.02);
          float blob4 = sdCircle(uv, vec2(0.3 + cos(time * 0.8 + 3.0) * 0.3, 0.5 + sin(time * 0.6 + 1.5) * 0.3), 0.16 + cos(time * 0.7) * 0.02);
          float blob5 = sdCircle(uv, vec2(0.7 + sin(time * 0.4 + 2.0) * 0.25, 0.3 + cos(time * 0.5 + 0.5) * 0.25), 0.14 + sin(time * 1.1) * 0.02);
          float blob6 = sdCircle(uv, vec2(0.15 + cos(time * 0.55 + 1.0) * 0.2, 0.6 + sin(time * 0.45 + 2.5) * 0.3), 0.13 + cos(time * 0.85) * 0.02);

          // Merge blobs using smooth minimum
          float k = 0.15; // Smoothness for organic blending
          float blobs = blob1;
          blobs = smin(blobs, blob2, k);
          blobs = smin(blobs, blob3, k);
          blobs = smin(blobs, blob4, k);
          blobs = smin(blobs, blob5, k);
          blobs = smin(blobs, blob6, k);
          
          // Create sharp blob edges with slight glow
          float blobMask = 1.0 - smoothstep(-0.02, 0.02, blobs);
          float blobGlow = 1.0 - smoothstep(-0.02, 0.15, blobs);
          
          // Background gradient
          vec3 bgColor = mix(uColor1, uColor2, uv.y * 0.8 + sin(uv.x * 3.0 + time * 0.2) * 0.1);
          
          // Blob color with internal gradient
          float internalGradient = smoothstep(0.0, 0.3, -blobs);
          vec3 blobColor = mix(uColor3, uColor4, internalGradient + sin(time * 0.5) * 0.2);
          
          // Add subtle highlight to blobs
          float highlight = smoothstep(0.1, 0.0, blobs + 0.05) * 0.3;
          blobColor += highlight;
          
          // Combine background and blobs
          vec3 color = mix(bgColor, blobColor, blobMask);
          
          // Add subtle glow around blobs
          color = mix(color, blobColor * 0.7, blobGlow * 0.3 * (1.0 - blobMask));
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(colors[0]) },
        uColor2: { value: new THREE.Color(colors[1]) },
        uColor3: { value: new THREE.Color(colors[2]) },
        uColor4: { value: new THREE.Color(colors[3]) },
      },
    });
  }, [colors]);

  return (
    <div className={className} style={{ width: "100%", height: "100%", ...style }}>
      <Canvas
        camera={{ position: [0, 0, 1.5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <LavaLampMesh material={shaderMaterial} />
      </Canvas>
    </div>
  );
};

export default ThreeLavaLamp;
