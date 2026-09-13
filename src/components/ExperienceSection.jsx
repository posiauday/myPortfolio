import { useState } from "react";
import { Briefcase, MapPin } from "lucide-react";
import { experience } from "../data/experience.js";
import useScrollFill from "../hooks/useScrollFill.js";
import useRevealEach from "../hooks/useRevealEach.js";

/* ============================================================
   EXPERIENCE
   A MagicUI-style animated timeline: a single rail runs the full
   height of the list, a gradient "fill" line draws itself over the
   plain track as you scroll (useScrollFill), and each card fades
   and slides up the first time it enters view (useRevealEach) —
   both pure CSS/IntersectionObserver, no animation library, and
   both settle into their finished state under
   prefers-reduced-motion instead of leaving anything stuck hidden.

   Highlights start collapsed past the third line so the section
   doesn't dominate the page — "Show more" reveals the rest.
   ============================================================ */
function ExperienceEntry({ item, revealed, itemRef }) {
  const [expanded, setExpanded] = useState(false);
  const visibleHighlights = expanded ? item.highlights : item.highlights.slice(0, 3);
  const hiddenCount = item.highlights.length - visibleHighlights.length;
  const current = item.end === "Present";

  return (
    <div
      ref={itemRef}
      className={`relative pl-10 transition-all duration-700 ease-out motion-reduce:transition-none sm:pl-14 ${
        revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 grid h-4 w-4 place-items-center rounded-full transition-colors duration-500 sm:h-6 sm:w-6"
        style={{ background: revealed ? `${item.color}1A` : "rgba(148,163,184,.15)" }}
      >
        <span
          className="h-2 w-2 rounded-full transition-all duration-500 sm:h-2.5 sm:w-2.5"
          style={{ background: revealed ? item.color : "#cbd5e1", boxShadow: revealed ? `0 0 0 4px ${item.color}22` : "none" }}
        />
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
              <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-green-500" /> Current role
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
  const [lineRef, progress] = useScrollFill();
  const [itemRefs, revealed] = useRevealEach(experience.length);

  return (
    <section id="experience" className="mx-auto max-w-7xl px-5 py-24">
      <p className="text-xs font-black uppercase tracking-[.2em] text-[#168326]">Career timeline</p>
      <h2 className="mt-3 text-4xl font-black sm:text-6xl">Where the systems got built.</h2>
      <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        5+ years architecting Power Platform and Microsoft 365 solutions for the public sector.
      </p>

      <div ref={lineRef} className="relative mt-12">
        {/* Track, then a gradient fill drawn over it as the section scrolls
            through view — percentage height, so it stays correct even
            while "Show more" changes a card's height below it. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-[7px] w-px bg-slate-200 dark:bg-white/10 sm:left-[11px]" />
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-0 w-px bg-gradient-to-b from-[#168326] via-[#0F6CBD] to-[#5B5BD6] transition-[height] duration-300 ease-out motion-reduce:transition-none sm:left-[11px]"
          style={{ height: `${progress * 100}%` }}
        />

        <div className="space-y-8">
          {experience.map((item, index) => (
            <ExperienceEntry
              key={item.org}
              item={item}
              revealed={revealed[index]}
              itemRef={el => (itemRefs.current[index] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExperienceSection;
