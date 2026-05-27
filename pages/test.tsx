import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Timer from "../components/Timer";
import Sidebar from "../components/Sidebar";
import SectionTabs from "../components/SectionTabs";
import QuestionTab from "../components/QuestionTab";
import SolutionDisplay from "../components/SolutionDisplay";
import { loadTestSession, type TestSession } from "../utils/testSession";

const Test: React.FC = () => {
  const [session, setSession] = useState<TestSession | null | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setSession(loadTestSession());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  const questions = session?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  const submitTest = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSectionSelect = (section: string) => {
    const firstQuestionIndex = questions.findIndex((question) => question.section === section);

    if (firstQuestionIndex >= 0) {
      setCurrentQuestionIndex(firstQuestionIndex);
    }
  };

  if (session === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-semibold text-slate-600">Loading test...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">No test loaded</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload your question paper and answer key first, then the generated test will appear here.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to upload
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              {isSubmitted ? "Review mode" : "Live test"}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">MCQ Test</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <span className="font-semibold">{answeredCount}</span> / {questions.length} answered
            </div>
            <Timer
              initialTime={session.settings.durationMinutes * 60}
              onExpire={submitTest}
              isRunning={!isSubmitted}
            />
            {!isSubmitted ? (
              <button
                type="button"
                onClick={submitTest}
                className="rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
              >
                Submit Test
              </button>
            ) : null}
          </div>
        </header>

        {!isSubmitted ? (
          <div className="mb-5">
            <SectionTabs
              questions={questions}
              currentSection={currentQuestion?.section ?? ""}
              answers={answers}
              onSelectSection={handleSectionSelect}
            />
          </div>
        ) : null}

        {isSubmitted ? (
          <SolutionDisplay
            questions={questions}
            answers={answers}
            positiveMarks={session.settings.positiveMarks}
            negativeMarks={session.settings.negativeMarks}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            {currentQuestion ? (
              <QuestionTab
                question={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                selectedAnswer={answers[currentQuestion.id]}
                onAnswer={(answer) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: answer,
                  }))
                }
                onNext={handleNext}
                onPrev={handlePrev}
              />
            ) : null}
            <Sidebar
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              currentSection={currentQuestion?.section ?? ""}
              answers={answers}
              onSelectQuestion={setCurrentQuestionIndex}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default Test;
