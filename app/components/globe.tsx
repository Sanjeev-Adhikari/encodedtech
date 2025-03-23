"use client";
import { useRef, useState, useMemo, useEffect, JSX } from "react";
import * as THREE from "three";
import { Canvas, useFrame, extend  } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Custom shader for glowing data paths
class DataPathMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color("#39ff14") }, // Neon green
        pulseColor: { value: new THREE.Color("#00ffff") }, // Blue
        flowSpeed: { value: 1.0 },
        flowIntensity: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying float vDistance;
        attribute float lineIndex;
        uniform float time;
        
        void main() {
          vPosition = position;
          vDistance = lineIndex;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 pulseColor;
        uniform float flowSpeed;
        uniform float flowIntensity;
        varying vec3 vPosition;
        varying float vDistance;
        
        void main() {
          float flow = fract(vDistance * 0.05 - time * flowSpeed);
          float pulse = pow(1.0 - abs(flow * 2.0 - 1.0), 5.0) * flowIntensity;
          vec3 finalColor = mix(baseColor, pulseColor, pulse);
          float glow = 0.8 + 0.2 * sin(time * 2.0 + vDistance);
          gl_FragColor = vec4(finalColor, (0.3 + pulse * 0.7) * glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }
}

// Custom shader for node points
class NodeMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color("#39ff14") }, // Neon green
        pulseColor: { value: new THREE.Color("#00ffff") }, // Blue
        connectionCount: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform vec3 pulseColor;
        uniform float connectionCount;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float dist = length(vUv - vec2(0.5));
          float glow = smoothstep(0.5, 0.2, dist);
          float pulse = 0.6 + 0.4 * sin(time * (1.0 + connectionCount * 0.2));
          float core = smoothstep(0.15, 0.0, dist);
          vec3 finalColor = mix(color, pulseColor, core * pulse);
          gl_FragColor = vec4(finalColor, glow * pulse);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }
}

// Custom shader for the globe hologram
class HologramMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color("#0066ff") }, // Blue
        highlightColor: { value: new THREE.Color("#39ff14") }, // Neon green
        scanningLine: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor;
        uniform vec3 highlightColor;
        uniform float scanningLine;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          float gridX = abs(fract(vPosition.x * 20.0 - 0.5) - 0.5);
          float gridY = abs(fract(vPosition.y * 20.0 - 0.5) - 0.5);
          float gridZ = abs(fract(vPosition.z * 20.0 - 0.5) - 0.5);
          float grid = min(min(gridX, gridY), gridZ);
          grid = smoothstep(0.05, 0.0, grid) * 0.5;
          float scan = smoothstep(0.1, 0.0, abs(vPosition.y - scanningLine)) * 0.5;
          vec3 finalColor = mix(baseColor, highlightColor, fresnel * 0.5 + grid + scan);
          float alpha = 0.3 + 0.1 * sin(time * 3.0) + fresnel * 0.6 + grid + scan;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      wireframe: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }   
}

