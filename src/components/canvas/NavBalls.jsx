import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float } from '@react-three/drei'
import { useStore } from '../../store'
import * as THREE from 'three'

export default function NavBalls() {
    const lenis = useStore((state) => state.lenis)

    const navItems = [
        { label: 'HOME', id: '#hero', color: '#ff4757' },
        { label: 'ABOUT', id: '#about', color: '#2ed573' },
        { label: 'WORK', id: '#work', color: '#1e90ff' },
        { label: 'CONTACT', id: '#contact', color: '#ffa502' },
    ]

    return (
        <group>
            {navItems.map((item, index) => (
                <NavBall key={item.label} item={item} index={index} lenis={lenis} />
            ))}
        </group>
    )
}

function NavBall({ item, index, lenis }) {
    const groupRef = useRef()
    const [hovered, setHovered] = useState(false)

    // Random initial position for floating effect (near center)
    const initialPos = useMemo(() => {
        return new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 2
        )
    }, [])

    useFrame((state) => {
        if (!groupRef.current) return

        const time = state.clock.elapsedTime

        // Faster floating motion
        groupRef.current.position.x = initialPos.x + Math.sin(time * 0.6 + index) * 1
        groupRef.current.position.y = initialPos.y + Math.cos(time * 0.8 + index) * 1

        // Faster rotation
        groupRef.current.rotation.x += 0.01
        groupRef.current.rotation.y += 0.01

        // Scale on hover
        const targetScale = hovered ? 1.3 : 1
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    })

    const handleClick = (e) => {
        e.stopPropagation()
        if (lenis) {
            lenis.scrollTo(item.id, { duration: 2 })
        }
    }

    return (
        <Float speed={3} rotationIntensity={0.5} floatIntensity={1.2}>
            <group
                ref={groupRef}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                {/* Main Ball */}
                <mesh>
                    <sphereGeometry args={[0.6, 32, 32]} />
                    <meshStandardMaterial
                        color={item.color}
                        emissive={hovered ? item.color : "black"}
                        emissiveIntensity={hovered ? 0.5 : 0}
                        metalness={0.3}
                        roughness={0.4}
                    />
                </mesh>

                {/* Text on the ball */}
                <Text
                    position={[0, 0, 0.61]}
                    fontSize={0.15}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight="bold"
                    outlineWidth={0.02}
                    outlineColor="#ffffff"
                >
                    {item.label}
                </Text>
            </group>
        </Float>
    )
}
