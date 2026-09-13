/* ============================================================
   PROJECT SHOWCASES
   Names here are stand-ins: each project is presented under a
   generic name that describes the same kind of system without
   identifying the real engagement. Every slide's `kind` is
   prefixed with its project's own id exactly, and ProjectScreen
   switches on that prefix.
   ============================================================ */
const projectShowcases = [
  {
    id: "wsms", title: "WSMS", subtitle: "Work Scope Management System", color: "#5B5BD6",
    stack: ["Canvas Power Apps", "Dataverse", "Power Automate"],
    impact: "A relational client and work-management experience with controlled editing, costing and inspection workflows.",
    slides: [
      { title: "Client & Project Dashboard", eyebrow: "Portfolio workspace", kind: "wsms-dashboard", description: "Searchable client projects, operational counts, refresh and guided record creation." },
      { title: "Client Information", eyebrow: "Governed data entry", kind: "wsms-client", description: "Required client, account, address, building and status fields with clear validation." },
      { title: "Work Specification", eyebrow: "Relational work design", kind: "wsms-work", description: "Work items, descriptions, approved material and labour costs in a focused split workspace." },
      { title: "Inspection Request", eyebrow: "Controlled workflow", kind: "wsms-inspection", description: "Inspection submission, assignment, scheduling and status context tied to the client record." }
    ]
  },
  {
    id: "dpmr", title: "DPMR", subtitle: "Delivery Performance & Milestone Reporting", color: "#168326",
    stack: ["Canvas Power Apps", "SharePoint Online", "Power BI"],
    impact: "A portfolio intelligence experience connecting project intake, delivery health, milestones, risks and executive drill-through.",
    slides: [
      { title: "Executive Portfolio Overview", eyebrow: "Decision intelligence", kind: "dpmr-overview", description: "Compact KPIs, portfolio health, reporting cycle and delivery trend for leadership." },
      { title: "Project Drill-through", eyebrow: "Project context", kind: "dpmr-project", description: "Project ownership, status, schedule, summary and delivery signals in one focused view." },
      { title: "Risk Intelligence", eyebrow: "Exposure management", kind: "dpmr-risk", description: "Open-risk concentration by impact and probability with mitigation and project context." },
      { title: "Milestone Tracking", eyebrow: "Delivery control", kind: "dpmr-milestone", description: "Upcoming, late and completed milestones with date, owner and status visibility." }
    ]
  },
  {
    id: "collab-gov", title: "Collaboration Governance Hub", subtitle: "Tenant-Wide Collaboration Oversight", color: "#0F6CBD",
    stack: ["Power BI", "PnP PowerShell", "Power Automate"],
    impact: "A reusable collection and analytics pipeline turning Microsoft 365 administration data into governance action.",
    slides: [
      { title: "Executive Governance Overview", eyebrow: "Enterprise command centre", kind: "collab-gov-overview", description: "Ownership, activity, storage and lifecycle signals summarized for governance teams." },
      { title: "Storage Analytics", eyebrow: "Capacity intelligence", kind: "collab-gov-storage", description: "Storage concentration, growth indicators and high-consumption workspaces." },
      { title: "Inactive Sites", eyebrow: "Lifecycle governance", kind: "collab-gov-inactive", description: "Inactive collaboration spaces prioritized by age, ownership and storage footprint." },
      { title: "Ownership Coverage", eyebrow: "Accountability", kind: "collab-gov-owner", description: "Owner coverage, missing accountability and actionable workspace exceptions." }
    ]
  },
  {
    id: "cirp", title: "CIRP", subtitle: "Client Intake & Reporting Platform", color: "#C239B3",
    stack: ["Canvas Power Apps", "Power BI", "Power Automate"],
    impact: "A centralized intake and reporting solution replacing spreadsheet-driven processing with governed validation, workflow, deployment and operational visibility.",
    slides: [
      { title: "Guided Client Intake", eyebrow: "Structured capture", kind: "cirp-intake", description: "A guided intake experience with required fields, validation states and clear ownership." },
      { title: "Case Workspace", eyebrow: "Operational management", kind: "cirp-workspace", description: "A focused workspace for reviewing client details, assigned work, documents and current status." },
      { title: "Workflow Tracking", eyebrow: "Process automation", kind: "cirp-workflow", description: "A transparent stage view showing intake, review, approval and completion without exposing private records." },
      { title: "Operations Dashboard", eyebrow: "Real-time reporting", kind: "cirp-dashboard", description: "Synthetic workload, status and completion indicators demonstrating the reporting experience." }
    ]
  },
  {
    id: "portfolio-insights", title: "Portfolio Insights", subtitle: "Executive Reporting & Feasibility Assessment", color: "#D83B01",
    stack: ["Power BI", "DAX", "SharePoint Online"],
    impact: "A portfolio-reporting initiative pairing executive dashboard delivery with a feasibility assessment that separated reliable current-state reporting from capabilities requiring historical data engineering.",
    slides: [
      { title: "Portfolio Health", eyebrow: "Current-state reporting", kind: "portfolio-insights-health", description: "Governed portfolio health, project status, schedule and financial indicators based on available source data." },
      { title: "Feasibility Matrix", eyebrow: "Architecture judgment", kind: "portfolio-insights-feasibility", description: "Requirements grouped into supported, conditional and redesign-needed paths before development." },
      { title: "Data Model Boundaries", eyebrow: "Technical clarity", kind: "portfolio-insights-model", description: "A visual explanation of operational SharePoint data versus historical snapshot and warehouse needs." },
      { title: "Delivery Roadmap", eyebrow: "Phased execution", kind: "portfolio-insights-roadmap", description: "A structured release path covering portfolio, project detail, financial, risk and governance capabilities." }
    ]
  },
  {
    id: "workspace-owners", title: "Workspace Ownership Dashboard", subtitle: "Collaboration Ownership & Lifecycle", color: "#0F6CBD",
    stack: ["Power BI", "PnP PowerShell", "Power Automate"],
    impact: "A governance experience that converts tenant administration data into clear ownership, activity, storage and lifecycle actions at enterprise scale.",
    slides: [
      { title: "Ownership Overview", eyebrow: "Accountability", kind: "workspace-owners-overview", description: "Synthetic ownership coverage, unresolved workspaces and governance attention indicators." },
      { title: "Workspace Explorer", eyebrow: "Self-service discovery", kind: "workspace-owners-explorer", description: "A masked searchable inventory showing workspace type, ownership coverage, activity and storage." },
      { title: "Governance Exceptions", eyebrow: "Action queue", kind: "workspace-owners-exceptions", description: "Prioritized missing-owner, inactive and high-storage exceptions with no real tenant information." },
      { title: "Collection Pipeline", eyebrow: "Repeatable automation", kind: "workspace-owners-pipeline", description: "A visual pipeline from scripted collection through transformation, refresh and governance action." }
    ]
  },
  {
    id: "tender-automation", title: "Tender Document Automation", subtitle: "Request-for-Quote & Approved Scope List", color: "#0078D4",
    stack: ["Power Automate", "Dataverse", "HTML to PDF"],
    impact: "A document-generation workflow that transforms approved application data into consistent bid and approved-work outputs while keeping calculation and distribution rules controlled.",
    slides: [
      { title: "Report Readiness", eyebrow: "Validated inputs", kind: "tender-automation-readiness", description: "A pre-generation review confirming required work items, amounts, status and report type." },
      { title: "Request for Quote", eyebrow: "Contractor output", kind: "tender-automation-invitation", description: "A masked professional report layout with synthetic work descriptions and quote fields." },
      { title: "Approved Scope List", eyebrow: "Client output", kind: "tender-automation-approved", description: "A separate approved-work presentation including controlled calculations and clear totals." },
      { title: "Generation Pipeline", eyebrow: "Automated delivery", kind: "tender-automation-pipeline", description: "Validation, HTML assembly, PDF generation, storage and distribution shown as an auditable flow." }
    ]
  }
];

export { projectShowcases };
