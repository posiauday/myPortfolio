import { POWER_APPS_SHOWCASE } from "../config.js";

/* ============================================================
   Live Power Apps embed slot.
   Renders an honest "not connected" state until a published
   Canvas app id and tenant id are configured (see .env.example);
   once they are, it embeds the real runtime instead.
   ============================================================ */
function PowerAppsEmbed({ componentId, title }) {
  if (!POWER_APPS_SHOWCASE.enabled || !POWER_APPS_SHOWCASE.appId) {
    return (
      <div className="grid min-h-[430px] place-items-center rounded-[26px] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/20 dark:bg-[#101816]">
        <div className="max-w-md">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 font-black text-violet-800">PA</span>
          <h3 className="mt-5 text-2xl font-black">Live Power Apps runtime not connected</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Publish a dedicated Canvas showcase app, share it with authorized users, then configure its App ID and Tenant ID. The static preview above remains available without sign-in.</p>
          <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-left text-xs dark:bg-white/10">
            <b>Launch parameter</b>
            <code className="mt-2 block break-all text-violet-700 dark:text-violet-300">component={componentId}</code>
          </div>
        </div>
      </div>
    );
  }
  const params = new URLSearchParams({ source: "iframe", tenantid: POWER_APPS_SHOWCASE.tenantId, component: componentId });
  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#101816]">
      <iframe title={`${title} live Power Apps preview`} src={`https://apps.powerapps.com/play/${POWER_APPS_SHOWCASE.appId}?${params.toString()}`} className="h-[680px] w-full border-0" allow="geolocation; microphone; camera; fullscreen" />
    </div>
  );
}

export default PowerAppsEmbed;
