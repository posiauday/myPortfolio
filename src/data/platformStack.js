/* ============================================================
   POWER PLATFORM STACK
   Feeds the orbiting diagram in PlatformOrbit.jsx. Each badge is a
   stylized color + initials, not an official product logo — the
   same convention the Power Apps placeholder in PowerAppsEmbed.jsx
   already uses ("PA" on a violet badge), extended across the rest
   of the platform rather than reproducing real brand artwork.
   ============================================================ */
const platformStack = [
  { name: "Power Apps", abbr: "PA", color: "#7C3AED", ring: "inner" },
  { name: "Power Automate", abbr: "FL", color: "#0066FF", ring: "inner" },
  { name: "Power BI", abbr: "BI", color: "#F2C811", textDark: true, ring: "inner" },
  { name: "Dataverse", abbr: "DV", color: "#0F6CBD", ring: "outer" },
  { name: "Copilot Studio", abbr: "CS", color: "#5B5BD6", ring: "outer" },
  { name: "Power Pages", abbr: "PP", color: "#1B84E7", ring: "outer" },
  { name: "SharePoint Online", abbr: "SP", color: "#036C70", ring: "outer" }
];

export { platformStack };
