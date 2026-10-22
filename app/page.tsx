import SmoothScroll from "@/components/site/SmoothScroll";
import RevealObserver from "@/components/studio/RevealObserver";
import ScrollFx from "@/components/studio/ScrollFx";
import Cursor from "@/components/studio/Cursor";
import Preloader from "@/components/studio/Preloader";
import Chrome from "@/components/studio/Chrome";
import Hero from "@/components/studio/Hero";
import EasterEggs from "@/components/studio/EasterEggs";
import Delight from "@/components/studio/Delight";
import RobotLayer from "@/components/studio/robot/RobotLayer";
import Signals from "@/components/studio/sections/Signals";
import Statement from "@/components/studio/sections/Statement";
import Story from "@/components/studio/sections/Story";
import BuildTunnel from "@/components/studio/sections/BuildTunnel";
import Skills from "@/components/studio/sections/Skills";
import SelectedWork from "@/components/studio/sections/SelectedWork";
import About from "@/components/studio/sections/About";
import Internships from "@/components/studio/sections/Internships";
import Clients from "@/components/studio/sections/Clients";
import Leadership from "@/components/studio/sections/Leadership";
import Wins from "@/components/studio/sections/Wins";
import HackWall from "@/components/studio/sections/HackWall";
import Research from "@/components/studio/sections/Research";
import Feed from "@/components/studio/sections/Feed";
import OffClock from "@/components/studio/sections/OffClock";
import Faq from "@/components/studio/sections/Faq";
import Footer from "@/components/studio/sections/Footer";
import { getPosts } from "@/lib/getContent";
import { getRepos } from "@/lib/github";

export const revalidate = 60;

export default async function Home() {
  const [posts, repos] = await Promise.all([getPosts(), getRepos()]);

  return (
    <div className="site">
      <SmoothScroll />
      <RevealObserver />
      <ScrollFx />
      <Cursor />
      <Preloader />
      <Chrome />
      <RobotLayer />
      <EasterEggs />
      <Delight />

      <Hero />
      <main id="main" className="paper">
        <Signals />
        <Statement />
        <Story />
        <BuildTunnel />
        <Internships />
        <Clients />
        <SelectedWork repos={repos} />
        <Skills />
        <About />
        <Leadership />
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
