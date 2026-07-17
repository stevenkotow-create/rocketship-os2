export type Stage =
  | "targeting" // Saved
  | "contacted" // Contacted
  | "applied"   // Applied
  | "early"     // Interviewing
  | "late"      // Final rounds
  | "offer"     // Offer
  | "accepted"  // Accepted
  | "closed";   // Closed

export type Pattern = "A" | "B" | "C" | "D" | "E";
export type Priority = "P1" | "P2" | "P3" | "Watch";
export type EquityCeiling = "rocket" | "est" | "mature";

export interface Score {
  v: number; // Values /25
  l: number; // Layers /4
  r: number; // Realism /10
  c: number; // Cycle pace /5
  eq: EquityCeiling;
}

export type ContactStatus = "identified" | "silent" | "dm" | "replied" | "cold" | "advanced";
export type ContactRole = "APAC_AE" | "GTM_RECRUITER" | "PEER" | "FOUNDER" | "HM" | "OTHER";

// Star Map V2 · engagement tracking per stakeholder
export interface EngagementEvent {
  type: "like" | "comment" | "post-share" | "silent-connect" | "dm-sent" | "reply" | "meeting-booked";
  date: string; // ISO
  note?: string;
}

export interface Contact {
  name: string;
  role: ContactRole;
  title?: string;
  linkedin?: string;
  status: ContactStatus;
  contactedAt?: string;
  notes?: string;
  // V2 additions · 3-stakeholder framework + pre-touch engagement cadence
  preTouchStartedAt?: string; // ISO · when the 3-5 day engagement cadence began
  engagementHistory?: EngagementEvent[]; // log of likes, comments, DMs, replies
  dmDraft?: string; // full post-connect-accepted DM (no char limit · sent Day 5-7)
  connectNote?: string; // 300-char connect-request note · sent WITH silent connect Day 0 · scroll-stop hook · same voice as dmDraft but compressed
  lastTouchAt?: string; // ISO · most recent engagement event
  responseAt?: string; // ISO · when they replied
  meetingBookedFor?: string; // ISO · if a call is scheduled
  // V2.4 · Star Map verification gate · prevents AI-surfaced stakeholder drift
  verified?: boolean; // the candidate explicitly confirmed LinkedIn URL is real + correct person
  verifiedAt?: string; // ISO
  // V2.4 · Threading research · per-stakeholder personalisation feed
  personalHook?: string; // candidate-input fact / recent post / mutual connection · feeds DM personalisation line
  // Auto-scaffold · role-mapped slot metadata (deterministic, no AI)
  tier?: "core" | "backup" | "round2"; // core = first-touch three, backup = fallback, round2 = activate at interview stage
  searchRecipe?: string; // LinkedIn search string to find the real person for this slot
  searchKeyword?: string; // clean role keyword for the LinkedIn people-search deep link
  enrichment?: string; // LinkedIn Bridge · pasted-back Claude output: what they care about + hooks + connect note + DM
}

// Star Map V2 · auto-computed stakeholder health per opp
export type StakeholderHealth = "complete" | "partial" | "single-thread" | "unthreaded";

// V2.1 · Probes Inbox · Tinder triage queue from morning + midday probes
// V2.3 · Probes now evaluate COMPANIES (not individual JDs). Auto-eval runs on intake,
// roles are auto-discovered, and approval branches into Watch (relationship-build only)
// or Apply (pick a live role, triggers Interview Playbook draft pipeline).
export type TriageStatus = "pending" | "approved" | "denied" | "later" | "watchlist";
export type ProbeSource = "morning-probe" | "midday-probe" | "manual" | "watchlist-promotion";

// V2.3 · live role auto-discovered at probe time
// Sources tier of reliability: ashby/greenhouse/lever > linkedin-jobs > company-careers
export type RoleSource = "ashby" | "greenhouse" | "lever" | "linkedin-jobs" | "company-careers";

export interface AvailableRole {
  title: string;
  type: string; // SDR / BDR / AE / AM / CSM / BDE etc.
  location: string;
  url: string;
  source: RoleSource;
  postedAt?: string; // ISO · used for 90-day freshness gate
  apacFit: boolean; // hard rule from memory
  tierFit: boolean; // matches the candidate's IC tier (SDR/BDR/AM/CSM/SMB-MM AE)
  freshnessOK: boolean; // posted within 90 days
  notes?: string; // why this role surfaced (e.g. "the candidate's exact lane via role-type mapping")
}

