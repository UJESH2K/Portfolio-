import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import AboutObject from '../components/canvas/AboutObject'
import Work3D from '../components/canvas/Work3D'
import GlobalSports from '../components/canvas/SportsBackground'

import NavBalls from '../components/canvas/NavBalls'

export default function Scene() {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-primary">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 1.5]} // Optimization: Cap DPR
                gl={{ antialias: true, alpha: false }}
            >
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={0.5} />

                <GlobalSports />
                <AboutObject />
                <Work3D />
                <NavBalls />

                <Preload all />
            </Canvas>
        </div>
    )
}
