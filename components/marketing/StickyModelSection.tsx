"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import Image from "next/image";

// ---------------- DATA ----------------

const aiModels = [
  {
    name: "GPT img 1",
    type: "image",
    src: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887e82ac8a8bb8139ebd_GPT%20img%201.avif",
  },
  {
    name: "Wan",
    type: "video",
    src: "https://assets.weavy.ai/homepage/mobile-videos/wan.mp4",
  },
  {
    name: "SD 3.5",
    type: "image",
    src: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887d618a9071dd147d5f_SD%203.5.avif",
  },
  {
    name: "Runway Gen-4",
    type: "video",
    src: "https://assets.weavy.ai/homepage/mobile-videos/runway.mp4",
  },
  {
    name: "Imagen 3",
    type: "image",
    src: "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825887d65bf65cc5194ac05_Imagen%203.avif",
  },
  {
    name: "Veo 3",
    type: "video",
    src: "https://assets.weavy.ai/homepage/mobile-videos/veo2.mp4",
  },
];

// ---------------- COMPONENT ----------------

export default function StickyModelSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Calculate active index
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const rawIndex = Math.floor(latest * aiModels.length);
    const safeIndex = Math.min(
      Math.max(rawIndex, 0),
      aiModels.length - 1
    );
    setActiveIndex(safeIndex);
  });

  // Move list upward smoothly
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-70%"]);

  return (
    <section
      ref={targetRef}
      className="h-[400vh] relative bg-[#09090b] text-white"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

        {/* Background Media */}
        <div className="absolute inset-0 z-0">
          {aiModels.map((model, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeIndex === idx ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              {model.type === "video" ? (
                <video
                  src={model.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-105"
                />
              ) : (
                <Image
                  src={model.src}
                  alt={model.name}
                  fill
                  className="object-cover scale-105"
                />
              )}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30" />
            </motion.div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="relative z-20 w-full max-w-7xl px-6 grid md:grid-cols-12 gap-10 items-center">

          {/* Left Text */}
          <div className="md:col-span-7">
            <h2 className="text-[12vw] md:text-[5vw] font-medium leading-tight tracking-tight mb-8">
              Use all AI models,<br />together at last
            </h2>
            <p className="text-base md:text-xl text-white/80 max-w-xl">
              AI models and professional editing tools in one node-based
              platform. Turn creative vision into scalable workflows without
              compromising quality.
            </p>
          </div>

          {/* Scroll List */}
          <div className="md:col-span-5 h-[60vh] overflow-hidden">
            <motion.div
              style={{ y }}
              className="flex flex-col gap-4 pt-[20vh]"
            >
              {aiModels.map((model, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`text-[28px] md:text-[3vw] font-medium transition-colors duration-300 ${
                      isActive ? "text-[#dfff4f]" : "text-white"
                    }`}
                  >
                    {model.name}
                  </div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
