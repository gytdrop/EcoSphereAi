import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'

function AnimatedSphere() {
  const sphereRef = useRef()
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.1
      sphereRef.current.rotation.z = t * 0.05
    }
  })

  return (
    <Sphere ref={sphereRef} args={[1.5, 64, 64]} scale={1.2}>
      <MeshDistortMaterial 
        color="#3B82F6" 
        attach="material" 
        distort={0.4} 
        speed={1.5} 
        roughness={0.2} 
        wireframe={true}
        transparent
        opacity={0.3}
      />
    </Sphere>
  )
}

export default function WebGLBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(circle at center, #fdfbfb 0%, #ebedee 100%)', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedSphere />
      </Canvas>
    </div>
  )
}
