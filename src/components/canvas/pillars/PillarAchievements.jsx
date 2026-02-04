import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Icosahedron, Octahedron } from '@react-three/drei'
import * as THREE from 'three'

export default function PillarAchievements({ active }) {
    const groupRef = useRef()

    useFrame((state, delta) => {
        if (!groupRef.current) return
        const targetScale = active ? 1 : 0
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5)

        if (active) {
            // Slow confident rotation
            groupRef.current.rotation.y += delta * 0.5
        }
    })

    return (
        <group ref={groupRef} scale={0}>
            <Octahedron args={[1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
                <meshPhysicalMaterial
                    color="#ffd700" // Gold-ish
                    emissive="#ffaa00"
                    emissiveIntensity={0.2}
                    metalness={1}
                    roughness={0.2}
                    wireframe
                />
            </Octahedron>
            <Icosahedron args={[1, 0]}>
                <meshStandardMaterial color="white" />
            </Icosahedron>
        </group>
    )
}
