import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

export default function PillarAI({ active, progress }) {
    const groupRef = useRef()

    useFrame((state, delta) => {
        if (!groupRef.current) return

        // Smooth visibility
        const targetScale = active ? 1 : 0
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5)

        if (active) {
            groupRef.current.rotation.y += delta * 0.2
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
        }
    })

    return (
        <group ref={groupRef} scale={0}>
            {/* Main "Cell" Sphere */}
            <Sphere args={[1.5, 64, 64]}>
                <meshPhysicalMaterial
                    color="#00f3ff"
                    roughness={0.2}
                    metalness={0.8}
                    transmission={0.5}
                    thickness={2}
                    wireframe
                />
            </Sphere>

            {/* Inner Nucleus */}
            <Sphere args={[0.5, 32, 32]}>
                <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
            </Sphere>

            {/* Floating "Data" particles (Birds/Cells) */}
            <Instances range={20}>
                <coneGeometry args={[0.1, 0.3, 4]} />
                <meshStandardMaterial color="#bf00ff" />
                {Array.from({ length: 20 }).map((_, i) => (
                    <Satellite key={i} index={i} />
                ))}
            </Instances>
        </group>
    )
}

function Satellite({ index }) {
    const ref = useRef()
    useFrame((state) => {
        const time = state.clock.elapsedTime
        const angle = (index / 20) * Math.PI * 2
        const radius = 2.5 + Math.sin(time + index) * 0.5
        ref.current.position.x = Math.cos(angle + time * 0.5) * radius
        ref.current.position.z = Math.sin(angle + time * 0.5) * radius
        ref.current.position.y = Math.sin(time * 0.3 + index)
        ref.current.lookAt(0, 0, 0)
    })
    return <Instance ref={ref} />
}
