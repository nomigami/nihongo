"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getLevelProgress,
  isLevelUnlocked,
  saveLevelPassed,
  shuffleArray,
  type LearningCategory,
  type LevelProgress,
} from "@/lib/levelProgress";

const CATEGORY: LearningCategory = "kotoba";
const MAX_QUESTIONS = 20;
const MAX_WRONG = 3;

type Kotoba = {
  id: number;
  level: number;
  word: string;
  reading: string | null;
  meaning: string;
  example_jp: string | null;
  example_id: string | null;
};

type Mode = "study" | "quiz";

export default function KotobaPage() {
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("study");
  const [progress, setProgress] = useState<LevelProgress>({});

  const [quizQuestions, setQuizQuestions] = useState<Kotoba[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [passed, setPassed] = useState(false);

  const levels = useMemo(
    () =>
      [...new Set(kotoba.map((item) => item.level))].sort(
        (a, b) => a - b
      ),
    [kotoba]
  );

  const levelKotoba = useMemo(() => {
    if (selectedLevel === null) return [];

    return kotoba
      .filter((item) => item.level === selectedLevel)
      .sort((a, b) => a.id - b.id)
      .slice(0, MAX_QUESTIONS);
  }, [kotoba, selectedLevel]);

  const currentQuestion = quizQuestions[quizIndex];

  useEffect(() => {
    setProgress(getLevelProgress(CATEGORY));

    async function fetchKotoba() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("kotoba")
        .select(
          "id, level, word, reading, meaning, example_jp, example_id"
        )
        .order("level", { ascending: true })
        .order("id", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setKotoba([]);
      } else {
        setKotoba((data ?? []) as Kotoba[]);
      }

      setLoading(false);
    }

    void fetchKotoba();
  }, []);

  const speakJapanese = useCallback((text: string | null) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  const makeOptions = useCallback((questions: Kotoba[], index: number) => {
    const question = questions[index];

    if (!question) {
      setOptions([]);
      return;
    }

    const distractors = [
      ...new Set(
        questions
          .filter((item) => item.id !== question.id)
          .map((item) => item.meaning.trim())
          .filter(
            (meaning) =>
              meaning.length > 0 && meaning !== question.meaning.trim()
          )
      ),
    ];

    const choices = shuffleArray([
      question.meaning,
      ...shuffleArray(distractors).slice(0, 3),
    ]);

    setOptions(choices);
  }, []);

  function resetQuizState() {
    setQuizIndex(0);
    setSelectedAnswer("");
    setAnswered(false);
    setCorrect(0);
    setWrong(0);
    setQuizFinished(false);
    setPassed(false);
  }

  function selectLevel(level: number) {
    if (!isLevelUnlocked(levels, level, progress)) return;

    setSelectedLevel(level);
    setMode("study");
    resetQuizState();
  }

  function backToLevels() {
    setSelectedLevel(null);
    setMode("study");
    resetQuizState();
  }

  function startQuiz() {
    if (selectedLevel === null || levelKotoba.length === 0) return;

    if (!isLevelUnlocked(levels, selectedLevel, progress)) return;

    const questions = shuffleArray(levelKotoba);

    setQuizQuestions(questions);
    resetQuizState();
    makeOptions(questions, 0);
    setMode("quiz");
  }

  function chooseAnswer(answer: string) {
    if (answered || !currentQuestion) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    if (answer === currentQuestion.meaning) {
      setCorrect((value) => value + 1);
    } else {
      setWrong((value) => value + 1);
    }
  }

  function nextQuestion() {
    if (!answered) return;

    const nextIndex = quizIndex + 1;

    if (nextIndex >= quizQuestions.length) {
      const finalWrong = wrong;

      const didPass = finalWrong <= MAX_WRONG;
      setPassed(didPass);
      setQuizFinished(true);

      if (didPass && selectedLevel !== null) {
        saveLevelPassed(CATEGORY, selectedLevel);
        setProgress(getLevelProgress(CATEGORY));
      }

      return;
    }

    setQuizIndex(nextIndex);
    setSelectedAnswer("");
    setAnswered(false);
    makeOptions(quizQuestions, nextIndex);
  }

  function retryQuiz() {
    startQuiz();
  }

  function backToStudy() {
    setMode("study");
    resetQuizState();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 font-medium text-slate-600">
            Memuat data kotoba...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-red-700">
            Gagal memuat kotoba
          </h1>
          <p className="mt-2 break-words text-sm text-slate-600">{error}</p>
          <p className="mt-4 text-sm text-slate-500">
            Periksa koneksi Supabase, nama tabel, dan izin SELECT pada tabel
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">
              kotoba
            </code>
            .
          </p>
        </div>
      </main>
    );
  }

  if (kotoba.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">📚</div>
          <h1 className="mt-4 text-2xl font-black text-slate-900">
            Data kotoba belum tersedia
          </h1>
          <p className="mt-2 text-slate-500">
            Tambahkan data ke tabel kotoba di Supabase terlebih dahulu.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-lg sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Belajar Bahasa Jepang
              </span>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Kotoba
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Pelajari kosakata bahasa Jepang, dengarkan pelafalannya, dan
                uji hafalanmu melalui kuis setiap level.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 sm:min-w-44">
              <p className="text-sm text-indigo-100">Total kosakata</p>
              <p className="mt-1 text-3xl font-black">{kotoba.length}</p>
              <p className="mt-1 text-xs text-indigo-100">
                {levels.length} level tersedia
              </p>
            </div>
          </div>
        </header>

        {selectedLevel === null ? (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-900">
                Pilih Level
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Selesaikan kuis level yang terbuka untuk membuka level
                berikutnya. Setiap level memuat maksimal 20 kotoba.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {levels.map((level, index) => {
                const count = kotoba.filter(
                  (item) => item.level === level
                ).length;
                const lessonCount = Math.min(count, MAX_QUESTIONS);
                const unlocked = isLevelUnlocked(levels, level, progress);
                const levelPassed = progress[level] === true;

                return (
                  <button
                    key={level}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => selectLevel(level)}
                    className={`group rounded-3xl border p-6 text-left shadow-sm transition ${
                      unlocked
                        ? "border-slate-200 bg-white hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black transition ${
                          unlocked
                            ? "bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {level}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          levelPassed
                            ? "bg-emerald-50 text-emerald-700"
                            : unlocked
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {levelPassed
                          ? "✓ Lulus"
                          : unlocked
                            ? "🔓 Terbuka"
                            : "🔒 Terkunci"}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-slate-900">
                      Level {level}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {count < MAX_QUESTIONS
                        ? `${count} kosakata tersedia`
                        : `${lessonCount}/${MAX_QUESTIONS} kotoba`}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold">
                      <span
                        className={
                          unlocked ? "text-indigo-700" : "text-slate-400"
                        }
                      >
                        {levelPassed
                          ? "Pelajari kembali"
                          : unlocked
                            ? "Mulai belajar"
                            : `Lulus Level ${levels[index - 1]} terlebih dahulu`}
                      </span>
                      <span className="text-lg">
                        {levelPassed ? "✓" : unlocked ? "→" : "🔒"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={backToLevels}
                  className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  <span aria-hidden="true">←</span>
                  Kembali ke daftar level
                </button>
                <h2 className="text-2xl font-black text-slate-900">
                  Kotoba Level {selectedLevel}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {levelKotoba.length} kosakata ditampilkan, maksimal{" "}
                  {MAX_QUESTIONS} kotoba per level.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => backToStudy()}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    mode === "study"
                      ? "bg-indigo-700 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Mode Belajar
                </button>
                <button
                  type="button"
                  onClick={startQuiz}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    mode === "quiz"
                      ? "bg-indigo-700 text-white"
                      : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
                  }`}
                >
                  Mulai Kuis
                </button>
              </div>
            </div>

            {mode === "study" ? (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Daftar Kosakata
                    </h3>
                    <p className="text-sm text-slate-500">
                      Gunakan tombol audio untuk mendengarkan pelafalan
                      bahasa Jepang.
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {levelKotoba.length} kotoba
                  </span>
                </div>

                {levelKotoba.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Belum ada kotoba pada level ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-4 font-bold">No.</th>
                          <th className="px-4 py-4 font-bold">Kotoba</th>
                          <th className="px-4 py-4 font-bold">Cara Baca</th>
                          <th className="px-4 py-4 font-bold">Arti</th>
                          <th className="px-4 py-4 font-bold">
                            Contoh Kalimat
                          </th>
                          <th className="px-4 py-4 font-bold">
                            Terjemahan
                          </th>
                          <th className="px-4 py-4 text-center font-bold">
                            Audio
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {levelKotoba.map((item, index) => (
                          <tr
                            key={item.id}
                            className="transition hover:bg-indigo-50/40"
                          >
                            <td className="px-4 py-4 font-semibold text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-lg font-bold text-slate-900">
                                {item.word}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {item.reading || "—"}
                            </td>
                            <td className="px-4 py-4 font-medium text-slate-800">
                              {item.meaning}
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-base text-slate-800">
                                {item.example_jp || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              {item.example_id || "—"}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  speakJapanese(
                                    item.example_jp || item.word
                                  )
                                }
                                aria-label={`Dengarkan ${item.word}`}
                                title="Dengarkan pelafalan"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-700 transition hover:bg-indigo-700 hover:text-white"
                              >
                                🔊
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Setelah belajar, kerjakan kuis untuk menyelesaikan level.
                    Maksimal kesalahan yang diizinkan: {MAX_WRONG}.
                  </p>
                  <button
                    type="button"
                    onClick={startQuiz}
                    disabled={levelKotoba.length === 0}
                    className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mulai Kuis →
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl">
                {quizFinished ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
                    <div
                      className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                        passed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {passed ? "🏆" : "📖"}
                    </div>

                    <h3 className="mt-5 text-2xl font-black text-slate-900">
                      {passed ? "Selamat, kamu lulus!" : "Belum lulus"}
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                      {passed
                        ? `Level ${selectedLevel} berhasil diselesaikan. Level berikutnya akan terbuka jika tersedia.`
                        : `Kamu melakukan ${wrong} kesalahan. Pelajari kembali kotoba lalu coba kuis sekali lagi. Batas lulus adalah maksimal ${MAX_WRONG} kesalahan.`}
                    </p>

                    <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <p className="text-sm text-emerald-700">Benar</p>
                        <p className="mt-1 text-3xl font-black text-emerald-800">
                          {correct}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-rose-50 p-4">
                        <p className="text-sm text-rose-700">Salah</p>
                        <p className="mt-1 text-3xl font-black text-rose-800">
                          {wrong}
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={backToStudy}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Kembali Belajar
                      </button>
                      <button
                        type="button"
                        onClick={retryQuiz}
                        className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-800"
                      >
                        Ulangi Kuis
                      </button>
                      <button
                        type="button"
                        onClick={backToLevels}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                      >
                        Daftar Level
                      </button>
                    </div>
                  </div>
                ) : currentQuestion ? (
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                          Kuis Level {selectedLevel}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">
                          Soal {quizIndex + 1} dari {quizQuestions.length}
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{
                            width: `${
                              ((quizIndex + 1) / quizQuestions.length) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                          Benar: {correct}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1.5 ${
                            wrong > MAX_WRONG
                              ? "bg-rose-100 text-rose-800"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          Salah: {wrong}/{MAX_WRONG}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-8">
                      <p className="text-center text-sm font-semibold text-slate-500">
                        Apa arti dari kosakata berikut?
                      </p>
                      <div className="mt-4 flex flex-col items-center">
                        <h3 className="text-center text-5xl font-black text-slate-900 sm:text-6xl">
                          {currentQuestion.word}
                        </h3>
                        {currentQuestion.reading && (
                          <p className="mt-3 text-lg text-slate-500">
                            {currentQuestion.reading}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            speakJapanese(currentQuestion.word)
                          }
                          className="mt-4 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          🔊 Dengarkan
                        </button>
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        {options.map((option, index) => {
                          const isCorrect =
                            option === currentQuestion.meaning;
                          const isSelected = selectedAnswer === option;

                          let optionStyle =
                            "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";

                          if (answered && isCorrect) {
                            optionStyle =
                              "border-emerald-500 bg-emerald-50 text-emerald-800";
                          } else if (
                            answered &&
                            isSelected &&
                            !isCorrect
                          ) {
                            optionStyle =
                              "border-rose-500 bg-rose-50 text-rose-800";
                          } else if (answered) {
                            optionStyle =
                              "border-slate-200 bg-slate-50 text-slate-400";
                          }

                          return (
                            <button
                              key={`${quizIndex}-${index}-${option}`}
                              type="button"
                              disabled={answered}
                              onClick={() => chooseAnswer(option)}
                              className={`min-h-16 rounded-2xl border-2 p-4 text-left text-sm font-bold transition disabled:cursor-default ${optionStyle}`}
                            >
                              <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                                {String.fromCharCode(65 + index)}
                              </span>
                              {option}
                              {answered && isCorrect && (
                                <span className="float-right">✓</span>
                              )}
                              {answered && isSelected && !isCorrect && (
                                <span className="float-right">✕</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          className={`mt-5 rounded-2xl p-4 text-sm font-medium ${
                            selectedAnswer === currentQuestion.meaning
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {selectedAnswer === currentQuestion.meaning
                            ? "Benar! Jawabanmu tepat."
                            : `Belum tepat. Arti yang benar: ${currentQuestion.meaning}`}
                        </div>
                      )}

                      {wrong > MAX_WRONG && answered && (
                        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                          Batas kesalahan sudah terlampaui. Selesaikan soal
                          yang tersisa untuk melihat hasil kuis.
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          disabled={!answered}
                          onClick={nextQuestion}
                          className="rounded-xl bg-indigo-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {quizIndex + 1 === quizQuestions.length
                            ? "Lihat Hasil"
                            : "Soal Berikutnya →"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
                    <p className="text-slate-600">
                      Belum ada soal untuk level ini.
                    </p>
                    <button
                      type="button"
                      onClick={backToStudy}
                      className="mt-4 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white"
                    >
                      Kembali
                    </button>
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