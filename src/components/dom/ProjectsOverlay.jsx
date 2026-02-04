export default function ProjectsOverlay() {
    return (
        <div className="w-full">
            <ProjectSection
                title="AI Monoact Generator"
                desc="Curtains open to reveal an AI-generated play."
                tech={['GPT-4', 'WebGL', 'React']}
            />
            <ProjectSection
                title="Pose Detection"
                desc="Real-time body tracking and posture analysis."
                tech={['TensorFlow', 'MediaPipe', 'R3F']}
            />
            <ProjectSection
                title="Geospatial Disaster Map"
                desc="3D terrain visualization for disaster relief."
                tech={['Mapbox', 'Deck.gl', 'Shaders']}
            />
        </div>
    )
}

function ProjectSection({ title, desc, tech }) {
    return (
        <div className="h-screen w-full flex items-center p-4 md:p-20 pointer-events-none border-t border-white/5">
            <div className="max-w-md backdrop-blur-md bg-black/30 p-8 rounded-lg border border-white/10">
                <h2 className="text-4xl font-bold mb-4 text-accent">{title}</h2>
                <p className="text-xl text-gray-300 mb-6">{desc}</p>
                <ul className="flex gap-4">
                    {tech.map((t) => (
                        <li key={t} className="text-sm font-mono text-gray-500 border border-gray-700 px-2 py-1 rounded">
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
