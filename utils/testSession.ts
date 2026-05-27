export interface TestQuestion {
  id: number;
  section: string;
  passage?: string;
  question: string;
  options: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface TestSettings {
  durationMinutes: number;
  positiveMarks: number;
  negativeMarks: number;
}

export interface TestSession {
  questions: TestQuestion[];
  settings: TestSettings;
  createdAt: string;
}

const SESSION_KEY = "mcq-test-session";

export function saveTestSession(session: TestSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadTestSession(): TestSession | null {
  const rawSession = sessionStorage.getItem(SESSION_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as TestSession;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function extractQuestions(questionText: string, answerText: string): TestQuestion[] {
  const answers = extractAnswers(answerText);
  const explanations = extractExplanations(questionText);
  const normalized = normalizePdfText(questionText);
  const questionMarkers = findQuestionMarkers(normalized);
  const directionBlocks = findDirectionBlocks(normalized, questionMarkers);
  const questions: TestQuestion[] = [];

  questionMarkers.forEach((marker, index) => {
    const nextMarker = questionMarkers[index + 1];
    const body = stripTrailingDirections(
      stripSolutions(normalized.slice(marker.end, nextMarker?.start ?? normalized.length))
    );
    const directions = directionBlocks
      .slice()
      .reverse()
      .find(
      (block) => marker.id >= block.from && marker.id <= block.to
    );
    const parsed = splitQuestionAndOptions(body);
    const options = parsed.options.length >= 2 ? parsed.options : directions?.options ?? [];

    if (options.length >= 2) {
      questions.push({
        id: marker.id,
        section: sectionForIndex(questions.length),
        passage: directions?.text,
        question: parsed.question,
        options,
        correctAnswer: answers.get(marker.id),
        explanation: explanations.get(marker.id),
      });
    }
  });

  return questions;
}

function splitQuestionAndOptions(body: string) {
  const optionPattern = /(?:^|\s)(?:\(([A-Ea-e])\)|([A-Ea-e])[\).])\s+/g;
  const optionMatches = [...body.matchAll(optionPattern)];

  if (optionMatches.length === 0) {
    return { question: cleanExtractedText(body), options: [] };
  }

  const question = body.slice(0, optionMatches[0].index).trim();
  const options = optionMatches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index < optionMatches.length - 1 ? optionMatches[index + 1].index ?? body.length : body.length;
    const optionLetter = (match[1] || match[2]).toUpperCase();
    return `${optionLetter}. ${cleanExtractedText(body.slice(start, end))}`;
  });

  return { question: cleanExtractedText(question), options };
}

function extractAnswers(answerText: string) {
  const answers = new Map<number, string>();
  const normalized = normalizePdfText(answerText);
  const answerPattern = /(?:^|(?<=\s))(\d{1,3})(?:[\).:-])?\s+([A-Ea-e])(?=\s|$)/g;
  let match: RegExpExecArray | null;

  while ((match = answerPattern.exec(normalized)) !== null) {
    answers.set(Number(match[1]), match[2].toUpperCase());
  }

  return answers;
}

function extractExplanations(questionText: string) {
  const explanations = new Map<number, string>();
  const normalized = normalizePdfText(questionText);
  const solutionStart = normalized.search(/\bSolutions?\b/i);

  if (solutionStart === -1) {
    return explanations;
  }

  const solutionsText = normalized.slice(solutionStart);
  const explanationPattern =
    /\bS\s*(\d{1,3})\.\s*Ans\.\s*(?:\([A-Ea-e]\)|[A-Ea-e])?\s*(?:Sol\.)?\s*/gi;
  const matches = [...solutionsText.matchAll(explanationPattern)];

  matches.forEach((match, index) => {
    const id = Number(match[1]);
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index < matches.length - 1 ? matches[index + 1].index ?? solutionsText.length : solutionsText.length;
    const explanation = cleanExtractedText(solutionsText.slice(start, end));

    if (explanation) {
      explanations.set(id, explanation);
    }
  });

  return explanations;
}

interface QuestionMarker {
  id: number;
  start: number;
  end: number;
}

interface DirectionBlock {
  from: number;
  to: number;
  text: string;
  options?: string[];
}

function findQuestionMarkers(text: string): QuestionMarker[] {
  const questionPattern = /\bQ\.?\s*(\d{1,3})\s*[\).]\s*/gi;
  const markers: QuestionMarker[] = [];
  let match: RegExpExecArray | null;

  while ((match = questionPattern.exec(text)) !== null) {
    markers.push({
      id: Number(match[1]),
      start: match.index,
      end: questionPattern.lastIndex,
    });
  }

  return fixRepeatedQuestionNumbers(markers);
}

function findDirectionBlocks(text: string, questionMarkers: QuestionMarker[]) {
  const directionPattern =
    /Directions?\s*\(\s*(\d{1,3})\s*(?:[-–]\s*(\d{1,3}))?\s*\)\s*:/gi;
  const blocks: DirectionBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = directionPattern.exec(text)) !== null) {
    const from = Number(match[1]);
    const to = normalizeDirectionEnd(from, Number(match[2] ?? match[1]));
    const firstQuestion = questionMarkers.find((marker) => marker.id >= from && marker.id <= to);

    if (!firstQuestion || firstQuestion.start <= match.index) {
      continue;
    }

    const directionsText = cleanExtractedText(text.slice(match.index, firstQuestion.start));
    const parsedDirections = splitQuestionAndOptions(directionsText);
    const options = parsedDirections.options.length >= 2 ? parsedDirections.options : undefined;
    const displayText = options ? parsedDirections.question : directionsText;

    if (displayText.length > 120 || options) {
      blocks.push({ from, to, text: displayText, options });
    }
  }

  return blocks;
}

function fixRepeatedQuestionNumbers(markers: QuestionMarker[]) {
  return markers.map((marker, index) => {
    const previous = markers[index - 1];
    const next = markers[index + 1];

    if (previous && next && marker.id === next.id && marker.id > previous.id + 1) {
      return { ...marker, id: previous.id + 1 };
    }

    return marker;
  });
}

function normalizePdfText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/\b\d+\s+Adda247 App\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanExtractedText(text: string) {
  return text
    .replace(/\s+([,.;:?!])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function stripSolutions(text: string) {
  return text
    .replace(/\bSolutions?\s+S\s*1\b[\s\S]*$/i, "")
    .replace(/\bS\s*1\.\s*Ans\.[\s\S]*$/i, "")
    .trim();
}

function stripTrailingDirections(text: string) {
  return text.replace(/\bDirections?\s*\(\s*\d{1,3}\s*(?:[-–]\s*\d{1,3})?\s*\)\s*:[\s\S]*$/i, "").trim();
}

function normalizeDirectionEnd(from: number, to: number) {
  const likelyPageNumberMerged = to - from > 50;
  const lastTwoDigits = to % 100;

  if (likelyPageNumberMerged && lastTwoDigits >= from) {
    return lastTwoDigits;
  }

  return to;
}

function sectionForIndex(index: number) {
  const sectionNames = ["English", "Reasoning", "Quantitative Aptitude", "Professional Knowledge"];
  return sectionNames[Math.min(Math.floor(index / 50), sectionNames.length - 1)];
}