export interface Triage {
  status: TriageStatus;
  surfacedAt: string; // ISO · when probe surfaced this candidate
  surfacedBy: ProbeSource;
  decidedAt?: string; // ISO · when the candidate approved / denied / latered / watchlisted
  summary?: string; // 1-2 sentence overview shown on the probe card
  denialReason?: string; // why jettisoned · for the JETTISONED registry
  laterUntil?: string; // ISO · resurface date if Later
  // V2.3 · company-level intel surfaced at probe time
  companyEvaluation?: CompanyEvaluation; // 6-dim score for the COMPANY (not a single role)
  availableRoles?: AvailableRole[]; // auto-discovered fits at probe time, filtered by APAC + tier + freshness
  appliedToRoleUrl?: string; // populated when Apply is chosen + a role is picked
  watchUntil?: string; // ISO · 30-day re-probe trigger for Watch path
}

// Six-Dimension Company Evaluator · operator playbook scoring engine
export type EvaluationVerdict = "rocket" | "watchlist" | "jettison";

export interface CompanyEvaluation {
  scoredAt: string; // ISO
  // The 6 dimensions · each scored 1-5
  layerInStack: number; // Infrastructure / Platform / Horizontal / Vertical / AI-Agentic
  layerNote?: string;
  categoryMaturity: number; // Emerging / Growth / Mature
  categoryNote?: string;
  stageOfGrowth: number; // Startup / Scale-up / Established
  stageNote?: string;
  gtmMotion: number; // PLG / SLG / Channel · scored on fit-to-candidate
  gtmNote?: string;
  commercialHealth: number; // Funding + ARR + customer logos + roadmap
  commercialNote?: string;
  mustHave: number; // 1 = nice-to-have only, 5 = mission-critical
  mustHaveNote?: string;
  // Computed
  totalScore: number; // sum of 6 dimensions · max 30
  strongDimensions: number; // count of dimensions scored >= 4
  verdict: EvaluationVerdict; // 4+ strong = rocket, 2-3 strong = watchlist, 0-1 = jettison
  apacGate?: boolean; // hard rule from memory · must be APAC-located seat
  freshnessGate?: boolean; // hard rule · role posted within 90 days
}

export interface ReferenceStatus {
  briefed: boolean;
  briefedAt?: string;
  expectedCallWindow?: string;
  outcome?: "pending" | "completed" | "not_needed";
  notes?: string;
}

export interface MissionTimestamp {
  event: string; // e.g. "Intel gathered" · "Star map locked" · "ATS submitted" · "DMs sent" · "Reply received"
  date: string; // ISO date
  hours?: number; // hours of work logged at this event (cumulative since previous timestamp)
  note?: string;
}

export interface Opportunity {
  id: string;
  company: string;
  position: string;
  type: string;
  location: string;
  stage: Stage;
  priority?: Priority;
  pattern?: Pattern;
  hm?: string;
  contacts?: Contact[];
  reference?: ReferenceStatus;
  score?: Score;
  note?: string;
  url?: string;
  loom?: boolean;
  live?: boolean;
  action?: string;
  daysInStage?: number;
  stale?: boolean;
  hoursSpent?: number; // total hours invested end-to-end
  timestamps?: MissionTimestamp[]; // event log
  patternType?: "first" | "reuse"; // first-of-pattern or framework reuse · informs velocity expectation
  // V2 additions · the operator playbook engine
  evaluation?: CompanyEvaluation; // Six-Dimension Evaluator score
  stakeholderHealth?: StakeholderHealth; // auto-computed from contacts array · multi-thread alert source
  meddpicc?: MEDDPICC; // qualification depth tracker
  triage?: Triage; // V2.1 · Probes Inbox triage state
  research?: ThreadingResearch; // V2.4 · per-opp research that feeds DM hooks + cover letter
  researchPack?: string; // full star-map research pack pasted back from Claude.ai
  hmTemplateVariant?: "A" | "B"; // V2.4 · HM DM template selector · A = warm (Thanks for connecting) · B = direct (I've applied for...)
  // V3.5 · Interview Prep Module · per-opp structured prep
  interviewPrep?: InterviewPrep;
}

