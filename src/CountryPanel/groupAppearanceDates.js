const CAP = 4; // max entries (individual dates or ranges) shown before "+ N more"

// Returns true if `b` is exactly one calendar day after `a` (both Date objects).
function isConsecutive(a, b) {
  const next = new Date(a);
  next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function formatDate(date, isEs) {
  return date.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    // Include year only when it differs from the current year.
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function formatRange(start, end, isEs) {
  if (start.toISOString().slice(0, 10) === end.toISOString().slice(0, 10)) {
    return formatDate(start, isEs);
  }
  const startStr = start.toLocaleDateString(isEs ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    // Include year on start if it differs from end's year or from current year.
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
  });
  const endStr = formatDate(end, isEs);
  return `${startStr} – ${endStr}`;
}

/**
 * Groups an array of ISO date strings (newest-first) into consecutive ranges,
 * caps output at CAP entries, and returns display strings plus an overflow count.
 *
 * @param {string[]} dates  ISO date strings, e.g. ["2026-04-10", "2026-04-09", "2026-03-05"]
 * @param {boolean}  isEs   true → Spanish locale formatting
 * @returns {{ entries: string[], overflow: number }}
 */
export function groupAppearanceDates(dates, isEs) {
  if (!Array.isArray(dates) || dates.length === 0) {
    return { entries: [], overflow: 0 };
  }

  // Parse and filter out malformed dates; keep newest-first order.
  const parsed = dates
    .map(d => {
      const dt = new Date(d + 'T00:00:00');
      return isNaN(dt.getTime()) ? null : dt;
    })
    .filter(Boolean);

  if (parsed.length === 0) return { entries: [], overflow: 0 };

  // Build consecutive runs (input is newest-first so runs are also newest-first).
  const runs = [];
  let rangeStart = parsed[0];
  let rangeEnd   = parsed[0];

  for (let i = 1; i < parsed.length; i++) {
    // Check if previous date (older) is consecutive to the current one (even older).
    if (isConsecutive(parsed[i], parsed[i - 1])) {
      rangeEnd = parsed[i]; // extend run toward the older end
    } else {
      runs.push({ start: rangeStart, end: rangeEnd });
      rangeStart = parsed[i];
      rangeEnd   = parsed[i];
    }
  }
  runs.push({ start: rangeStart, end: rangeEnd });

  // Count total individual days represented by each run for the overflow counter.
  const runDayCounts = runs.map(r => {
    const diff = Math.round((r.start - r.end) / 86400000);
    return diff + 1;
  });

  const visible = runs.slice(0, CAP);
  const hiddenRuns = runs.slice(CAP);
  const overflow = hiddenRuns.reduce((sum, _, i) => sum + runDayCounts[CAP + i], 0);

  const entries = visible.map(r => formatRange(r.start, r.end, isEs));

  return { entries, overflow };
}
