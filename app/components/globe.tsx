// components/Globe.tsx
"use client";
import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";

const GlobeComponent = () => {
  const globeRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <>
      <Stars
        radius={300}
        depth={150}
        count={9000}
        factor={6}
        saturation={0}
        fade
        speed={0.5}
      />
      <ambientLight intensity={1.5} />
      <pointLight position={[5, 3, 4]} intensity={1} />
      <mesh ref={globeRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          bumpScale={0.05}
          map={new THREE.TextureLoader().load("/textures/earth.jpg")}
          specular={new THREE.Color(0x111111)}
          shininess={5}
        />
      </mesh>
      <OrbitControls
        enableZoom={false}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.2}
        minDistance={1.5}
        maxDistance={5}
      />
    </>
  );
};

const Globe = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Canvas
        style={{ position: "absolute", top: 0, left: 0 }}
        camera={{ position: [0, 0, 2], fov: 75, near: 0.5, far: 1000 }}
        gl={{ alpha: false, antialias: true }}
      >
        <color attach="background" args={[0x000000]} />
        <GlobeComponent />
      </Canvas>

      {/* Text Content */}
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
          fontWeight: 900,
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
          background: "linear-gradient(45deg, #0066ff, #00ffff)",
          border: "none",
          borderRadius: "50px",
          color: "white",
          fontWeight: 700,
          cursor: "pointer",
          transition: "transform 0.3s ease",
          pointerEvents: "auto",
          boxShadow: "0 0 30px rgba(0, 102, 255, 0.4)",
      
        }}>
          Explore Solutions
        </button>

     
      </div>
       {/* Under Construction Notice */}
       <div style={{
        position: "absolute",
        bottom: "20px",
        width: "100%",
        textAlign: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: "1.5rem",
        textShadow: "0 0 10px rgba(255, 255, 255, 0.8)"
      }}>
        Site is under construction
      </div>

    </div>
       
  );
};

export default Globe;