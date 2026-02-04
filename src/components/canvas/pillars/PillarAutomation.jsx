import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Torus, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

export default function PillarAutomation({ active }) {
    const groupRef = useRef()

    useFrame((state, delta) => {
        if (!groupRef.current) return
        const targetScale = active ? 1 : 0
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5)
        if (active) groupRef.current.rotation.z += delta * 0.1
    })

    // Procedural Nodes
    // ...

    return (
        <group ref={groupRef} scale={0}>
            {/* Symbolic Infinite Pipe / Flow */}
            <Torus args={[2, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#bf00ff" wireframe />
            </Torus>

            <Torus args={[1.5, 0.05, 16, 100]} rotation={[Math.PI / 2, 0.5, 0]}>
                <meshStandardMaterial color="#00f3ff" />
            </Torus>

            {/* Floating Nodes */}
            {Array.from({ length: 8 }).map((_, i) => (
                <Sphere key={i} args={[0.1]} position={[Math.cos(i) * 2, Math.sin(i) * 2, 0]}>
                    <meshStandardMaterial color="white" />
                </Sphere>
            ))}
        </group>
    )
}
