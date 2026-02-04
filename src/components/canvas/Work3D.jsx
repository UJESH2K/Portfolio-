import { useRef } from 'react'
import { useStore } from '../../store'
import { useFrame } from '@react-three/fiber'
import PillarAI from './pillars/PillarAI'
import PillarPlatforms from './pillars/PillarPlatforms'
import PillarAutomation from './pillars/PillarAutomation'
import PillarAchievements from './pillars/PillarAchievements'

export default function Work3D() {
    const scrollProgress = useStore((state) => state.scrollProgress)

    // Scroll Timeline mappings (Approximate, requires tuning with DOM height)
    // Pillar 1: 0.2 - 0.4
    // Pillar 2: 0.4 - 0.6
    // Pillar 3: 0.6 - 0.8
    // Pillar 4: 0.8 - 0.95

    return (
        <group position={[3, 0, 0]}>
            <PillarAI active={scrollProgress > 0.15 && scrollProgress < 0.4} progress={scrollProgress} />
            <PillarPlatforms active={scrollProgress > 0.4 && scrollProgress < 0.6} progress={scrollProgress} />
            <PillarAutomation active={scrollProgress > 0.6 && scrollProgress < 0.8} progress={scrollProgress} />
            <PillarAchievements active={scrollProgress > 0.8} progress={scrollProgress} />
        </group>
    )
}
