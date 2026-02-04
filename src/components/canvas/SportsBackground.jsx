import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Instance, Instances, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'

export default function SportsBackground() {
    const scrollProgress = useStore((state) => state.scrollProgress)

    return (
        <group>
            {/* Floating Balls */}
            <Instances range={15}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color="#ff4757" roughness={0.4} />
                {Array.from({ length: 15 }).map((_, i) => (
                    <Ball key={i} index={i} scrollProgress={scrollProgress} />
                ))}
            </Instances>

            {/* Secondary Balls (White) */}
            <Instances range={10} position={[0, 0, -2]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color="#2f3542" />
                {Array.from({ length: 10 }).map((_, i) => (
                    <Ball key={i} index={i + 20} scrollProgress={scrollProgress} speed={0.5} />
                ))}
            </Instances>
        </group>
    )
}

function Ball({ index, scrollProgress, speed = 1 }) {
    const ref = useRef()
    const initialPos = useMemo(() => {
        return new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 5
        )
    }, [])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Base floating
        ref.current.position.x = initialPos.x + Math.sin(time * 0.5 + index) * 0.5

        // Scroll interaction: Move up/down with scroll
        // "Sports moving with scroll" -> They should flow past the camera
        const yOffset = (scrollProgress * 20 * speed) % 20
        ref.current.position.y = initialPos.y + yOffset
        if (ref.current.position.y > 10) ref.current.position.y -= 20

        // Rotation (rolling ball)
        ref.current.rotation.x += 0.02
        ref.current.rotation.z += 0.02
    })

    return <Instance ref={ref} />
}
