// Resilience layer · daily mantras, reframes, wind-down protocols

export interface SpaceQuote {
  quote: string;
  author: string;
  context?: string;
}

export const SPACE_QUOTES: SpaceQuote[] = [
  { quote: "Space is not the final frontier — preparation is. The void rewards the disciplined.", author: "Mission Rocket Ship", context: "Internal mantra" },
  { quote: "That's one small step for man, one giant leap for mankind.", author: "Neil Armstrong", context: "Apollo 11 · 1969" },
  { quote: "We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.", author: "John F. Kennedy", context: "Rice University · 1962" },
  { quote: "When you launch in a rocket, you're not really flying that rocket. You're just sort of hanging on.", author: "Michael P. Anderson", context: "STS-107" },
  { quote: "The dinosaurs went extinct because they didn't have a space program.", author: "Larry Niven", context: "On why expansion matters" },
  { quote: "I would like to die on Mars. Just not on impact.", author: "Elon Musk", context: "On long-term vision" },
  { quote: "Curiosity is the essence of our existence.", author: "Gene Cernan", context: "Apollo 17 · last man on the Moon" },
  { quote: "An astronaut is just someone who shows up to work and the work is space.", author: "Chris Hadfield", context: "ISS Commander" },
  { quote: "If you decide you're going to do only the things you know are going to work, you're going to leave a lot of opportunity on the table.", author: "Jeff Bezos", context: "Blue Origin" },
  { quote: "I see Earth! It is so beautiful!", author: "Yuri Gagarin", context: "First human in space · 1961" },
  { quote: "It is difficult to say what is impossible, for the dream of yesterday is the hope of today and the reality of tomorrow.", author: "Robert H. Goddard", context: "Father of modern rocketry" },
  { quote: "The first rule of any technology used in a business is that automation applied to an efficient operation will magnify the efficiency.", author: "Bill Gates", context: "The pre-flight check rule" },
  { quote: "Failure is not an option.", author: "Gene Kranz", context: "Apollo 13 · NASA Flight Director" },
  { quote: "Houston, we have a problem.", author: "Jim Lovell", context: "Apollo 13 · also: every Tuesday" },
  { quote: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan", context: "Cosmos" },
  { quote: "The most important thing we can do is inspire young minds and to advance the kind of science, math and technology education that will help youngsters take us to the next phase of space travel.", author: "John Glenn", context: "First American to orbit Earth" },
  { quote: "Reach for the stars, even if you have to stand on a cactus.", author: "Susan Longacre", context: "On stretch goals" },
  { quote: "Do or do not. There is no try.", author: "Yoda", context: "On committing fully" },
  { quote: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", context: "The 09:00 AM rule" },
  { quote: "Shoot for the moon. Even if you miss, you'll land among the stars.", author: "Norman Vincent Peale", context: "The stretch-opp rule" },
  { quote: "Discipline equals freedom.", author: "Jocko Willink", context: "Mission Drills justification" },
  { quote: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell", context: "Apply for the role that scares you" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela", context: "The pre-offer mantra" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", context: "The Wednesday-of-the-week mantra" },
  { quote: "We are made of star-stuff. We are a way for the cosmos to know itself.", author: "Carl Sagan", context: "Why this all matters" },
  { quote: "Adventure is worthwhile in itself.", author: "Amelia Earhart", context: "The decade-of-variety thesis" },
  { quote: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca", context: "Why hardship builds strength" },
  { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu", context: "Today's first DM" },
  { quote: "Action expresses priorities.", author: "Mahatma Gandhi", context: "Mission Drills made literal" },
  { quote: "What we do in life echoes in eternity.", author: "Marcus Aurelius", context: "The Build Log is the eternity" },
  { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", context: "The 'pitch us a role' DM" },
  { quote: "The future depends on what you do today.", author: "Mahatma Gandhi", context: "Why we keep shipping" },
  { quote: "Stars can't shine without darkness.", author: "Unknown", context: "On finding light in setbacks" },
  { quote: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott", context: "Operation Rocket Ship · literally" },
  { quote: "The two most powerful warriors are patience and time.", author: "Leo Tolstoy", context: "The 14-30 day rule" },
  { quote: "Don't count the days; make the days count.", author: "Muhammad Ali", context: "Mission Drills compounding" },
  { quote: "If you want to go fast, go alone. If you want to go far, go together.", author: "African proverb", context: "Multi-thread principle" },
  { quote: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky", context: "Why we apply to stretches" },
  { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", context: "The cadence philosophy" },
  { quote: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", context: "Mission Identity in one sentence" },
  { quote: "Ad astra per aspera.", author: "Latin proverb", context: "To the stars, through hardships" },
];

export function getTodaysQuote(): SpaceQuote {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return SPACE_QUOTES[dayOfYear % SPACE_QUOTES.length];
}


export const DAILY_MANTRAS: Record<number, { mantra: string; subtext: string }> = {
  0: { // Sunday
    mantra: "Plan the week. Light prep. Bed early.",
    subtext: "Monday is launch day. Sunday is the runway. Set the conditions for momentum, then rest.",
  },
  1: { // Monday
    mantra: "The week begins. One ship, one win, one log entry. That's enough.",
    subtext: "Monday is start-state. Don't try to win the week before lunch. Just begin.",
  },
  2: { // Tuesday
    mantra: "Cadence over genius. Show up today and the math works.",
    subtext: "The data: steady cadence lands roles in weeks, not days. You're inside the window. Keep firing.",
  },
  3: { // Wednesday
    mantra: "Mid-flight. Trust the trajectory. Keep firing engines.",
    subtext: "Wednesday is the test of conviction. The week's neither new nor done. Stay disciplined.",
  },
  4: { // Thursday
    mantra: "Follow-ups matter more than first sends today.",
    subtext: "Anyone you DM'd Mon-Tue is in the Day-1 to Day-3 window. Re-engage > over-extend.",
  },
  5: { // Friday
    mantra: "Weekly audit. Ship the last opps. Close the laptop. Earned rest.",
    subtext: "Run the Friday audit. Capture what worked. Plan one tiny Saturday recovery thing. Done.",
  },
  6: { // Saturday
    mantra: "Recover. Walk. See people. Side-project work or no work at all.",
    subtext: "Job-search work is officially off the table today. Build the muscles that compound everything else: sleep, body, relationships.",
  },
};

export interface Reframe {
  trigger: string;
  reframe: string;
  source: string;
}

export const REFRAMES: Reframe[] = [
  {
    trigger: "I'm getting ghosted",
    reframe: "Candidates who run the search like a sales cycle land in 14-30 days. Most outreach doesn't reply Day 1. A few days of silence are not failure, they're standard cadence.",
    source: "Sales Cycle Applied",
  },
  {
    trigger: "I'm not qualified for these roles",
    reframe: "Companies ask for founder energy. You've actually done it. Open on title. The role gets shaped after the conversation, not before. Stretches land 1 in 5, but the 1 changes everything.",
    source: "Mission Identity",
  },
  {
    trigger: "This is taking too long",
    reframe: "Cadence-to-offer math is 4-6 weeks from when the daily ritual starts. If you're inside the window, patience is structural, not emotional.",
    source: "Trajectory Density math",
  },
  {
    trigger: "What if I never land",
    reframe: "There are active opportunities in the pipeline and the daily scanner adds more. The math is on your side. The narrative isn't.",
    source: "Pipeline snapshot",
  },
  {
    trigger: "I should be applying to more",
    reframe: "Response rate is the constraint, not volume. A dozen tailored applications beats thirty sprayed. Quality is the multiplier. Multi-thread beats volume.",
    source: "Sales Cycle Applied",
  },
  {
    trigger: "A bad process broke me",
    reframe: "A broken process is a structural failure on their end. Capture it, move on. The trajectory continues. A hard week doesn't break you, it becomes the launchpad.",
    source: "Build Log",
  },
  {
    trigger: "I'm not in the right vertical",
    reframe: "Most of the thesis verticals are AI-native. You ARE the right vertical. The market is moving toward you, not away.",
    source: "Target Sectors",
  },
  {
    trigger: "Why didn't they reply",
    reframe: "They're busy. Their world doesn't revolve around your inbox. Day 1 silence is noise. Day 14 silence is signal. Until then, send your follow-up and move on.",
    source: "Outreach Cadence",
  },
  {
    trigger: "I'm behind on my drills",
    reframe: "The threshold for the day to count is 2 of 4 ritual items, not 4 of 4. Missed days don't compound into a story. Show up tomorrow.",
    source: "Mission Drills framework",
  },
  {
    trigger: "I shouldn't be enjoying anything until I land",
    reframe: "The opposite is true. Enjoyment compounds resilience. Resilience compounds discipline. Discipline compounds outcomes. Take the walk. See the friend. Enjoy the meal. It's all part of the work.",
    source: "Resilience principle",
  },
];

export const WIND_DOWN_CHECKLIST = [
  "Mission Drills logged for today",
  "Mission Log entry written (Win + Lesson + Obs + POD)",
  "Energy check-in done",
  "Tomorrow's first move chosen (1 thing, not a list)",
  "Laptop closing in <10 minutes",
];

export const RECOVERY_PROTOCOLS = [
  { name: "Walk", desc: "20+ min, outside, no podcast. The default reset.", icon: "🚶" },
  { name: "Workout", desc: "Endurance, weights, anything physical. Triathlon training counts double.", icon: "💪" },
  { name: "See someone", desc: "Call or visit one person who has no idea what Operation Rocket Ship is.", icon: "👥" },
  { name: "Real meal", desc: "Cook it or sit down somewhere proper. No laptop, no scrolling.", icon: "🍽" },
  { name: "Side project", desc: "Switch identity from candidate to operator for 60 min.", icon: "🔧" },
  { name: "Read fiction", desc: "Something that has nothing to do with sales, AI, or careers.", icon: "📚" },
  { name: "Watch something dumb", desc: "Reality TV, comedy, anything that makes you laugh and turns the brain off.", icon: "📺" },
  { name: "Bed early", desc: "Sleep is the highest-leverage move you can make. 8+ hours.", icon: "😴" },
];

export const CRISIS_PROTOCOL = {
  title: "When today is genuinely hard",
  body: `Some days the work feels heavier than usual. That's normal. A forced pivot, a tough exit, a rough interview, and a deal that fell through is real weight. The platform doesn't expect you to be a robot.

If today is one of those days:

1. **The bar drops to 1.** One tiny action. Send one message, tick one drill item, write one POD entry. Don't try to win the day.

2. **Recovery is execution.** Walking the dog is operational work. Cooking dinner is operational work. Calling your mum is operational work.

3. **The pipeline doesn't expire.** Your active opps are still there tomorrow. Cadence flexes. Trust the system you built when you were stronger.

4. **Energy is data, not identity.** A low day doesn't predict tomorrow. Capture it in the Energy Check-in, see if it persists, adjust if it does.

5. **You're not alone in this.** Your mentors exist. The people you trust exist. Reach out without making it a big thing.

The work doesn't suffer for one easier day. The streak metric is wrong if it makes you push through what shouldn't be pushed through. Real resilience is knowing the difference.`,
};
