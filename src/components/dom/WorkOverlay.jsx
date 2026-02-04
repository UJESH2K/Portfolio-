import clsx from 'clsx'
import img1 from '../../assets/WhatsApp Image 2026-02-04 at 18.19.13.jpeg'
import img2 from '../../assets/WhatsApp Image 2026-02-04 at 18.19.17.jpeg'
import img3 from '../../assets/WhatsApp Image 2026-02-04 at 18.19.18.jpeg'
import img4 from '../../assets/WhatsApp Image 2026-02-04 at 18.19.19.jpeg'
import imgCV from '../../assets/WhatsApp Image 2026-02-04 at 18.19.28 (1).jpeg'
import imgAch from '../../assets/WhatsApp Image 2026-02-04 at 18.19.28.jpeg'
import vid2 from '../../assets/WhatsApp Video 2026-02-04 at 18.20.00.mp4'

export default function WorkOverlay() {
    return (
        <div className="w-full relative">
            {/* Pillar 1: AI for Impact */}
            <div id="work">
                <Section title="AI for Impact" subtitle="Health · Vision · Ecology">
                    <Project
                        title="Skin Cancer Detection"
                        desc="Medical AI trained on dermoscopic images to classify malignant vs benign lesions."
                        badges={["Deep Learning", "CNN", "Medical AI"]}
                        quote="An AI system designed to assist early-stage detection with a focus on reliability."
                        image={img1}
                    />
                    <Project
                        title="Hitachi Bird Species ID"
                        desc="Production-oriented ML system for wildlife monitoring."
                        badges={["TensorFlow", "Research Paper", "Industrial"]}
                        quote="Bridging industrial requirements and academic research."
                        image={img2}
                    />
                </Section>

                {/* Pillar 2: Platforms & Systems */}
                <Section title="Platforms & Systems" subtitle="Production-Level Engineering">
                    <Project
                        title="EaseMed Procurement"
                        desc="B2B healthcare platform streamlining vendor selection and RFQs."
                        badges={["System Arch", "B2B", "Complex Data"]}
                        quote="Order from chaos: Intelligent vendor evaluation and operational efficiency."
                        image={img3}
                    />
                    <Project
                        title="Loklbiz.in"
                        desc="End-to-end e-commerce platform for local businesses."
                        badges={["Full Stack", "Deployment", "Scale"]}
                        quote="Empowering local businesses through digital storefronts."
                        image={img4}
                    />
                </Section>

                {/* Pillar 3: Automation & Experiments */}
                <Section title="Automation & Web3" subtitle="Experimental Builds">
                    <Project
                        title="GitPay & Cardano Locks"
                        desc="Blockchain automated payments and visual trade locking systems."
                        badges={["Web3", "n8n", "ReactFlow"]}
                        quote="Transparent, automated solutions for the decentralized web."
                        video={vid2}
                    />
                    <Project
                        title="Computer Vision Lab"
                        desc="Real-time lane detection and autonomous vision pipelines."
                        badges={["OpenCV", "Real-time", "Robotics"]}
                        image={imgCV}
                    />
                </Section>

                {/* Pillar 4: Achievements */}
                <Section title="Leadership & Recognition" subtitle="Proven Excellence">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Achievement title="4x Hackathon Winner" desc="Consistent execution under pressure." image={imgAch} />
                        <Achievement title="GDSC Regional Qualifier" desc="Global-scale problem solving." />
                        <Achievement title="Tech Lead, Code Club" desc="Mentorship & Architecture." />
                        <Achievement title="Internships" desc="Edunet (Microsoft/SAP), Hitachi." />
                    </div>
                    <p className="mt-8 text-xl text-accent font-light italic">
                        "I specialize in building intelligent systems — from healthcare AI to production-grade platforms."
                    </p>
                </Section>
            </div>
        </div>
    )
}

function Section({ title, subtitle, children }) {
    return (
        <div className="min-h-screen w-full flex flex-col justify-center p-4 md:p-20 border-t border-black/5 relative">
            <div className="mb-12">
                <h5 className="text-accent tracking-widest uppercase text-sm font-bold mb-2">{subtitle}</h5>
                <h2 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-400">
                    {title}
                </h2>
            </div>
            <div className="flex flex-col gap-12 max-w-2xl">
                {children}
            </div>
        </div>
    )
}

function Project({ title, desc, badges, quote, image, video }) {
    return (
        <div className="backdrop-blur-md bg-white/40 p-8 rounded-2xl border border-white/20 hover:border-accent/50 transition-colors duration-500 group shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-3 text-gray-800 group-hover:text-accent transition-colors">{title}</h3>
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">{desc}</p>

                    {quote && (
                        <blockquote className="border-l-2 border-accent pl-4 mb-6 text-gray-500 italic text-sm">
                            {quote}
                        </blockquote>
                    )}

                    <div className="flex gap-2 flex-wrap">
                        {badges?.map(b => (
                            <span key={b} className="text-xs font-mono uppercase px-2 py-1 bg-white/50 rounded text-gray-600 border border-gray-200">
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
                {(image || video) && (
                    <div className="flex-1 md:max-w-xs md:max-h-48 rounded-xl overflow-hidden shadow-inner border border-white/20 mt-4 md:mt-0">
                        {video ? (
                            <video src={video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function Achievement({ title, desc, image }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white/40 rounded-lg border border-white/20 shadow-sm hover:shadow-md transition-shadow">
            {image ? (
                <img src={image} alt={title} className="h-12 w-12 rounded-full object-cover border border-accent" />
            ) : (
                <div className="h-10 w-1 bg-accent rounded-full" />
            )}
            <div>
                <h4 className="font-bold text-xl text-gray-800">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
            </div>
        </div>
    )
}
