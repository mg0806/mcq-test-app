import React from "react";
import type { TestQuestion } from "../utils/testSession";

const QuestionTab: React.FC<{
  question: TestQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isSubmitted?: boolean;
}> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNext,
  onPrev,
  isSubmitted = false,
}) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {question.section}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          ID {question.id}
        </span>
      </div>

      {question.passage ? (
        <div className="mt-5 max-h-72 overflow-y-auto rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm leading-6 text-slate-700">
          {question.passage}
        </div>
      ) : null}

      <p className="mt-5 text-base leading-7 text-slate-900">{question.question}</p>

      <div className="mt-6 space-y-3">
        {question.options.map((option) => {
          const optionLetter = option.charAt(0).toUpperCase();
          const isSelected = selectedAnswer === optionLetter;
          const isCorrect = isSubmitted && question.correctAnswer === optionLetter;
          const isWrong = isSubmitted && isSelected && !isCorrect;

          return (
            <button
              key={option}
              type="button"
              disabled={isSubmitted}
              onClick={() => onAnswer(optionLetter)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : isWrong
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : isSelected
                      ? "border-blue-400 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentQuestionIndex === 0}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentQuestionIndex === totalQuestions - 1}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default QuestionTab;
