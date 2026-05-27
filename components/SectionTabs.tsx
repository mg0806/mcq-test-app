import React from "react";
import type { TestQuestion } from "../utils/testSession";

const SectionTabs: React.FC<{
  questions: TestQuestion[];
  currentSection: string;
  answers: Record<number, string>;
  onSelectSection: (section: string) => void;
}> = ({ questions, currentSection, answers, onSelectSection }) => {
  const sections = Array.from(new Set(questions.map((question) => question.section)));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {sections.map((section) => {
          const sectionQuestions = questions.filter((question) => question.section === section);
          const answered = sectionQuestions.filter((question) => answers[question.id]).length;
          const isActive = section === currentSection;

          return (
            <button
              key={section}
              type="button"
              onClick={() => onSelectSection(section)}
              className={`rounded-md px-4 py-2 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="block">{section}</span>
              <span className={`mt-1 block text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                {answered}/{sectionQuestions.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SectionTabs;
