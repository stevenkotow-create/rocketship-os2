type LogEntry = {
  day: string;
  date: string;
  title: string;
  summary: string;
  shipped: string[];
};

// Add your own build-log entries here. Each entry is one day's story of the mission.
const LOG_ENTRIES: LogEntry[] = [];

export default function BuildLog() {
  return (
    <div>
      <div className="page-hero">
        <h1>Build Log</h1>
        <p>The story of how your mission came together. Day-by-day.</p>
      </div>

      {LOG_ENTRIES.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-2xl mb-2">🚀</p>
          <p className="text-sm text-text-dim">No entries yet.</p>
          <p className="text-xs text-muted mt-1">Log a day to start telling the story of your search.</p>
        </div>
      ) : (
        LOG_ENTRIES.map((entry, i) => (
          <div key={i} className="card-elevated bg-gradient-to-br from-surface to-surface-2 mb-6">
            <div className="label-caps mb-2">{entry.day} · {entry.date}</div>
            <h2 className="text-[22px] font-bold mt-0 mb-4 text-navy tracking-tight">{entry.title}</h2>
            <p className="text-[15px] leading-relaxed mb-4">{entry.summary}</p>
            {entry.shipped.length > 0 && (
              <>
                <h3 className="text-base font-semibold mt-6 mb-3 text-navy">What shipped</h3>
                <ul className="text-sm text-text-dim space-y-1.5 pl-5 list-disc">
                  {entry.shipped.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
