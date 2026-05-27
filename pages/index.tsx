import React, { useState } from "react";
import { useRouter } from "next/router";
import UploadForm from "../components/UploadForm";
import { extractQuestions, saveTestSession, type TestSettings } from "../utils/testSession";

const Home: React.FC = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (
    questionFile: File,
    answerFile: File,
    settings: TestSettings
  ) => {
    setIsProcessing(true);
    setError("");

    try {
      const { parsePDF } = await import("../utils/pdfParser");
      const [questionText, answerText] = await Promise.all([
        parsePDF(questionFile),
        parsePDF(answerFile),
      ]);
      const questions = extractQuestions(questionText, answerText);

      if (questions.length === 0) {
        setError(
          "I could not detect MCQ questions. Use a PDF with questions like '1. ... A. ... B. ...' and an answer key like '1. A'."
        );
        return;
      }

      saveTestSession({
        questions,
        settings,
        createdAt: new Date().toISOString(),
      });
      await router.push("/test");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while reading the PDFs. Please try another file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl pb-8 pt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          MCQ Test Builder
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
          Turn a question PDF into a timed test.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Upload the paper and answer key, set the exam rules, then run the test with
          navigation, auto-submit, scoring, and review.
        </p>
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-900">
          Use this app only for previous year questions practice. It is made compatible
          for that only. For more requirements, contact Manohar.
        </div>
      </section>

      <UploadForm onUpload={handleUpload} isProcessing={isProcessing} error={error} />
    </main>
  );
};

export default Home;
