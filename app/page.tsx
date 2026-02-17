"use client";

import HeroSection from "@/components/marketing/HeroSection";
import StickyModelSection from "@/components/marketing/StickyModelSection";
import ToolSection from "@/components/marketing/ToolSection";
import EditorSection from "@/components/marketing/EditorSection";
import WorkflowTransition from "@/components/marketing/WorkflowTransition";
import ExploreWorkflows from "@/components/marketing/ExploreWorkflows";
import Footer from "@/components/marketing/Footer";
import Navbar from "@/components/marketing/Navbar";

export default function LandingPage() {
	return (
		<div className=" font-sans">
      <Navbar />
			<HeroSection />
			<StickyModelSection />
			<ToolSection />

			<EditorSection />
			<WorkflowTransition />
			<ExploreWorkflows />
			<Footer />
		</div>
	);
}