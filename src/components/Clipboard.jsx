import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Clipboard as ClipboardIcon, Copy, Lock, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient.js";
import useCopyFeedback from "../hooks/useCopyFeedback.js";

const SETTINGS_ID = "main";
const MAX_VISIBLE = 30;
const PRUNE_AFTER = 40;
const LOCK_STORAGE_KEY = "clipboard_unlocked";

/* Relative time, same shape as the rest of this site's own "Xm ago"
   labels (see Experience section) rather than a raw timestamp. */
function formatTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 45000) return "Just now";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function safeGet(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* private mode, storage full, etc. */ }
}
function safeRemove(key) {
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

/* A cross-device clipboard: paste something on one device, it shows up
   live on every other device unlocked with the same PIN. Backed by a
   dedicated Supabase project (src/lib/supabaseClient.js) — GitHub Pages
   alone has nowhere to keep shared state, so this is the one page on
   the whole site with a real backend behind it. The PIN is a soft,
   app-level gate (disclosed on the setup screen), not encryption: Row
   Level Security on both tables allows the public/anon key to read and
   write, the same tradeoff a personal pastebin makes everywhere else —
   real protection here is keeping the page's own URL from spreading,
   not the PIN itself. */
function Clipboard({ dark, onBack }) {
  const [phase, setPhase] = useState("loading"); // loading | setup | locked | unlocked
  const [pin, setPin] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [syncState, setSyncState] = useState("connecting"); // connecting | synced | offline
  const [copied, copy] = useCopyFeedback();
  const pinInputRef = useRef(null);
  const textareaRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("clipboard_settings")
      .select("pin")
      .eq("id", SETTINGS_ID)
      .maybeSingle()
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setSyncState("offline");
          setError("Couldn't reach the clipboard's storage. Reload to try again.");
          return;
        }
        if (data && data.pin) {
          setPin(data.pin);
          if (safeGet(LOCK_STORAGE_KEY) === "1") {
            setPhase("unlocked");
          } else {
            setPhase("locked");
          }
        } else {
          setPhase("setup");
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (phase === "locked") setTimeout(() => pinInputRef.current?.focus(), 50);
    if (phase === "setup") setTimeout(() => pinInputRef.current?.focus(), 50);
    if (phase === "unlocked") setTimeout(() => textareaRef.current?.focus(), 50);
  }, [phase]);

  function fetchItems() {
    return supabase
      .from("clipboard_items")
      .select("id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_VISIBLE)
      .then(({ data, error: fetchError }) => {
        if (fetchError) { setSyncState("offline"); return; }
        setItems(data || []);
        setSyncState("synced");
      });
  }

  useEffect(() => {
    if (phase !== "unlocked") return undefined;
    fetchItems();
    const channel = supabase
      .channel("clipboard_items_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "clipboard_items" }, () => fetchItems())
      .subscribe(status => {
        if (status === "SUBSCRIBED") setSyncState("synced");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setSyncState("offline");
      });
    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, [phase]);

  function pruneIfNeeded() {
    supabase
      .from("clipboard_items")
      .select("id")
      .order("created_at", { ascending: false })
      .range(PRUNE_AFTER, PRUNE_AFTER + 50)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        supabase.from("clipboard_items").delete().in("id", data.map(row => row.id)).then(() => {});
      });
  }

  function handleSetupSubmit(e) {
    e.preventDefault();
    const value = pinInput.trim();
    if (value.length < 4) {
      setError("Use at least 4 digits.");
      return;
    }
    setError("");
    supabase
      .from("clipboard_settings")
      .insert({ id: SETTINGS_ID, pin: value })
      .then(({ error: insertError }) => {
        if (insertError) {
          // Most likely another device just finished setup first —
          // pick up the PIN it created instead of failing here.
          supabase.from("clipboard_settings").select("pin").eq("id", SETTINGS_ID).maybeSingle().then(({ data }) => {
            if (data && data.pin) {
              setPin(data.pin);
              setPhase("locked");
              setError("Someone just set this up on another device — enter that PIN instead.");
            } else {
              setError("Couldn't save your PIN. Try again.");
            }
          });
          return;
        }
        setPin(value);
        safeSet(LOCK_STORAGE_KEY, "1");
        setPhase("unlocked");
      });
  }

  function handleUnlockSubmit(e) {
    e.preventDefault();
    if (pinInput.trim() === pin) {
      safeSet(LOCK_STORAGE_KEY, "1");
      setPhase("unlocked");
      setPinInput("");
      setError("");
    } else {
      setError("That PIN doesn't match.");
      setPinInput("");
      pinInputRef.current?.focus();
    }
  }

  function handleLock() {
    safeRemove(LOCK_STORAGE_KEY);
    setPhase("locked");
    setPinInput("");
  }

  function handleSend() {
    const text = draft;
    if (!text.trim()) return;
    setSending(true);
    supabase
      .from("clipboard_items")
      .insert({ content: text })
      .then(({ error: insertError }) => {
        setSending(false);
        if (insertError) return;
        setDraft("");
        textareaRef.current?.focus();
        pruneIfNeeded();
      });
  }

  function handleDelete(id) {
    setItems(current => current.filter(row => row.id !== id));
    supabase.from("clipboard_items").delete().eq("id", id).then(({ error: deleteError }) => {
      if (deleteError) fetchItems();
    });
  }

  return (
    <main className={dark ? "dark min-h-screen bg-[#0B1110] text-white" : "min-h-screen bg-[#FBFDFB] text-[#17201B]"}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#101816]/95">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <button onClick={onBack} className="flex items-center gap-2 font-bold"><ArrowLeft size={18} /> Home</button>
          <div className="flex items-center gap-2">
            <b>Clipboard</b>
            {phase === "unlocked" && (
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${syncState === "synced" ? "bg-[#168326]" : "bg-slate-400"}`} aria-hidden="true" />
                {syncState === "synced" ? "Synced" : syncState === "offline" ? "Offline" : "Connecting"}
              </span>
            )}
          </div>
          {phase === "unlocked" ? (
            <button onClick={handleLock} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-[#17201B] dark:border-white/10 dark:text-slate-400 dark:hover:text-white">
              <Lock size={13} /> Lock
            </button>
          ) : <span className="w-[68px]" />}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-10">
        {phase === "loading" && (
          <p className="mt-20 text-center text-sm font-bold text-slate-500 dark:text-slate-400">Opening clipboard&hellip;</p>
        )}

        {phase === "setup" && (
          <form onSubmit={handleSetupSubmit} className="mx-auto mt-10 flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <span className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-green-50 text-[#168326] dark:bg-white/10 dark:text-[#4ADE80]"><ClipboardIcon size={22} /></span>
            <h1 className="text-xl font-black">Set up your clipboard</h1>
            <p className="mt-1 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
              This page works from any device. Choose a 4&ndash;6 digit PIN now so only you can open what you send here.
            </p>
            <label htmlFor="clipboard-setup-pin" className="sr-only">Choose a PIN</label>
            <input
              ref={pinInputRef}
              id="clipboard-setup-pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="off"
              value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="&middot;&middot;&middot;&middot;"
              className="mt-4 w-full max-w-[180px] rounded-xl border border-slate-200 bg-[#FBFDFB] px-4 py-3 text-center font-mono text-xl tracking-[0.5em] outline-none focus:border-[#168326] dark:border-white/10 dark:bg-[#0B1110]"
            />
            {error && <p className="mt-2 text-xs font-bold text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" className="mt-5 w-full max-w-[180px] rounded-full bg-[#168326] py-3 text-sm font-bold text-white hover:bg-[#126b1f]">Create PIN</button>
            <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Keep this page&rsquo;s link private &mdash; anyone who has it and knows the PIN can read and clear what&rsquo;s here.</p>
          </form>
        )}

        {phase === "locked" && (
          <form onSubmit={handleUnlockSubmit} className="mx-auto mt-10 flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <span className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-green-50 text-[#168326] dark:bg-white/10 dark:text-[#4ADE80]"><Lock size={20} /></span>
            <h1 className="text-xl font-black">Clipboard is locked</h1>
            <p className="mt-1 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">Enter your PIN to view and share what&rsquo;s here on this device.</p>
            <label htmlFor="clipboard-unlock-pin" className="sr-only">Enter your PIN</label>
            <input
              ref={pinInputRef}
              id="clipboard-unlock-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="off"
              value={pinInput}
              onChange={e => setPinInput(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="&middot;&middot;&middot;&middot;"
              className="mt-4 w-full max-w-[180px] rounded-xl border border-slate-200 bg-[#FBFDFB] px-4 py-3 text-center font-mono text-xl tracking-[0.5em] outline-none focus:border-[#168326] dark:border-white/10 dark:bg-[#0B1110]"
            />
            {error && <p className="mt-2 text-xs font-bold text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" className="mt-5 w-full max-w-[180px] rounded-full bg-[#168326] py-3 text-sm font-bold text-white hover:bg-[#126b1f]">Unlock</button>
          </form>
        )}

        {phase === "unlocked" && (
          <div className="flex flex-col gap-8">
            <form
              onSubmit={e => { e.preventDefault(); handleSend(); }}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <label htmlFor="clipboard-draft" className="sr-only">Paste or type something to share</label>
              <textarea
                ref={textareaRef}
                id="clipboard-draft"
                rows={3}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleSend(); } }}
                placeholder="Paste or type something to send to your other devices&hellip;"
                className="w-full resize-y bg-transparent text-sm leading-6 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/10">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-white/10">Ctrl/&#8984;</kbd>+<kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-white/10">Enter</kbd> to send
                </span>
                <button type="submit" disabled={sending || !draft.trim()} className="rounded-full bg-[#168326] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#126b1f] disabled:cursor-not-allowed disabled:opacity-50">
                  Send to devices
                </button>
              </div>
            </form>

            <div>
              <p className="px-1 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">On every device you unlock this on</p>
              {items.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <ClipboardIcon size={24} className="mx-auto mb-3 opacity-60" />
                  Nothing here yet. Send something above &mdash; it shows up on every device you unlock this on.
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {items.map(row => (
                    <article key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-white/10">
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{formatTime(row.created_at)}</span>
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => copy(row.content, row.id)} className="copy-btn light">
                            {copied === row.id ? <Check size={13} /> : <Copy size={13} />} {copied === row.id ? "Copied" : "Copy"}
                          </button>
                          <button type="button" onClick={() => handleDelete(row.id)} aria-label="Delete" className="copy-btn light">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{row.content}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Clipboard;
