import HeroWorkflow from "@/components/marketing/HeroWorkflow";
import MobileHeroCards from "@/components/marketing/MobileHeroCards";

export default function HeroSection() {
  return (
    <section className="relative w-full bg-[#e6eaed] overflow-hidden !text-black">

      {/* SUBTLE GRID BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: "24px 24px",
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
        }}
        aria-hidden="true"
      />

      {/* HERO TEXT CONTENT */}
      <div className="relative z-10 pt-24 md:pt-32 px-4 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto mb-10">

          <div className="flex flex-col md:flex-row md:items-start md:gap-20 lg:gap-28">

            {/* LEFT TITLE */}
            <div className="shrink-0">
              <h1 className="text-[clamp(3rem,15vw,8rem)] font-normal leading-[0.9] tracking-tight">
                Weavy
              </h1>
            </div>

            {/* RIGHT CONTENT */}
            <div className="mt-6 md:mt-2">
              <h2 className="text-[clamp(2.5rem,10vw,5rem)] font-normal leading-none tracking-tight mb-6 text-center md:text-left">
                Artistic
                <br className="md:hidden" /> Intelligence
              </h2>

              <p className="text-sm md:text-base leading-relaxed max-w-md">
                Turn your creative vision into scalable workflows.
                Access all AI models and professional editing tools
                in one node based platform.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* WORKFLOW SECTION */}
      <div className="relative w-full z-10 text-black">

        <div className="hidden md:block text-black">
          <div className="relative mx-4 md:mx-8 lg:mx-16 rounded-b-[40px] overflow-hidden bg-[#dde4e7] -mb-10 text-black">

            <div
              className="absolute inset-0 pointer-events-none text-black"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 60%)",
              }}
              aria-hidden="true"
            />

            <div className="relative h-[650px] w-full text-black">
              <HeroWorkflow />
            </div>

          </div>
        </div>

        <div className="md:hidden rounded-b-[40px] text-black">
          <MobileHeroCards />
        </div>

      </div>

    </section>
  );
}
