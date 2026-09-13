import { useState } from "react";
import { Briefcase, MapPin } from "lucide-react";
import { experience } from "../data/experience.js";

/* ============================================================
   EXPERIENCE
   A vertical career timeline: a rail of dots down the left (top
   of each card on mobile) connects entries in reverse-chronological
   order, each with role, org, dates and its own highlight list.
   Highlights start collapsed past the third line so the section
   doesn't dominate the page — "Show more" reveals the rest.
   ============================================================ */
function ExperienceEntry({ item, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const visibleHighlights = expanded ? item.highlights : item.highlights.slice(0, 3);
  const hiddenCount = item.highlights.length - visibleHighlights.length;
  const current = item.end === "Present";

  return (
    <div className="relative pl-10 sm:pl-14">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-6 h-[calc(100%+2rem)] w-px bg-slate-200 dark:bg-white/10 sm:left-[11px]"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-full sm:h-6 sm:w-6"
        style={{ background: `${item.color}1A` }}
      >
        <span className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ background: item.color }} />
      </span>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-black"
            style={{ background: `${item.color}18`, color: item.color }}
          >
            {item.start} &ndash; {item.end}
          </span>
          {current && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-900/20 dark:text-green-300">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Current role
            </span>
          )}
        </div>

        <h3 className="mt-4 text-2xl font-black">{item.role}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase size={14} /> {item.org}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} /> {item.location}
          </span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {visibleHighlights.map(point => (
            <li key={point} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.color }} />
              {point}
            </li>
          ))}
        </ul>

        {hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-4 text-sm font-bold hover:underline"
            style={{ color: item.color }}
          >
            Show {hiddenCount} more
          </button>
        )}
        {expanded && item.highlights.length > 3 && (
          <button
            onClick={() => setExpanded(false)}
            className="mt-4 text-sm font-bold text-slate-400 hover:underline"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}

function ExperienceSection() {
  return (
    <section id="experience" className="mx-auto max-w-7xl px-5 py-24">
      <p className="text-xs font-black uppercase tracking-[.2em] text-[#168326]">Career timeline</p>
      <h2 className="mt-3 text-4xl font-black sm:text-6xl">Where the systems got built.</h2>
      <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        5+ years architecting Power Platform and Microsoft 365 solutions for the public sector.
      </p>

      <div className="mt-12 space-y-8">
        {experience.map((item, index) => (
          <ExperienceEntry key={item.org} item={item} isLast={index === experience.length - 1} />
        ))}
      </div>
    </section>
  );
}

export default ExperienceSection;
