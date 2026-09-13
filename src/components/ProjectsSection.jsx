import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { projectShowcases } from "../data/projectShowcases.js";
import ProjectScreen from "./ProjectScreen.jsx";
import RevealHeading from "./RevealHeading.jsx";

/* ============================================================
   PROJECTS
   One showcase at a time, chosen from a rail, rather than seven
   stacked carousels: the old layout made the section enormously
   tall and repetitive, and its floating arrows sat on top of the
   screen content they were meant to navigate.

   Each screen now sits in a window frame with its own title bar,
   so it reads as a product screenshot, and the slide controls sit
   in a bar beneath the frame where they name the slide they move
   to instead of showing anonymous dots.

   ProjectScreen renders at a fixed minimum width (SCREEN_MIN_WIDTH)
   inside a horizontally scrollable viewport, rather than fluid or
   scaled. Several mockups have a flex header with an unshrinkable
   button, or a multi-column table, that cannot reflow below a few
   hundred pixels without overlapping — and shrinking the whole
   mockup down to fit a phone width makes its already-small text
   illegible. Keeping it at native size and letting a narrow
   viewport scroll to see the rest (like a wide screenshot or table)
   keeps every mockup legible everywhere, and never forces its grid
   ancestor wider than the page: an element with overflow set to
   anything but `visible` is treated as having zero minimum width in
   flex/grid sizing, which is what actually stops the blowout —
   `min-w-0` below is the same fix applied one level up, as
   defense-in-depth against a future change reintroducing it.
   ============================================================ */
const SCREEN_MIN_WIDTH = 680;

function ProjectsSection() {
  const [projectIndex, setProjectIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const railRef = useRef(null);

  const project = projectShowcases[projectIndex];
  const slide = project.slides[slideIndex];
  const total = project.slides.length;

  const selectProject = index => {
    setProjectIndex(index);
    setSlideIndex(0);
  };

  const moveSlide = delta => setSlideIndex(current => (current + delta + total) % total);

  // Left/right arrows walk the project rail, which is what a visitor
  // expects from a horizontal row of choices.
  const onRailKeyDown = event => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (projectIndex + delta + projectShowcases.length) % projectShowcases.length;
    selectProject(next);
    railRef.current?.querySelectorAll("button")[next]?.focus();
  };

  return (
    <section id="projects" className="bg-[#17201B] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:py-24">
        <p className="text-xs font-black uppercase tracking-[.2em] text-green-400">Project showcase</p>
        <RevealHeading className="mt-3 text-4xl font-black sm:text-6xl">See the systems in motion.</RevealHeading>
        <p className="mt-5 max-w-3xl text-base leading-7 text-white/60">
          Interface recreations of delivered Power Platform solutions, shown under generic names.
          Every figure on every screen is synthetic.
        </p>

        {/* Project rail */}
        <div
          ref={railRef}
          onKeyDown={onRailKeyDown}
          className="mt-10 flex gap-3 overflow-x-auto pb-2"
        >
          {projectShowcases.map((item, index) => {
            const active = index === projectIndex;
            return (
              <button
                key={item.id}
                onClick={() => selectProject(index)}
                aria-current={active ? "true" : undefined}
                className={`w-56 shrink-0 rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-transparent bg-white/[.10]"
                    : "border-white/10 bg-white/[.03] hover:bg-white/[.07]"
                }`}
                style={active ? { borderColor: item.color } : undefined}
              >
                <span
                  className="text-[10px] font-black tracking-[.2em]"
                  style={{ color: active ? item.color : "rgba(255,255,255,.35)" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <b className="mt-2 block text-sm leading-tight">{item.title}</b>
                <span className="mt-1 block text-[11px] leading-snug text-white/45">{item.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Showcase */}
        <article
          key={project.id}
          className="slide-in mt-6 overflow-hidden rounded-[34px] border border-white/10 bg-white/[.06] shadow-2xl"
        >
          <div className="grid lg:grid-cols-[1.45fr_.55fr]">
            <div className="min-w-0 p-4 sm:p-6">
              {/* Window frame */}
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white shadow-2xl">
                <div className="flex items-center gap-3 border-b border-slate-200 bg-[#F4F6F8] px-4 py-2.5">
                  <span className="flex gap-1.5" aria-hidden="true">
                    {["#FF5F57", "#FEBC2E", "#28C840"].map(dot => (
                      <i key={dot} className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
                    ))}
                  </span>
                  <span className="truncate text-[10px] font-bold text-slate-500">
                    {project.title} &mdash; {slide.title}
                  </span>
                  <span
                    className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black"
                    style={{ background: `${project.color}1A`, color: project.color }}
                  >
                    Synthetic data
                  </span>
                </div>
                <div className="overflow-x-auto bg-white">
                  <div
                    key={slide.kind}
                    className="slide-in min-h-[380px] bg-white"
                    style={{ minWidth: SCREEN_MIN_WIDTH }}
                  >
                    <ProjectScreen kind={slide.kind} color={project.color} />
                  </div>
                </div>
              </div>

              {/* Slide controls, below the frame instead of over it */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => moveSlide(-1)}
                  aria-label={`Previous ${project.title} screen`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 hover:bg-white/15"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex flex-1 gap-1 overflow-x-auto">
                  {project.slides.map((item, index) => {
                    const active = index === slideIndex;
                    return (
                      <button
                        key={item.kind}
                        onClick={() => setSlideIndex(index)}
                        aria-current={active ? "true" : undefined}
                        className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-bold transition ${
                          active ? "text-[#17201B]" : "text-white/50 hover:text-white/80"
                        }`}
                        style={active ? { background: project.color, color: "#fff" } : undefined}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => moveSlide(1)}
                  aria-label={`Next ${project.title} screen`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5 hover:bg-white/15"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Project and slide detail */}
            <div className="flex flex-col justify-between border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div>
                <span className="text-xs font-black uppercase tracking-[.18em]" style={{ color: project.color }}>
                  {project.subtitle}
                </span>
                <h3 className="mt-2 text-4xl font-black">{project.title}</h3>
                <p className="mt-5 text-sm leading-6 text-white/60">{project.impact}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.stack.map(item => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 border-t border-white/10 pt-6">
                  <span className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: project.color }}>
                    {slide.eyebrow}
                  </span>
                  <h4 className="mt-2 text-2xl font-black">{slide.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-white/60">{slide.description}</p>
                </div>
              </div>
              <span className="mt-8 text-xs font-bold text-white/40">
                Screen {String(slideIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProjectsSection;
