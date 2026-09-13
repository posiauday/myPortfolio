import { platformStack } from "../data/platformStack.js";
import { CONTACT } from "../config.js";

/* ============================================================
   PLATFORM ORBIT
   A ring of Power Platform badges circling a central hub, in the
   style of MagicUI's "Orbiting Circles" — pure CSS (the `orbit`
   keyframe + counter-rotation in index.css), no animation library.
   Each badge is a colored-initials placeholder rather than an
   official product logo (see data/platformStack.js).

   Two concentric rings turn in opposite directions at different
   speeds, which is what actually sells the "orbit" read — a single
   ring rotating uniformly just looks like a spinner.
   ============================================================ */
const RING = {
  inner: { radius: 68, duration: "16s", size: 44 },
  outer: { radius: 128, duration: "30s", size: 48 }
};

function OrbitBadge({ item, angle, reverse }) {
  const ring = RING[item.ring];
  return (
    <div
      className={`orbit-item absolute left-1/2 top-1/2${reverse ? " orbit-reverse" : ""}`}
      style={{ "--angle": angle, "--radius": `${ring.radius}px`, "--duration": ring.duration }}
    >
      <span
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-black shadow-lg ring-4 ring-[#FBFDFB] dark:ring-[#0B1110]"
        style={{ width: ring.size, height: ring.size, background: item.color, color: item.textDark ? "#17201B" : "#fff" }}
        title={item.name}
      >
        {item.abbr}
      </span>
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
            Every system on this page is built on the same core: Power Apps, Power Automate and Power BI at the
            center, Dataverse and SharePoint underneath, Copilot Studio and Power Pages extending it outward.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Power Platform and Microsoft 365 tools">
            {platformStack.map(item => (
              <li
                key={item.name}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300"
              >
                {item.name}
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