// V3.5 · Interview Prep Module · structured per-opp prep that powers /interview-day + Mission Profile
// 5-stage interview framework + Operating Principles decoder + Sources audit + accountability lines

export type InterviewStage =
  | "recruiter-screen"
  | "hm-screen"
  | "peer-round"
  | "exec-round"
  | "offer-stage";

export interface InterviewStageCheck {
  stage: InterviewStage;
  scheduledFor?: string; // ISO · when this round is scheduled
  withWhom?: string; // interviewer name
  preCallNotes?: string; // 30-min-before checklist notes
  duringCallPrompts?: string[]; // bullet prompts to glance at during call
  postCallNotes?: string; // immediate post-call log
  thankYouSentAt?: string; // ISO · when thank-you DM fired
  completed: boolean;
  completedAt?: string;
}

export interface OperatingPrinciple {
  principle: string; // the company's own principle text
  source: string; // URL or doc reference · NEVER allowed to be empty per Sources rule
  decode: string; // the candidate's interpretation · "what they really mean by this"
  exampleAnswer?: string; // pre-rehearsed answer that demonstrates the principle
}

export interface InterviewSource {
  claim: string; // the claim being made in prep (e.g. "Company X has 70% market share")
  source: string; // where the claim came from · URL, doc, person
  date?: string; // when sourced
  verified?: boolean; // user explicitly verified
}

export interface InterviewPrep {
  stages: InterviewStageCheck[]; // 5-stage progress tracker
  operatingPrinciples?: OperatingPrinciple[]; // company-specific principles decoded
  sources?: InterviewSource[]; // audit trail for every claim · non-negotiable per memory
  ninetySecOpener?: string; // pre-rehearsed 90-sec narrative
  accountabilityLines?: string[]; // 4-6 "I don't know but I'll get back to you in 24 hrs" variants
  keyQuestions?: string[]; // questions to ask the interviewer · 3-4 per round
  thankYouDmTemplate?: string; // pre-drafted thank-you DM with placeholders
  updatedAt?: string; // ISO
}

// V2.4 · Threading Research Layer
// Four-step research surface that feeds Mission Profile · drives cover letter hooks + DM scroll-stop openers + per-stakeholder personalisation
export type SignalsType = "earnings" | "funding" | "podcast" | "leadership" | "other";

export interface RecentNewsItem {
  date: string; // ISO
  headline: string;
  url?: string;
}

export interface ThreadingResearch {
  companyOverview?: string; // 1-2 paragraph snapshot from web research · feeds cover letter
  signalsType?: SignalsType; // public earnings vs private funding round vs podcast etc.
  signalsContent?: string; // structured content of the most recent commercial signal
  recentNews?: RecentNewsItem[]; // press releases / announcements last 30 days
  perStakeholderHooks?: Record<string, string>; // contact.name → one-line personal hook
  scrollStopOpener?: string; // the line that becomes the HM DM scroll-stop opener
  freshnessGate?: boolean; // computed · true if any signal within 30 days · false = watchlist signal
  researchUpdatedAt?: string; // ISO · last touched
}

// MEDDPICC · 7-field qualification framework (industry-standard enterprise sales qualification)
// Each field stores a 1-3 confidence rating · 1 unmapped, 2 partial, 3 mapped solid
export interface MEDDPICC {
  metrics?: { rating: 1 | 2 | 3; note?: string }; // role + comp range understood
  economicBuyer?: { rating: 1 | 2 | 3; note?: string }; // HM identified + intel
  decisionCriteria?: { rating: 1 | 2 | 3; note?: string }; // how they actually hire
  decisionProcess?: { rating: 1 | 2 | 3; note?: string }; // interview sequence mapped
  identifyPain?: { rating: 1 | 2 | 3; note?: string }; // why hiring now
  champion?: { rating: 1 | 2 | 3; note?: string }; // your internal referrer
  competition?: { rating: 1 | 2 | 3; note?: string }; // other candidates in process
}

export interface PhaseTask {
  phase: 1 | 2 | 3 | 4;
  id: string;
  title: string;
  done: boolean;
  note?: string;
  next?: boolean;
}

export interface PatternDef {
  letter: Pattern;
  name: string;
  desc: string;
  when: string;
}

export interface Framework {
  id: string;
  title: string;
  body: string;
}

export interface Sector {
  id: string;
  name: string;
  thesis: string;
  pattern: string;
  companies: string[];
  pipelineIds: string[];
}

