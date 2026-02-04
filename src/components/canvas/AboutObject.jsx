import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { useStore } from '../../store'
import * as THREE from 'three'

export default function AboutObject() {
    const groupRef = useRef()
    const scrollProgress = useStore((state) => state.scrollProgress)

    useFrame(() => {
        // Scroll progress 0-1
        // We want this section to activate around 0.2 - 0.5?
        // For now just map global progress to expansion

        // Map 0 -> 1 to expansion amount
        const expand = THREE.MathUtils.lerp(0, 2, scrollProgress)

        if (groupRef.current) {
            // Simple layer expansion
            groupRef.current.children[0].position.y = expand * 0.5
            groupRef.current.children[1].position.y = 0
            groupRef.current.children[2].position.y = -expand * 0.5

            // Rotation based on scroll too
            groupRef.current.rotation.y = scrollProgress * Math.PI * 2
        }
    })

    return (
        // Position this further down or manipulate based on scroll too
        <group ref={groupRef} position={[3, 0, 0]} scale={0.5}>
            {/* Layer 1 */}
            <Box args={[2, 0.2, 2]} position={[0, 0.5, 0]}>
                <meshStandardMaterial color="#00f3ff" />
            </Box>

            {/* Layer 2 */}
            <Box args={[2, 0.2, 2]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#ffffff" />
            </Box>

            {/* Layer 3 */}
            <Box args={[2, 0.2, 2]} position={[0, -0.5, 0]}>
                <meshStandardMaterial color="#bf00ff" />
            </Box>
        </group>
    )
}
