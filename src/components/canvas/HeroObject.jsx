import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Icosahedron } from '@react-three/drei'
import { useStore } from '../../store'

export default function HeroObject() {
    const meshRef = useRef()
    const scrollProgress = useStore((state) => state.scrollProgress)

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        // Subtle rotation + Mouse interaction
        if (meshRef.current) {
            meshRef.current.rotation.y = time * 0.1 + state.pointer.x * 0.2
            meshRef.current.rotation.x = time * 0.05 + state.pointer.y * 0.2

            // Scroll Exit
            const scrollFactor = Math.min(scrollProgress * 2, 1)
            meshRef.current.position.y = scrollFactor * 5
            meshRef.current.position.z = -scrollFactor * 5
            meshRef.current.scale.setScalar(1 - scrollFactor * 0.5)
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <group>
                {/* Wireframe Outer Shell */}
                <Icosahedron args={[1.5, 1]} ref={meshRef}>
                    <meshStandardMaterial
                        color="#00f3ff"
                        wireframe
                        emissive="#00f3ff"
                        emissiveIntensity={0.5}
                    />
                </Icosahedron>

                {/* Inner Core */}
                <Icosahedron args={[1, 0]}>
                    <meshPhysicalMaterial
                        color="#0a0a0a"
                        roughness={0}
                        metalness={1}
                        clearcoat={1}
                    />
                </Icosahedron>
            </group>
        </Float>
    )
}
