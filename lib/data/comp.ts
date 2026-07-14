export interface CompBenchmark {
  company: string;
  base: number;
  ote: number;
  topPerformer: number;
  category?: string;
}

// Senior Tech AE comp packages · June 2026 · USD denominated · public market reference data
export const SENIOR_AE_COMP_JUNE_2026: CompBenchmark[] = [
  { company: "Google Cloud", base: 151, ote: 355, topPerformer: 1315, category: "Cloud Infra" },
  { company: "Mulesoft (Salesforce)", base: 175, ote: 350, topPerformer: 1326, category: "Integration" },
  { company: "Palo Alto Networks", base: 175, ote: 350, topPerformer: 1047, category: "Cybersecurity" },
  { company: "Adobe", base: 175, ote: 345, topPerformer: 1052, category: "Productivity SaaS" },
  { company: "Tanium", base: 172, ote: 345, topPerformer: 1329, category: "Cybersecurity" },
  { company: "Nutanix", base: 165, ote: 330, topPerformer: 1421, category: "Cloud Infra" },
  { company: "Zscaler", base: 165, ote: 330, topPerformer: 1193, category: "Cybersecurity" },
  { company: "Samsara", base: 140, ote: 330, topPerformer: 1347, category: "IoT/Ops" },
  { company: "UiPath", base: 172, ote: 328, topPerformer: 1319, category: "Automation" },
  { company: "Chainguard", base: 162, ote: 325, topPerformer: 1302, category: "AI-Native Cybersecurity" },
  { company: "Box", base: 160, ote: 320, topPerformer: 1167, category: "Productivity SaaS" },
  { company: "Ping Identity", base: 150, ote: 320, topPerformer: 1196, category: "Cybersecurity" },
  { company: "Salesforce", base: 165, ote: 320, topPerformer: 1406, category: "CRM" },
  { company: "Snowflake", base: 160, ote: 320, topPerformer: 1396, category: "Data Cloud" },
  { company: "ServiceNow", base: 165, ote: 320, topPerformer: 986, category: "Enterprise SaaS" },
  { company: "Wiz", base: 161, ote: 320, topPerformer: 993, category: "AI-Native Cybersecurity" },
  { company: "Databricks", base: 160, ote: 320, topPerformer: 1306, category: "Data Cloud" },
];

// Your pipeline matches against the benchmark dataset
export const PIPELINE_MATCHES: { company: string; note: string }[] = [];

// Adjacent extrapolated comp bands
export const AI_NATIVE_EXTRAPOLATED: { company: string; oteEstimate: string; reason: string }[] = [];
