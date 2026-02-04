export default function AboutOverlay() {
    return (
        <div id="about" className="min-h-screen flex items-center justify-start pl-20 pointer-events-none">
            <div className="flex flex-col gap-8 max-w-lg">
                <div className="p-4 backdrop-blur-sm bg-white/50 border-l-2 border-accent">
                    <h2 className="text-3xl font-bold mb-2 text-gray-800">Systems Thinking</h2>
                    <p className="text-gray-600">
                        I break down complex problems into modular, scalable architectures.
                    </p>
                </div>

                <div className="p-4 backdrop-blur-sm bg-white/50 border-l-2 border-gray-400">
                    <h2 className="text-3xl font-bold mb-2 text-gray-800">Machine Learning</h2>
                    <p className="text-gray-600">
                        Integrating AI to create adaptive, intelligent user interfaces.
                    </p>
                </div>

                <div className="p-4 backdrop-blur-sm bg-white/50 border-l-2 border-purple-500">
                    <h2 className="text-3xl font-bold mb-2 text-gray-800">Creative Dev</h2>
                    <p className="text-gray-600">
                        Where code meets art. 60FPS experiences that tell a story.
                    </p>
                </div>
            </div>
        </div>
    )
}
