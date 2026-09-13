import { useEffect, useMemo, useState } from "react";
import { Award, ArrowRight, BadgeCheck, BarChart3, Check, Menu, Moon, Search, Sparkles, Sun, X } from "lucide-react";
import { categories, icons, components, FEATURED_IDS } from "../data/componentLibrary.js";
import { certifications } from "../data/certifications.js";
import { skills } from "../data/skills.js";
import { CONTACT } from "../config.js";
import useReveal from "../hooks/useReveal.js";
import useParallax from "../hooks/useParallax.js";
import useTilt from "../hooks/useTilt.js";
import useComponentRoute from "../hooks/useComponentRoute.js";
import ProjectsSection from "./ProjectsSection.jsx";
import ExperienceSection from "./ExperienceSection.jsx";
import PlatformOrbit from "./PlatformOrbit.jsx";
import NumberTicker from "./NumberTicker.jsx";
import Detail from "./ComponentDetail.jsx";

/* Real, already-stated figures pulled together into one skimmable strip
   right under the hero, rather than left scattered across Experience and
   Recognition where a quick skim can miss them. Nothing here is a new
   claim — years comes from experience.js's own earliest start date, the
   users/productivity figures are the same ones already stated in the
   Recognition and Experience copy, and PL-300 is the same cert listed
   in certifications.js. `value` is numeric and gets NumberTicker's
   count-up; `display` is a plain string for the one non-numeric stat. */
const IMPACT_STATS = [
  { value: 5, suffix: "+", label: "Years in Power Platform & M365" },
  { value: 5000, suffix: "+", label: "Users under governed delivery" },
  { value: 35, suffix: "%+", label: "Productivity lift, automated workflows" },
  { display: "PL-300", label: "Microsoft Certified" }
];

/* ============================================================
   MAIN PORTFOLIO
   Nav labels match the real section ids (Projects / Experience /
   Components / Recognition). The hero's depth, the reveal-on-scroll
   bars and the card hover lift are all CSS plus the useParallax /
   useReveal hooks, so there is still no animation dependency.
   ============================================================ */
