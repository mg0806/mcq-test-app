import React from "react";
import type { TestQuestion } from "../utils/testSession";

const Sidebar: React.FC<{
  questions: TestQuestion[];
  currentQuestionIndex: number;
  currentSection: string;
  answers: Record<number, string>;
  onSelectQuestion: (index: number) => void;
}> = ({ questions, currentQuestionIndex, currentSection, answers, onSelectQuestion }) => {
  const sectionQuestions = questions
    .map((question, index) => ({ question, index }))
    .filter((item) => item.question.section === currentSection);

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-950">Questions</h2>
        <span className="text-xs font-semibold text-slate-500">{currentSection}</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {sectionQuestions.map(({ question, index }) => {
          const isActive = index === currentQuestionIndex;
          const isAnswered = Boolean(answers[question.id]);

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelectQuestion(index)}
              className={`aspect-square rounded-md text-xs font-bold transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : isAnswered
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              aria-label={`Go to question ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
