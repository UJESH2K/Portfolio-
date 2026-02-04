import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder, Plane, Sphere } from '@react-three/drei'
import { useStore } from '../../store'
import * as THREE from 'three'

export default function ProjectsObject() {
    const groupRef = useRef()
    const scrollProgress = useStore((state) => state.scrollProgress)

    useFrame(() => {
        // Assuming 5 screens total:
        // 0.0 - 0.2: Hero
        // 0.2 - 0.4: About
        // 0.4 - 0.6: Project 1 (Monoact)
        // 0.6 - 0.8: Project 2 (Pose)
        // 0.8 - 1.0: Project 3 (Geo)

        if (!groupRef.current) return

        // Global position logic: Move entire group based on scroll? 
        // Or just fade/move specific children?
        // Let's hide everything if < 0.35 (enter Project 1)

        // Smooth transitions
    })

    // Helper to calculate opacity/scale for a specific slice of scroll
    const getActiveState = (start, end) => {
        // Simple checks for now
        const center = (start + end) / 2
        const dist = Math.abs(scrollProgress - center)
        const visible = dist < 0.1 // Active window
        return visible
    }

    const p1Visible = getActiveState(0.4, 0.6)
    const p2Visible = getActiveState(0.6, 0.8)
    const p3Visible = getActiveState(0.8, 1.0)

    return (
        <group ref={groupRef} position={[2, 0, 0]}>
            {/* Project 1: Stage Curtain Logic */}
            <group visible={scrollProgress > 0.3 && scrollProgress < 0.7}>
                {/* Simple representation: Box "Curtains" opening */}
                <mesh position={[-0.5, 0, 0]} scale={[1, 1, 0.1]}>
                    <boxGeometry />
                    <meshStandardMaterial color="#333" />
                </mesh>
                <mesh position={[0.5, 0, 0]} scale={[1, 1, 0.1]}>
                    <boxGeometry />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* The actor */}
                <Sphere args={[0.3]} position={[0, 0, -0.5]}>
                    <meshStandardMaterial color="red" />
                </Sphere>
            </group>

            {/* Project 2: Skeleton */}
            <group visible={scrollProgress > 0.5 && scrollProgress < 0.9} position={[0, -5, 0]}>
                {/* We rely on camera moving or object moving up? 
                 Let's keep position static relative to screen but use React Suspense/Switching?
                 Actually, simpler to just have them exist and animate visibility/position.
             */}
                <Cylinder args={[0.1, 0.1, 2]} rotation={[0, 0, Math.PI / 4]}>
                    <meshStandardMaterial color="green" />
                </Cylinder>
            </group>

            {/* Project 3: Map */}
            <group visible={scrollProgress > 0.7} position={[0, -10, 0]}>
                <Plane args={[3, 3]} rotation={[-Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="blue" wireframe />
                </Plane>
            </group>
        </group>
    )
}
