import Universe from "@/components/site/Universe";
import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import About from "@/components/site/chapters/About";
import Process from "@/components/site/chapters/Process";
import Experience from "@/components/site/chapters/Experience";
import FeaturedWork from "@/components/site/chapters/FeaturedWork";
import Freelance from "@/components/site/chapters/Freelance";
import Experiments from "@/components/site/chapters/Experiments";
import Achievements from "@/components/site/chapters/Achievements";
import Updates from "@/components/site/Updates";
import Contact from "@/components/site/Contact";
import ScheduleWidget from "@/components/site/ScheduleWidget";
import {
  getProjects,
  getFreelance,
  getExperience,
  getAchievements,
  getHackathons,
  getPosts,
} from "@/lib/getContent";

export const revalidate = 60;

export default async function Home() {
  const [projects, freelance, experience, achievements, hackathons, posts] = await Promise.all([
    getProjects(),
    getFreelance(),
    getExperience(),
    getAchievements(),
    getHackathons(),
    getPosts(),
  ]);

  return (
    <>
      <Universe />
      <Nav />
      <main className="relative">
        <Hero />
        <About />
        <Process />
        <Experience experience={experience} />
        <FeaturedWork projects={projects} />
        <Freelance projects={freelance} />
        <Experiments />
        <Achievements achievements={achievements} hackathons={hackathons} />
        <Updates posts={posts} />
        <Contact />
      </main>
      <ScheduleWidget />
    </>
  );
}
