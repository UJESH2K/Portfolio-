import SmoothScroll from "@/components/site/SmoothScroll";
import RevealObserver from "@/components/studio/RevealObserver";
import Preloader from "@/components/studio/Preloader";
import Chrome from "@/components/studio/Chrome";
import Hero from "@/components/studio/Hero";
import IdleDoodles from "@/components/studio/IdleDoodles";
import LiquidMedia from "@/components/studio/LiquidMedia";
import EasterEggs from "@/components/studio/EasterEggs";
import Delight from "@/components/studio/Delight";
import RobotLayer from "@/components/studio/robot/RobotLayer";
import Signals from "@/components/studio/sections/Signals";
import Statement from "@/components/studio/sections/Statement";
import Story from "@/components/studio/sections/Story";
import BuildOrbit from "@/components/studio/sections/BuildOrbit";
import Skills from "@/components/studio/sections/Skills";
import SelectedWork from "@/components/studio/sections/SelectedWork";
import About from "@/components/studio/sections/About";
import Experience from "@/components/studio/sections/Experience";
import Wins from "@/components/studio/sections/Wins";
import HackWall from "@/components/studio/sections/HackWall";
import Research from "@/components/studio/sections/Research";
import Feed from "@/components/studio/sections/Feed";
import OffClock from "@/components/studio/sections/OffClock";
import Faq from "@/components/studio/sections/Faq";
import Footer from "@/components/studio/sections/Footer";
import { getPosts } from "@/lib/getContent";

export const revalidate = 60;

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="site">
      <SmoothScroll />
      <RevealObserver />
      <Preloader />
      <Chrome />
      <RobotLayer />
      <IdleDoodles />
      <LiquidMedia />
      <EasterEggs />
      <Delight />

      <Hero />
      <main id="main" className="paper">
        <Signals />
        <Statement />
        <Story />
        <BuildOrbit />
        <Skills />
        <SelectedWork />
        <About />
        <Experience />
        <Wins />
        <HackWall />
        <Research />
        <Feed posts={posts} />
        <OffClock />
        <Faq />
        <Footer />
      </main>
    </div>
  );
}
