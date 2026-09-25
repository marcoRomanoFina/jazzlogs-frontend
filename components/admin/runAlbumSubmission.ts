import { ApiError } from "@/lib/api";

export type StepStatus = "pending" | "running" | "done" | "error";

export interface StepReport {
  key: string;
  label: string;
  status: StepStatus;
  error?: string;
}

interface SubmissionStep {
  key: string;
  label: string;
  run: () => Promise<void>;
}

export function omitEmpty<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null,
    ),
  ) as Partial<T>;
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return `${err.status}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return "Error desconocido";
}

async function runSteps(
  steps: SubmissionStep[],
  onUpdate: (reports: StepReport[]) => void,
): Promise<StepReport[]> {
  const reports: StepReport[] = steps.map((s) => ({
    key: s.key,
    label: s.label,
    status: "pending",
  }));
  onUpdate([...reports]);

  for (let i = 0; i < steps.length; i++) {
    reports[i] = { ...reports[i], status: "running" };
    onUpdate([...reports]);
    try {
      await steps[i].run();
      reports[i] = { ...reports[i], status: "done" };
    } catch (err) {
      reports[i] = { ...reports[i], status: "error", error: errorMessage(err) };
    }
    onUpdate([...reports]);
  }

  return reports;
}

async function retrySteps(
  steps: SubmissionStep[],
  previousReports: StepReport[],
  onUpdate: (reports: StepReport[]) => void,
): Promise<StepReport[]> {
  const stepsByKey = new Map(steps.map((s) => [s.key, s]));
  const reports = [...previousReports];

  for (let i = 0; i < reports.length; i++) {
    const r = reports[i];
    if (r.status !== "error") continue;
    const step = stepsByKey.get(r.key);
    if (!step) continue;

    reports[i] = { ...r, status: "running", error: undefined };
    onUpdate([...reports]);
    try {
      await step.run();
      reports[i] = { ...reports[i], status: "done", error: undefined };
    } catch (err) {
      reports[i] = { ...reports[i], status: "error", error: errorMessage(err) };
    }
    onUpdate([...reports]);
  }

  return reports;
}

export async function submitSteps(
  steps: SubmissionStep[],
  onUpdate: (reports: StepReport[]) => void,
): Promise<StepReport[]> {
  return runSteps(steps, onUpdate);
}

export async function retryFailedSteps(
  steps: SubmissionStep[],
  previousReports: StepReport[],
  onUpdate: (reports: StepReport[]) => void,
): Promise<StepReport[]> {
  return retrySteps(steps, previousReports, onUpdate);
}
