import React, { useRef, useMemo, Component, ReactNode, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float time;
uniform vec4 resolution;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float time;
uniform vec4 resolution;

float PI = 3.141592653589793238;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}

float smin( float a, float b, float k ) {
    k *= 6.0;
    float h = max( k-abs(a-b), 0.0 )/k;
    return min(a,b) - h*h*h*k*(1.0/6.0);
}

float sphereSDF(vec3 p, float r) {
    return length(p) - r;
}

float sdf(vec3 p) {
    vec3 p1 = rotate(p, vec3(0.0, 0.0, 1.0), time/5.0);
    vec3 p2 = rotate(p, vec3(1.), -time/5.0);
    vec3 p3 = rotate(p, vec3(1., 1., 0.), -time/4.5);
    vec3 p4 = rotate(p, vec3(0., 1., 0.), -time/4.0);
    
    float final = sphereSDF(p1 - vec3(-0.5, 0.0, 0.0), 0.35);
    float nextSphere = sphereSDF(p2 - vec3(0.55, 0.0, 0.0), 0.3);
    final = smin(final, nextSphere, 0.1);
    nextSphere = sphereSDF(p2 - vec3(-0.8, 0.0, 0.0), 0.2);
    final = smin(final, nextSphere, 0.1);
    nextSphere = sphereSDF(p3 - vec3(1.0, 0.0, 0.0), 0.15);
    final = smin(final, nextSphere, 0.1);
    nextSphere = sphereSDF(p4 - vec3(0.45, -0.45, 0.0), 0.15);
    final = smin(final, nextSphere, 0.1);
    
    return final;
}

vec3 getNormal(vec3 p) {
    float d = 0.001;
    return normalize(vec3(
        sdf(p + vec3(d, 0.0, 0.0)) - sdf(p - vec3(d, 0.0, 0.0)),
        sdf(p + vec3(0.0, d, 0.0)) - sdf(p - vec3(0.0, d, 0.0)),
        sdf(p + vec3(0.0, 0.0, d)) - sdf(p - vec3(0.0, 0.0, d))
    ));
}

float rayMarch(vec3 rayOrigin, vec3 ray) {
    float t = 0.0;
    for (int i = 0; i < 100; i++) {
        vec3 p = rayOrigin + ray * t;
        float d = sdf(p);
        if (d < 0.001) return t;
        t += d;
        if (t > 100.0) break;
    }
    return -1.0;
}

void main() {
    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    vec3 cameraPos = vec3(0.0, 0.0, 5.0);
    vec3 ray = normalize(vec3((vUv - vec2(0.5)) * resolution.zw, -1));
    
    float t = rayMarch(cameraPos, ray);
    if (t > 0.0) {
        vec3 p = cameraPos + ray * t;
        vec3 normal = getNormal(p);
        float fresnel = pow(1.0 + dot(ray, normal), 3.0);
        
        // Create colorful gradient
        vec3 color1 = vec3(0.6, 0.2, 1.0);  // Purple
        vec3 color2 = vec3(1.0, 0.3, 0.6);  // Pink
        vec3 color3 = vec3(1.0, 0.5, 0.2);  // Orange
        vec3 color4 = vec3(0.4, 0.6, 1.0);  // Blue
        
        // Mix colors based on position and time
        vec3 mixedColor = mix(color1, color2, sin(p.x * 2.0 + time) * 0.5 + 0.5);
        mixedColor = mix(mixedColor, color3, sin(p.y * 2.0 + time * 1.2) * 0.5 + 0.5);
        mixedColor = mix(mixedColor, color4, sin(p.z * 2.0 + time * 0.8) * 0.5 + 0.5);
        
        vec3 finalColor = mixedColor * fresnel * 1.5;
        gl_FragColor = vec4(finalColor, 0.9);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
`;

function LavaLampShader() {
  const meshRef = useRef();
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    resolution: { value: new THREE.Vector4() }
  }), []);

  React.useEffect(() => {
    const { width, height } = size;
    const imageAspect = 1;
    let a1, a2;
    
    if (height / width > imageAspect) {
      a1 = (width / height) * imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = (height / width) / imageAspect;
    }
    
    uniforms.resolution.value.set(width, height, a1, a2);
  }, [size, uniforms]);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[5, 5]} />
      <shaderMaterial
        args={[{
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true
        }]}
      />
    </mesh>
  );
}

// Gradient fallback for when WebGL is not available
const GradientBackground: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={className}
    style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(262, 83%, 40%) 50%, hsl(262, 83%, 25%) 100%)',
      position: 'absolute',
    }}
  />
);

// Robust WebGL detection that actually tests context creation
const checkWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    // Try to get WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return false;
    
    // Additional check: verify the context is actually usable
    // Some browsers report having WebGL but it's disabled/broken
    if (gl instanceof WebGLRenderingContext) {
      // Check if we can create a simple shader program
      const shader = gl.createShader(gl.VERTEX_SHADER);
      if (!shader) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return false;
      }
      gl.deleteShader(shader);
      
      // Clean up
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

// Error Boundary to catch any remaining WebGL runtime errors
interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    // Silently handle WebGL errors
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const LavaLamp: React.FC<{ className?: string }> = ({ className }) => {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Check WebGL support on mount
    const supported = checkWebGLSupport();
    setWebGLSupported(supported);
  }, []);

  // Show fallback while checking or if not supported
  if (webGLSupported === null || webGLSupported === false) {
    return <GradientBackground className={className} />;
  }

  return (
    <WebGLErrorBoundary fallback={<GradientBackground className={className} />}>
      <div style={{ width: '100%', height: '100%', background: 'transparent', position: "absolute" }}>
        <Canvas
          fallback={<GradientBackground className={className} />}
          camera={{
            left: -0.5,
            right: 0.5,
            top: 0.5,
            bottom: -0.5,
            near: -1000,
            far: 1000,
            position: [0, 0, 2]
          }}
          orthographic
          gl={{ antialias: true, alpha: true }}
        >
          <LavaLampShader />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
