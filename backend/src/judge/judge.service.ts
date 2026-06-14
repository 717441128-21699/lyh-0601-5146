import { Injectable, Logger } from '@nestjs/common';
import { ProgrammingLanguage } from '../submissions/entities/submission.entity';
import { SubmissionStatus } from '../submissions/entities/submission.entity';
import { TestCase } from '../problems/entities/problem.entity';

export interface JudgeRequest {
  problemId: number;
  language: ProgrammingLanguage;
  code: string;
  timeLimit: number;
  memoryLimit: number;
  testCases?: TestCase[];
}

export interface TestCaseResult {
  id: number;
  passed: boolean;
  runTime: number;
  memoryUsage: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  errorMessage?: string;
}

export interface JudgeResult {
  status: SubmissionStatus;
  runTime: number;
  memoryUsage: number;
  errorMessage?: string;
  details: TestCaseResult[];
}

interface LanguageConfig {
  name: string;
  extension: string;
  compileCommand?: (sourceFile: string, outputFile: string) => string;
  runCommand: (fileName: string) => string;
  compilerOutputFile: (sourceFile: string) => string;
}

const LANGUAGE_CONFIGS: Record<ProgrammingLanguage, LanguageConfig> = {
  [ProgrammingLanguage.CPP]: {
    name: 'C++',
    extension: 'cpp',
    compileCommand: (sourceFile: string, outputFile: string) =>
      `g++ -O2 -o ${outputFile} ${sourceFile} -std=c++17`,
    runCommand: (fileName: string) => fileName,
    compilerOutputFile: (_sourceFile: string) => 'solution',
  },
  [ProgrammingLanguage.JAVA]: {
    name: 'Java',
    extension: 'java',
    compileCommand: (sourceFile: string, _outputFile: string) =>
      `javac ${sourceFile}`,
    runCommand: (fileName: string) => `java -cp /sandbox Main`,
    compilerOutputFile: (_sourceFile: string) => 'Main.class',
  },
  [ProgrammingLanguage.PYTHON]: {
    name: 'Python',
    extension: 'py',
    runCommand: (fileName: string) => `python3 ${fileName}`,
    compilerOutputFile: (sourceFile: string) => sourceFile,
  },
  [ProgrammingLanguage.JAVASCRIPT]: {
    name: 'JavaScript',
    extension: 'js',
    runCommand: (fileName: string) => `node ${fileName}`,
    compilerOutputFile: (sourceFile: string) => sourceFile,
  },
};

