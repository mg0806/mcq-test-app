import React, { useState } from "react";
import type { TestQuestion } from "../utils/testSession";

const SolutionDisplay: React.FC<{
  questions: TestQuestion[];
  answers: Record<number, string>;
  positiveMarks: number;
  negativeMarks: number;
}> = ({ questions, answers, positiveMarks, negativeMarks }) => {
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswer).length;
  const attempted = questions.filter((question) => Boolean(answers[question.id])).length;
  const wrong = questions.filter(
    (question) => answers[question.id] && answers[question.id] !== question.correctAnswer
  ).length;
  const score = correct * positiveMarks - wrong * negativeMarks;

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Score" value={score.toFixed(2)} />
        <Stat label="Correct" value={String(correct)} />
        <Stat label="Wrong" value={String(wrong)} />
        <Stat label="Attempted" value={`${attempted}/${questions.length}`} />
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id] || "Not answered";
          const isCorrect = userAnswer === question.correctAnswer;

          return (
            <article key={question.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-950">Question {index + 1}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isCorrect ? "Correct" : "Review"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{question.question}</p>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <p className="rounded-md bg-slate-50 px-3 py-2">
                  Correct answer: <strong>{question.correctAnswer || "Not found"}</strong>
                </p>
                <p className="rounded-md bg-slate-50 px-3 py-2">
                  Your answer: <strong>{userAnswer}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setExpandedExplanations((prev) => ({
                    ...prev,
                    [question.id]: !prev[question.id],
                  }))
                }
                className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                {expandedExplanations[question.id] ? "Hide explanation" : "Show explanation"}
              </button>
              {expandedExplanations[question.id] ? (
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-700">
                  {question.explanation || "No explanation given."}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default SolutionDisplay;
