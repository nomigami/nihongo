
"use client";

import Image from "next/image";
import { Sparkles, ChevronRight } from "lucide-react";
import HeroCharacter from "@/components/home/HeroCharacter";
import LearningRoulette from "@/components/home/LearningRoulette";

export default function HeroSection() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#090b18] text-white">
      {/* Background anime */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/backgrounds/bg.jpg"
          alt="Background anime Jepang"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Overlay untuk keterbacaan judul */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#080b1b]/95 via-[#080b1b]/65 to-[#080b1b]/15" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080b1b]/75 via-transparent to-[#080b1b]/20" />

      {/* Cahaya dekoratif */}
      <div className="pointer-events-none absolute -left-24 top-1/4 -z-10 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 right-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-[110px]" />

      <section className="relative mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 items-center gap-4 px-6 pb-16 pt-14 sm:px-10 lg:grid-cols-2 lg:px-16">
        {/* Bagian kiri: judul dan deskripsi */}
        <div className="hero-title-enter relative z-20 order-2 max-w-2xl self-center pb-10 lg:order-1 lg:pb-0">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-[10px] tracking-[0.28em] text-white/80 shadow-lg backdrop-blur-md sm:text-xs">
            <Sparkles className="h-4 w-4 text-pink-200" />
            JAPANESE LANGUAGE LEARNING
          </div>

          <p className="mb-5 text-xs tracking-[0.45em] text-pink-200 sm:text-sm">
            ようこそ
            <span className="ml-3 text-white/55">WELCOME</span>
          </p>

          <h1 className="flex flex-col items-start">
            <span className="japanese-title text-6xl font-black leading-tight tracking-[0.08em] sm:text-7xl md:text-8xl">
              <ruby>
                日本語
                <rt>にほんご</rt>
              </ruby>
            </span>

            <span className="mt-3 text-base font-light tracking-[0.35em] text-white/70 sm:text-lg">
              BY
            </span>

            <span className="mt-2 bg-gradient-to-r from-pink-200 via-white to-cyan-200 bg-clip-text text-3xl font-bold tracking-[0.08em] text-transparent sm:text-4xl md:text-5xl">
              よが・さぷとら
            </span>

            <span className="mt-2 text-[10px] tracking-[0.38em] text-white/55 sm:text-xs">
              YOGA SAPUTRA
            </span>
          </h1>

          <div className="mt-7 h-[2px] w-32 bg-gradient-to-r from-pink-200 to-transparent" />

          <p className="mt-6 max-w-lg text-sm leading-8 text-white/75 sm:text-base">
            Mari mulai perjalanan belajar bahasa Jepang. Pelajari huruf,
            kosakata, tata bahasa, dan kanji melalui pengalaman belajar
            yang interaktif.
          </p>

          {/* Tombol menuju halaman yang dipilih di roulette */}

         {/* Tombol mulai belajar */}
         <a
          href="/hiragana"
          className="mt-8 inline-flex items-center gap-3 rounded-full border border-pink-200/50 bg-pink-300/15 px-7 py-3 text-xs font-semibold tracking-[0.16em] text-white shadow-[0_0_35px_rgba(244,114,182,0.16)] backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-pink-300/25 sm:text-sm"
          >
          MULAI BELAJAR
          <ChevronRight className="h-4 w-4" />
          </a>

          <p className="mt-5 text-xs tracking-[0.18em] text-white/45">
            一緒に日本語を学びましょう
          </p>
        </div>

        {/* Bagian kanan: karakter dan roulette di atas tangan */}
        <div className="character-enter relative z-10 order-1 flex h-[390px] w-full items-end justify-center sm:h-[520px] lg:order-2 lg:h-[min(88vh,850px)]">
          <div className="relative h-full w-full max-w-[650px]">
            <HeroCharacter />
          </div>

          {/* Roulette navigasi di atas tangan karakter */}
          <div className="roulette-enter absolute left-[60%] top-[30%] z-30 w-[min(92vw,440px)] -translate-x-1/2 sm:top-[32%] lg:top-[15%]">
            <LearningRoulette />
          </div>
        </div>
      </section>

      {/* Footer kecil */}
      <div className="pointer-events-none absolute bottom-4 left-6 z-20 text-[9px] tracking-[0.28em] text-white/45 sm:left-10 lg:left-16">
        NIHONGO BY YOGA SAPUTRA
      </div>
    </main>
  );
}