import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useStore } from '../../store'

export default function ContactObject() {
    const meshRef = useRef()
    const scrollProgress = useStore((state) => state.scrollProgress)

    useFrame((state) => {
        // Visible only at the end
        const visible = scrollProgress > 0.9

        if (meshRef.current) {
            meshRef.current.visible = visible
            if (visible) {
                // Calm motion
                meshRef.current.rotation.y += 0.005
                // Scale up slightly
                const scale = Math.min((scrollProgress - 0.9) * 10, 1) + 1 // 1 to 2
                meshRef.current.scale.setScalar(scale)
            }
        }
    })

    return (
        <Sphere args={[1.5, 32, 32]} ref={meshRef} position={[0, 0, 0]} visible={false}>
            <MeshDistortMaterial
                color="#00f3ff"
                distort={0.4}
                speed={1.5}
                metalness={0.9}
                roughness={0.1}
            />
        </Sphere>
    )
}
