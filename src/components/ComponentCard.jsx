import { ArrowRight, Sparkles } from "lucide-react";
import { icons } from "../data/componentLibrary.js";
import { darken, lighten } from "../lib/color.js";
import ComponentPreview from "./ComponentPreview.jsx";

/* Shared between the homepage's featured grid and the full Catalog
   page — kept as one component so the card markup can't drift apart
   between the two places it now renders.

   The thumbnail is a real, cropped snapshot of this exact component's
   own bespoke Preview mockup — the same one ComponentDetail.jsx's
   Preview tab renders — scaled down, not a placeholder shared by all
   25 (a calendar's card used to look identical to a data table's).
   interactive={false} swaps ComponentPreview's handful of illustrative
   <button> elements for plain <span>s, since this thumbnail sits
   inside the card's own single real <button> and is itself
   aria-hidden — a nested, focusable-but-invisible control would be
   both invalid HTML and its own real accessibility violation. Scaled
   from a fixed top-anchored width so a tall mockup (Enterprise
   Calendar's full month grid, say) crops cleanly from the bottom
   rather than being centered-and-clipped unpredictably. */
function ComponentCard({ item, onSelect }) {
  const Icon = icons[item.category] || Sparkles;
  return (
    <button onClick={() => onSelect(item)} className="lift-hover overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-lg dark:border-white/10 dark:bg-white/5">
      <div className="relative h-44 overflow-hidden bg-slate-50 dark:bg-white/5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-4 w-[380px] origin-top -translate-x-1/2 scale-[0.42] rounded-[22px] bg-white p-5 shadow-xl dark:bg-[#17201B]"
        >
          <div className="mb-4 flex items-center justify-between">
            <Icon style={{ color: item.color }} />
            <span
              className="rounded-full px-2 py-1 text-[9px] font-black text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
              style={{ background: `${item.color}18`, "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
            >
              {item.maturity}
            </span>
          </div>
          <ComponentPreview item={item} interactive={false} />
        </div>
      </div>
      <div className="p-6">
        <p
          className="text-[10px] font-black uppercase tracking-widest text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
          style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
        >
          {item.category}
        </p>
        <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#168326] dark:text-[#4ADE80]">Open component <ArrowRight size={16} /></span>
      </div>
    </button>
  );
}

export default ComponentCard;
