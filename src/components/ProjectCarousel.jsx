import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProjectScreen from "./ProjectScreen.jsx";

/* ============================================================
   PROJECT CAROUSEL
   The slide-change transition previously used framer-motion's
   initial/animate on a keyed motion.div. A keyed remount already
   replays a CSS animation on its own, so a plain div with the
   `.slide-in` class (defined above) gets the same effect for free.
   ============================================================ */
function ProjectCarousel({ project }) {
  const [index, setIndex] = useState(0);
  const slide = project.slides[index];
  const move = delta => setIndex(current => (current + delta + project.slides.length) % project.slides.length);

  return (
    <article className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[.06] shadow-2xl">
      <div className="grid lg:grid-cols-[1.35fr_.65fr]">
        <div className="relative min-h-[430px] bg-white p-4 sm:p-6">
          <div key={slide.kind} className="slide-in h-full min-h-[380px] overflow-hidden rounded-[24px] border border-slate-200 shadow-xl">
            <ProjectScreen kind={slide.kind} color={project.color} />
          </div>
          <button onClick={() => move(-1)} aria-label={`Previous ${project.title} screen`} className="absolute left-7 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-900 shadow-xl"><ArrowLeft size={18} /></button>
          <button onClick={() => move(1)} aria-label={`Next ${project.title} screen`} className="absolute right-7 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white text-slate-900 shadow-xl"><ArrowRight size={18} /></button>
        </div>
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <span className="text-xs font-black uppercase tracking-[.18em]" style={{ color: project.color }}>{project.subtitle}</span>
            <h3 className="mt-2 text-4xl font-black">{project.title}</h3>
            <p className="mt-5 text-sm leading-6 text-white/60">{project.impact}</p>
            <div className="mt-6 flex flex-wrap gap-2">{project.stack.map(x => <span key={x} className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold">{x}</span>)}</div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <span className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: project.color }}>{slide.eyebrow}</span>
              <h4 className="mt-2 text-2xl font-black">{slide.title}</h4>
              <p className="mt-3 text-sm leading-6 text-white/60">{slide.description}</p>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <span className="text-xs font-bold text-white/45">{String(index + 1).padStart(2, "0")} / {String(project.slides.length).padStart(2, "0")}</span>
            <div className="flex gap-2">{project.slides.map((s, i) => <button key={s.kind} onClick={() => setIndex(i)} aria-label={`Show ${s.title}`} className="h-2.5 rounded-full" style={{ width: i === index ? 28 : 10, background: i === index ? project.color : "rgba(255,255,255,.22)" }} />)}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProjectCarousel;
