
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";

const modules = [
  { label: "ホーム", subtitle: "Beranda", href: "/" },
  { label: "ひらがな", subtitle: "Hiragana", href: "/hiragana" },
  { label: "カタカナ", subtitle: "Katakana", href: "/katakana" },
  { label: "言葉", subtitle: "Kotoba", href: "/kotoba" },
  { label: "動詞", subtitle: "Kata Kerja", href: "/kata-kerja" },
  { label: "形容詞", subtitle: "Kata Sifat", href: "/kata-sifat" },
  { label: "漢字", subtitle: "Kanji", href: "/kanji" },
];

export default function LearningRoulette() {
  const pathname = usePathname();
  const [active, setActive] = useState(0);

  // Sinkronkan pilihan roulette dengan halaman yang sedang dibuka.
  useEffect(() => {
    const currentIndex = modules.findIndex(
      (item) => item.href === pathname
    );

    if (currentIndex !== -1) {
      setActive(currentIndex);
    }
  }, [pathname]);

  const previous = () => {
    setActive((current) =>
      (current - 1 + modules.length) % modules.length
    );
  };

  const next = () => {
    setActive((current) =>
      (current + 1) % modules.length
    );
  };

  const selected = modules[active];

  return (
    <nav
      aria-label="Navigasi materi pembelajaran"
      className="roulette-enter absolute bottom-[8%] left-1/2 z-30 w-[min(92vw,460px)] -translate-x-1/2 lg:bottom-[12%]"
    >
      <div className="rounded-2xl border border-white/20 bg-[#101326]/80 p-3 shadow-[0_0_45px_rgba(236,72,153,0.2)] backdrop-blur-xl sm:p-4">
        {/* Header roulette */}
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-[9px] tracking-[0.25em] text-pink-100/80 sm:text-[10px]">
            学習メニュー · MENU BELAJAR
          </span>

          <span className="text-[10px] tabular-nums text-white/50">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(modules.length).padStart(2, "0")}
          </span>
        </div>

        {/* Pilihan halaman */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previous}
            aria-label="Pilihan sebelumnya"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:scale-110 hover:border-pink-200/60 hover:bg-pink-300/15"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden">
            {[-1, 0, 1].map((offset) => {
              const index =
                (active + offset + modules.length) % modules.length;
              const item = modules[index];
              const isActive = offset === 0;

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  className={`min-w-0 flex-1 rounded-xl border px-1 py-3 transition-all duration-500 sm:px-2 ${
                    isActive
                      ? "scale-105 border-pink-200/60 bg-pink-300/20 text-white shadow-[0_0_24px_rgba(244,114,182,0.2)]"
                      : "scale-90 border-transparent text-white/45 hover:text-white/80"
                  }`}
                >
                  <span
                    className={`block truncate font-semibold tracking-wide ${
                      isActive
                        ? "text-sm sm:text-base"
                        : "text-[10px] sm:text-xs"
                    }`}
                  >
                    {item.label}
                  </span>

                  <span className="mt-1 block truncate text-[8px] text-white/55 sm:text-[9px]">
                    {item.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Pilihan berikutnya"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition hover:scale-110 hover:border-pink-200/60 hover:bg-pink-300/15"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Tombol menuju halaman terpilih */}
        <div className="mt-3 flex justify-center">
          <Link
            href={selected.href}
            className="group inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-pink-300/10 px-6 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-white transition hover:border-pink-200/70 hover:bg-pink-300/20 sm:text-xs"
          >
            MASUK · {selected.subtitle.toUpperCase()}
            <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Aksen dekoratif */}
        <div className="mt-3 flex justify-center">
          <span className="h-1 w-12 rounded-full bg-gradient-to-r from-pink-200 to-cyan-200" />
        </div>
      </div>
    </nav>
  );
}