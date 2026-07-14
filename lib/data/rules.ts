export interface StandingRule {
  id: string;
  category: RuleCategory;
  icon: string;
  title: string;
  one_liner: string;
  body: string;
  apply_when: string;
  examples?: string[];
}

export type RuleCategory =
  | "Voice & Tone"
  | "Outreach Craft"
  | "Targeting & Pipeline"
  | "Positioning"
  | "Negotiation"
  | "Frameworks"
  | "Process Discipline";


export const STANDING_RULES: StandingRule[] = [];

export const RULE_CATEGORIES: RuleCategory[] = [
  "Voice & Tone",
  "Outreach Craft",
  "Targeting & Pipeline",
  "Positioning",
  "Negotiation",
  "Frameworks",
  "Process Discipline",
];