export interface DailyEntry {
  win?: string;
  lesson?: string;
  obs?: string;
  pod?: string;
}

export interface RitualEntry {
  apps: number;
  outreach: number;
  followups: number;
  practice: number;
}

export interface BrandPost {
  id: string;
  title: string;
  body: string;
  status: "draft" | "scheduled" | "published";
  scheduledFor?: string;
  publishedAt?: string;
  engagement?: { likes?: number; comments?: number; reposts?: number; impressions?: number };
  topic?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ResumeVersion {
  id: string;
  name: string; // e.g. "Candidate CV - Company.pdf"
  type: "cv" | "cover_letter" | "supporting";
  company?: string; // tailored for which company
  opportunityId?: string; // links to Opportunity.id
  filePath?: string; // user's local path, just for display
  createdAt: string; // ISO date
  isMaster?: boolean; // the current canonical CV
  notes?: string;
}

// V2.4 · Global reusable assets · Loom URL + Gamma URL stored once, auto-substituted in every DM draft
export interface GlobalAssets {
  loomUrl?: string; // generic 80-sec personal intro Loom · replaces [LOOM LINK] placeholder everywhere
  gammaUrl?: string; // generic 9-slide Operation Rocket Ship deck · replaces [GAMMA LINK] placeholder everywhere
  updatedAt?: string;
}

// V3.0 · Mission Compass forward declarations (kept here to avoid circular imports)
// Full type definitions live in /lib/mission-compass.ts
export interface MissionCompassValuesProfile {
  topValues: string[];
  antiValues?: string[];
  needsPriorities: string[];
  selfConcordance: string;
  selfConcordanceNote?: string;
  // V3.0 · Modern OB · Calling Orientation (Wrzesniewski 1997)
  callingOrientation?: string;
  callingOrientationNote?: string;
  riasec: string[];
  directionVows: { domain: string; vow: string }[];
  retrodiction: { context: string; insight: string }[];
  calibratedAt: string;
  version: number;
  notes?: string;
}

export interface MissionCompassStoredAssessment {
  oppId: string;
  reads: {
    valuesAlignment: string;
    needsFit: string;
    selfConcordance: string;
    vocationalFit: string;
    directionVowCheck: string;
  };
  fitRead: string;
  whyItFits: string[];
  redFlags: string[];
  selfConcordanceFlag?: string;
  fitScore?: number;
  assessedAt: string;
}

export interface MissionCompassDecisionEntry {
  id: string;
  oppId?: string;
  question: string;
  chosen: string;
  predictedAlignment: number;
  reasoning: string;
  reviewDueAt: string;
  reviewedAt?: string;
  outcome?: "matched-prediction" | "exceeded-prediction" | "fell-short" | "ambiguous";
  outcomeNote?: string;
  accuracyDelta?: number;
  createdAt: string;
}

// V3.5 · Discovery phase types · the front door that makes ORS a journey, not a toolkit
// Together these surfaces capture WHO the user is, WHERE they want to go, and WHAT must be true for a role to fit.
// Feeds into Probe Configuration (auto-derived scrape criteria) and into every opportunity score downstream.

// Why are you searching? · single-question high-signal driver
export type WhyNowReason =
  | "forced"      // laid off, redundancy, bad role
  | "proactive"   // career growth, raise, level up
  | "exploratory" // curious about market, not actively
  | "burnout"     // need a reset
  | "lifechange"; // moved, relationship, family

export interface WhyNow {
  reason: WhyNowReason;
  context?: string; // optional free-text · "made redundant 4 weeks ago"
  urgency: "high" | "medium" | "low"; // computed from reason or user-set
  capturedAt: string; // ISO
}

// Career Hypothesis · 5-year trajectory · shapes which roles to surface
export type ManagementAppetite = "love-it" | "open" | "avoid";
export type GrowthPace = "rocket" | "steady" | "sustainable";

export interface CareerHypothesis {
  fiveYearVision: string; // free-text · "be a CRO" or "stay IC senior specialist" etc.
  managementAppetite: ManagementAppetite;
  industryPreference: string[]; // tags · empty = open to any
  growthPace: GrowthPace;
  whatWinningLooksLike: string; // free-text · 1-2 sentence vision
  capturedAt: string; // ISO
}

// Resume Audit · Claude-generated structured assessment
export interface ResumeAudit {
  resumeText?: string; // raw text the user pasted or extracted
  fileName?: string; // original filename if uploaded
  strengths: string[]; // top 3-5 strengths Claude identified
  gaps: string[]; // top 3-5 gaps / weak spots
  roleShapeFit: {
    BDR: number; // 0-100 fit score for each seat type
    SDR: number;
    AE: number;
    AM: number;
    CSM: number;
    Manager: number;
  };
  keywordDensity: { keyword: string; count: number }[]; // top 10 keywords detected
  missingKeywords: string[]; // top 5 keywords the user SHOULD add given their target lane
  atsScore: number; // 0-100 · formatting + parseability
  narrativeCoherence: number; // 0-100 · story flows / themes consistent
  recommendedSeatLevels: string[]; // e.g. "Senior BDR / Founding SDR / Junior AE"
  overallReadiness: "ship-it" | "tighten-first" | "rewrite-needed";
  summary: string; // 2-3 sentence overall read
  auditedAt: string; // ISO
  // V4.2 · Resume Lab v2 · multi-pass probing + 4-lens output + asset derivation
  /** 5-10 follow-up questions Claude asks to surface metrics the user didn't think to include */
  probingQuestions?: string[];
  /** User answers to the probing questions · keyed by question */
  probingAnswers?: Record<string, string>;
  /** 2-3 paragraph strategic narrative reads on positioning · NOT bullets */
  strategicInsights?: string[];
  /** Structured 3-5 step priority action plan · this-week vs this-month framing */
  actionPlan?: { priority: number; action: string; timeframe: "this-week" | "this-month" | "ongoing" }[];
  /** Suggested LinkedIn About section rewrite (~200 words) */
  linkedinAbout?: string;
  /** Suggested outreach hook variations (3-5 short DM openers using the user's positioning) */
  outreachHooks?: string[];
  /** Suggested resume rewrite bullets (the 5-10 most impactful changes to make) */
  resumeRewrites?: { section: string; before?: string; after: string; why: string }[];
  /** Version this audit belongs to · for history tracking */
  version?: number;
}

// V4.2 · LinkedIn Brand Progress · post tracking + engagement trajectory
export interface BrandPostEntry {
  id: string;
  postedAt: string; // ISO
  topic: string; // user-tagged topic · "AI-native operator" / "founder story" / "customer empathy" / etc
  hook: string; // first 1-2 lines of the post · the scroll-stop
  url?: string; // LinkedIn post URL
  engagement?: {
    likes?: number;
    comments?: number;
    reposts?: number;
    impressions?: number;
  };
  narrativePillar?: "pillar-1" | "pillar-2" | "pillar-3" | "pillar-4" | "pillar-5" | "other";
  notes?: string;
}

export interface BrandSnapshot {
  capturedAt: string; // ISO
  followerCount?: number;
  sssr?: number; // social selling index if user wants
  weeklyImpressions?: number;
  notes?: string;
}

// Logistics · nice-to-haves that shape scoring (but don't disqualify)
export interface Logistics {
  salaryFloor: number; // AUD or USD · the minimum acceptable OTE
  salaryTarget: number; // the comfortable target OTE
  salaryCurrency: "AUD" | "USD" | "GBP" | "EUR";
  hybridPreference: "remote" | "hybrid" | "in-office" | "flexible";
  geography: string[]; // multi-select cities / regions · ["Sydney", "Melbourne", "Remote-AU"]
  roleLevels: string[]; // ["BDR", "SDR", "AM", "CSM"] · which seat types are open
  progressionSpeed: "fast" | "steady" | "stable"; // expected growth pace in role
  equityVsCash: number; // 0-100 slider · 0 = all cash, 100 = all equity
  capturedAt: string; // ISO
}

// Dealbreakers · hard constraints that disqualify a role from scoring
export interface Dealbreakers {
  excludedIndustries: string[]; // e.g. ["Healthcare", "Defence", "Gambling"]
  excludedLocations: string[]; // e.g. ["US-only", "EU-only"] · already partially enforced by APAC rule
  excludedRoleTypes: string[]; // e.g. ["Manager", "Field AE"] · seats the candidate won't take
  companySizeLimits?: { min?: number; max?: number }; // headcount bounds
  notes?: string; // free-text · "no roles requiring 5d in-office"
  capturedAt: string; // ISO
}

// Network Seed · 3-5 warm contacts captured at onboarding
// Future-state · these become seed nodes in the Solar System constellation graph
export interface NetworkSeedContact {
  id: string;
  name: string;
  company?: string;
  role?: string;
  relationshipType: "ex-colleague" | "school" | "friend" | "industry" | "client" | "mentor" | "other";
  lastContactDate?: string; // ISO · approximate
  notes?: string; // how you know them, what's the relationship texture
  linkedin?: string;
  capturedAt: string; // ISO
}

// Probe Configuration · auto-derived from all upstream Discovery inputs
// This is what gets fed into the scrape engine to populate Probes Inbox
export interface ProbeConfig {
  // Hard filters · used to filter the scrape results
  geographyFilter: string[]; // from Logistics.geography + APAC rule
  roleTypeFilter: string[]; // from Logistics.roleLevels
  salaryFloor: number; // from Logistics
  excludedIndustries: string[]; // from Dealbreakers
  excludedLocations: string[]; // from Dealbreakers
  freshnessGate: number; // days · 90-day freshness rule
  // Soft scoring inputs · used to score and rank results
  topValues: string[]; // from MissionCompassValuesProfile.topValues
  industryPreference: string[]; // from CareerHypothesis.industryPreference
  growthPaceTarget: GrowthPace; // from CareerHypothesis
  callingOrientation?: string; // from MissionCompassValuesProfile
  // Resume-derived
  resumeKeywords?: string[]; // top keywords from ResumeAudit · used for fit scoring
  targetSeatLevels?: string[]; // from ResumeAudit.recommendedSeatLevels
  // Meta
  configuredAt: string; // ISO
  lastScrapedAt?: string; // ISO
  active: boolean; // whether the probe is firing
  cadence: "daily" | "twice-daily" | "weekly"; // how often to run
}

// Discovery progress · tracks where the user is in onboarding
export interface DiscoveryProgress {
  startedAt?: string; // ISO · when user first hit /onboarding
  completedAt?: string; // ISO · when probe was launched
  stepsCompleted: string[]; // ordered list of step IDs completed
  currentStep?: string; // step ID user is currently on
  skippedSteps?: string[]; // steps user chose to skip · prompt to come back later
  importedLinkedIn?: boolean; // completed the paste-LinkedIn quick-start
}

// Snippet Library · reusable, voice-consistent outreach building blocks
export type SnippetCategory = "connect" | "dm" | "email" | "loom" | "cta";
export interface Snippet {
  id: string;
  category: SnippetCategory;
  label: string;
  body: string;
  custom?: boolean; // user-added (vs seeded template)
}

export interface AppState {
  opps: Record<string, Partial<Opportunity>>;
  tasks: Record<string, boolean>;
  ritual: Record<string, RitualEntry>;
  log: Record<string, DailyEntry>;
  energy: Record<string, number>;
  cadence: Record<string, Record<string, string>>;
  expandedOpps: Record<string, boolean>;
  customOpps: Opportunity[];
  currentPhase: 1 | 2 | 3 | 4;
  chat: ChatMessage[];
  resumes?: ResumeVersion[];
  globalAssets?: GlobalAssets; // V2.4 · platform-wide Loom + Gamma URLs
  // V3.0 · Mission Compass values engine
  valuesProfile?: MissionCompassValuesProfile;
  missionCompassAssessments?: Record<string, MissionCompassStoredAssessment>; // keyed by oppId
  decisionJournal?: MissionCompassDecisionEntry[];
  // V3.5 · Discovery phase · the front door
  whyNow?: WhyNow;
  careerHypothesis?: CareerHypothesis;
  resumeAudit?: ResumeAudit;
  logistics?: Logistics;
  dealbreakers?: Dealbreakers;
  networkSeed?: NetworkSeedContact[];
  probeConfig?: ProbeConfig;
  discoveryProgress?: DiscoveryProgress;
  // V4.2 · Resume Audit v2 · version history + LinkedIn Brand Progress
  resumeAuditHistory?: ResumeAudit[]; // chronological audits, latest first
  brandPosts?: BrandPostEntry[];
  brandSnapshots?: BrandSnapshot[];
  // Snippet Library · user-added reusable outreach blocks (seed templates live in data)
  snippets?: Snippet[];
}
