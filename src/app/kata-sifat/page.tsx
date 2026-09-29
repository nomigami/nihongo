
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getLevelProgress,
  isLevelUnlocked,
  saveLevelPassed,
  shuffleArray,
  type LevelProgress,
} from "@/lib/levelProgress";

type KataSifat = {
  id: number;
  level: number;
  word: string | null;
  reading: string;
  meaning: string;
  adjective_type: string | null;
};

type QuizQuestion = {
  item: KataSifat;
  choices: string[];
};

type PageMode = "study" | "quiz";

const MAX_QUESTIONS = 20;
const MAX_WRONG_ANSWERS = 3;

export default function KataSifatPage() {
  const [items, setItems] = useState<KataSifat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [mode, setMode] = useState<PageMode>("study");
  const [progress, setProgress] = useState<LevelProgress>({});
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    setProgress(getLevelProgress("kata-sifat"));
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchKataSifat() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("kata_sifat")
        .select("id, level, word, reading, meaning, adjective_type")
        .order("level", { ascending: true })
        .order("id", { ascending: true });

      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        setItems([]);
      } else {
        setItems((data ?? []) as KataSifat[]);
      }

      setLoading(false);
    }

    void fetchKataSifat();

    return () => {
      active = false;
    };
  }, []);

  const levels = useMemo(
    () => [...new Set(items.map((item) => item.level))].sort((a, b) => a - b),
    [items]
  );

  const levelItems = useMemo(
    () =>
      selectedLevel === null
        ? []
        : items.filter((item) => item.level === selectedLevel),
    [items, selectedLevel]
  );

  const unlocked = useMemo(
    () =>
      selectedLevel !== null &&
      isLevelUnlocked(levels, selectedLevel, progress),
    [levels, progress, selectedLevel]
  );

  const currentQuestion = questions[questionIndex];

  const speakJapanese = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  function resetQuiz() {
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrectCount(0);
    setWrongCount(0);
    setQuizFinished(false);
    setQuizPassed(false);
  }

  function backToLevels() {
    resetQuiz();
    setSelectedLevel(null);
    setMode("study");
  }

  function startQuiz() {
    if (!unlocked || levelItems.length === 0) return;

    const quizItems = shuffleArray(levelItems).slice(0, MAX_QUESTIONS);
    const allMeanings = [...new Set(items.map((item) => item.meaning))];

    const generatedQuestions: QuizQuestion[] = quizItems.map((item) => {
      const wrongChoices = shuffleArray(
        allMeanings.filter((meaning) => meaning !== item.meaning)
      ).slice(0, 3);

      return {
        item,
        choices: shuffleArray([...wrongChoices, item.meaning]),
      };
    });

    resetQuiz();
    setQuestions(generatedQuestions);
    setMode("quiz");
  }

  function chooseAnswer(answer: string) {
    if (answered || !currentQuestion) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    if (answer === currentQuestion.item.meaning) {
      setCorrectCount((count) => count + 1);
    } else {
      setWrongCount((count) => count + 1);
    }
  }

  function nextQuestion() {
    if (!answered) return;

    const nextIndex = questionIndex + 1;
    const isLastQuestion = nextIndex >= questions.length;
    const nextWrongCount =
      wrongCount +
      (selectedAnswer === currentQuestion?.item.meaning ? 0 : 1);

    if (isLastQuestion || nextWrongCount > MAX_WRONG_ANSWERS) {
      const passed = nextWrongCount <= MAX_WRONG_ANSWERS;

      setQuizPassed(passed);
      setQuizFinished(true);

      if (passed && selectedLevel !== null) {
        saveLevelPassed("kata-sifat", selectedLevel);
        setProgress(getLevelProgress("kata-sifat"));
      }

      return;
    }

    setQuestionIndex(nextIndex);
    setSelectedAnswer(null);
    setAnswered(false);
  }

  function restartCurrentQuiz() {
    resetQuiz();
    setMode("study");
  }

  const progressPercent =
    questions.length > 0
      ? Math.round(((questionIndex + (answered ? 1 : 0)) / questions.length) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-fuchsia-700 p-6 text-white shadow-lg sm:p-9">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium ring-1 ring-white/20">
                にほんご • NIHONGO
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Belajar Kata Sifat
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-pink-50 sm:text-base">
                Pelajari kata sifat bahasa Jepang, pahami perbedaan kata sifat
                い dan な, lalu uji hafalanmu melalui kuis setiap level.
              </p>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-2xl bg-white/15 text-5xl ring-1 ring-white/20 sm:self-center">
              あ
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-pink-100">Jumlah kosakata</p>
              <p className="mt-1 text-2xl font-bold">{items.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
              <p className="text-xs text-pink-100">Level tersedia</p>
              <p className="mt-1 text-2xl font-bold">{levels.length}</p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-pink-100 border-t-pink-600" />
            <p className="mt-4 font-medium text-slate-600">
              Memuat data kata sifat...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <h2 className="font-bold">Gagal memuat data</h2>
            <p className="mt-1 break-words text-sm">{error}</p>
            <p className="mt-3 text-sm">
              Periksa koneksi Supabase, nama tabel, kolom, dan kebijakan SELECT.
            </p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
            <h2 className="font-bold">Data kata sifat belum tersedia</h2>
            <p className="mt-2 text-sm">
              Tambahkan data ke tabel <code>kata_sifat</code> di Supabase.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && selectedLevel === null && (
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Pilih Level</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Selesaikan kuis level sebelumnya untuk membuka level
                  berikutnya.
                </p>
              </div>
              <span className="rounded-full bg-pink-100 px-3 py-1.5 text-sm font-semibold text-pink-700">
                {Object.values(progress).filter(Boolean).length} level lulus
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {levels.map((level, index) => {
                const isUnlocked = isLevelUnlocked(levels, level, progress);
                const isPassed = progress[level] === true;
                const count = items.filter((item) => item.level === level).length;

                return (
                  <button
                    key={level}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      setSelectedLevel(level);
                      setMode("study");
                      resetQuiz();
                    }}
                    className={`group rounded-2xl border p-5 text-left shadow-sm transition ${
                      isUnlocked
                        ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-lg font-bold text-pink-700">
                        {String(level).padStart(2, "0")}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isPassed
                            ? "bg-emerald-100 text-emerald-700"
                            : isUnlocked
                              ? "bg-pink-100 text-pink-700"
                              : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isPassed
                          ? "✓ Lulus"
                          : isUnlocked
                            ? "Terbuka"
                            : "🔒 Terkunci"}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">
                      Level {level}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {count} kosakata tersedia
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                      <span className="font-medium text-slate-500">
                        {isPassed ? "Ulangi materi" : "Mulai belajar"}
                      </span>
                      <span className="font-bold text-pink-600 transition group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                    {index > 0 && !isUnlocked && (
                      <p className="mt-2 text-xs text-slate-400">
                        Lulus level sebelumnya untuk membuka.
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!loading && !error && selectedLevel !== null && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={backToLevels}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                <span aria-hidden="true">←</span> Kembali ke level
              </button>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-pink-100 px-3 py-1.5 text-sm font-bold text-pink-700">
                  Level {selectedLevel}
                </span>
                {progress[selectedLevel] && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    ✓ Lulus
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("study");
                  resetQuiz();
                }}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  mode === "study"
                    ? "bg-pink-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                📖 Materi
              </button>
              <button
                type="button"
                onClick={startQuiz}
                disabled={!unlocked || levelItems.length === 0}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  mode === "quiz"
                    ? "bg-pink-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                ✏️ Mulai Kuis
              </button>
            </div>

            {mode === "study" && (
              <>
                <div className="mb-5 rounded-2xl border border-pink-100 bg-pink-50 p-4">
                  <h2 className="font-bold text-pink-900">
                    Materi Kata Sifat Level {selectedLevel}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-pink-800">
                    Pelajari arti dan cara baca setiap kosakata. Tekan tombol
                    audio untuk mendengarkan pelafalan bahasa Jepang.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                      <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-4">No.</th>
                          <th className="px-4 py-4">Kanji</th>
                          <th className="px-4 py-4">Kana</th>
                          <th className="px-4 py-4">Arti</th>
                          <th className="px-4 py-4">Jenis</th>
                          <th className="px-4 py-4 text-center">Audio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {levelItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className="transition hover:bg-pink-50/50"
                          >
                            <td className="px-4 py-4 font-medium text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-lg font-bold text-slate-800">
                                {item.word || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-medium text-pink-700">
                                {item.reading}
                              </span>
                            </td>
                            <td className="px-4 py-4 font-medium text-slate-700">
                              {item.meaning}
                            </td>
                            <td className="px-4 py-4">
                              <span className="whitespace-nowrap rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                {item.adjective_type || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => speakJapanese(item.reading)}
                                aria-label={`Dengarkan ${item.reading}`}
                                className="rounded-lg bg-pink-100 px-3 py-2 font-semibold text-pink-700 transition hover:bg-pink-200"
                              >
                                🔊
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                    Total {levelItems.length} kosakata pada level ini.
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={startQuiz}
                    className="rounded-xl bg-pink-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-pink-700"
                  >
                    Mulai Kuis →
                  </button>
                </div>
              </>
            )}

            {mode === "quiz" && (
              <div className="mx-auto max-w-3xl">
                {quizFinished ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
                    <div
                      className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                        quizPassed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {quizPassed ? "🏆" : "📚"}
                    </div>
                    <h2 className="mt-5 text-2xl font-bold">
                      {quizPassed ? "Selamat, kamu lulus!" : "Tetap semangat!"}
                    </h2>
                    <p className="mt-2 text-slate-500">
                      {quizPassed
                        ? "Kamu berhasil menyelesaikan kuis level ini."
                        : "Kamu belum lulus. Pelajari kembali materi dan coba lagi."}
                    </p>

                    <div className="mt-7 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Soal</p>
                        <p className="mt-1 text-2xl font-bold">
                          {questions.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs text-emerald-700">Benar</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-700">
                          {correctCount}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-rose-50 p-4">
                        <p className="text-xs text-rose-700">Salah</p>
                        <p className="mt-1 text-2xl font-bold text-rose-700">
                          {wrongCount}
                        </p>
                      </div>
                    </div>

                    <p className="mt-5 text-sm text-slate-500">
                      Batas kesalahan: {MAX_WRONG_ANSWERS} kali.
                    </p>

                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={restartCurrentQuiz}
                        className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Kembali ke Materi
                      </button>
                      <button
                        type="button"
                        onClick={startQuiz}
                        className="rounded-xl bg-pink-600 px-5 py-3 font-bold text-white transition hover:bg-pink-700"
                      >
                        Ulangi Kuis
                      </button>
                      {quizPassed && (
                        <button
                          type="button"
                          onClick={backToLevels}
                          className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
                        >
                          Lihat Level
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 p-5 text-white sm:p-7">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-pink-100">
                            Kuis Kata Sifat
                          </p>
                          <h2 className="mt-1 text-xl font-bold">
                            Level {selectedLevel}
                          </h2>
                        </div>
                        <div className="rounded-xl bg-white/15 px-3 py-2 text-sm font-bold">
                          {questionIndex + 1} / {questions.length}
                        </div>
                      </div>
                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full rounded-full bg-white transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {currentQuestion && (
                      <div className="p-5 sm:p-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                          <span className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700">
                            Pilih arti yang benar
                          </span>
                          <span className="text-sm font-medium text-rose-600">
                            Kesalahan: {wrongCount}/{MAX_WRONG_ANSWERS}
                          </span>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
                          <p className="text-sm text-slate-500">
                            Apa arti dari kata berikut?
                          </p>
                          <p className="mt-3 text-4xl font-bold text-slate-800">
                            {currentQuestion.item.word ||
                              currentQuestion.item.reading}
                          </p>
                          {currentQuestion.item.word && (
                            <p className="mt-2 text-lg font-medium text-pink-700">
                              {currentQuestion.item.reading}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              speakJapanese(currentQuestion.item.reading)
                            }
                            className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-pink-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-pink-50"
                          >
                            🔊 Dengarkan
                          </button>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          {currentQuestion.choices.map((choice, index) => {
                            const isCorrect =
                              choice === currentQuestion.item.meaning;
                            const isSelected = selectedAnswer === choice;

                            let choiceStyle =
                              "border-slate-200 bg-white text-slate-700 hover:border-pink-300 hover:bg-pink-50";

                            if (answered && isCorrect) {
                              choiceStyle =
                                "border-emerald-500 bg-emerald-50 text-emerald-800";
                            } else if (answered && isSelected && !isCorrect) {
                              choiceStyle =
                                "border-rose-500 bg-rose-50 text-rose-800";
                            } else if (answered) {
                              choiceStyle =
                                "border-slate-200 bg-slate-50 text-slate-400";
                            }

                            return (
                              <button
                                key={`${questionIndex}-${choice}`}
                                type="button"
                                disabled={answered}
                                onClick={() => chooseAnswer(choice)}
                                className={`flex min-h-16 items-center gap-3 rounded-xl border-2 p-4 text-left font-semibold transition ${choiceStyle}`}
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500">
                                  {["A", "B", "C", "D"][index]}
                                </span>
                                <span className="flex-1">{choice}</span>
                                {answered && isCorrect && <span>✓</span>}
                                {answered && isSelected && !isCorrect && (
                                  <span>✕</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {answered && (
                          <div
                            className={`mt-5 rounded-xl p-4 text-sm font-medium ${
                              selectedAnswer === currentQuestion.item.meaning
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-rose-50 text-rose-800"
                            }`}
                          >
                            {selectedAnswer === currentQuestion.item.meaning
                              ? "Benar! Jawabanmu tepat."
                              : `Belum tepat. Arti yang benar: ${currentQuestion.item.meaning}`}
                          </div>
                        )}

                        <div className="mt-6 flex justify-end">
                          <button
                            type="button"
                            disabled={!answered}
                            onClick={nextQuestion}
                            className="rounded-xl bg-pink-600 px-6 py-3 font-bold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {questionIndex + 1 >= questions.length ||
                            wrongCount >= MAX_WRONG_ANSWERS
                              ? "Lihat Hasil"
                              : "Soal Berikutnya →"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}