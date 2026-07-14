export default function MissionIdentity() {
  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Mission Identity</h1>
      <p className="text-muted text-sm mb-6">Who you ARE before any tactical work. The foundational layer everything else compounds from. Fill each section in with your own story.</p>

      <h2 className="text-xl font-semibold mb-4">Your Pillars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="card !border-accent">
          <h3 className="text-[15px] font-semibold text-accent mt-0 mb-2">🤝 Pillar One (headline)</h3>
          <p className="text-sm">Your core thesis about how you work and win. Back it with one or two quantified proof points from your own history.</p>
        </div>
        <div className="card !border-cool">
          <h3 className="text-[15px] font-semibold text-cool mt-0 mb-2">🧭 Pillar Two</h3>
          <p className="text-sm">A second dimension of your edge. Ownership, resilience, a domain you know deeply. Make it concrete, not a vibe.</p>
        </div>
        <div className="card !border-purple">
          <h3 className="text-[15px] font-semibold text-purple mt-0 mb-2">🎵 Pillar Three</h3>
          <p className="text-sm">Something distinctive that keeps you close to a target market or ICP. The thing you don&apos;t have to learn because you&apos;ve lived it.</p>
        </div>
        <div className="card !border-warn">
          <h3 className="text-[15px] font-semibold text-warn mt-0 mb-2">🧠 Pillar Four</h3>
          <p className="text-sm">Your formal or intellectual lens. The framework you apply to complex, multi-stakeholder conversations.</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">AI-Native Operator Layer · your edge</h2>
      <div className="card !border-good bg-gradient-to-br from-surface-2 to-surface">
        <p className="text-sm mb-3"><strong>How you use AI daily</strong> across research, prospecting, and prep. Describe the workflow, not the buzzword.</p>
        <p className="text-sm mb-3"><strong>Your proof asset</strong>: the tangible thing you built or shipped that demonstrates the workflow. That&apos;s the proof, not a CV claim.</p>
        <p className="text-sm"><strong>This platform</strong> is itself an artifact you can walk an interviewer through. Make it yours.</p>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">Current Targeting</h2>
      <div className="card">
        <p className="text-sm mb-2"><strong>Primary</strong>: the role types you are pursuing and the shape that fits you best.</p>
        <p className="text-sm mb-2"><strong>Hot verticals</strong>: the industries and company types you are targeting.</p>
        <p className="text-sm mb-2"><strong>On / off the table</strong>: any nuance about which company shapes you will and won&apos;t pursue.</p>
        <p className="text-sm"><strong>Always-on threading</strong>: any company that meets your criteria gets multi-threaded into the funnel even if no current role matches. Build relationships now, ship when a seat opens.</p>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">Non-Negotiables · your gates</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="card !border-accent text-center"><div className="text-3xl mb-2">💰</div><h3 className="text-sm font-bold mt-0 mb-1 text-accent">Comp floor</h3><p className="text-xs text-text-dim mt-1">Set your OTE gate. If they can&apos;t hit it, the conversation stops.</p></div>
        <div className="card !border-good text-center"><div className="text-3xl mb-2">📈</div><h3 className="text-sm font-bold mt-0 mb-1 text-good">Growth Potential</h3><p className="text-xs text-text-dim mt-1">Trajectory, valuation arc, vertical momentum.</p></div>
        <div className="card !border-navy text-center"><div className="text-3xl mb-2">🧭</div><h3 className="text-sm font-bold mt-0 mb-1 text-navy">Manager Quality</h3><p className="text-xs text-text-dim mt-1">Ask to speak with current direct reports before joining.</p></div>
      </div>
      <div className="card">
        <p className="text-sm mb-2"><strong>💎 A TIER · Revenue Equity</strong> — meaningful upside at a growth-stage company.</p>
        <p className="text-sm mb-2"><strong>💵 B TIER · Base</strong> — important, but don&apos;t over-index.</p>
        <p className="text-sm"><strong>🔥 OVERHYPED · Titles</strong> — stay open on the title.</p>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">Personal Mission Statement</h2>
      <div className="card !border-accent bg-gradient-to-br from-surface-2 to-surface">
        <p className="text-[15px] leading-relaxed">Write your own mission statement here: where you thrive, the kind of culture you want, and the work that energises you.</p>
        <p className="text-[15px] leading-relaxed mt-2.5">Describe the seat you are aiming for and why your combination of strengths compounds into something rare.</p>
        <p className="text-accent font-semibold mt-3.5">End with the one-line thesis you want people to remember you by.</p>
      </div>
    </div>
  );
}
