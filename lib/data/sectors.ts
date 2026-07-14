import type { Sector } from "../types";

export const SECTORS: Sector[] = [
  {
    id: "ai-saas",
    name: "🤖 AI-Native SaaS",
    thesis: "Companies where AI IS the product. Highest equity ceiling, fastest pace of change, best fit for an AI-native operator.",
    pattern: "A (Propulsion)",
    companies: ["Anthropic", "Sierra", "Glean", "Cursor"],
    pipelineIds: [],
  },
  {
    id: "healthcare-ai",
    name: "🏥 Healthcare AI",
    thesis: "AI maturing fast in clinical settings. Strong AU scene, clinical-buyer rapport-driven sales motion.",
    pattern: "D (Navigation) + A (Propulsion)",
    companies: ["Lyrebird Health", "Harrison.ai", "Decagon"],
    pipelineIds: [],
  },
  {
    id: "ai-agents",
    name: "🤝 AI Agents",
    thesis: "The frontier. Foundational seats at companies building autonomous AI agents for enterprise.",
    pattern: "A (Propulsion) + B (Captain)",
    companies: ["Sierra", "Decagon", "Wonderful", "Lorikeet", "Agency"],
    pipelineIds: [],
  },
  {
    id: "cyber",
    name: "🛡 Cybersecurity",
    thesis: "AI-native cyber exploding. Regulatory tailwinds keep budgets protected through downturns.",
    pattern: "C (Heavy Lift) or D (Navigation)",
    companies: ["CrowdStrike", "Wiz", "Snyk"],
    pipelineIds: [],
  },
  {
    id: "devtools",
    name: "⚙ DevTools",
    thesis: "Developer-facing infrastructure. AI-native shift accelerating.",
    pattern: "B (Captain) or C (Heavy Lift)",
    companies: ["Linear", "Octopus Deploy"],
    pipelineIds: [],
  },
  {
    id: "au-unicorns",
    name: "🇦🇺 AU Unicorns",
    thesis: "Local strength. Equity-for-every-hire policies common. Founder-friendly culture.",
    pattern: "B (Captain) or D (Navigation)",
    companies: ["SafetyCulture", "Immutable", "Airwallex", "Employment Hero"],
    pipelineIds: [],
  },
];
