
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Volume2,
} from "lucide-react";

type Kana = {
  kana: string;
  romaji: string;
};

type Category = "basic" | "dakuon" | "handakuon" | "youon";

const categories: { id: Category; label: string; description: string }[] = [
  { id: "basic", label: "Dasar", description: "Katakana dasar ア〜ン" },
  { id: "dakuon", label: "Dakuon", description: "Bunyi dengan tanda ゛" },
  { id: "handakuon", label: "Handakuon", description: "Bunyi dengan tanda ゜" },
  { id: "youon", label: "Yōon", description: "Gabungan dengan ャ・ュ・ョ" },
];

const kanaData: Record<Category, Kana[]> = {
  basic: [
    { kana: "ア", romaji: "a" }, { kana: "イ", romaji: "i" }, { kana: "ウ", romaji: "u" }, { kana: "エ", romaji: "e" }, { kana: "オ", romaji: "o" },
    { kana: "カ", romaji: "ka" }, { kana: "キ", romaji: "ki" }, { kana: "ク", romaji: "ku" }, { kana: "ケ", romaji: "ke" }, { kana: "コ", romaji: "ko" },
    { kana: "サ", romaji: "sa" }, { kana: "シ", romaji: "shi" }, { kana: "ス", romaji: "su" }, { kana: "セ", romaji: "se" }, { kana: "ソ", romaji: "so" },
    { kana: "タ", romaji: "ta" }, { kana: "チ", romaji: "chi" }, { kana: "ツ", romaji: "tsu" }, { kana: "テ", romaji: "te" }, { kana: "ト", romaji: "to" },
    { kana: "ナ", romaji: "na" }, { kana: "ニ", romaji: "ni" }, { kana: "ヌ", romaji: "nu" }, { kana: "ネ", romaji: "ne" }, { kana: "ノ", romaji: "no" },
    { kana: "ハ", romaji: "ha" }, { kana: "ヒ", romaji: "hi" }, { kana: "フ", romaji: "fu" }, { kana: "ヘ", romaji: "he" }, { kana: "ホ", romaji: "ho" },
    { kana: "マ", romaji: "ma" }, { kana: "ミ", romaji: "mi" }, { kana: "ム", romaji: "mu" }, { kana: "メ", romaji: "me" }, { kana: "モ", romaji: "mo" },
    { kana: "ヤ", romaji: "ya" }, { kana: "ユ", romaji: "yu" }, { kana: "ヨ", romaji: "yo" },
    { kana: "ラ", romaji: "ra" }, { kana: "リ", romaji: "ri" }, { kana: "ル", romaji: "ru" }, { kana: "レ", romaji: "re" }, { kana: "ロ", romaji: "ro" },
    { kana: "ワ", romaji: "wa" }, { kana: "ヲ", romaji: "wo" }, { kana: "ン", romaji: "n" },
  ],
  dakuon: [
    { kana: "ガ", romaji: "ga" }, { kana: "ギ", romaji: "gi" }, { kana: "グ", romaji: "gu" }, { kana: "ゲ", romaji: "ge" }, { kana: "ゴ", romaji: "go" },
    { kana: "ザ", romaji: "za" }, { kana: "ジ", romaji: "ji" }, { kana: "ズ", romaji: "zu" }, { kana: "ゼ", romaji: "ze" }, { kana: "ゾ", romaji: "zo" },
    { kana: "ダ", romaji: "da" }, { kana: "ヂ", romaji: "ji" }, { kana: "ヅ", romaji: "zu" }, { kana: "デ", romaji: "de" }, { kana: "ド", romaji: "do" },
    { kana: "バ", romaji: "ba" }, { kana: "ビ", romaji: "bi" }, { kana: "ブ", romaji: "bu" }, { kana: "ベ", romaji: "be" }, { kana: "ボ", romaji: "bo" },
  ],
  handakuon: [
    { kana: "パ", romaji: "pa" }, { kana: "ピ", romaji: "pi" }, { kana: "プ", romaji: "pu" }, { kana: "ペ", romaji: "pe" }, { kana: "ポ", romaji: "po" },
  ],
  youon: [
    { kana: "キャ", romaji: "kya" }, { kana: "キュ", romaji: "kyu" }, { kana: "キョ", romaji: "kyo" },
    { kana: "シャ", romaji: "sha" }, { kana: "シュ", romaji: "shu" }, { kana: "ショ", romaji: "sho" },
    { kana: "チャ", romaji: "cha" }, { kana: "チュ", romaji: "chu" }, { kana: "チョ", romaji: "cho" },
    { kana: "ニャ", romaji: "nya" }, { kana: "ニュ", romaji: "nyu" }, { kana: "ニョ", romaji: "nyo" },
    { kana: "ヒャ", romaji: "hya" }, { kana: "ヒュ", romaji: "hyu" }, { kana: "ヒョ", romaji: "hyo" },
    { kana: "ミャ", romaji: "mya" }, { kana: "ミュ", romaji: "myu" }, { kana: "ミョ", romaji: "myo" },
    { kana: "リャ", romaji: "rya" }, { kana: "リュ", romaji: "ryu" }, { kana: "リョ", romaji: "ryo" },
    { kana: "ギャ", romaji: "gya" }, { kana: "ギュ", romaji: "gyu" }, { kana: "ギョ", romaji: "gyo" },
    { kana: "ジャ", romaji: "ja" }, { kana: "ジュ", romaji: "ju" }, { kana: "ジョ", romaji: "jo" },
    { kana: "ビャ", romaji: "bya" }, { kana: "ビュ", romaji: "byu" }, { kana: "ビョ", romaji: "byo" },
    { kana: "ピャ", romaji: "pya" }, { kana: "ピュ", romaji: "pyu" }, { kana: "ピョ", romaji: "pyo" },
  ],
};

