import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  EmailAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { useTenant } from "@/lib/TenantContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { masterDb } from "@/master/lib/firebase"; 
import { trialApp, trialAuth, trialFunctions } from "@/lib/trialFirebase";
import { CheckCircle2 } from "lucide-react";

// Import Master Theme Engine Utilities
import {
  CACHE_KEYS,
  getCachedContent,
  setCachedContent,
  DEFAULT_CONTENT,
  DynamicGlobalStyles,
  getTextureStyle,
  isDarkColor
} from "@/master/pages/features/sharedUtils";

type Step = "enter_phone" | "enter_otp" | "credentials" | "done" | "waitlist" | "login";

// Apple-like smooth animation variants
const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const formStepVariant = {
  initial: { opacity: 0, x: 15, filter: "blur(8px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -15, filter: "blur(8px)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function TrialLanding() {
  const { auth, functions, switchDatabase, db } = useTenant();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("enter_phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [pendingTrialId, setPendingTrialId] = useState<string | null>(null);
  const [pendingDatabaseId, setPendingDatabaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 🎨 THEME STATE (From MasterHome)
  const [content, setContent] = useState(() => getCachedContent(CACHE_KEYS.LANDING, DEFAULT_CONTENT));

  const phone = useMemo(() => {
    const cc = String(countryCode || "").trim();
    const pn = String(phoneNumber || "").trim();
    return `${cc}${pn}`;
  }, [countryCode, phoneNumber]);

  const confirmationRef = useRef<any>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  const isDemoHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "demo.gallero.in" ||
      window.location.hostname === "demo.localhost" ||
      window.location.hostname === "localhost");

  const authToUse = isDemoHost ? trialAuth : auth;
  const functionsToUse = isDemoHost ? trialFunctions : functions;

  const hasEmailPasswordLinked = (u: any) => {
    const providers = Array.isArray(u?.providerData) ? u.providerData : [];
    return Boolean(
      u?.email ||
        providers.some((p: any) => p?.providerId === "password" || p?.providerId === "email")
    );
  };

  const existingPhone = (authToUse as any)?.currentUser?.phoneNumber as string | undefined;

  useEffect(() => {
    // Prevent stale state from previous attempts.
    setPendingTrialId(null);
    setPendingDatabaseId(null);
  }, [existingPhone]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    try {
      // eslint-disable-next-line no-console
      console.log("[TrialLanding] host=", window.location.hostname);
      // eslint-disable-next-line no-console
      console.log("[TrialLanding] trialApp projectId=", (trialApp as any)?.options?.projectId);
      // eslint-disable-next-line no-console
      console.log("[TrialLanding] trialApp authDomain=", (trialApp as any)?.options?.authDomain);
      // eslint-disable-next-line no-console
      console.log("[TrialLanding] trialApp apiKey=", (trialApp as any)?.options?.apiKey);
      // eslint-disable-next-line no-console
      console.log("[TrialLanding] authToUse projectId=", (authToUse as any)?.app?.options?.projectId);
    } catch {
      // ignore
    }
  }, [authToUse]);

  useEffect(() => {
    if (!isDemoHost) {
      window.location.href = "https://gallero.in";
    }
  }, [isDemoHost]);

  // 📡 FETCH DYNAMIC THEME (Just like MasterHome)
  useEffect(() => {
    const unsub = onSnapshot(doc(masterDb, "content", "landingPage"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (!data.themeConfig) data.themeConfig = DEFAULT_CONTENT.themeConfig;
        
        const mergedData = { ...DEFAULT_CONTENT, ...data };
        setCachedContent(CACHE_KEYS.LANDING, mergedData);
        setContent(mergedData);
      }
    });
    return () => unsub();
  }, []);

  // Theme Convenience Vars
  const theme = content.themeConfig;
  const isPrimaryDark = isDarkColor(theme.colors.primary);
  const isBgDark = isDarkColor(theme.colors.bg);

  // Dynamic Button Styles (Mirroring MasterHome)
  const getBtnStyle = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
    const base = { borderRadius: theme.radius, fontFamily: theme.fonts.body };
    if (variant === 'primary') {
        if (theme.btnStyle === 'outline') return { ...base, border: `2px solid ${theme.colors.primary}`, color: theme.colors.primary, background: 'transparent' };
        if (theme.btnStyle === 'soft') return { ...base, background: `${theme.colors.primary}20`, color: theme.colors.primary };
        if (theme.btnStyle === 'brutalist') return { ...base, background: theme.colors.primary, color: isPrimaryDark ? '#fff' : '#000', border: `2px solid ${theme.colors.text}`, boxShadow: `4px 4px 0px ${theme.colors.text}` };
        return { ...base, background: theme.colors.primary, color: isPrimaryDark ? '#fff' : '#000' };
    }
    if (variant === 'ghost') {
        return { ...base, background: 'transparent', color: theme.colors.text, opacity: 0.8 };
    }
    return { ...base, background: 'transparent', border: `1px solid ${theme.colors.text}40`, color: theme.colors.text };
  };

  const writeAdminRoleToDb = async (targetDb: any, uid: string, emailValue: string) => {
    const ref = doc(targetDb, "user_roles", uid);
    // Server already creates the role doc. We only attach extra fields.
    // Using update avoids accidentally doing a create (which would be forbidden for admin role).
    await updateDoc(ref, {
      email: emailValue || null,
      mustChangePassword: false,
      username: "",
      updated_at: serverTimestamp(),
    });
  };

  const completeCredentials = async () => {
    setMsg(null);
    if (!pendingTrialId || !pendingDatabaseId) {
      setMsg("Trial setup is incomplete. Please try again.");
      return;
    }
    if (!email || !password) {
      setMsg("Please enter email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      const currentUser = (authToUse as any)?.currentUser;
      if (!currentUser) throw new Error("Login session missing. Please try again.");

      const cred = EmailAuthProvider.credential(String(email).trim(), password);
      try {
        await linkWithCredential(currentUser, cred);
      } catch (linkErr: any) {
        // If the user already linked Email/Password previously, allow continuing.
        if (linkErr?.code !== "auth/provider-already-linked") {
          throw linkErr;
        }
      }

      const dbToWrite = isDemoHost
        ? getFirestore(trialApp, String(pendingDatabaseId))
        : db;

      await writeAdminRoleToDb(dbToWrite, currentUser.uid, String(email).trim());

      window.location.replace(`/trial/${pendingTrialId}/admin`);
    } catch (e: any) {
      console.error(e);
      if (e?.code === "auth/email-already-in-use" || e?.code === "auth/credential-already-in-use") {
        setMsg("This email is already in use. Please use a different email.");
      } else if (e?.code === "firestore/not-found") {
        setMsg("Trial setup is still finishing. Please wait 5 seconds and try again.");
      } else if (e?.code === "auth/provider-already-linked") {
        window.location.replace(`/trial/${pendingTrialId}/admin`);
      } else {
        setMsg(e?.message || "Failed to set email/password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const continueWithExistingLogin = async () => {
    setMsg(null);
    if (!acceptedTerms) {
      setMsg("Please accept the Terms & Conditions to continue.");
      return;
    }

    setLoading(true);
    try {
      const u = (authToUse as any)?.currentUser;
      if (!u) throw new Error("Not logged in");

      const createTrial = httpsCallable(functionsToUse as any, "createTrial");
      const res = await createTrial({
        phone: u.phoneNumber || phone,
        fullName: fullName || null,
        studioName: studioName || null,
        location: location || null,
        city: city || null,
      });
      const data = (res.data || {}) as any;

      if (data.status === "full") {
        setStep("waitlist");
        setLoading(false);
        return;
      }

      if (data.status === "cooldown") {
        const existingTrialId = data.trialId as string | null | undefined;
        if (existingTrialId) {
          try {
            const getTrial = httpsCallable(functionsToUse as any, "getTrial");
            const tr = await getTrial({ trialId: existingTrialId });
            const tData = (tr.data || {}) as any;
            const expiresAtMs = Number(tData.expiresAtMs || 0);
            if (expiresAtMs && Date.now() < expiresAtMs) {
              window.location.replace(`/trial/${existingTrialId}/admin`);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }

        setMsg("You have already used a trial on this number. Please upgrade to continue enjoying Gallero.");
        setStep("done");
        setLoading(false);
        return;
      }

      if (!data.trialId) throw new Error("We couldn't set up your trial. Please try again.");

      const tId = String(data.trialId);
      const dId = String(data.databaseId || "");
      if (hasEmailPasswordLinked(u)) {
        window.location.replace(`/trial/${tId}/admin`);
        return;
      }

      setPendingTrialId(tId);
      setPendingDatabaseId(dId);
      setStep("credentials");
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Failed to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async () => {
    setMsg(null);
    if (!loginEmail || !loginPassword) {
      setMsg("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(authToUse, loginEmail, loginPassword);
      const u = cred.user;

      const getTrialFn = httpsCallable(functionsToUse as any, "getTrial");
      // We don't know the trialId yet; server can find it via phone on user's claims
      // So we call createTrial which returns cooldown+trialId for existing trial
      const createTrial = httpsCallable(functionsToUse as any, "createTrial");
      const res = await createTrial({ phone: u.phoneNumber || "" });
      const data = (res.data || {}) as any;

      if (data.status === "cooldown" && data.trialId) {
        window.location.replace(`/trial/${data.trialId}/admin`);
        return;
      }
      if (data.trialId) {
        window.location.replace(`/trial/${data.trialId}/admin`);
        return;
      }

      setMsg("No active trial found for this account. Please sign up with your phone number.");
    } catch (e: any) {
      console.error(e);
      if (e?.code === "auth/invalid-credential" || e?.code === "auth/wrong-password" || e?.code === "auth/user-not-found") {
        setMsg("Incorrect email or password. Please try again.");
      } else {
        setMsg(e?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = (authToUse as any)?.currentUser;
    if (!u?.phoneNumber) return;
    const raw = String(u.phoneNumber);
    if (raw.startsWith("+")) {
      // best-effort fill; user can still edit
      setCountryCode(raw.slice(0, 3));
      setPhoneNumber(raw.slice(3));
    }
  }, [authToUse]);

  const ensureRecaptcha = () => {
    if (recaptchaRef.current) return recaptchaRef.current;

    const verifier = new RecaptchaVerifier(
      authToUse,
      "trial-recaptcha",
      {
        size: "invisible",
      }
    );

    recaptchaRef.current = verifier;
    return verifier;
  };

  const sendOtp = async () => {
    setMsg(null);
    if (!acceptedTerms) {
      setMsg("Please accept the Terms & Conditions to continue.");
      return;
    }
    setLoading(true);
    try {
      const verifier = ensureRecaptcha();
      const confirmation = await signInWithPhoneNumber(authToUse, phone, verifier);
      confirmationRef.current = confirmation;
      setStep("enter_otp");
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setMsg(null);
    if (!acceptedTerms) {
      setMsg("Please accept the Terms & Conditions to continue.");
      return;
    }
    setLoading(true);
    try {
      const confirmation = confirmationRef.current;
      if (!confirmation) throw new Error("Your session expired. Please request a new OTP.");

      const cred = await confirmation.confirm(otp);
      const u = cred.user;

      const createTrial = httpsCallable(functionsToUse as any, "createTrial");
      const res = await createTrial({
        phone,
        fullName: fullName || null,
        studioName: studioName || null,
        location: location || null,
        city: city || null,
      });
      const data = (res.data || {}) as any;

      if (data.status === "full") {
        setStep("waitlist");
        setLoading(false);
        return;
      }

      if (data.status === "cooldown") {
        const existingTrialId = data.trialId as string | null | undefined;
        if (existingTrialId) {
          try {
            const getTrial = httpsCallable(functionsToUse as any, "getTrial");
            const tr = await getTrial({ trialId: existingTrialId });
            const tData = (tr.data || {}) as any;
            const expiresAtMs = Number(tData.expiresAtMs || 0);
            if (expiresAtMs && Date.now() < expiresAtMs) {
              window.location.replace(`/trial/${existingTrialId}/admin`);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }

        setMsg("You have already used a trial on this number. Please upgrade to continue enjoying Gallero.");
        setStep("done");
        setLoading(false);
        return;
      }

      if (!data.trialId) throw new Error("We couldn't set up your trial. Please try again.");

      const tId = String(data.trialId);
      const dId = String(data.databaseId || "");
      if (hasEmailPasswordLinked(u)) {
        window.location.replace(`/trial/${tId}/admin`);
        return;
      }

      setPendingTrialId(tId);
      setPendingDatabaseId(dId);
      setStep("credentials");
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "The OTP you entered is incorrect or expired.");
    } finally {
      setLoading(false);
    }
  };

  const joinWaitlist = async () => {
    setMsg(null);
    setLoading(true);
    try {
      const addToWaitlist = httpsCallable(functionsToUse as any, "addToWaitlist");
      await addToWaitlist({ phone });
      setMsg("You're on the list! We will notify you as soon as a slot opens.");
    } catch (e: any) {
      console.error(e);
      setMsg(e?.message || "Failed to join the waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen font-body overflow-hidden flex items-center transition-colors duration-500" 
      style={{ backgroundColor: theme.colors.bg, color: theme.colors.text }}
    >
      {/* Dynamic Global Styles & Texture from Master Theme */}
      <DynamicGlobalStyles theme={theme} />
      <div style={getTextureStyle(theme.texture, theme.colors)} />

      {/* Cinematic Ambient Background Glow tied to Primary Color */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] pointer-events-none opacity-40 blur-[120px]"
        style={{ 
          background: `radial-gradient(ellipse at top, ${theme.colors.primary}50, transparent 70%)` 
        }}
      />
      
      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* Left Content Section */}
          <motion.div 
            className="lg:col-span-7 space-y-12"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="space-y-8">
              {/* Logo & Brand Name */}
              <motion.div variants={fadeUpVariant} className="flex items-center gap-3.5 mb-8">
                <div 
                  className="h-12 w-12 rounded-full border flex items-center justify-center backdrop-blur-md shadow-2xl p-2"
                  style={{ backgroundColor: `${theme.colors.text}05`, borderColor: `${theme.colors.text}15` }}
                >
                  <img 
                    src="/logo.png" 
                    alt="Gallero Logo" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold tracking-tight font-hand">
                  Gallero
                </span>
              </motion.div>

              {/* Status Badge */}
              <motion.div 
                variants={fadeUpVariant} 
                className="inline-flex items-center gap-3 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-md shadow-sm"
                style={{ backgroundColor: `${theme.colors.text}05`, borderColor: `${theme.colors.text}15` }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.colors.primary }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme.colors.primary }}></span>
                </span>
                7-Day Free Trial • Limited Access
              </motion.div>

              <motion.h1 
                variants={fadeUpVariant} 
                className="text-4xl md:text-5xl lg:text-[4rem] font-bold leading-[1.05] tracking-tight font-hand"
              >
                Elevate your client gallery experience in minutes.
              </motion.h1>
              
              <motion.p 
                variants={fadeUpVariant} 
                className="text-lg md:text-xl max-w-xl leading-relaxed font-light opacity-70"
              >
                Experience Gallero firsthand. Upload your work, easily share links, and manage client selections in a fully featured test environment.
              </motion.p>
            </div>

            {/* Feature Grid */}
            <motion.div variants={fadeUpVariant} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div 
                className="group rounded-3xl border p-6 transition-all"
                style={{ backgroundColor: `${theme.colors.text}03`, borderColor: `${theme.colors.text}10` }}
              >
                <div className="text-base font-semibold mb-2">Beautiful Galleries</div>
                <div className="text-sm leading-relaxed font-light opacity-60">Share elegant links and manage client selections effortlessly.</div>
              </div>
              <div 
                className="group rounded-3xl border p-6 transition-all"
                style={{ backgroundColor: `${theme.colors.text}03`, borderColor: `${theme.colors.text}10` }}
              >
                <div className="text-base font-semibold mb-2">Private & Secure</div>
                <div className="text-sm leading-relaxed font-light opacity-60">Your trial workspace is completely private and safe.</div>
              </div>
              <div 
                className="group rounded-3xl border p-6 transition-all"
                style={{ backgroundColor: `${theme.colors.text}03`, borderColor: `${theme.colors.text}10` }}
              >
                <div className="text-base font-semibold mb-2">No Credit Card</div>
                <div className="text-sm leading-relaxed font-light opacity-60">Start instantly using just your mobile number.</div>
              </div>
              <div 
                className="group rounded-3xl border p-6 transition-all"
                style={{ backgroundColor: `${theme.colors.text}03`, borderColor: `${theme.colors.text}10` }}
              >
                <div className="text-base font-semibold mb-2">Sandbox Environment</div>
                <div className="text-sm leading-relaxed font-light opacity-60">Test safely. Trial data won't migrate, ensuring your paid workspace starts clean.</div>
              </div>
            </motion.div>

            {/* Trial Info Guidelines */}
            <motion.div 
              variants={fadeUpVariant} 
              className="rounded-3xl border p-7"
              style={{ backgroundColor: `${theme.colors.text}05`, borderColor: `${theme.colors.text}10` }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-5 opacity-80">Things to know</h3>
              <ul className="space-y-4 text-sm font-light opacity-80">
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                  <span className="leading-relaxed">Enjoy full access to your temporary testing workspace for <strong className="font-bold opacity-100">7 days</strong>.</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                  <span className="leading-relaxed">Trials are limited to one per phone number every <strong className="font-bold opacity-100">90 days</strong>.</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                  <span className="leading-relaxed"><strong className="font-bold opacity-100">Data does not migrate.</strong> Because galleries contain thousands of heavy files, your trial acts as a sandbox. When you upgrade, you start with a fresh, fast, clutter-free production workspace.</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                  <span className="leading-relaxed">To protect your privacy, all trial data is securely wiped after expiration.</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Right Form Section */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Soft background glow behind form */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full pointer-events-none blur-[100px]"
              style={{ backgroundColor: `${theme.colors.text}05` }}
            ></div>
            
            <div 
              className="relative rounded-[2.5rem] border p-8 md:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden"
              style={{ backgroundColor: `${theme.colors.bg}CC`, borderColor: `${theme.colors.text}15` }}
            >
              <div className="mb-10">
                <h2 className="text-2xl font-semibold tracking-tight">Start your free trial</h2>
                <p className="text-sm mt-2 font-light opacity-60">Create your sandbox workspace instantly.</p>
              </div>

              <AnimatePresence mode="popLayout">
                {msg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 28 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4.5 text-sm text-red-600 dark:text-red-300 leading-relaxed font-medium">
                      {msg}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Invisible Recaptcha container */}
              <div id="trial-recaptcha" />

              <div className="relative">
                <AnimatePresence mode="wait">
                  {/* Enter Phone Step */}
                  {step === "enter_phone" && (
                    <motion.div key="phone" variants={formStepVariant} initial="initial" animate="animate" exit="exit" className="space-y-6">
                      {existingPhone && (
                        <div
                          className="rounded-2xl border p-5 space-y-3"
                          style={{ backgroundColor: `${theme.colors.text}05`, borderColor: `${theme.colors.text}15` }}
                        >
                          <div className="text-sm font-medium opacity-80">You’re already signed in</div>
                          <div className="text-sm font-light opacity-70">{existingPhone}</div>
                          <div className="grid grid-cols-1 gap-3 pt-1">
                            <button
                              type="button"
                              onClick={continueWithExistingLogin}
                              disabled={loading}
                              className="w-full py-3.5 font-bold transition-all active:scale-[0.98] text-base disabled:opacity-70"
                              style={getBtnStyle('primary')}
                            >
                              {loading ? "Continuing..." : "Continue with this number"}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await (authToUse as any)?.signOut?.();
                                } catch {
                                  // ignore
                                }
                              }}
                              disabled={loading}
                              className="w-full py-3.5 font-medium transition-all active:scale-[0.98] text-sm disabled:opacity-50"
                              style={getBtnStyle('secondary')}
                            >
                              Use a different number
                            </button>
                          </div>
                        </div>
                      )}

                      {!existingPhone && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-2.5 opacity-80">Your Name</label>
                              <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Full name"
                                className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-base shadow-inner font-medium border"
                                style={{
                                  backgroundColor: `${theme.colors.text}05`,
                                  color: theme.colors.text,
                                  borderColor: `${theme.colors.text}20`,
                                }}
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2.5 opacity-80">Studio Name</label>
                              <input
                                value={studioName}
                                onChange={(e) => setStudioName(e.target.value)}
                                placeholder="Studio / Brand"
                                className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-base shadow-inner font-medium border"
                                style={{
                                  backgroundColor: `${theme.colors.text}05`,
                                  color: theme.colors.text,
                                  borderColor: `${theme.colors.text}20`,
                                }}
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-2.5 opacity-80">Location</label>
                              <input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Area / State"
                                className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-base shadow-inner font-medium border"
                                style={{
                                  backgroundColor: `${theme.colors.text}05`,
                                  color: theme.colors.text,
                                  borderColor: `${theme.colors.text}20`,
                                }}
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2.5 opacity-80">City</label>
                              <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="City"
                                className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-base shadow-inner font-medium border"
                                style={{
                                  backgroundColor: `${theme.colors.text}05`,
                                  color: theme.colors.text,
                                  borderColor: `${theme.colors.text}20`,
                                }}
                                disabled={loading}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2.5 opacity-80">Phone Number</label>
                        <div className="flex gap-3">
                          <input
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            placeholder="+91"
                            className="w-[88px] rounded-2xl px-4 py-4 focus:outline-none transition-all text-center text-lg shadow-inner font-medium border"
                            style={{ 
                              backgroundColor: `${theme.colors.text}05`, 
                              color: theme.colors.text, 
                              borderColor: `${theme.colors.text}20` 
                            }}
                            inputMode="tel"
                            disabled={loading}
                          />
                          <input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter your number"
                            className="flex-1 rounded-2xl px-5 py-4 focus:outline-none transition-all text-lg shadow-inner font-medium border"
                            style={{ 
                              backgroundColor: `${theme.colors.text}05`, 
                              color: theme.colors.text, 
                              borderColor: `${theme.colors.text}20` 
                            }}
                            inputMode="tel"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-4 p-2 cursor-pointer group rounded-xl transition-colors -mx-2" style={{ ':hover': { backgroundColor: `${theme.colors.text}05` } } as any}>
                        <div className="relative flex items-start justify-center mt-1">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="peer h-5 w-5 shrink-0 rounded-[6px] border focus:outline-none focus:ring-2 transition-all cursor-pointer appearance-none shadow-inner"
                            style={{ 
                              backgroundColor: `${theme.colors.text}05`, 
                              borderColor: `${theme.colors.text}30`,
                              accentColor: theme.colors.primary 
                            }}
                          />
                          {/* Custom Checkmark matching theme */}
                          <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 top-[3px]" style={{ color: isBgDark ? '#000' : '#fff' }} viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {/* Inner solid fill for checked state based on theme primary */}
                          <div className="absolute inset-0 rounded-[5px] pointer-events-none opacity-0 peer-checked:opacity-100 -z-10" style={{ backgroundColor: theme.colors.text }}></div>
                        </div>
                        <span className="text-sm leading-relaxed font-light opacity-70 group-hover:opacity-100 transition-opacity">
                          I agree to the{" "}
                          <a href="https://gallero.in/terms-and-conditions" target="_blank" rel="noreferrer" className="font-medium underline decoration-current/30 underline-offset-4 hover:decoration-current transition-all">
                            Terms & Conditions
                          </a>
                          {" "}and understand trial data acts as a test and will not migrate to a paid plan.
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={loading}
                        className="w-full py-4 font-bold transition-all active:scale-[0.98] text-lg disabled:opacity-70"
                        style={getBtnStyle('primary')}
                      >
                        {loading ? "Sending Code..." : "Continue"}
                      </button>
                      
                      <p className="text-center text-xs font-light pt-2 opacity-50">
                        You will receive an SMS to verify your number.
                      </p>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => { setMsg(null); setStep("login"); }}
                          className="text-sm font-medium underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity"
                          style={{ color: theme.colors.text }}
                        >
                          Already have a trial? Login with email
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Enter OTP Step */}
                  {step === "enter_otp" && (
                    <motion.div key="otp" variants={formStepVariant} initial="initial" animate="animate" exit="exit" className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2.5 opacity-80">Verification Code</label>
                        <input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all tracking-[0.5em] text-center text-xl shadow-inner font-medium border"
                          style={{ 
                            backgroundColor: `${theme.colors.text}05`, 
                            color: theme.colors.text, 
                            borderColor: `${theme.colors.text}20` 
                          }}
                          inputMode="numeric"
                          disabled={loading}
                        />
                      </div>

                      <div className="pt-4 space-y-4">
                        <button
                          type="button"
                          onClick={verifyOtp}
                          disabled={loading}
                          className="w-full py-4 font-bold transition-all active:scale-[0.98] text-lg disabled:opacity-70"
                          style={getBtnStyle('primary')}
                        >
                          {loading ? "Verifying..." : "Verify & Create Workspace"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setStep("enter_phone");
                            setOtp("");
                          }}
                          disabled={loading}
                          className="w-full py-4 font-medium transition-all active:scale-[0.98] text-sm disabled:opacity-50"
                          style={getBtnStyle('ghost')}
                        >
                          Use a different number
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Credentials Step */}
                  {step === "credentials" && (
                    <motion.div key="credentials" variants={formStepVariant} initial="initial" animate="animate" exit="exit" className="space-y-6">
                      <div className="space-y-2">
                        <div className="text-xl font-bold">Create your Admin Login</div>
                        <div className="text-sm opacity-80">Use this email and password to login next time.</div>
                      </div>

                      <div className="space-y-3">
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          type="email"
                          className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-lg shadow-inner font-medium border"
                          style={{
                            backgroundColor: `${theme.colors.text}05`,
                            borderColor: `${theme.colors.text}20`,
                            color: theme.colors.text,
                          }}
                        />
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          type="password"
                          className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-lg shadow-inner font-medium border"
                          style={{
                            backgroundColor: `${theme.colors.text}05`,
                            borderColor: `${theme.colors.text}20`,
                            color: theme.colors.text,
                          }}
                        />
                      </div>

                      <div className="pt-2 space-y-3">
                        <button
                          type="button"
                          onClick={completeCredentials}
                          disabled={loading}
                          className="w-full py-4 font-bold transition-all active:scale-[0.98] text-lg disabled:opacity-70"
                          style={getBtnStyle('primary')}
                        >
                          {loading ? "Setting up..." : "Continue"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Done / Cooldown Step */}
                  {step === "done" && msg && (
                    <motion.div key="done" variants={formStepVariant} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "https://gallero.in/start";
                        }}
                        className="w-full py-4 font-bold transition-all active:scale-[0.98] text-lg"
                        style={getBtnStyle('primary')}
                      >
                        Start Fresh on a Paid Plan
                      </button>
                    </motion.div>
                  )}

                  {/* Login Step */}
                  {step === "login" && (
                    <motion.div key="login" variants={formStepVariant} initial="initial" animate="animate" exit="exit" className="space-y-6">
                      <div className="space-y-2">
                        <div className="text-xl font-bold">Welcome back</div>
                        <div className="text-sm opacity-60">Login with your trial email and password.</div>
                      </div>

                      <div className="space-y-3">
                        <input
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="Email"
                          type="email"
                          className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-lg shadow-inner font-medium border"
                          style={{
                            backgroundColor: `${theme.colors.text}05`,
                            borderColor: `${theme.colors.text}20`,
                            color: theme.colors.text,
                          }}
                          disabled={loading}
                        />
                        <input
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Password"
                          type="password"
                          className="w-full rounded-2xl px-5 py-4 focus:outline-none transition-all text-lg shadow-inner font-medium border"
                          style={{
                            backgroundColor: `${theme.colors.text}05`,
                            borderColor: `${theme.colors.text}20`,
                            color: theme.colors.text,
                          }}
                          disabled={loading}
                        />
                      </div>

                      <div className="pt-2 space-y-3">
                        <button
                          type="button"
                          onClick={loginWithEmail}
                          disabled={loading}
                          className="w-full py-4 font-bold transition-all active:scale-[0.98] text-lg disabled:opacity-70"
                          style={getBtnStyle('primary')}
                        >
                          {loading ? "Logging in..." : "Login"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setMsg(null); setStep("enter_phone"); }}
                          disabled={loading}
                          className="w-full py-4 font-medium transition-all active:scale-[0.98] text-sm disabled:opacity-50"
                          style={getBtnStyle('ghost')}
                        >
                          Back to Sign Up
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Waitlist Step */}
                  {step === "waitlist" && (
                    <motion.div key="waitlist" variants={formStepVariant} initial="initial" animate="animate" exit="exit" className="space-y-6 pt-2">
                      <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-5 text-sm text-orange-600 dark:text-orange-300 leading-relaxed mb-6 font-medium">
                        Due to high demand, our trial slots are currently full.
                      </div>
                      <button
                        type="button"
                        onClick={joinWaitlist}
                        disabled={loading}
                        className="w-full py-4 font-bold transition-all active:scale-[0.98] text-lg disabled:opacity-70"
                        style={getBtnStyle('primary')}
                      >
                        {loading ? "Joining..." : "Join the Waitlist"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "https://gallero.in/start";
                        }}
                        className="w-full py-4 font-medium transition-all active:scale-[0.98] text-sm mt-2 disabled:opacity-50"
                        style={getBtnStyle('ghost')}
                      >
                        Skip Waitlist & Upgrade
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}