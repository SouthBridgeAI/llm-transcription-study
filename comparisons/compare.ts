import chalk from "chalk";
import fs from "fs";

interface DiffResult {
  type: "equal" | "insert" | "delete" | "replace";
  value: string;
}

function myersDiff(oldStr: string[], newStr: string[]): DiffResult[] {
  const N = oldStr.length;
  const M = newStr.length;
  const max = N + M;
  const v = new Array(2 * max + 1).fill(0);
  const trace: number[][] = [];

  for (let d = 0; d <= max; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x, y;
      if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
        x = v[k + 1 + max];
      } else {
        x = v[k - 1 + max] + 1;
      }
      y = x - k;

      while (x < N && y < M && oldStr[x] === newStr[y]) {
        x++;
        y++;
      }

      v[k + max] = x;

      if (x >= N && y >= M) {
        return backtrack(trace, oldStr, newStr, max);
      }
    }
    trace.push([...v]);
  }
  return [];
}

function backtrack(
  trace: number[][],
  oldStr: string[],
  newStr: string[],
  max: number
): DiffResult[] {
  let x = oldStr.length;
  let y = newStr.length;
  const result: DiffResult[] = [];

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;

    let prevK;
    if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v[prevK + max];
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      result.unshift({ type: "equal", value: oldStr[x - 1] });
      x--;
      y--;
    }

    if (d > 0) {
      if (x === prevX) {
        result.unshift({ type: "insert", value: newStr[y - 1] });
        y--;
      } else {
        result.unshift({ type: "delete", value: oldStr[x - 1] });
        x--;
      }
    }
  }

  return result;
}

function calculateWER(reference: string[], hypothesis: string[]): number {
  const diff = myersDiff(reference, hypothesis);
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;

  for (let i = 0; i < diff.length; i++) {
    if (diff[i].type === "delete") {
      if (i + 1 < diff.length && diff[i + 1].type === "insert") {
        // This is a substitution
        substitutions++;
        i++; // Skip the next insert
      } else {
        deletions++;
      }
    } else if (diff[i].type === "insert") {
      insertions++;
    }
  }

  const totalErrors = substitutions + deletions + insertions;
  return totalErrors / reference.length;
}

function colorDiff(diff: DiffResult[], colorOnlyBad: boolean = false): string {
  return diff
    .map((item) => {
      switch (item.type) {
        case "equal":
          return item.value;
        case "insert":
          return colorOnlyBad ? chalk.red(item.value) : chalk.green(item.value);
        case "delete":
          return colorOnlyBad ? "" : chalk.red(item.value);
        case "replace":
          return colorOnlyBad
            ? chalk.red(item.value)
            : chalk.yellow(item.value);
      }
    })
    .join(" ");
}

function processTranscriptions(
  reference: string,
  transcriptions: {
    name: string;
    transcription: string;
  }[],
  colorOnlyBad: boolean = false
): void {
  // console.log(chalk.blue("Original passage:"));
  // console.log(reference);
  // console.log();

  reference = reference.toLowerCase().replace(/\,/g, "");

  const refWords = reference.split(/\s+/);

  transcriptions.forEach((transcription, index) => {
    transcription.transcription = transcription.transcription
      .toLowerCase()
      .replace(/\,/g, "");
    console.log(chalk.blue(`Transcription ${transcription.name}:`));
    const hypWords = transcription.transcription.split(/\s+/);
    const diff = myersDiff(refWords, hypWords);
    console.log(colorDiff(diff, colorOnlyBad));
    const wer = calculateWER(refWords, hypWords);
    console.log(chalk.yellow(`Word Error Rate: ${(wer * 100).toFixed(2)}%`));
    console.log();
  });
}
// Example usage
const originalPassage = fs.readFileSync(
  __dirname + "/voilatest/original.txt",
  "utf8"
);
const transcriptions = [
  {
    name: "Gemini Flash 002",
    transcription: fs.readFileSync(
      __dirname + "/voilatest/flash-002.txt",
      "utf8"
    ),
  },
  {
    name: "Gemini Flash (noise removed)",
    transcription: fs.readFileSync(
      __dirname + "/voilatest/flash-002-noise-removed.txt",
      "utf8"
    ),
  },
  {
    name: "Gemini Flash (with fixing in the prompt)",
    transcription: fs.readFileSync(
      __dirname + "/voilatest/flash-002-with-fixing.txt",
      "utf8"
    ),
  },
  {
    name: "AssemblyAI",
    transcription: fs.readFileSync(
      __dirname + "/voilatest/assemblyai.txt",
      "utf8"
    ),
  },
  {
    name: "Whisper Turbo",
    transcription: fs.readFileSync(
      __dirname + "/voilatest/whisper-turbo.txt",
      "utf8"
    ),
  },
  {
    name: "Whisper Turbo (noise removed)",
    transcription: fs.readFileSync(
      __dirname + "/voilatest/whisper-turbo-noise-removed.txt",
      "utf8"
    ),
  },
];

processTranscriptions(originalPassage, transcriptions, true);

console.log(
  "===================== Second one: Shadow of the erdtree (https://www.youtube.com/watch?v=ldTQoUxROzY) ======================"
);

const originalPassage2 = fs.readFileSync(
  __dirname + "/shadow-of-erdtree/original.txt",
  "utf8"
);

const transcriptions2 = [
  {
    name: "Gemini Flash 002",
    transcription: fs.readFileSync(
      __dirname + "/shadow-of-erdtree/flash-002.txt",
      "utf8"
    ),
  },
  {
    name: "Gemini Flash (with fixing in the prompt)",
    transcription: fs.readFileSync(
      __dirname + "/shadow-of-erdtree/flash-002-fixed.txt",
      "utf8"
    ),
  },
  {
    name: "Gemini Pro (with fixing in the prompt)",
    transcription: fs.readFileSync(
      __dirname + "/shadow-of-erdtree/pro-002.txt",
      "utf8"
    ),
  },
  {
    name: "AssemblyAI",
    transcription: fs.readFileSync(
      __dirname + "/shadow-of-erdtree/assemblyai.txt",
      "utf8"
    ),
  },
  {
    name: "Whisper Turbo",
    transcription: fs.readFileSync(
      __dirname + "/shadow-of-erdtree/whisper-turbo.txt",
      "utf8"
    ),
  },
];

processTranscriptions(originalPassage2, transcriptions2, true);