// Custom material for background grid lines
class BackgroundGridMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        primaryColor: { value: new THREE.Color("#0066ff") },
        secondaryColor: { value: new THREE.Color("#39ff14") }, 
        gridScale: { value: 15.0 },
        pulseSpeed: { value: 0.5 },
        fadeDistance: { value: 20.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 primaryColor;
        uniform vec3 secondaryColor;
        uniform float gridScale;
        uniform float pulseSpeed;
        uniform float fadeDistance;
        varying vec2 vUv;
        
        float grid(vec2 uv, float size) {
          vec2 grid = fract(uv * size);
          return (step(0.98, grid.x) + step(0.98, grid.y)) * 0.5;
        }
        
        float falloff(float dist, float limit) {
          return smoothstep(limit, 0.0, dist);
        }
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }
        
        void main() {
          vec2 uv = vUv * 2.0 - 1.0;
          uv.x *= resolution.x / resolution.y;
          float dist = length(uv);
          float basegrid = grid(uv, gridScale);
          float animGrid = grid(uv + sin(time * 0.2) * 0.1, gridScale * 0.5);
          vec2 flowDirection = normalize(uv + vec2(cos(time * 0.1), sin(time * 0.1)) * 0.5);
          float flow = sin(dot(uv, flowDirection) * 5.0 + time * pulseSpeed) * 0.5 + 0.5;
          float wave1 = 0.5 + 0.5 * sin(uv.x * 10.0 + time * 0.3);
          float wave2 = 0.5 + 0.5 * sin(uv.y * 8.0 - time * 0.2);
          float waves = wave1 * wave2 * 0.15;
          float noiseVal = noise((uv + vec2(time * 0.05)) * 3.0) * 0.3;
          float connections = max(0.0, 1.0 - 10.0 * abs(dist - (0.4 + 0.2 * sin(time * 0.1 + uv.x * 2.0))));
          connections *= 0.3 * (0.5 + 0.5 * sin(atan(uv.y, uv.x) * 20.0 + time));
          float pulse = smoothstep(0.02, 0.0, abs(dist - mod(time * 0.2, 1.0)));
          float distFalloff = falloff(dist, fadeDistance);
          float finalIntensity = (basegrid * 0.3 + animGrid * 0.2 + waves + noiseVal + connections + pulse * 0.5) * distFalloff;
          vec3 finalColor = mix(primaryColor, secondaryColor, finalIntensity + flow * 0.3);
          gl_FragColor = vec4(finalColor, finalIntensity * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }
}

// Register custom materials
extend({ DataPathMaterial, NodeMaterial, HologramMaterial, BackgroundGridMaterial });

