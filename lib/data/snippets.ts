import type { Snippet, SnippetCategory } from "@/lib/types";

// The personal-productivity layer of the outreach stack: reusable, proven building
// blocks in the house voice. Punchy, present-tense, human, Australian English, no em
// dashes, and never asking for the job — you express conviction, they offer the seat.
// Brackets are the only thing you personalise before it goes out.

export const SNIPPET_CATEGORIES: { id: SnippetCategory; label: string; desc: string }[] = [
  { id: "connect", label: "Connect notes", desc: "300-char LinkedIn connection requests · scroll-stop hook, no pitch" },
  { id: "dm", label: "Follow-up DMs", desc: "Post-accept messages · conviction, not a request" },
  { id: "email", label: "Emails", desc: "Direct email · one reason, two proofs, a soft open" },
  { id: "loom", label: "Loom scripts", desc: "75-85 second spoken intros · observation first" },
  { id: "cta", label: "CTAs / closes", desc: "The soft ask that leaves the door open" },
];

export const SEED_SNIPPETS: Snippet[] = [
  // ── Connect notes ──
  {
    id: "seed-connect-1",
    category: "connect",
    label: "Post reaction",
    body: "Saw your post on [specific thing]. The point about [specific reframe] is the part most people skip past. Following how [company] plays it.",
  },
  {
    id: "seed-connect-2",
    category: "connect",
    label: "Strategy bet",
    body: "[company]'s move into [area] is the one I'd bet on this year, and you're clearly close to it. Keen to follow the build from here.",
  },
  {
    id: "seed-connect-3",
    category: "connect",
    label: "Learned-from-you",
    body: "Read your take on [topic]. It shifted how I think about [thing]. Connecting to keep learning from the way you read the market.",
  },

  // ── Follow-up DMs ──
  {
    id: "seed-dm-1",
    category: "dm",
    label: "Why them, specifically",
    body: "Thanks for connecting [name]. What pulled me to [company] specifically: [one sharp, honest reason tied to their strategy]. I back the direction and wanted to be on your radar as it scales. No ask, just conviction.",
  },
  {
    id: "seed-dm-2",
    category: "dm",
    label: "Proof + intent",
    body: "Appreciate the connect. I've spent [timeframe] doing [relevant motion], and [company]'s [specific priority] is exactly the problem I want to work on next. Happy to share how I'd approach it if it's useful.",
  },

  // ── Emails ──
  {
    id: "seed-email-1",
    category: "email",
    label: "Conviction email",
    body: "[name], I've been following [company]'s [specific thing] and it's the clearest version of [category] I've seen. Quick background: [one quantified win], and [second quantified win]. I'm not writing about a job. I'm writing because this is the work I want to be near. If it's useful, I'll send how I'd approach [specific problem].",
  },
  {
    id: "seed-email-2",
    category: "email",
    label: "Subject line formula",
    body: "[company] + [role] + [your one-line differentiator], under 60 characters. Never \"quick question\", \"following up\", or \"introduction\". Make the subject the reason they open it.",
  },

  // ── Loom scripts ──
  {
    id: "seed-loom-1",
    category: "loom",
    label: "80-second intro",
    body: "[0-10s] Hi [name], [your name] here. [10-30s] I've been watching [company] do [specific thing], and here's the observation that made me record this: [sharp reframe]. [30-60s] Here's how I'd approach [their problem], drawing on [relevant experience]. [60-80s] I'm not asking for anything. I back the direction and wanted you to see how I think. Following the build either way.",
  },

  // ── CTAs / closes ──
  {
    id: "seed-cta-1",
    category: "cta",
    label: "Value-first 15",
    body: "If it's worth 15 minutes, I'll come with [a teardown / a plan / a POV], not a pitch. Either way I'm cheering [company] on.",
  },
  {
    id: "seed-cta-2",
    category: "cta",
    label: "Door left open",
    body: "No pressure at all. If the timing's right, I'd love to show you how I'd run [specific]. If not, I'll keep following the work.",
  },
];
