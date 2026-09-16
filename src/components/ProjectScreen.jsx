import React from "react";
import { ArrowRight, BarChart3, FileText, Layers3, ShieldCheck, Workflow } from "lucide-react";

/* ============================================================
   PROJECT SCREEN MOCKUPS
   One function per project, switching on the standardized `kind`
   prefix. Purely illustrative — every number here is synthetic.
   ============================================================ */
function ProjectScreen({ kind, color }) {
  const Metric = ({ label, value }) => (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <span className="text-[9px] text-slate-500">{label}</span>
      <b className="mt-1 block text-xl" style={{ color }}>{value}</b>
    </div>
  );
  const Field = ({ label, wide = false }) => (
    <div className={wide ? "md:col-span-2" : ""}>
      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</span>
      <div className="mt-1 h-9 rounded-lg border border-slate-200 bg-white" />
    </div>
  );

  if (kind === "wsms-dashboard") {
    return (
      <div className="h-full bg-[#F4F6F8] p-4 text-slate-900">
        <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
          <div><b className="block text-sm">Client Projects</b><span className="text-[9px] text-slate-500">Work Scope Management System</span></div>
          <button className="rounded-lg px-3 py-2 text-[9px] font-black text-white" style={{ background: color }}>+ Add client</button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Clients" value="128" /><Metric label="Active" value="42" /><Metric label="Pending" value="07" /></div>
        <div className="mt-3 rounded-xl bg-white p-3 shadow-sm">
          <div className="mb-2 grid h-8 grid-cols-[1fr_.5fr_.4fr] items-center rounded-lg bg-slate-100 px-2 text-[8px] font-black uppercase tracking-wider text-slate-500">
            <span>Client</span><span>Account</span><span>Status</span>
          </div>
          {["Northgate Medical Centre", "Eastside Service Depot", "Civic Operations Hub"].map((x, i) => (
            <div key={x} className="grid grid-cols-[1fr_.5fr_.4fr] border-t border-slate-100 py-2 text-[9px]">
              <b>{x}</b><span>Account {210 + i}</span><span className="font-bold text-green-700">Active</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind.startsWith("wsms-")) {
    const active = kind === "wsms-client" ? 0 : kind === "wsms-work" ? 1 : 3;
    return (
      <div className="h-full bg-[#F4F6F8] p-4 text-slate-900">
        <div className="flex justify-between">
          <div><span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>WSMS workspace</span><b className="block text-lg">{kind === "wsms-client" ? "Client Information" : kind === "wsms-work" ? "Work Specification" : "Inspection Request"}</b></div>
          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-bold shadow-sm">Draft</span>
        </div>
        <div className="mt-3 flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {["Client Info", "Work Spec", "Instructions", "Inspection"].map((x, i) => (
            <span key={x} className="flex-1 rounded-lg px-1 py-2 text-center text-[8px] font-bold" style={i === active ? { background: color, color: "white" } : { color: "#94A3B8" }}>{x}</span>
          ))}
        </div>
        <div className="mt-3 grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2">
          {kind === "wsms-client" ? (
            <><Field label="Client name" /><Field label="Account" /><Field label="Address" wide /><Field label="Building" /><Field label="Status" /></>
          ) : kind === "wsms-work" ? (
            <>
              <div className="space-y-2 rounded-lg bg-slate-50 p-2">{["Floor care", "Window cleaning", "Waste removal"].map(x => <div key={x} className="rounded-lg bg-white p-2 text-[9px] font-bold">{x}</div>)}</div>
              <div className="grid grid-cols-2 gap-2"><Field label="Work item" /><Field label="Title" /><Field label="Material cost" /><Field label="Labour cost" /><Field label="Description" wide /></div>
            </>
          ) : (
            <><Field label="Inspection type" /><Field label="Requested date" /><Field label="Assigned inspector" /><Field label="Priority" /><Field label="Inspection notes" wide /></>
          )}
        </div>
      </div>
    );
  }

  if (kind === "dpmr-risk") {
    return (
      <div className="h-full bg-[#F3F7F4] p-4 text-slate-900">
        <b className="text-lg">Portfolio Risk Intelligence</b>
        <div className="mt-3 grid grid-cols-3 gap-2">{[1, 2, 1, 3, 4, 2, 1, 3, 5].map((n, i) => <div key={i} className="grid aspect-[1.7] place-items-center rounded-lg text-xs font-black" style={{ background: ["#DCFCE7", "#FEF3C7", "#FEE2E2"][Math.floor(i / 3)] }}>{n}</div>)}</div>
        <div className="mt-3 rounded-xl bg-white p-3 shadow-sm">
          {["Vendor capacity risk", "Timeline dependency", "Resource availability"].map((x, i) => (
            <div key={x} className="flex justify-between border-b border-slate-100 py-2 text-[9px]"><b>{x}</b><span className={i === 0 ? "text-red-600" : "text-amber-600"}>{i === 0 ? "Very high" : "High"}</span></div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "dpmr-milestone") {
    return (
      <div className="h-full bg-[#F3F7F4] p-4 text-slate-900">
        <b className="text-lg">Milestone Delivery</b>
        <div className="mt-4 space-y-3">
          {[["Requirements approved", "Completed", "100%"], ["Build complete", "In progress", "72%"], ["Production release", "Upcoming", "24%"]].map(([a, b, c], i) => (
            <div key={a} className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex justify-between text-[10px]"><b>{a}</b><span>{b}</span></div>
              <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: c, background: i === 0 ? "#168326" : color }} /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind.startsWith("dpmr-")) {
    return (
      <div className="h-full bg-[#F3F7F4] p-4 text-slate-900">
        <div className="flex justify-between">
          <div><span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>Portfolio command</span><b className="block text-lg">{kind === "dpmr-project" ? "Project Drill-through" : "Executive Overview"}</b></div>
          <BarChart3 style={{ color }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Health" value="74%" /><Metric label="Active" value="32" /><Metric label="At risk" value="06" /></div>
        <div className="mt-3 rounded-xl bg-white p-3 shadow-sm">
          <span className="text-[9px] font-bold">Delivery trend</span>
          <div className="mt-3 flex h-24 items-end gap-2">{[42, 60, 52, 75, 68, 88].map((h, i) => <i key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 5 ? color : `${color}66` }} />)}</div>
        </div>
      </div>
    );
  }

  if (kind === "collab-gov-storage") {
    return (
      <div className="h-full bg-[#F1F6FB] p-4 text-slate-900">
        <b className="text-lg">Storage Analytics</b>
        <div className="mt-4 grid grid-cols-[.8fr_1.2fr] gap-3">
          <div className="grid place-items-center rounded-xl bg-white shadow-sm">
            <div className="grid h-28 w-28 place-items-center rounded-full" style={{ background: `conic-gradient(${color} 0 68%,#DCE6F0 68%)` }}>
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white"><b>68%</b></div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            {[["Teams sites", "4.8 TB"], ["Communication", "2.1 TB"], ["Archive", "1.2 TB"]].map(([a, b], i) => (
              <div key={a} className="border-b border-slate-100 py-3">
                <div className="flex justify-between text-[9px]"><b>{a}</b><span>{b}</span></div>
                <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${80 - i * 18}%`, background: color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (kind === "collab-gov-inactive" || kind === "collab-gov-owner") {
    return (
      <div className="h-full bg-[#F1F6FB] p-4 text-slate-900">
        <b className="text-lg">{kind === "collab-gov-inactive" ? "Inactive Sites" : "Ownership Coverage"}</b>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          {["Finance Collaboration", "Regional Operations", "Legacy Program", "Digital Services"].map((x, i) => (
            <div key={x} className="grid grid-cols-[1.2fr_.6fr_.6fr] border-b border-slate-100 p-3 text-[9px]">
              <b>{x}</b><span>{kind === "collab-gov-owner" ? [0, 2, 0, 3][i] : `${90 + i * 42} days`}</span><span style={{ color: i % 2 ? "#168326" : "#D13438" }}>{i % 2 ? "Covered" : "Action"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind.startsWith("cirp-")) {
    return (
      <div className="h-full bg-[#FBF3FA] p-4 text-slate-900">
        <div className="flex justify-between">
          <div><span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>Client services workspace</span><b className="block text-lg">{kind === "cirp-intake" ? "Guided Client Intake" : kind === "cirp-workspace" ? "Case Workspace" : kind === "cirp-workflow" ? "Workflow Tracking" : "Operations Dashboard"}</b></div>
          <Workflow style={{ color }} />
        </div>
        {kind === "cirp-dashboard" ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Open cases" value="48" /><Metric label="In review" value="17" /><Metric label="Completed" value="86%" /></div>
            <div className="mt-3 flex h-32 items-end gap-2 rounded-xl bg-white p-4 shadow-sm">{[45, 62, 54, 76, 69, 88, 82].map((h, i) => <i key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 5 ? color : `${color}66` }} />)}</div>
          </>
        ) : kind === "cirp-workflow" ? (
          <div className="mt-5 space-y-2">
            {["Intake", "Review", "Approval", "Complete"].map((x, i) => (
              <div key={x} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-black text-white" style={{ background: i < 2 ? color : "#CBD5E1" }}>{i < 2 ? "\u2713" : i + 1}</span>
                <b className="text-xs">{x}</b><span className="ml-auto text-[9px] text-slate-500">{i < 2 ? "Complete" : "Pending"}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2">
            <Field label="Client reference" /><Field label="Service region" /><Field label="Request type" /><Field label="Assigned role" /><Field label="Summary" wide />
            <button className="rounded-lg px-4 py-2 text-xs font-bold text-white md:col-span-2" style={{ background: color }}>Save and continue</button>
          </div>
        )}
      </div>
    );
  }

  if (kind.startsWith("portfolio-insights-")) {
    return (
      <div className="h-full bg-[#FFF6F0] p-4 text-slate-900">
        <div className="flex justify-between">
          <div><span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>Portfolio architecture</span><b className="block text-lg">{kind === "portfolio-insights-health" ? "Portfolio Health" : kind === "portfolio-insights-feasibility" ? "Feasibility Matrix" : kind === "portfolio-insights-model" ? "Data Model Boundaries" : "Delivery Roadmap"}</b></div>
          <Layers3 style={{ color }} />
        </div>
        {kind === "portfolio-insights-health" ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Healthy" value="71%" /><Metric label="Active" value="28" /><Metric label="Attention" value="05" /></div>
            <div className="mt-3 flex h-28 items-end gap-2 rounded-xl bg-white p-3 shadow-sm">{[52, 64, 58, 78, 71, 86].map((h, i) => <i key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 5 ? color : `${color}55` }} />)}</div>
          </>
        ) : kind === "portfolio-insights-feasibility" ? (
          <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
            {[["Portfolio overview", "Supported"], ["Financial metrics", "Conditional"], ["Historical trends", "New architecture"], ["Resource capacity", "New architecture"]].map(([a, b], i) => (
              <div key={a} className="grid grid-cols-[1.3fr_.7fr] border-b border-slate-100 p-3 text-[10px]"><b>{a}</b><span style={{ color: i === 0 ? "#168326" : i === 1 ? "#CA5010" : "#D13438" }}>{b}</span></div>
            ))}
          </div>
        ) : kind === "portfolio-insights-model" ? (
          <div className="mt-8 flex items-center gap-2">
            {["Operational lists", "Current-state model", "Executive reporting"].map((x, i) => (
              <React.Fragment key={x}>
                <div className="flex-1 rounded-xl bg-white p-4 text-center text-[10px] font-bold shadow-sm">{x}</div>
                {i < 2 && <ArrowRight size={16} style={{ color }} />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-4 gap-2">
            {["Portfolio", "Project detail", "Financial", "Risk & governance"].map((x, i) => (
              <div key={x} className="rounded-xl bg-white p-3 text-center shadow-sm">
                <span className="mx-auto grid h-7 w-7 place-items-center rounded-full text-[9px] font-black text-white" style={{ background: color }}>{i + 1}</span>
                <b className="mt-3 block text-[9px]">{x}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (kind.startsWith("workspace-owners-")) {
    return (
      <div className="h-full bg-[#F1F6FB] p-4 text-slate-900">
        <div className="flex justify-between">
          <div><span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>Ownership governance</span><b className="block text-lg">{kind === "workspace-owners-overview" ? "Ownership Overview" : kind === "workspace-owners-explorer" ? "Workspace Explorer" : kind === "workspace-owners-exceptions" ? "Governance Exceptions" : "Collection Pipeline"}</b></div>
          <ShieldCheck style={{ color }} />
        </div>
        {kind === "workspace-owners-overview" ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Workspaces" value="6K+" /><Metric label="Covered" value="92%" /><Metric label="Action" value="146" /></div>
            <div className="mt-3 rounded-xl bg-white p-3 shadow-sm"><div className="h-3 rounded-full bg-slate-100"><div className="h-full w-4/5 rounded-full" style={{ background: color }} /></div></div>
          </>
        ) : kind === "workspace-owners-pipeline" ? (
          <div className="mt-8 flex items-center gap-2">
            {["PnP collection", "Transform", "Dataset", "Action queue"].map((x, i) => (
              <React.Fragment key={x}>
                <div className="flex-1 rounded-xl bg-white p-3 text-center text-[9px] font-bold shadow-sm">{x}</div>
                {i < 3 && <ArrowRight size={14} style={{ color }} />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
            {["Workspace Alpha", "Service Hub 12", "Program Archive", "Regional Portal"].map((x, i) => (
              <div key={x} className="grid grid-cols-[1.2fr_.6fr_.6fr] border-b border-slate-100 p-3 text-[9px]">
                <b>{x}</b><span>{kind === "workspace-owners-explorer" ? `${12 + i * 9} GB` : i % 2 ? "Covered" : "Missing owner"}</span><span style={{ color: i % 2 ? "#168326" : "#D13438" }}>{i % 2 ? "Healthy" : "Review"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (kind.startsWith("tender-automation-")) {
    return (
      <div className="h-full bg-[#F4F7FB] p-4 text-slate-900">
        <div className="flex justify-between">
          <div><span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>Document automation</span><b className="block text-lg">{kind === "tender-automation-readiness" ? "Report Readiness" : kind === "tender-automation-invitation" ? "Request for Quote" : kind === "tender-automation-approved" ? "Approved Scope List" : "Generation Pipeline"}</b></div>
          <FileText style={{ color }} />
        </div>
        {kind === "tender-automation-pipeline" ? (
          <div className="mt-8 flex items-center gap-2">
            {["Validate", "Build HTML", "Create PDF", "Store & notify"].map((x, i) => (
              <React.Fragment key={x}>
                <div className="flex-1 rounded-xl bg-white p-3 text-center text-[9px] font-bold shadow-sm">{x}</div>
                {i < 3 && <ArrowRight size={14} style={{ color }} />}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <div><b className="text-sm">{kind === "tender-automation-readiness" ? "Generation checklist" : kind === "tender-automation-invitation" ? "Sample contractor package" : "Sample client package"}</b><span className="block text-[8px] text-slate-500">Reference DEMO-1042</span></div>
              <span className="rounded-full bg-green-50 px-2 py-1 text-[9px] font-bold text-green-700">Synthetic</span>
            </div>
            {["Exterior repair package", "Mechanical allowance", "Finishing work"].map((x, i) => (
              <div key={x} className="grid grid-cols-[1fr_.35fr] border-b border-slate-100 py-3 text-[9px]"><b>{x}</b><span className="text-right">${[4800, 3250, 1900][i].toLocaleString()}</span></div>
            ))}
            <div className="mt-3 flex justify-between text-xs font-black"><span>Total</span><span style={{ color }}>$9,950</span></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full bg-[#F1F6FB] p-4 text-slate-900">
      <div className="flex justify-between">
        <div><span className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>Governance command</span><b className="block text-lg">Executive Overview</b></div>
        <ShieldCheck style={{ color }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Sites" value="2.4K" /><Metric label="Owned" value="91%" /><Metric label="Inactive" value="184" /></div>
      <div className="mt-3 flex h-32 items-end gap-2 rounded-xl bg-white p-3 shadow-sm">{[72, 48, 85, 62, 94, 76, 88].map((h, i) => <i key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 4 ? color : `${color}60` }} />)}</div>
    </div>
  );
}

export default ProjectScreen;