// Update your type declaration to properly type the custom materials
// Properly type the extended elements
declare module "@react-three/fiber" {
  interface ThreeElements {
    dataPathMaterial: JSX.IntrinsicElements['mesh'] 
    nodeMaterial: JSX.IntrinsicElements['mesh'] & {
      color?: THREE.Color;
      pulseColor?: THREE.Color;
      connectionCount?: number;
    };
    hologramMaterial: JSX.IntrinsicElements['mesh'] 
    backgroundGridMaterial: JSX.IntrinsicElements['mesh'] & {
      primaryColor?: THREE.Color;
      secondaryColor?: THREE.Color;
    };
  }
}
// Advanced network with data flow
const FuturisticNetwork = () => {
  const networkRef = useRef<THREE.Group>(null);
  const dataPathMaterialRef = useRef<DataPathMaterial>(null);
  const nodeMaterialRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const nodeCount = 280;
  const connectionRadius = 6.0;
  const maxConnections = 10;

  // Create nodes and connections
  const { nodes, connections, lineIndices } = useMemo(() => {
    const nodesArray = [];
    const connectionsArray = [];
    const lineIndicesArray = [];
    let lineIndexCounter = 0;
    
    // Generate nodes in a spherical distribution
    for (let i = 0; i < nodeCount; i++) {
      const radius = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      nodesArray.push({
        position: new THREE.Vector3(x, y, z),
        connections: 0,
        importance: Math.random(),
        speed: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      });
    }
    
    // Create connections between nodes
    for (let i = 0; i < nodeCount; i++) {
      const nodeA = nodesArray[i];
      
      const neighbors = [];
      for (let j = 0; j < nodeCount; j++) {
        if (i !== j) {
          const nodeB = nodesArray[j];
          const distance = nodeA.position.distanceTo(nodeB.position);
          if (distance < connectionRadius) {
            neighbors.push({ index: j, distance });
          }
        }
      }
      
      neighbors.sort((a, b) => a.distance - b.distance);
      const connectionsToCreate = Math.min(
        Math.floor(1 + nodeA.importance * maxConnections),
        neighbors.length
      );
      
      for (let k = 0; k < connectionsToCreate; k++) {
        const j = neighbors[k].index;
        if (j > i) {
          connectionsArray.push({ from: i, to: j });
          lineIndicesArray.push(lineIndexCounter++);
          nodesArray[i].connections++;
          nodesArray[j].connections++;
        }
      }
    }
    
    return { nodes: nodesArray, connections: connectionsArray, lineIndices: lineIndicesArray };
  }, []);

  // Create line geometry for connections
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(connections.length * 6);
    const indices = new Uint16Array(connections.length * 2);
    const lineIndexAttribute = new Float32Array(connections.length * 6);
    
    connections.forEach((connection, i) => {
      const fromPos = nodes[connection.from].position;
      const toPos = nodes[connection.to].position;
      
      positions[i * 6] = fromPos.x;
      positions[i * 6 + 1] = fromPos.y;
      positions[i * 6 + 2] = fromPos.z;
      positions[i * 6 + 3] = toPos.x;
      positions[i * 6 + 4] = toPos.y;
      positions[i * 6 + 5] = toPos.z;
      
      indices[i * 2] = i * 2;
      indices[i * 2 + 1] = i * 2 + 1;
      
      lineIndexAttribute[i * 6] = lineIndices[i];
      lineIndexAttribute[i * 6 + 1] = lineIndices[i];
      lineIndexAttribute[i * 6 + 2] = lineIndices[i];
      lineIndexAttribute[i * 6 + 3] = lineIndices[i];
      lineIndexAttribute[i * 6 + 4] = lineIndices[i];
      lineIndexAttribute[i * 6 + 5] = lineIndices[i];
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute('lineIndex', new THREE.BufferAttribute(lineIndexAttribute, 1));
    
    return geometry;
  }, [connections, nodes, lineIndices]);

  // Initialize nodeMaterialRefs array
  useEffect(() => {
    nodeMaterialRefs.current = nodes.map(() => null);
  }, [nodes]);

  // Animation for network elements
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (dataPathMaterialRef.current) {
      dataPathMaterialRef.current.uniforms.time.value = time;
      dataPathMaterialRef.current.uniforms.flowSpeed.value = 0.4 + 0.2 * Math.sin(time * 0.2);
    }
    
    if (networkRef.current) {
      networkRef.current.rotation.y = time * 0.03;
      networkRef.current.rotation.x = Math.sin(time * 0.02) * 0.1;
    }
    
    nodes.forEach((node, i) => {
      const nodeMaterial = nodeMaterialRefs.current[i];
      if (nodeMaterial?.uniforms) {
        nodeMaterial.uniforms.time.value = time;
        nodeMaterial.uniforms.connectionCount.value = node.connections;
      }
    });
  });

  return (
    <group ref={networkRef}>
      <lineSegments geometry={lineGeometry}>
         <dataPathMaterial ref={dataPathMaterialRef} />
      </lineSegments>
      
      {nodes.map((node, i) => (
        <mesh key={`node-${i}`} position={node.position}>
          <sphereGeometry args={[0.04 + 0.02 * Math.min(node.connections / 3, 1), 16, 16]} />
          <nodeMaterial 
  ref={(ref: NodeMaterial | null) => (nodeMaterialRefs.current[i] = ref)}
  color={new THREE.Color("#39ff14")} 
  pulseColor={new THREE.Color("#00ffff")} 
  connectionCount={node.connections}
/>
        </mesh>
      ))}
      
      {connections.map((connection, i) => {
        if (Math.random() > 0.7) return null;
        
        const fromPos = nodes[connection.from].position;
        const toPos = nodes[connection.to].position;
        const packetSpeed = 0.6 + nodes[connection.from].importance * 0.8;
        
        return (
          <DataPacket 
            key={`packet-${i}`} 
            startPosition={fromPos} 
            endPosition={toPos} 
            speed={packetSpeed} 
            initialOffset={Math.random()} 
          />
        );
      })}
    </group>
  );
};

interface DataPacketProps {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  speed: number;
  initialOffset: number;
}

