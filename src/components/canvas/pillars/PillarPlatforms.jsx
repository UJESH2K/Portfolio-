import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import * as THREE from 'three'

export default function PillarPlatforms({ active }) {
    const groupRef = useRef()

    useFrame((state, delta) => {
        if (!groupRef.current) return
        const targetScale = active ? 1 : 0
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5)

        // Constant rotation
        if (active) {
            groupRef.current.rotation.y -= delta * 0.3
        }
    })

    return (
        <group ref={groupRef} scale={0}>
            {/* Central Hub */}
            <Box args={[1, 4, 1]}>
                <meshStandardMaterial color="#0e0e0e" wireframe />
            </Box>

            {/* Orbital Blocks (Modules) */}
            {Array.from({ length: 5 }).map((_, i) => (
                <Block key={i} index={i} />
            ))}
        </group>
    )
}

function Block({ index }) {
    const ref = useRef()
    const offset = index * 0.8
    useFrame((state) => {
        const time = state.clock.elapsedTime
        ref.current.position.y = Math.sin(time + offset) * 1.5
        ref.current.rotation.x = time
    })

    return (
        <Box ref={ref} args={[0.8, 0.2, 2.5]} position={[0, 0, 0]}>
            <meshStandardMaterial color={index % 2 === 0 ? "#ffffff" : "#00f3ff"} />
        </Box>
    )
}