export default function Portfolio() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showAllComponents, setShowAllComponents] = useState(false);
  const [selected, selectComponent, clearSelected] = useComponentRoute(components);
  const [menuOpen, setMenuOpen] = useState(false);
  const [barsRef, barsIn] = useReveal();
  const scrolled = useParallax();
  const {
    wrapperRef: heroWrapperRef,
    cardRef: heroCardRef,
    glareRef: heroGlareRef,
    shadowRef: heroShadowRef
  } = useTilt({ max: 14 });

  // Clamped so the layers stop drifting once the hero is off screen; each
  // factor is how much a layer lags (positive) or leads (negative) the page.
  const p = Math.min(scrolled, 900);
  const layer = (factor, extra = "") => ({ transform: `translate3d(0,${p * factor}px,0)${extra}` });

  // The unfiltered "All" view defaults to a curated FEATURED_IDS subset
  // rather than dumping all 25 cards on first scroll — searching or
  // picking a category always searches/shows the complete catalog
  // regardless of this toggle, since narrowing an explicit filter down
  // further would just hide matches the visitor asked for.
  const isDefaultBrowse = category === "All" && query.trim() === "";
  const shown = useMemo(() => {
    if (isDefaultBrowse && !showAllComponents) {
      return FEATURED_IDS.map(id => components.find(c => c.id === id)).filter(Boolean);
    }
    return components.filter(c => (category === "All" || c.category === category) && `${c.title} ${c.category} ${c.summary}`.toLowerCase().includes(query.toLowerCase()));
  }, [query, category, showAllComponents, isDefaultBrowse]);

  // Escape closes the mobile menu, same as any other overlay on the page.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = e => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  if (selected) return <Detail item={selected} dark={dark} onBack={clearSelected} />;

  return (
    <main className={dark ? "dark min-h-screen bg-[#0B1110] text-white" : "min-h-screen bg-[#FBFDFB] text-[#17201B]"}>
      <nav className="fixed inset-x-0 top-0 z-30 p-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#101816]/90">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#168326] font-black text-white">{CONTACT.initials}</span>
              <div><b className="block text-sm">{CONTACT.name}</b><span className="text-[9px] uppercase tracking-widest text-slate-500">{CONTACT.tagline}</span></div>
            </div>
            <div className="hidden gap-1 md:flex">
              {["Projects", "Experience", "Components", "Recognition"].map(x => <a key={x} href={`#${x.toLowerCase()}`} className="rounded-full px-4 py-2 text-sm font-bold hover:bg-green-50 hover:text-[#168326] dark:hover:bg-white/10">{x}</a>)}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setDark(!dark)} className="grid h-10 w-10 place-items-center rounded-full" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="grid h-10 w-10 place-items-center rounded-full md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div
              id="mobile-nav-menu"
              className="mt-2 flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#101816]/95 md:hidden"
            >
              {["Projects", "Experience", "Components", "Recognition"].map(x => (
                <a
                  key={x}
                  href={`#${x.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-green-50 hover:text-[#168326] dark:hover:bg-white/10"
                >
                  {x}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <section className="relative overflow-hidden pt-28">
        {/* Parallax backdrop: three layers drifting at different rates. */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="hero-mesh absolute inset-0 scale-125" style={layer(0.42)} />
          <div
            className="absolute -left-24 top-10 h-[26rem] w-[26rem] rounded-full bg-[#168326]/20 blur-3xl"
            style={layer(0.26)}
          />
          <div
            className="absolute -right-20 top-56 h-[22rem] w-[22rem] rounded-full bg-[#0F6CBD]/20 blur-3xl"
            style={layer(0.14)}
          />
        </div>
        <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2">
          <div style={layer(0.1)}>
            <span className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-xs font-black text-[#168326] dark:border-white/10 dark:bg-white/10"><Sparkles size={14} /> POWER PLATFORM + MICROSOFT 365</span>
            <h1 className="hero-title-size mt-7 font-black leading-[.96] tracking-[-.065em]">I build systems<br /><span className="grad-hero-text bg-clip-text pb-2 text-transparent">people trust.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Secure, scalable applications, automation, data, analytics and governance, designed from discovery through long-term operations.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="rounded-full bg-[#168326] px-6 py-3 font-bold text-white">Explore projects</a>
              <a href="#components" className="rounded-full border border-slate-300 bg-white/70 px-6 py-3 font-bold dark:border-white/20 dark:bg-white/5">Browse design system</a>
            </div>
          </div>

          <div ref={heroShadowRef} className="grad-brand-br rounded-[42px] p-4 shadow-2xl" style={layer(-0.07)}>
            {/* Idle float — a slow ambient bob so the card reads as
                lifted off the page even before the cursor ever touches
                it, on its own layer so it never fights the parallax
                transform above it or the tilt transform below it. */}
            <div className="motion-safe:animate-[hero-float_6s_ease-in-out_infinite]">
              {/* Static hit-test surface for useTilt — see the hook's own
                  comment for why listening here (rather than on the card
                  that actually rotates) matters. */}
              <div ref={heroWrapperRef} className="[perspective:1000px]">
                <div
                  ref={heroCardRef}
                  className="relative overflow-hidden rounded-[32px] bg-white p-6 text-slate-900 [transform-style:preserve-3d]"
                >
                  {/* Cursor-tracked glare — see useTilt. Purely decorative,
                      opacity/background are driven directly by the hook. */}
                  <div ref={heroGlareRef} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0" />

                  {/* Each block sits at its own translateZ inside the
                      card's preserve-3d space, so as useTilt rotates the
                      whole card toward the cursor, the chart visibly pops
                      further forward than the header — real parallax
                      inside the card, not just a single rotated plane. */}
                  <div className="flex justify-between [transform:translateZ(20px)]">
                    <div><span className="text-xs font-black uppercase tracking-widest text-slate-400">Portfolio command</span><h2 className="mt-2 text-2xl font-black">Executive overview</h2></div>
                    <BarChart3 className="text-[#168326] [transform:translateZ(35px)]" />
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 [transform:translateZ(28px)]">
                    {[["Health", "74%"], ["Active", "32"], ["At risk", "06"]].map(([a, b], i) => (
                      <div key={a} className="lift-hover rounded-2xl bg-slate-50 p-4"><span className="text-xs text-slate-500">{a}</span><b className="mt-2 block text-2xl" style={{ color: i === 2 ? "#D13438" : "#168326" }}>{b}</b></div>
                    ))}
                  </div>
                  <div ref={barsRef} className="mt-4 flex h-40 items-end gap-2 rounded-2xl bg-[#F0F5F1] p-5 [transform:translateZ(42px)]">
                    {[42, 56, 48, 70, 62, 82, 76, 94].map((h, i) => <div key={i} className="bar-grow flex-1 rounded-t-lg" style={{ height: barsIn ? `${h}%` : "0%", background: i === 7 ? "#168326" : "#73C184" }} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16" aria-label="Impact at a glance">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {IMPACT_STATS.map(stat => (
            <div key={stat.label} className="rounded-[24px] border border-slate-200 bg-white p-5 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-2xl font-black text-[#168326] sm:text-3xl">
                {stat.display || (
                  <>
                    <NumberTicker value={stat.value} />
                    {stat.suffix}
                  </>
                )}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <PlatformOrbit />

      <ProjectsSection />

      <ExperienceSection />

      <section id="components" className="mx-auto max-w-7xl px-5 py-24">
        <div className="grad-dark-br rounded-[38px] p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-green-400">Uday enterprise design system</p>
          <h2 className="mt-3 text-4xl font-black sm:text-6xl">Reusable components.<br />Built to feel complete.</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[components.length, "Components"], [categories.length - 1, "Categories"], ["100%", "Responsive"], ["Original", "PMO patterns"]].map(([a, b]) => (
              <div key={b} className="rounded-2xl bg-white/10 p-4"><b className="text-2xl">{a}</b><span className="block text-xs text-white/60">{b}</span></div>
            ))}
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          A personal design-system exercise, not shipped production code: {components.length} original and
          reference-verified Power Apps components, each documented down to properties, events, architecture and
          generated YAML.
          {isDefaultBrowse && !showAllComponents && " Six flagship picks below — browse the full catalog to see the rest."}
        </p>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:justify-between">
          <label className="flex min-h-12 w-full max-w-xl items-center gap-3 rounded-full border border-slate-200 px-5 dark:border-white/10">
            <Search size={18} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search components" className="w-full bg-transparent outline-none" />
          </label>
          <div className="flex gap-2 overflow-x-auto">{categories.map(x => <button key={x} onClick={() => setCategory(x)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${category === x ? "bg-[#168326] text-white" : "bg-slate-100 dark:bg-white/10"}`}>{x}</button>)}</div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map(c => {
            const I = icons[c.category] || Sparkles;
            return (
              <button key={c.id} onClick={() => selectComponent(c)} className="lift-hover overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-lg dark:border-white/10 dark:bg-white/5">
                <div className="grid h-44 place-items-center bg-slate-50 p-5 dark:bg-white/5">
                  <div className="w-[78%] rounded-[22px] bg-white p-5 shadow-xl dark:bg-[#17201B]">
                    <div className="flex justify-between"><I style={{ color: c.color }} /><span className="rounded-full px-2 py-1 text-[9px] font-black" style={{ background: `${c.color}18`, color: c.color }}>{c.maturity}</span></div>
                    <div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full" style={{ background: c.color }} /></div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: c.color }}>{c.category}</p>
                  <h3 className="mt-2 text-2xl font-black">{c.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{c.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#168326]">Open component <ArrowRight size={16} /></span>
                </div>
              </button>
            );
          })}
        </div>

        {isDefaultBrowse && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAllComponents(value => !value)}
              className="rounded-full border border-slate-300 bg-white px-6 py-3 font-bold dark:border-white/20 dark:bg-white/5"
            >
              {showAllComponents ? "Show featured only" : `Browse all ${components.length} components`}
            </button>
          </div>
        )}
      </section>

      <section id="recognition" className="mx-auto grid max-w-7xl gap-5 px-5 py-24 lg:grid-cols-2">
        <div className="grad-brand-br rounded-[34px] p-8 text-white">
          <Award />
          <h2 className="mt-16 text-3xl font-black">Deputy Minister&rsquo;s Award</h2>
          <p className="mt-2 text-white/70">Best New Talent &middot; 2023</p>
        </div>
        <div className="rounded-[34px] border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/5">
          <Sparkles className="text-[#5B5BD6]" />
          <h2 className="mt-16 text-3xl font-black">Enterprise-scale governance</h2>
          <p className="mt-2 text-slate-500">Secure and maintainable delivery supporting 5,000+ users.</p>
        </div>
        {certifications.map(cert => {
          const inProgress = cert.status !== "Certified";
          return (
            <div key={cert.code} className="rounded-[34px] border border-slate-200 bg-white p-8 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between">
                <BadgeCheck className="text-[#168326]" />
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    inProgress
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                      : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                  }`}
                >
                  {cert.status}
                </span>
              </div>
              <h2 className="mt-14 text-3xl font-black">{cert.name}</h2>
              <p className="mt-2 text-slate-500">Microsoft Certified &middot; {cert.code}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#168326]">Skills</p>
        <h2 className="mt-3 text-4xl font-black sm:text-5xl">Endorsed by people I&rsquo;ve worked with.</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Straight from LinkedIn &mdash; the checked ones have been endorsed by a colleague.
        </p>
        <ul className="mt-8 flex flex-wrap gap-3" aria-label="Skills endorsed on LinkedIn">
          {skills.map(skill => (
            <li
              key={skill.name}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200"
            >
              {skill.endorsements > 0 && (
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
              {skill.name}
            </li>
          ))}
        </ul>
        <a
          href={CONTACT.linkedin}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#168326] hover:underline"
        >
          View skills on LinkedIn <ArrowRight size={14} />
        </a>
      </section>

      <footer className="mx-auto max-w-7xl px-5 pb-8">
        <div className="rounded-[34px] bg-[#E7F6EA] p-8 dark:bg-[#112319] sm:p-12">
          <h2 className="text-4xl font-black sm:text-6xl">Let&rsquo;s turn complexity into clarity.</h2>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={`mailto:${CONTACT.email}`} className="rounded-full bg-[#168326] px-6 py-3 font-bold text-white">Email Uday</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="rounded-full bg-white px-6 py-3 font-bold text-[#17201B]">LinkedIn</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