const DataPacket = ({ startPosition, endPosition, speed, initialOffset }: DataPacketProps)  => {
  const packetRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(initialOffset);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    setProgress((prev: number) => {
      const newProgress = (prev + speed * 0.005) % 1;
      return newProgress;
    });
    
    if (packetRef.current) {
      packetRef.current.position.x = startPosition.x + (endPosition.x - startPosition.x) * progress;
      packetRef.current.position.y = startPosition.y + (endPosition.y - startPosition.y) * progress;
      packetRef.current.position.z = startPosition.z + (endPosition.z - startPosition.z) * progress;
      
      const scale = 0.8 + 0.2 * Math.sin(time * 8 + initialOffset * 10);
      packetRef.current.scale.set(scale, scale, scale);
    }
  });
  
  return (
    <mesh ref={packetRef}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshBasicMaterial color="#39ff14" transparent opacity={0.8} />
    </mesh>
  );
};

// Background grid component
// const BackgroundGrid = () => {
//   const bgRef = useRef<THREE.Mesh>(null);
//   const bgMaterialRef = useRef<BackgroundGridMaterial>(null);
  
//   return (
//     <mesh ref={bgRef} position={[0, 0, -15]}>
//       <planeGeometry args={[100, 100]} />
//       < backgroundGridMaterial 
//         ref={bgMaterialRef} 
//         primaryColor={new THREE.Color("#0066ff")} 
//         secondaryColor={new THREE.Color("#39ff14")}
//       />
//     </mesh>
//   );
// };



// Advanced globe component
const AdvancedGlobeComponent = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const hologramMaterialRef = useRef<HologramMaterial>(null);
  const rotationSpeed = useRef(0.1);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (globeRef.current) {
      globeRef.current.rotation.y = time * rotationSpeed.current;
    }
    
    if (hologramMaterialRef.current) {
      hologramMaterialRef.current.uniforms.time.value = time;
 
    }
  });

  return (
    <>
     

      
      <FuturisticNetwork />
      
      <ambientLight intensity={1} />
      <pointLight position={[5, 3, 4]} intensity={2} color="#39ff14" />
      
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <hologramMaterial ref={hologramMaterialRef} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshBasicMaterial color="#0044ff" transparent opacity={0} />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#39ff14" transparent opacity={0} />
      </mesh>
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        zoomSpeed={0.6}
    
        panSpeed={0.5}
        rotateSpeed={0.2}
        minDistance={0.5  }
        maxDistance={5}
      />
    </>
  );
};

// Main component
const Globe = () => {
  return (
    <div style={{ 
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      margin: 0,
      padding: 0,
      overflow: "hidden",
      background: "linear-gradient(to bottom, #000510, #001030)",
    }}>
      <Canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        camera={{ position: [0, 0, 1.8], fov: 80, near: 0.1, far: 1000 }}
        gl={{ 
          alpha: false, 
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <AdvancedGlobeComponent />
      </Canvas>

      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        width: "100%",
        zIndex: 1,
        pointerEvents: "none"
      }}>
        <h1 style={{
          fontSize: "clamp(3rem, 8vw, 6rem)",
          fontWeight: 1000,
          color: "white",
          margin: 0,
          textShadow: "0 0 20px rgba(0, 150, 255, 0.5)",
          background: "linear-gradient(45deg, #00ffff, #0066ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Encoded Tech
        </h1>
        <p style={{
          fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
          color: "rgba(255, 255, 255, 0.9)",
          margin: "1rem 0 2rem",
          fontWeight: 300
        }}>
          Global IT Solutions & Innovation
        </p>
        <button style={{
          padding: "1rem 2.5rem",
          fontSize: "1.2rem",
          background: "linear-gradient(45deg, #0066ff, #39ff14)",
          border: "none",
          borderRadius: "50px",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.3s ease",
          pointerEvents: "auto",
          boxShadow: "0 0 30px rgba(0, 102, 255, 0.4)",
        }}>
          Explore Solutions
        </button>
      </div>
    </div>
  );
};

export default Globe;