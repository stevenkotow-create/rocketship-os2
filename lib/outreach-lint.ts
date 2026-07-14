// V5 · Outreach Lint Engine
// Implements the "Never Ask for the Job" Core Rule from the Outreach Strategy framework.
// The single most differentiated feature in the V5 ship · platform refuses to send messages
// that ask for the job. Every other tool lets candidates beg. ORS prevents it.

export type LintSeverity = "block" | "warn" | "ok";

export interface LintIssue {
  pattern: string;            // The phrase that triggered
  severity: LintSeverity;     // block = cannot send · warn = think twice · ok = stylistic
  category: string;           // What rule was broken
  reframe: string;            // What to say instead
  rule: string;               // The underlying principle
}

export interface LintResult {
  issues: LintIssue[];
  canSend: boolean;           // false if any "block" severity issues
  score: number;              // 0-100 quality score
  charCount: number;
  charLimit?: number;
  charsOverLimit: number;
}

// ── BLOCKING patterns · message cannot be sent ──
// These are the "asking for the job" anti-patterns from the Outreach Strategy doc Core Rule
const BLOCK_PATTERNS: Array<{ pattern: RegExp; phrase: string; category: string; reframe: string; rule: string }> = [
  {
    pattern: /\b(would|d|i'd)?\s*love to be considered\b/i,
    phrase: "love to be considered",
    category: "Asking for the job",
    reframe: "Express conviction about the company instead. e.g. 'The company's thesis lands for me because...'",
    rule: "You never ask for the job. You express conviction about the company and the market.",
  },
  {
    pattern: /\b(i'm|i am|just)\s+applying for\b/i,
    phrase: "applying for",
    category: "Asking for the job",
    reframe: "Don't announce the application. Lead with what about the company pulled you in.",
    rule: "Application status is your business. Conviction is what they want to hear.",
  },
  {
    pattern: /\b(i'd|would)\s+love (an interview|to interview|the chance to interview)\b/i,
    phrase: "love an interview",
    category: "Asking for the job",
    reframe: "Goal is for them to say 'you should apply' or 'let's chat.' You don't ask · they offer.",
    rule: "Make them offer it.",
  },
  {
    pattern: /\b(any\s+(opportunit|opening|role|seat)|opportunities at)\b/i,
    phrase: "any openings / opportunities",
    category: "Asking for the job",
    reframe: "Generic ask · feels like every other DM in their inbox. Be specific about why this company specifically.",
    rule: "Specific conviction beats generic availability.",
  },
  {
    pattern: /\b(consider|considering)\s+me\b/i,
    phrase: "consider me",
    category: "Asking for the job",
    reframe: "Position yourself as a peer or fellow operator · not a candidate waiting for permission.",
    rule: "Peer energy beats candidate energy.",
  },
  {
    pattern: /\b(open to|looking for|seeking)\s+(opportunit|role|position|seat)\b/i,
    phrase: "open to opportunities / seeking",
    category: "Asking for the job",
    reframe: "Don't telegraph need. Lead with a thesis about the company's market or product.",
    rule: "Need broadcasts weakness. Thesis broadcasts depth.",
  },
  {
    pattern: /\b(hire|hiring)\s+me\b/i,
    phrase: "hire me",
    category: "Asking for the job",
    reframe: "Make them want to talk to you · don't tell them what to do.",
    rule: "The ask is implicit. The conviction is explicit.",
  },
];

// ── WARNING patterns · think twice ──
const WARN_PATTERNS: Array<{ pattern: RegExp; phrase: string; category: string; reframe: string; rule: string }> = [
  {
    pattern: /\b(quick\s+(question|chat|call|introduction)|follow(\s+|-)?up)\b/i,
    phrase: "Quick question / Follow up",
    category: "Generic subject pattern",
    reframe: "Specific company + role + differentiator under 60 chars. Memory rule: subject-line-audit.",
    rule: "Generic subject lines fail at the open.",
  },
  {
    pattern: /\b(my (phone )?number is|call me at|text me at|my mobile|\+\d{1,3}\s?\d{3,}|\(\d{3}\)\s?\d{3})\b/i,
    phrase: "Phone number in cold message",
    category: "Premature contact info",
    reframe: "Share phone only after positive reply. Cold message ≠ broadcast channel.",
    rule: "Phone in cold message reads presumptuous.",
  },
  {
    pattern: /\b(calendly|book a time|schedule a call|here's my calendar|cal\.com|calendar\.app)\b/i,
    phrase: "Scheduling link in cold message",
    category: "Premature contact info",
    reframe: "Scheduling link before they've said yes is asking for the wrong thing.",
    rule: "Earn the calendar slot · don't demand it.",
  },
  {
    pattern: /\bi'm a (great fit|perfect fit|good fit)\b/i,
    phrase: "I'm a great fit",
    category: "Telling vs showing",
    reframe: "Show, don't tell. State the specific structural overlap, not the conclusion.",
    rule: "Self-assessment lands as bravado. Evidence lands as credibility.",
  },
  {
    pattern: /\bjust (wanted|wondering|thought)\b/i,
    phrase: "Just wanted / wondering / thought",
    category: "Hedging language",
    reframe: "Confident declarative prose · per executive-presence memory rule.",
    rule: "Hedging makes you smaller. Active voice makes you peer-equal.",
  },
];

// ── CHECKLIST · 10-item Pre-Send Gate (F18 from V2 mining) ──
export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  detail: string;
}

export const PRE_SEND_CHECKLIST: ChecklistItem[] = [
  {
    id: "anchor-genuine",
    category: "Research",
    label: "Personal anchor is genuine",
    detail: "Shared location, event meeting, podcast reference, mutual connection. Fabricated anchors collapse in conversation.",
  },
  {
    id: "no-asking",
    category: "Core Rule",
    label: "You never asked for the job",
    detail: "No mention of applying, 'I'd love to be considered.' Express conviction about the company and the market.",
  },
  {
    id: "under-300",
    category: "Format",
    label: "Connection note under 300 characters",
    detail: "LinkedIn truncates over 300 · truncated notes look careless.",
  },
  {
    id: "no-contact-info",
    category: "Tone",
    label: "No phone numbers or scheduling links",
    detail: "Share those only after a positive reply.",
  },
  {
    id: "researched-person",
    category: "Research",
    label: "You've done the research on this specific person",
    detail: "Not just their title · tenure, background, quoted beliefs. Message only makes sense to them.",
  },
  {
    id: "sequencing",
    category: "Discipline",
    label: "Sequencing is correct · no tier jumping",
    detail: "Warm + HM tiers before exec. 5-7 days between layers. Parallel tracks fine · leapfrogging not.",
  },
  {
    id: "one-ask",
    category: "Format",
    label: "One ask only",
    detail: "One question, one request, one invitation. Multiple asks dilute response rate.",
  },
  {
    id: "language-mirror",
    category: "Research",
    label: "Company and role language mirrored back",
    detail: "Use company's own words where they fit naturally. Signals you've done the work.",
  },
  {
    id: "framing-accurate",
    category: "Tone",
    label: "Framing of how you met is accurate",
    detail: "'Introduced myself at the conference' lands differently to 'we crossed paths.' Be intentional.",
  },
  {
    id: "claims-defensible",
    category: "Accuracy",
    label: "You can defend every claim made",
    detail: "If they ask 'tell me more about that' · can you? Accuracy beats impressive-sounding.",
  },
];

// ── MAIN LINT FUNCTION ──
export function lintOutreach(
  text: string,
  options?: { charLimit?: number }
): LintResult {
  const issues: LintIssue[] = [];
  const charCount = text.length;
  const charLimit = options?.charLimit;
  const charsOverLimit = charLimit ? Math.max(0, charCount - charLimit) : 0;

  // Check block patterns
  for (const { pattern, phrase, category, reframe, rule } of BLOCK_PATTERNS) {
    if (pattern.test(text)) {
      issues.push({
        pattern: phrase,
        severity: "block",
        category,
        reframe,
        rule,
      });
    }
  }

  // Check warn patterns
  for (const { pattern, phrase, category, reframe, rule } of WARN_PATTERNS) {
    if (pattern.test(text)) {
      issues.push({
        pattern: phrase,
        severity: "warn",
        category,
        reframe,
        rule,
      });
    }
  }

  // Character limit as a blocking issue
  if (charLimit && charsOverLimit > 0) {
    issues.push({
      pattern: `${charCount}/${charLimit} chars`,
      severity: "block",
      category: "Format",
      reframe: `Trim ${charsOverLimit} characters. LinkedIn hard-caps at ${charLimit} · truncated notes look careless.`,
      rule: "Connection notes under 300 chars hard limit.",
    });
  }

  const blocks = issues.filter((i) => i.severity === "block").length;
  const warns = issues.filter((i) => i.severity === "warn").length;
  const canSend = blocks === 0;

  // Score · 100 minus 20 per block minus 8 per warn · floor 0
  const score = Math.max(0, 100 - blocks * 20 - warns * 8);

  return {
    issues,
    canSend,
    score,
    charCount,
    charLimit,
    charsOverLimit,
  };
}
