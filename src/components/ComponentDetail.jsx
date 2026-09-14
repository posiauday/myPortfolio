import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Code2, Copy, Sparkles, X } from "lucide-react";
import { icons } from "../data/componentLibrary.js";
import { pascalCase, buildComponentYaml, buildScreenControlYaml, buildComponentDocs } from "../lib/componentDocs.js";
import { darken, lighten } from "../lib/color.js";
import useCopyFeedback from "../hooks/useCopyFeedback.js";
import PowerAppsEmbed from "./PowerAppsEmbed.jsx";
import ComponentPreview from "./ComponentPreview.jsx";

/* ============================================================
   COMPONENT DETAIL PAGE
   Reads like a real component reference page: a filename plus
   "Copy YAML" / "Copy Docs" header, the four-step import
   instructions, and a Preview / Component YAML toggle above the
   mockup. The live-embed section renders PowerAppsEmbed, which
   shows its own honest "not connected" card until an app id and
   tenant id are configured.
   ============================================================ */
function Detail({ item, dark, onBack }) {
  const [tab, setTab] = useState("Preview");
  const [previewView, setPreviewView] = useState("mock");
  const [showLive, setShowLive] = useState(false);
  const [overrides, setOverrides] = useState({});
  const [copied, copy] = useCopyFeedback();
  const tabs = ["Preview", "Variants", "Properties", "Events", "Architecture", "Examples", "Accessibility", "Limitations"];
  const Icon = icons[item.category] || Sparkles;
  const pascal = useMemo(() => pascalCase(item.title), [item.title]);
  const yamlText = useMemo(() => buildComponentYaml(item, overrides), [item, overrides]);
  const controlYamlText = useMemo(() => buildScreenControlYaml(item, overrides), [item, overrides]);
  const docsText = useMemo(() => buildComponentDocs(item), [item]);
  const previewValues = useMemo(() => {
    const resolved = {};
    item.properties.forEach(([name, , def]) => { resolved[name] = overrides[name] ?? def; });
    return resolved;
  }, [item, overrides]);
  const setOverride = (name, value) => setOverrides(prev => ({ ...prev, [name]: value }));

  // Detail doesn't always remount between components — a direct hash
  // navigation from one #components/<id> straight to another (rather
  // than closing back to the catalog first) swaps `item` on the same
  // mounted instance. Without this, an edited value could silently
  // carry over and describe the wrong component's YAML.
  useEffect(() => {
    setOverrides({});
  }, [item.id]);

  const Panel = ({ title, children }) => (
    <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-black">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{item.yamlStatus}</span>
      </div>
      {children}
    </section>
  );

  const renderTab = () => {
    switch (tab) {
      case "Preview":
        return (
          <>
            <div className="mt-8 flex items-center gap-2">
              <button onClick={() => setPreviewView("mock")} className={`rounded-full px-4 py-2 text-xs font-bold ${previewView === "mock" ? "bg-[#168326] text-white" : "bg-slate-100 dark:bg-white/10"}`}>Preview</button>
              <button onClick={() => setPreviewView("yaml")} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ${previewView === "yaml" ? "bg-[#168326] text-white" : "bg-slate-100 dark:bg-white/10"}`}><Code2 size={13} /> Component YAML</button>
            </div>

            {previewView === "mock" ? (
              <div className="mt-5 grid gap-5 rounded-[32px] bg-slate-100 p-5 dark:bg-white/5 lg:grid-cols-[1.3fr_.7fr]">
                <div className="grid min-h-[430px] place-items-center rounded-[26px] bg-[#EAF0F5] p-5 dark:bg-[#101816]">
                  <article className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl dark:bg-[#17201B]">
                    <div className="mb-7 flex items-center justify-between">
                      <div><span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Live preview</span><h2 className="mt-2 text-2xl font-black">{item.title}</h2></div>
                      <Icon style={{ color: item.color }} />
                    </div>
                    <ComponentPreview item={item} values={previewValues} />
                  </article>
                </div>
                <aside className="rounded-[26px] bg-white p-6 dark:bg-[#17201B]">
                  <h3 className="font-black">Component contract</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary}</p>
                  <div
                    className="mt-5 rounded-2xl p-4 text-sm"
                    style={{ background: `${item.color}14`, "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
                  >
                    <b className="text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]">{item.maturity}</b>
                    <span className="mt-1 block text-slate-600 dark:text-slate-300">{item.yamlStatus}</span>
                  </div>

                  <div className="mt-7 flex items-center justify-between">
                    <h3 className="font-black">Configure</h3>
                    <button onClick={() => setOverrides({})} className="text-xs font-bold text-slate-600 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100">
                      Reset to defaults
                    </button>
                  </div>
                  <div className="mt-3 space-y-3">
                    {item.properties.map(([name, type]) => {
                      const value = previewValues[name];
                      return (
                        <label key={name} className="block">
                          <span className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>{name}</span>
                            <span className="text-slate-600 dark:text-slate-300">{type}</span>
                          </span>
                          {type === "Boolean" ? (
                            <button
                              type="button"
                              onClick={() => setOverride(name, value === "true" ? "false" : "true")}
                              className={`mt-1.5 w-full rounded-xl px-3 py-2 text-left text-sm font-bold ${
                                value === "true" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                              }`}
                            >
                              {value === "true" ? "True" : "False"}
                            </button>
                          ) : (
                            <input
                              type={type === "Number" ? "number" : "text"}
                              value={value ?? ""}
                              onChange={e => setOverride(name, e.target.value)}
                              className="mt-1.5 w-full rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#168326] dark:bg-white/10 dark:text-white"
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    The YAML on the next tab always reflects these exact values. The mockup above only
                    updates live for components whose preview is wired to real properties (Executive KPI
                    Card, for now) — everything else keeps its illustrative default view regardless of what
                    you change here.
                  </p>
                </aside>
              </div>
            ) : (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">cmp{pascal}.yaml &mdash; generated from this page&rsquo;s property and event contract, live-updated from the Configure panel on the Preview tab</span>
                  <button className="copy-btn light" onClick={() => copy(yamlText, "yaml")}>{copied === "yaml" ? <Check size={14} /> : <Copy size={14} />} {copied === "yaml" ? "Copied" : "Copy YAML"}</button>
                </div>
                <pre className="code-panel mt-3"><code>{yamlText}</code></pre>
              </div>
            )}

            <div className="mt-8">
              <button onClick={() => setShowLive(v => !v)} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold dark:bg-white/10">{showLive ? "Hide" : "Show"} live Power Apps runtime</button>
              {showLive && <div className="mt-4"><PowerAppsEmbed componentId={item.id} title={item.title} /></div>}
            </div>
          </>
        );
      case "Variants":
        return (
          <Panel title="Variants">
            <p className="mt-3 text-slate-600 dark:text-slate-300">Supported presentation modes for this component contract.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {item.variants.map((v, i) => (
                <div key={v} className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-sm font-black text-white" style={{ background: item.color }}>{i + 1}</span>
                  <h3 className="mt-5 font-black">{v}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{v === "Compact" ? "Reduced density for galleries and constrained layouts." : v === "Dark" ? "Token-adjusted surfaces, borders and readable states." : v === "Mobile" ? "Narrow layout with touch-friendly actions and stacking." : "Full information layout for primary screens."}</p>
                </div>
              ))}
            </div>
          </Panel>
        );
      case "Properties":
        return (
          <Panel title="Properties">
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-[1fr_.7fr_.8fr_1.7fr] gap-3 border-b border-slate-200 pb-3 text-xs font-black uppercase tracking-wider text-slate-600 dark:border-white/10 dark:text-slate-300"><span>Property</span><span>Type</span><span>Default</span><span>Description</span></div>
                {item.properties.map(([name, type, def, desc]) => (
                  <div key={name} className="grid grid-cols-[1fr_.7fr_.8fr_1.7fr] gap-3 border-b border-slate-100 py-4 text-sm dark:border-white/10">
                    <b>{name}</b><span className="text-slate-600 dark:text-slate-300">{type}</span>
                    <code
                      className="text-xs text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
                      style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
                    >
                      {def}
                    </code>
                    <span className="text-slate-600 dark:text-slate-300">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        );
      case "Events":
        return (
          <Panel title="Events">
            {item.events.length ? (
              <div className="mt-6 grid gap-3">{item.events.map(([name, desc]) => (
                <div key={name} className="rounded-2xl bg-slate-50 p-5 dark:bg-white/10">
                  <code
                    className="font-black text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
                    style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
                  >
                    {name}
                  </code>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
                </div>
              ))}</div>
            ) : (
              <div className="mt-6 rounded-2xl bg-slate-50 p-6 dark:bg-white/10"><b>No behavior events</b><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This visual is input-driven and exposes no interaction event in the current specification.</p></div>
            )}
          </Panel>
        );
      case "Architecture":
        return (
          <Panel title="Architecture">
            <div className="mt-8 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              {item.architecture.map((x, i) => (
                <React.Fragment key={x}>
                  <div className="rounded-2xl border border-slate-200 p-5 text-center dark:border-white/10"><span className="mx-auto grid h-9 w-9 place-items-center rounded-full text-xs font-black text-white" style={{ background: item.color }}>{i + 1}</span><b className="mt-4 block text-sm">{x}</b></div>
                  {i < item.architecture.length - 1 && <ArrowRight className="mx-auto hidden text-slate-300 md:block" />}
                </React.Fragment>
              ))}
            </div>
          </Panel>
        );
      case "Examples":
        return (
          <Panel title="Examples">
            <div className="mt-6 grid gap-4 md:grid-cols-3">{item.examples.map((x, i) => (
              <div key={x} className="rounded-2xl bg-slate-50 p-5 dark:bg-white/10">
                <span
                  className="text-xs font-black text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
                  style={{ "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
                >
                  EXAMPLE {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-black">{x}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use the property contract while the host app owns data access, security and persistence.</p>
              </div>
            ))}</div>
          </Panel>
        );
      case "Accessibility":
        return (
          <Panel title="Accessibility">
            <div className="mt-6 grid gap-3">{item.accessibility.map(x => <div key={x} className="flex items-start gap-3 rounded-2xl bg-green-50 p-4 text-green-900 dark:bg-green-900/20 dark:text-green-100"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><span className="text-sm font-semibold">{x}</span></div>)}</div>
          </Panel>
        );
      case "Limitations":
        return (
          <Panel title="Limitations">
            <div className="mt-6 grid gap-3">{item.limitations.map(x => <div key={x} className="rounded-2xl border-l-4 bg-amber-50 p-5 text-sm font-semibold text-amber-900 dark:bg-amber-900/20 dark:text-amber-100" style={{ borderColor: item.color }}>{x}</div>)}</div>
            <p className="mt-6 text-xs leading-5 text-slate-600 dark:text-slate-300">Blueprint and Original entries describe a design contract. They are not presented as downloadable production YAML until their definitions are built and tested in Power Apps Studio.</p>
          </Panel>
        );
      default:
        return null;
    }
  };

  return (
    <main className={dark ? "dark min-h-screen bg-[#0B1110] text-white" : "min-h-screen bg-[#FBFDFB] text-[#17201B]"}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#101816]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <button onClick={onBack} className="flex items-center gap-2 font-bold"><ArrowLeft size={18} /> Components</button>
          <b className="hidden sm:block">{item.title}</b>
          <button onClick={onBack} aria-label="Close, back to components" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-white/10"><X size={18} /></button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-black text-[color:var(--badge-light)] dark:text-[color:var(--badge-dark)]"
            style={{ background: `${item.color}18`, "--badge-light": darken(item.color), "--badge-dark": lighten(item.color) }}
          >
            {item.maturity}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">{item.category}</span>
        </div>
        <h1 className="mt-4 text-4xl font-black sm:text-6xl">{item.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{item.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
          <code className="text-xs font-bold text-slate-600 dark:text-slate-300">cmp{pascal}.yaml</code>
          <span className="hidden text-slate-300 sm:inline">&middot;</span>
          <button className="copy-btn light" onClick={() => copy(yamlText, "yaml-top")}>{copied === "yaml-top" ? <Check size={14} /> : <Copy size={14} />} {copied === "yaml-top" ? "Copied" : "Copy YAML"}</button>
          <button className="copy-btn light" onClick={() => copy(controlYamlText, "control-yaml")}>{copied === "control-yaml" ? <Check size={14} /> : <Copy size={14} />} {copied === "control-yaml" ? "Copied" : "Copy as screen control"}</button>
          <button className="copy-btn light" onClick={() => copy(docsText, "docs")}>{copied === "docs" ? <Check size={14} /> : <Copy size={14} />} {copied === "docs" ? "Copied" : "Copy Docs"}</button>
        </div>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          <b className="font-bold text-slate-600 dark:text-slate-300">Copy YAML</b> defines the component once &mdash; Components tab &rarr; New component &rarr; Import from code.{" "}
          <b className="font-bold text-slate-600 dark:text-slate-300">Copy as screen control</b> drops one instance of it onto a screen afterward &mdash; paste directly into the tree view. Press F5 to preview either way.
        </p>

        <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-white/10">
          {tabs.map(x => <button key={x} onClick={() => setTab(x)} className={`shrink-0 border-b-2 px-4 py-4 text-sm font-bold ${tab === x ? "border-[#168326] text-[#168326] dark:text-[#4ADE80]" : "border-transparent text-slate-600 dark:text-slate-400"}`}>{x}</button>)}
        </nav>
        {renderTab()}
      </div>
    </main>
  );
}

export default Detail;
