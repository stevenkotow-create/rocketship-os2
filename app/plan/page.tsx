export default function FlightPlan() {
  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1.5">Flight Plan</h1>
      <p className="text-muted text-sm mb-6">Prepared 14 May 2026 · ~75-day mission · AE target.</p>

      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="stat"><div className="text-[11px] text-muted uppercase tracking-wider">Target Role</div><div className="text-[18px] font-bold text-accent mt-1">BDR/AE/AM</div><div className="text-xs text-muted">open on title</div></div>
        <div className="stat"><div className="text-[11px] text-muted uppercase tracking-wider">Income</div><div className="text-[18px] font-bold text-accent mt-1">$150K OTE</div><div className="text-xs text-muted">comp first</div></div>
        <div className="stat"><div className="text-[11px] text-muted uppercase tracking-wider">Work Setup</div><div className="text-[18px] font-bold mt-1">Hybrid</div></div>
        <div className="stat"><div className="text-[11px] text-muted uppercase tracking-wider">Timeline</div><div className="text-[18px] font-bold mt-1">60 days</div></div>
        <div className="stat"><div className="text-[11px] text-muted uppercase tracking-wider">Capacity</div><div className="text-[18px] font-bold mt-1">10+ hrs/wk</div></div>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">4-Phase Launch Timeline</h2>
      <div className="card">
        <h3 className="text-base font-semibold text-accent mt-0">Phase 1 · Pre-Flight · Week 1-2 · <span className="text-good">89% complete</span></h3>
        <p className="text-sm">Identity locked. Plan filed. Target sectors mapped. 50-company list built. First Loom in flight.</p>
        <h3 className="text-base font-semibold mt-4 text-navy">Phase 2 · Ignition &amp; Ascent · Week 3-5</h3>
        <p className="text-sm">20 outreach/week: 60% direct HM via LinkedIn (APAC AE first), 30% GTM Recruiter, 10% peer warm-ups + formal applications.</p>
        <h3 className="text-base font-semibold mt-4 text-navy">Phase 3 · Orbital Approach · Week 6-7</h3>
        <p className="text-sm">First interviews mid-week 4. Active interviewing. Deep prep per screening. References activated.</p>
        <h3 className="text-base font-semibold mt-4 text-navy">Phase 4 · Docking · Week 8+</h3>
        <p className="text-sm">Close interviews into offers. Negotiate base, variable, territory, equity. Run multi-offer through pay-priority framework.</p>
      </div>

      <h2 className="text-xl font-semibold mt-7 mb-4">Daily Execution Plan</h2>
      <div className="card">
        <ul className="list-none p-0 space-y-2">
          <li className="py-2 border-b border-border">📤 Apply to <strong>2 roles</strong></li>
          <li className="py-2 border-b border-border">💬 Send <strong>4 outreach messages</strong></li>
          <li className="py-2 border-b border-border">🔄 Follow up with <strong>2 companies</strong></li>
          <li className="py-2">🎯 Practice interview skills <strong>15-20 minutes</strong></li>
        </ul>
      </div>
    </div>
  );
}