function normalizeOutput(output: string): string {
  return output
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n+$/, '')
    .trim();
}

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);

  private async simulateCompilation(
    code: string,
    language: ProgrammingLanguage,
  ): Promise<{ success: boolean; errorMessage?: string }> {
    await this.delay(200 + Math.random() * 300);

    if (language === ProgrammingLanguage.CPP) {
      if (code.includes('#include') && code.includes('main')) {
        return { success: true };
      }
      if (!code.includes('main')) {
        return { success: false, errorMessage: 'compilation error: missing main function' };
      }
    }

    if (language === ProgrammingLanguage.JAVA) {
      if (!code.includes('public static void main')) {
        return { success: false, errorMessage: 'compilation error: missing main method' };
      }
    }

    if (language === ProgrammingLanguage.PYTHON) {
      try {
        if (code.includes('syntax_error_test')) {
          throw new Error('SyntaxError: invalid syntax');
        }
        return { success: true };
      } catch (e: any) {
        return { success: false, errorMessage: `compilation error: ${e.message}` };
      }
    }

    return { success: true };
  }

  private simulateExecution(
    code: string,
    input: string,
    language: ProgrammingLanguage,
    timeLimit: number,
  ): { output: string; runTime: number; memoryUsage: number; error?: string } {
    const startTime = Date.now();
    const sleepTime = 50 + Math.random() * 150;

    let output = '';
    let error: string | undefined;

    try {
      if (sleepTime > timeLimit) {
        return {
          output: '',
          runTime: timeLimit + 100,
          memoryUsage: 10240,
          error: 'Time Limit Exceeded',
        };
      }

      if (language === ProgrammingLanguage.PYTHON) {
        const a = parseInt(input.split(' ')[0]) || 0;
        const b = parseInt(input.split(' ')[1]) || 0;
        output = `${a + b}\n`;
      } else if (language === ProgrammingLanguage.JAVASCRIPT) {
        const a = parseInt(input.split(' ')[0]) || 0;
        const b = parseInt(input.split(' ')[1]) || 0;
        output = `${a + b}\n`;
      } else if (language === ProgrammingLanguage.CPP) {
        const a = parseInt(input.split(' ')[0]) || 0;
        const b = parseInt(input.split(' ')[1]) || 0;
        output = `${a + b}\n`;
      } else if (language === ProgrammingLanguage.JAVA) {
        const a = parseInt(input.split(' ')[0]) || 0;
        const b = parseInt(input.split(' ')[1]) || 0;
        output = `${a + b}\n`;
      }

      if (code.includes('force_wa_test')) {
        output = 'wrong answer output\n';
      }

      if (code.includes('force_re_test')) {
        throw new Error('Segmentation Fault');
      }

      if (code.includes('force_mle_test')) {
        return {
          output,
          runTime: sleepTime,
          memoryUsage: 1000000,
          error: 'Memory Limit Exceeded',
        };
      }
    } catch (e: any) {
      error = e.message;
    }

    const runTime = Date.now() - startTime;
    const memoryUsage = 5120 + Math.floor(Math.random() * 10240);

    return { output, runTime, memoryUsage, error };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async judge(request: JudgeRequest): Promise<JudgeResult> {
    const { problemId, language, code, timeLimit, memoryLimit, testCases } = request;

    this.logger.log(`开始评测: problemId=${problemId}, language=${language}`);

    const cases: TestCase[] = testCases && testCases.length > 0 ? testCases : [
      { id: 1, input: '1 2\n', expectedOutput: '3\n' },
      { id: 2, input: '10 20\n', expectedOutput: '30\n' },
      { id: 3, input: '-5 5\n', expectedOutput: '0\n' },
      { id: 4, input: '100 200\n', expectedOutput: '300\n' },
      { id: 5, input: '999999 1\n', expectedOutput: '1000000\n' },
    ];

    const compilationResult = await this.simulateCompilation(code, language);
    if (!compilationResult.success) {
      return {
        status: SubmissionStatus.COMPILATION_ERROR,
        runTime: 0,
        memoryUsage: 0,
        errorMessage: compilationResult.errorMessage,
        details: [],
      };
    }

    const details: TestCaseResult[] = [];
    let allPassed = true;
    let totalTime = 0;
    let maxMemory = 0;
    let finalStatus = SubmissionStatus.ACCEPTED;

    for (const testCase of cases) {
      const execution = this.simulateExecution(
        code,
        testCase.input,
        language,
        timeLimit,
      );

      totalTime = Math.max(totalTime, execution.runTime);
      maxMemory = Math.max(maxMemory, execution.memoryUsage);

      if (execution.error === 'Time Limit Exceeded') {
        details.push({
          id: testCase.id,
          passed: false,
          runTime: execution.runTime,
          memoryUsage: execution.memoryUsage,
          errorMessage: 'Time Limit Exceeded',
        });
        allPassed = false;
        if (finalStatus === SubmissionStatus.ACCEPTED) {
          finalStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
        }
        continue;
      }

      if (execution.error === 'Memory Limit Exceeded') {
        details.push({
          id: testCase.id,
          passed: false,
          runTime: execution.runTime,
          memoryUsage: execution.memoryUsage,
          errorMessage: 'Memory Limit Exceeded',
        });
        allPassed = false;
        if (finalStatus === SubmissionStatus.ACCEPTED) {
          finalStatus = SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
        }
        continue;
      }

      if (execution.error) {
        details.push({
          id: testCase.id,
          passed: false,
          runTime: execution.runTime,
          memoryUsage: execution.memoryUsage,
          errorMessage: execution.error,
        });
        allPassed = false;
        if (finalStatus === SubmissionStatus.ACCEPTED) {
          finalStatus = SubmissionStatus.RUNTIME_ERROR;
        }
        continue;
      }

      const expectedNormalized = normalizeOutput(testCase.expectedOutput);
      const actualNormalized = normalizeOutput(execution.output);
      const passed = expectedNormalized === actualNormalized;

      details.push({
        id: testCase.id,
        passed,
        runTime: execution.runTime,
        memoryUsage: execution.memoryUsage,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: execution.output,
      });

      if (!passed) {
        allPassed = false;
        if (finalStatus === SubmissionStatus.ACCEPTED) {
          finalStatus = SubmissionStatus.WRONG_ANSWER;
        }
      }
    }

    if (allPassed) {
      finalStatus = SubmissionStatus.ACCEPTED;
    }

    this.logger.log(
      `评测完成: problemId=${problemId}, status=${finalStatus}, time=${totalTime}ms, memory=${maxMemory}KB`,
    );

    return {
      status: finalStatus,
      runTime: totalTime,
      memoryUsage: maxMemory,
      details,
    };
  }

  getSupportedLanguages(): ProgrammingLanguage[] {
    return Object.values(ProgrammingLanguage);
  }

  getLanguageConfig(language: ProgrammingLanguage): LanguageConfig {
    return LANGUAGE_CONFIGS[language];
  }
}
