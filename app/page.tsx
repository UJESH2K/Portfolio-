// app/page.tsx — the console dashboard. Composes every section in order.

import { ConsoleLegend } from "@/components/console/ConsoleLegend";
import { FeaturedTile } from "@/components/console/FeaturedTile";
import { FriendsSection } from "@/components/console/FriendsSection";
import { RecommendedSection } from "@/components/console/RecommendedSection";
import { SettingsPanel } from "@/components/console/SettingsPanel";
import { SocialFooter } from "@/components/console/SocialFooter";
import { TopBar } from "@/components/console/TopBar";
import { WhatsNewSection } from "@/components/console/WhatsNewSection";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-bg text-text-primary">
      <TopBar />
      <FeaturedTile />
      <WhatsNewSection />
      <FriendsSection />
      <RecommendedSection />
      <SettingsPanel />
      <SocialFooter />
      <ConsoleLegend />
    </main>
  );
}
