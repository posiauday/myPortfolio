import { platformStack } from "../data/platformStack.js";
import { CONTACT } from "../config.js";

/* ============================================================
   PLATFORM ORBIT
   A ring of Power Platform product icons circling a central hub,
   in the style of MagicUI's "Orbiting Circles" — pure CSS (the
   `orbit` keyframe + counter-rotation in index.css), no animation
   library. Icons are Microsoft's own official artwork (see
   assets/logos/NOTICE.md), shown at natural size and color with no
   crop, recolor, or reshape.

   Microsoft's stated terms for these icons require the product's
   full name to appear near its icon, not overlapping it — awkward
   for something mid-orbit, so the diagram itself stays icon-only
   and the row of labeled thumbnails below pairs every icon with its
   name permanently, rather than only in a tooltip.

   Two concentric rings turn in opposite directions at different
   speeds, which is what actually sells the "orbit" read — a single
   ring rotating uniformly just looks like a spinner.
   ============================================================ */
const RING = {
  inner: { radius: 70, duration: "16s", size: 46 },
  outer: { radius: 130, duration: "30s", size: 52 }
};

function OrbitBadge({ item, angle, reverse }) {
  const ring = RING[item.ring];
  return (
    <div
      className={`orbit-item absolute left-1/2 top-1/2${reverse ? " orbit-reverse" : ""}`}
      style={{ "--angle": angle, "--radius": `${ring.radius}px`, "--duration": ring.duration }}
    >
      <img
        src={item.icon}
        alt=""
        width={ring.size}
        height={ring.size}
        className="-translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
      />
    </div>
  );
}

function PlatformOrbit() {
  const inner = platformStack.filter(item => item.ring === "inner");
  const outer = platformStack.filter(item => item.ring === "outer");

  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#168326]">Platform</p>
          <h2 className="mt-3 text-4xl font-black sm:text-5xl">One platform. Every capability.</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
            Every system on this page is built on the same core: Power Apps and Power Automate for the
            experience and the workflow, Dataverse underneath, Copilot Studio, AI Builder and Power Pages
            extending it outward.
          </p>

          {/* Labeled legend — Microsoft's icon terms require the product's full
              name to appear near its icon, so every icon is paired with its
              name here rather than only inside a hover tooltip. */}
          <ul className="mt-6 flex flex-wrap gap-3" aria-label="Power Platform tools used">
            {platformStack.map(item => (
              <li
                key={item.name}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-1.5 pr-3.5 dark:border-white/10"
              >
                <img src={item.icon} alt="" width={20} height={20} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto grid h-[320px] w-[320px] place-items-center" aria-hidden="true">
          {/* Guide rings */}
          <span className="absolute rounded-full border border-dashed border-slate-200 dark:border-white/10" style={{ inset: 320 / 2 - RING.outer.radius }} />
          <span className="absolute rounded-full border border-dashed border-slate-200 dark:border-white/10" style={{ inset: 320 / 2 - RING.inner.radius }} />

          {/* Hub */}
          <span className="motion-safe:animate-ping absolute h-16 w-16 rounded-full bg-[#168326]/25" />
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-[#168326] font-black text-white shadow-xl">
            {CONTACT.initials}
          </span>

          {inner.map((item, index) => (
            <OrbitBadge key={item.name} item={item} angle={index * (360 / inner.length) + 30} />
          ))}
          {outer.map((item, index) => (
            <OrbitBadge key={item.name} item={item} angle={index * (360 / outer.length)} reverse />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PlatformOrbit;
