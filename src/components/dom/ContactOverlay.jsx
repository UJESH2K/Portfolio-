import imgProfile from '../../assets/WhatsApp Image 2026-02-04 at 18.20.01.jpeg'

export default function ContactOverlay() {
    return (
        <div id="contact" className="h-screen flex flex-col items-center justify-center text-center pointer-events-none p-4">
            <div className="max-w-xl backdrop-blur-md bg-white/60 p-10 rounded-2xl border border-black/10 pointer-events-auto shadow-xl flex flex-col items-center">
                <img src={imgProfile} alt="Ujesh" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mb-6" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Built to Scale.</h2>
                <p className="text-xl text-gray-600 mb-8">
                    I build systems that think, move, and scale.
                </p>
                <div className="flex gap-4 justify-center">
                    <button className="px-8 py-3 bg-accent text-white font-bold rounded-full hover:bg-red-600 transition-colors">
                        Resume
                    </button>
                    <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                        GitHub
                    </button>
                    <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    )
}