const allKana = Object.values(kanaData).flat();

function shuffle<T,>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function KatakanaPage() {
  const [category, setCategory] = useState<Category>("basic");
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [showRomaji, setShowRomaji] = useState(true);
  const [studyIndex, setStudyIndex] = useState(0);

  const [quizQuestions, setQuizQuestions] = useState<Kana[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentList = kanaData[category];
  const currentKana = currentList[studyIndex % currentList.length];
  const currentQuestion = quizQuestions[questionIndex];

  const options = useMemo(() => {
    if (!currentQuestion) return [];

    const wrongAnswers = shuffle(
      allKana.filter((item) => item.kana !== currentQuestion.kana)
    ).slice(0, 3);

    return shuffle([currentQuestion, ...wrongAnswers]);
  }, [currentQuestion]);

  const startQuiz = () => {
    const questions = shuffle(currentList).slice(
      0,
      Math.min(10, currentList.length)
    );

    setQuizQuestions(questions);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
    setMode("quiz");
  };

  const answerQuestion = (answer: string) => {
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(answer);

    if (answer === currentQuestion.romaji) {
      setScore((value) => value + 1);
    }
  };

  const nextQuestion = () => {
    if (questionIndex + 1 >= quizQuestions.length) {
      setQuizFinished(true);
      return;
    }

    setQuestionIndex((value) => value + 1);
    setSelectedAnswer(null);
  };

  const resetQuiz = () => {
    setMode("learn");
    setQuizFinished(false);
    setSelectedAnswer(null);
    setQuestionIndex(0);
    setScore(0);
  };

  const speakKana = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.75;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="min-h-screen bg-[#0b1020] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm text-white/65 transition hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-pink-500/10 p-6 sm:p-9">
            <p className="mb-2 text-sm font-semibold tracking-[0.25em] text-cyan-200">
              NIHONGO • MATERI DASAR
            </p>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Belajar Katakana
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              Pelajari huruf Katakana dasar, dakuon, handakuon, dan yōon.
              Setelah belajar, uji pemahamanmu melalui latihan singkat.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setMode("learn")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  mode === "learn"
                    ? "bg-cyan-200 text-slate-950"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Mode Belajar
              </button>

              <button
                type="button"
                onClick={startQuiz}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  mode === "quiz"
                    ? "bg-pink-300 text-slate-950"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                Mulai Tes
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {mode === "learn" ? (
          <section className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCategory(item.id);
                    setStudyIndex(0);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    category === item.id
                      ? "border-cyan-200 bg-cyan-200 text-slate-950"
                      : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      {categories.find((item) => item.id === category)?.label}
                    </h2>
                    <p className="mt-1 text-sm text-white/50">
                      {categories.find((item) => item.id === category)?.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRomaji((value) => !value)}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    {showRomaji ? "Sembunyikan romaji" : "Tampilkan romaji"}
                  </button>
                </div>

                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-cyan-200/15 bg-gradient-to-br from-cyan-400/10 to-pink-400/5 p-6">
                  <span className="text-8xl font-medium text-cyan-100 sm:text-9xl">
                    {currentKana.kana}
                  </span>

                  {showRomaji && (
                    <span className="mt-3 text-2xl font-bold tracking-widest text-pink-200">
                      {currentKana.romaji}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => speakKana(currentKana.kana)}
                    aria-label="Dengarkan pelafalan"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <Volume2 className="h-4 w-4" />
                    Dengarkan
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setStudyIndex((value) =>
                        value === 0 ? currentList.length - 1 : value - 1
                      )
                    }
                    className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:bg-white/10"
                  >
                    Sebelumnya
                  </button>

                  <span className="text-xs text-white/50">
                    {studyIndex + 1} / {currentList.length}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setStudyIndex((value) => (value + 1) % currentList.length)
                    }
                    className="rounded-full bg-cyan-200 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">Tabel Katakana</h2>
                  <p className="mt-1 text-sm text-white/50">
                    Pilih salah satu huruf untuk mempelajarinya.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {currentList.map((item, index) => (
                    <button
                      key={`${item.kana}-${index}`}
                      type="button"
                      onClick={() => setStudyIndex(index)}
                      className={`flex min-h-[88px] flex-col items-center justify-center rounded-2xl border p-2 transition ${
                        studyIndex === index
                          ? "border-cyan-200 bg-cyan-200/15"
                          : "border-white/10 bg-slate-950/40 hover:border-cyan-200/40 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-3xl text-white">{item.kana}</span>
                      <span className="mt-1 text-xs text-white/55">
                        {item.romaji}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-8">
            {quizFinished ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />

                <p className="mt-5 text-sm font-semibold tracking-[0.2em] text-cyan-200">
                  TES SELESAI
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Hasil latihanmu
                </h2>

                <p className="mt-4 text-5xl font-black text-cyan-200">
                  {score} / {quizQuestions.length}
                </p>

                <p className="mt-3 text-white/65">
                  Nilai:{" "}
                  {quizQuestions.length
                    ? Math.round((score / quizQuestions.length) * 100)
                    : 0}
                  %
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={startQuiz}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-200 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Ulangi Tes
                  </button>

                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    Kembali Belajar
                  </button>
                </div>
              </div>
            ) : currentQuestion ? (
              <>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold tracking-widest text-cyan-200">
                      LATIHAN KATAKANA
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      Pilih romaji yang benar
                    </h2>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
                    Soal {questionIndex + 1} / {quizQuestions.length}
                  </span>
                </div>

                <div className="mb-7 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-pink-300 transition-all"
                    style={{
                      width: `${
                        ((questionIndex + 1) / quizQuestions.length) * 100
                      }%`,
                    }}
                  />
                </div>

                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.06]">
                  <span className="text-8xl text-cyan-100">
                    {currentQuestion.kana}
                  </span>
                  <span className="mt-3 text-sm text-white/50">
                    Apa cara baca huruf ini?
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {options.map((option) => {
                    const isCorrect =
                      option.romaji === currentQuestion.romaji;
                    const isSelected =
                      selectedAnswer === option.romaji;

                    let optionClass =
                      "border-white/10 bg-white/5 hover:border-cyan-200/50 hover:bg-white/10";

                    if (selectedAnswer && isCorrect) {
                      optionClass =
                        "border-emerald-300 bg-emerald-400/15 text-emerald-200";
                    } else if (isSelected && !isCorrect) {
                      optionClass =
                        "border-rose-300 bg-rose-400/15 text-rose-200";
                    }

                    return (
                      <button
                        key={option.kana}
                        type="button"
                        disabled={!!selectedAnswer}
                        onClick={() => answerQuestion(option.romaji)}
                        className={`rounded-2xl border px-4 py-5 text-lg font-bold transition disabled:cursor-default ${optionClass}`}
                      >
                        {option.romaji}
                      </button>
                    );
                  })}
                </div>

                {selectedAnswer && (
                  <div
                    className={`mt-5 rounded-xl border p-4 text-sm ${
                      selectedAnswer === currentQuestion.romaji
                        ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                        : "border-rose-300/30 bg-rose-300/10 text-rose-200"
                    }`}
                  >
                    {selectedAnswer === currentQuestion.romaji
                      ? "Benar! Jawabanmu tepat."
                      : `Belum tepat. Jawaban yang benar adalah ${currentQuestion.romaji}.`}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-white/55">
                    Skor: {score}
                  </span>

                  <button
                    type="button"
                    disabled={!selectedAnswer}
                    onClick={nextQuestion}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-200 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {questionIndex + 1 === quizQuestions.length
                      ? "Lihat Hasil"
                      : "Soal Berikutnya"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-white/70">Menyiapkan soal...</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}