
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Sesuaikan materi aktif dengan halaman yang sedang dibuka
  useEffect(() => {
    const index = modules.findIndex((item) => item.href === pathname);

    if (index !== -1) {
      setActive(index);
    }
  }, [pathname]);

  // Pindah ke materi sebelumnya
  const previous = () => {
    setActive((current) =>
      current === 0 ? modules.length - 1 : current - 1
    );
  };

  // Pindah ke materi berikutnya
  const next = () => {
    setActive((current) =>
      current === modules.length - 1 ? 0 : current + 1
    );
  };

  const selected = modules[active];

  return (
    <nav
      aria-label="Navigasi materi pembelajaran"
      className="relative z-40 w-full"
    >
      <div className="flex w-full items-center justify-center gap-5 sm:gap-8">
        {/* Tombol panah kiri */}
        <button
          type="button"
          onClick={previous}
          aria-label="Materi sebelumnya"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-white/70 transition duration-300 hover:scale-125 hover:text-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          <ChevronLeft className="h-5 w-5 sm:h-7 sm:w-7" />
        </button>

        {/* Materi aktif yang dapat diklik */}
        <Link
          key={selected.href}
          href={selected.href}
          aria-current={pathname === selected.href ? "page" : undefined}
          className="flex min-w-[120px] flex-col items-center justify-center text-center transition-all duration-300"
        >
          <span className="whitespace-nowrap text-xl font-semibold tracking-wider text-pink-100 drop-shadow-[0_0_12px_rgba(249,168,212,0.95)] sm:text-2xl">
            {selected.label}
          </span>

          <span className="mt-1 whitespace-nowrap text-[10px] tracking-widest text-white/90 sm:text-xs">
            {selected.subtitle}
          </span>

          {/* Garis aksen */}
          <span className="mt-3 h-[2px] w-24 rounded-full bg-gradient-to-r from-pink-200 to-cyan-200 shadow-[0_0_10px_rgba(249,168,212,0.9)]" />
        </Link>

        {/* Tombol panah kanan */}
        <button
          type="button"
          onClick={next}
          aria-label="Materi berikutnya"
          className="flex h-10 w-10 shrink-0 items-center justify-center text-white/70 transition duration-300 hover:scale-125 hover:text-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
        >
          <ChevronRight className="h-5 w-5 sm:h-7 sm:w-7" />
        </button>
      </div>
    </nav>
  );
}