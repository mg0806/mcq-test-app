import React, { useRef, useState } from "react";
import type { TestSettings } from "../utils/testSession";

interface UploadFormProps {
  onUpload: (questionFile: File, answerFile: File, settings: TestSettings) => void;
  isProcessing?: boolean;
  error?: string;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUpload, isProcessing = false, error }) => {
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [positiveMarks, setPositiveMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [dragTarget, setDragTarget] = useState<"question" | "answer" | null>(null);

  const questionInputRef = useRef<HTMLInputElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = Boolean(questionFile && answerFile && !isProcessing);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionFile || !answerFile) {
      return;
    }

    onUpload(questionFile, answerFile, {
      durationMinutes,
      positiveMarks,
      negativeMarks,
    });
  };

  const handleDrop = (e: React.DragEvent, type: "question" | "answer") => {
    e.preventDefault();
    setDragTarget(null);
    const file = e.dataTransfer.files[0];

    if (file?.type !== "application/pdf") {
      return;
    }

    if (type === "question") {
      setQuestionFile(file);
    } else {
      setAnswerFile(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <DropZone
          label="Question paper"
          file={questionFile}
          isDragging={dragTarget === "question"}
          inputRef={questionInputRef}
          accent="blue"
          onFileSelect={setQuestionFile}
          onDragEnter={() => setDragTarget("question")}
          onDragLeave={() => setDragTarget(null)}
          onDrop={(e) => handleDrop(e, "question")}
        />
        <DropZone
          label="Answer key"
          file={answerFile}
          isDragging={dragTarget === "answer"}
          inputRef={answerInputRef}
          accent="emerald"
          onFileSelect={setAnswerFile}
          onDragEnter={() => setDragTarget("answer")}
          onDragLeave={() => setDragTarget(null)}
          onDrop={(e) => handleDrop(e, "answer")}
        />
      </div>

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
        <NumberField
          label="Timer"
          suffix="minutes"
          min={1}
          value={durationMinutes}
          onChange={setDurationMinutes}
        />
        <NumberField
          label="Positive marks"
          min={0}
          step={0.25}
          value={positiveMarks}
          onChange={setPositiveMarks}
        />
        <NumberField
          label="Negative marks"
          min={0}
          step={0.25}
          value={negativeMarks}
          onChange={setNegativeMarks}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isProcessing ? "Extracting test..." : "Create Test"}
      </button>
    </form>
  );
};

interface DropZoneProps {
  label: string;
  file: File | null;
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accent: "blue" | "emerald";
  onFileSelect: (file: File | null) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

const accentClasses = {
  blue: "hover:border-blue-400 data-[dragging=true]:border-blue-500 data-[dragging=true]:bg-blue-50",
  emerald:
    "hover:border-emerald-400 data-[dragging=true]:border-emerald-500 data-[dragging=true]:bg-emerald-50",
};

function DropZone({
  label,
  file,
  isDragging,
  inputRef,
  accent,
  onFileSelect,
  onDragEnter,
  onDragLeave,
  onDrop,
}: DropZoneProps) {
  return (
    <button
      type="button"
      data-dragging={isDragging}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        onDragEnter();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        onDragLeave();
      }}
      onDrop={onDrop}
      className={`min-h-48 rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-left shadow-sm transition ${accentClasses[accent]}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
      />
      <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        PDF
      </span>
      <span className="block text-sm font-semibold text-slate-950">{label}</span>
      <span className="mt-2 block break-words text-sm text-slate-600">
        {file ? file.name : "Drop a PDF here or click to browse"}
      </span>
    </button>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}

function NumberField({ label, value, onChange, min = 0, step = 1, suffix }: NumberFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-2 flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 focus-within:border-slate-500 focus-within:bg-white">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-slate-950 outline-none"
        />
        {suffix ? <span className="text-xs font-medium text-slate-500">{suffix}</span> : null}
      </div>
    </label>
  );
}

export default UploadForm;
