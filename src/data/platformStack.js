import powerApps from "../assets/logos/power-apps.svg";
import powerAutomate from "../assets/logos/power-automate.svg";
import dataverse from "../assets/logos/dataverse.svg";
import powerPages from "../assets/logos/power-pages.svg";
import aiBuilder from "../assets/logos/ai-builder.svg";
import copilotStudio from "../assets/logos/copilot-studio.svg";

/* ============================================================
   POWER PLATFORM STACK
   Feeds the orbiting diagram in PlatformOrbit.jsx. `icon` is
   Microsoft's own official product icon (see assets/logos/NOTICE.md
   for the source and usage terms) — used at its natural size and
   colors, never cropped, recolored, or reshaped.
   ============================================================ */
const platformStack = [
  { name: "Power Apps", icon: powerApps, ring: "inner" },
  { name: "Power Automate", icon: powerAutomate, ring: "inner" },
  { name: "AI Builder", icon: aiBuilder, ring: "inner" },
  { name: "Dataverse", icon: dataverse, ring: "outer" },
  { name: "Copilot Studio", icon: copilotStudio, ring: "outer" },
  { name: "Power Pages", icon: powerPages, ring: "outer" }
];

export { platformStack };
