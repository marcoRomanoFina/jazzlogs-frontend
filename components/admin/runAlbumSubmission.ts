import { apiFetch, ApiError } from "@/lib/api";
import type { AlbumFormValues } from "@/lib/validations/album";

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

function buildAlbumPayload(values: AlbumFormValues) {
  return omitEmpty({
    artistId: values.artistId,
    spotifyAlbumId: values.spotifyAlbumId,
    logNumber: values.logNumber,
    label: values.label,
    vocalProfile: values.vocalProfile,
    energy: values.energy,
    moodIntensity: values.moodIntensity,
    accessibility: values.accessibility,
    instagramPermalink: values.instagramPermalink,
  });
}

export async function submitFicha(
  values: AlbumFormValues,
  onUpdate: (reports: StepReport[]) => void,
): Promise<{ albumId: string | null; reports: StepReport[] }> {
  const reports: StepReport[] = [
    { key: "album", label: "Guardar ficha", status: "running" },
  ];
  onUpdate([...reports]);

  try {
    const created = await apiFetch<{ id: string }>("/albums", {
      method: "POST",
      body: JSON.stringify(buildAlbumPayload(values)),
    });
    reports[0] = { ...reports[0], status: "done" };
    onUpdate([...reports]);
    return { albumId: created.id, reports };
  } catch (err) {
    reports[0] = { ...reports[0], status: "error", error: errorMessage(err) };
    onUpdate([...reports]);
    return { albumId: null, reports };
  }
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
