import { ArrowRight, Sparkles } from "lucide-react";
import { icons } from "../data/componentLibrary.js";

/* Shared between the homepage's featured grid and the full Catalog
   page — kept as one component so the card markup can't drift apart
   between the two places it now renders. */
function ComponentCard({ item, onSelect }) {
  const Icon = icons[item.category] || Sparkles;
  return (
    <button onClick={() => onSelect(item)} className="lift-hover overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-lg dark:border-white/10 dark:bg-white/5">
      <div className="grid h-44 place-items-center bg-slate-50 p-5 dark:bg-white/5">
        <div className="w-[78%] rounded-[22px] bg-white p-5 shadow-xl dark:bg-[#17201B]">
          <div className="flex justify-between">
            <Icon style={{ color: item.color }} />
            <span className="rounded-full px-2 py-1 text-[9px] font-black" style={{ background: `${item.color}18`, color: item.color }}>{item.maturity}</span>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full" style={{ background: item.color }} /></div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: item.color }}>{item.category}</p>
        <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 font-bold text-[#168326]">Open component <ArrowRight size={16} /></span>
      </div>
    </button>
  );
}

export default ComponentCard;
