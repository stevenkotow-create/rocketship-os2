export interface CompBenchmark {
  company: string;
  base: number;
  ote: number;
  topPerformer: number;
  category?: string;
}

// Comp benchmark dataset · populate with your own market research
export const SENIOR_AE_COMP_JUNE_2026: CompBenchmark[] = [];

// Your pipeline matches against the benchmark dataset
export const PIPELINE_MATCHES: { company: string; note: string }[] = [];

// Adjacent extrapolated comp bands
export const AI_NATIVE_EXTRAPOLATED: { company: string; oteEstimate: string; reason: string }[] = [];
