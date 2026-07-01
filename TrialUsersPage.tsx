import React, { useEffect, useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { trialAuth, trialDb, trialFunctions } from "../lib/firebase";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";

type TrialStatus = "active" | "expired" | "ended";

type TrialTenant = {
  trialId: string;
  phone: string;
  createdAtMs: number;
  expiresAtMs: number;
  status: TrialStatus;
  databaseId: string;
  fullName?: string | null;
  studioName?: string | null;
  location?: string | null;
  city?: string | null;
};

type WaitlistEntry = {
  id: string;
  phone: string;
  createdAtMs: number;
  notified?: boolean;
};

export default function TrialUsersPage() {
  const [trials, setTrials] = useState<TrialTenant[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [poolStats, setPoolStats] = useState<{ free: number; allocated: number; total: number } | null>(null);
  const [trialAuthed, setTrialAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(trialAuth as any, (u) => {
      setTrialAuthed(!!u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!trialAuthed) return;
    setErrMsg(null);
    const q1 = query(collection(trialDb as any, "trial_tenants"), orderBy("createdAtMs", "desc"));
    const unsub1 = onSnapshot(q1, (snap) => {
      const items: TrialTenant[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        items.push({
          trialId: d.id,
          phone: data.phone,
          createdAtMs: data.createdAtMs,
          expiresAtMs: data.expiresAtMs,
          status: data.status,
          databaseId: data.databaseId,
          fullName: data.fullName ?? null,
          studioName: data.studioName ?? null,
          location: data.location ?? null,
          city: data.city ?? null,
        });
      });
      setTrials(items);
    }, (e) => setErrMsg(e?.message || "Missing or insufficient permissions."));

    const q2 = query(collection(trialDb as any, "waitlist"), orderBy("createdAtMs", "asc"));
    const unsub2 = onSnapshot(q2, (snap) => {
      const items: WaitlistEntry[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        items.push({ id: d.id, phone: data.phone, createdAtMs: data.createdAtMs, notified: data.notified });
      });
      setWaitlist(items);
    }, (e) => setErrMsg(e?.message || "Missing or insufficient permissions."));

    const q3 = query(collection(trialDb as any, "trial_db_pool"), orderBy("databaseId", "asc"));
    const unsub3 = onSnapshot(q3, (snap) => {
      let free = 0;
      let allocated = 0;
      snap.forEach((d) => {
        const data = d.data() as any;
        if (data.status === "free") free++;
        if (data.status === "allocated") allocated++;
      });
      setPoolStats({ free, allocated, total: snap.size });
    }, (e) => setErrMsg(e?.message || "Missing or insufficient permissions."));

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [trialAuthed]);

  const stats = useMemo(() => {
    const active = trials.filter((t) => t.status === "active").length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const daily = trials.filter((t) => t.createdAtMs >= todayMs).length;

    return { active, daily };
  }, [trials]);

  const dbUsageLabel = useMemo(() => {
    if (!poolStats) return `${stats.active} / 200`;
    return `${poolStats.allocated} used, ${poolStats.free} free`;
  }, [poolStats, stats.active]);

  const call = async (name: string, data: any) => {
    if (!trialAuthed) {
      throw new Error("Login required");
    }
    setBusyId(data?.trialId || data?.id || name);
    setErrMsg(null);
    setInfoMsg(null);
    try {
      const fn = httpsCallable(trialFunctions as any, name);
      const res = await fn(data);
      return (res as any)?.data;
    } catch (e: any) {
      setErrMsg(e?.message || "Request failed");
      throw e;
    } finally {
      setBusyId(null);
    }
  };

  const signInTrial = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(trialAuth as any, provider);
  };

  if (!authReady) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!trialAuthed) {
    return (
      <div className="p-6">
        <div className="max-w-xl space-y-3">
          <h1 className="text-2xl font-bold">Trial Users</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to the trial Firebase project to manage the trial pool, users, and waitlist.
          </p>
          <button
            type="button"
            onClick={signInTrial}
            className="px-4 py-2 rounded-xl bg-black text-white font-semibold"
          >
            Sign in (Trial Project)
          </button>
          <p className="text-xs text-muted-foreground">
            Use the same super admin Google account that is allowlisted in trial functions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {errMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {errMsg}
        </div>
      )}
      {infoMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 text-sm">
          {infoMsg}
        </div>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Trial Users</h1>
          <p className="text-sm text-muted-foreground">Manage trial tenants and waitlist.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              const data = await call("initTrialDbPoolAdmin", {});
              const created = (data as any)?.created;
              if (typeof created === "number") {
                setInfoMsg(created > 0 ? `DB pool repaired: created ${created} slots.` : "DB pool already initialized (no missing slots).");
              } else {
                setInfoMsg("DB pool init/repair completed.");
              }
            }}
            disabled={!!busyId}
            className="px-4 py-2 rounded-xl border border-border bg-card font-semibold"
          >
            Init / Repair DB Pool
          </button>
          <button
            type="button"
            onClick={async () => {
              const data = await call("cleanupExpiredTrialsAdmin", {});
              const cleaned = (data as any)?.cleaned;
              if (typeof cleaned === "number") {
                setInfoMsg(`Cleanup completed: cleaned ${cleaned} expired trials.`);
              } else {
                setInfoMsg("Cleanup completed.");
              }
            }}
            disabled={!!busyId}
            className="px-4 py-2 rounded-xl bg-black text-white font-semibold"
          >
            Cleanup expired trials
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-2xl p-4 bg-card">
          <div className="text-xs text-muted-foreground">Active trials</div>
          <div className="text-2xl font-bold mt-1">{stats.active}</div>
        </div>
        <div className="border border-border rounded-2xl p-4 bg-card">
          <div className="text-xs text-muted-foreground">Daily signups</div>
          <div className="text-2xl font-bold mt-1">{stats.daily}</div>
        </div>
        <div className="border border-border rounded-2xl p-4 bg-card">
          <div className="text-xs text-muted-foreground">DB usage</div>
          <div className="text-2xl font-bold mt-1">{dbUsageLabel}</div>
          {poolStats && (
            <div className="mt-1 text-xs text-muted-foreground">
              Pool: {poolStats.total} (allocated: {poolStats.allocated}, free: {poolStats.free})
            </div>
          )}
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Trials</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="p-3">trialId</th>
                <th className="p-3">phone</th>
                <th className="p-3">name</th>
                <th className="p-3">studio</th>
                <th className="p-3">location</th>
                <th className="p-3">createdAt</th>
                <th className="p-3">expiresAt</th>
                <th className="p-3">status</th>
                <th className="p-3">databaseId</th>
                <th className="p-3">actions</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((t) => (
                <tr key={t.trialId} className="border-t border-border">
                  <td className="p-3 font-mono text-xs">{t.trialId}</td>
                  <td className="p-3">{t.phone}</td>
                  <td className="p-3">{t.fullName || "-"}</td>
                  <td className="p-3">{t.studioName || "-"}</td>
                  <td className="p-3">{[t.location, t.city].filter(Boolean).join(", ") || "-"}</td>
                  <td className="p-3">{new Date(t.createdAtMs).toLocaleString()}</td>
                  <td className="p-3">{new Date(t.expiresAtMs).toLocaleString()}</td>
                  <td className="p-3">{t.status}</td>
                  <td className="p-3 font-mono text-xs">{t.databaseId}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 rounded-lg border border-border"
                        disabled={busyId === t.trialId}
                        onClick={() => call("extendTrial", { trialId: t.trialId, days: 7 })}
                      >
                        Extend +7d
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg border border-border"
                        disabled={busyId === t.trialId}
                        onClick={() => call("endTrial", { trialId: t.trialId })}
                      >
                        End
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg border border-border"
                        disabled={busyId === t.trialId}
                        onClick={() => call("resetTrial", { trialId: t.trialId })}
                      >
                        Reset
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg border border-border text-red-600"
                        disabled={busyId === t.trialId}
                        onClick={() => call("deleteTrial", { trialId: t.trialId })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {trials.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={10}>
                    No trials.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Waitlist</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="p-3">phone</th>
                <th className="p-3">createdAt</th>
                <th className="p-3">notified</th>
                <th className="p-3">actions</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map((w) => (
                <tr key={w.id} className="border-t border-border">
                  <td className="p-3">{w.phone}</td>
                  <td className="p-3">{new Date(w.createdAtMs).toLocaleString()}</td>
                  <td className="p-3">{String(!!w.notified)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 rounded-lg border border-border"
                        disabled={busyId === w.id}
                        onClick={() => call("assignWaitlist", { waitlistId: w.id })}
                      >
                        Assign
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg border border-border text-red-600"
                        disabled={busyId === w.id}
                        onClick={() => call("removeWaitlist", { waitlistId: w.id })}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {waitlist.length === 0 && (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={4}>
                    Waitlist empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
