/* Live Power Apps embed slot.
   Blank by default: the Detail page then renders its own honest
   "not connected" state. Set both values in .env (see .env.example)
   and the component Detail page starts embedding the published
   Canvas showcase app instead. */
const appId = import.meta.env.VITE_POWERAPPS_APP_ID || "";
const tenantId = import.meta.env.VITE_POWERAPPS_TENANT_ID || "";

export const POWER_APPS_SHOWCASE = {
  appId,
  tenantId,
  enabled: Boolean(appId && tenantId)
};

export const CONTACT = {
  name: "Uday Posia",
  initials: "UP",
  tagline: "Architect · Automate · Govern",
  email: "udayposia@gmail.com",
  linkedin: "https://linkedin.com/in/udayposia"
};
