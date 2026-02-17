"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 40) setIsScrolled(true);
    else setIsScrolled(false);
  });

  return (
    <>
      {/* 🔴 TOP BLACK ANNOUNCEMENT BAR */}
      <section className="bg-black text-white py-1">
        <div className="max-w-9xl mx-auto flex items-center justify-center gap-3">
          <Image
            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/69032e91ec29a8f27508fa9c_Image-Figma_acc.avif"
            alt="Figma Logo"
            width={50}
            height={50}
            className="object-contain"
          />
          <p className="text-lg md:text-lg font-semibold tracking-wide text-center">
            Weavy is now a part of Figma
          </p>
        </div>
      </section>

      {/* 🟢 MAIN NAVBAR */}
      <motion.header
        animate={{ height: isScrolled ? 60 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-10 w-full z-40 backdrop-blur-md border-b border-black/5 bg-white/80"
      >
        <div className="h-full px-8 xl:px-16 flex items-center justify-between">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-6">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
            </div>

            <div className="flex items-center gap-4 text-black">
              <span className="font-semibold text-lg tracking-tight">
                WEAVY
              </span>

              <div className="h-5 w-px bg-black/20"></div>

              <span className="text-[11px] tracking-widest text-black/60 uppercase">
                Artistic Intelligence
              </span>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-8">

            {/* NAV LINKS */}
            <nav className="hidden lg:flex items-center gap-8 text-[13px] text-black/70 tracking-wide">
              <Link href="#" className="hover:text-black transition-colors">
                COLLECTIVE
              </Link>
              <Link href="#" className="hover:text-black transition-colors">
                ENTERPRISE
              </Link>
              <Link href="#" className="hover:text-black transition-colors">
                PRICING
              </Link>
              <Link href="#" className="hover:text-black transition-colors">
                REQUEST A DEMO
              </Link>

              {/* ✅ SIGN IN (Only when signed out) */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="hover:text-black transition-colors">
                    SIGN IN
                  </button>
                </SignInButton>
              </SignedOut>

              {/* ✅ USER BUTTON (When signed in) */}
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </nav>

            {/* ✅ START NOW BUTTON */}
            <motion.div
              animate={{ scale: isScrolled ? 0.96 : 1 }}
              transition={{ duration: 0.25 }}
            >
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className="bg-[#eaff7b] hover:bg-[#d4ff00] 
                    text-black text-[18px] font-medium 
                    px-8 py-4 rounded-md 
                    transition-all duration-200"
                  >
                    Start Now
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/workflows"
                  className="bg-[#eaff7b] hover:bg-[#d4ff00] 
                  text-black text-[18px] font-medium 
                  px-8 py-4 rounded-md 
                  transition-all duration-200 
                  inline-flex items-center justify-center"
                >
                  Start Now
                </Link>
              </SignedIn>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </>
  );
}

