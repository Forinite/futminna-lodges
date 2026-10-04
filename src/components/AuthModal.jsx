import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { Btn, LinkBtn, Modal, inputCls, labelCls } from "./ui.jsx";

// Sign in with email + password.
// New accounts (or password resets): email -> 6-digit code -> set and confirm a password.
export default function AuthModal({ onClose, onSuccess, reason }) {
  const [mode, setMode] = useState("signin"); // signin | email | code | password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const go = (m) => { setMode(m); setError(""); setInfo(""); };
  const run = async (fn) => { setBusy(true); setError(""); try { await fn(); } finally { setBusy(false); } };

  const signIn = (e) => { e.preventDefault(); run(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) setError("Wrong email or password."); else onSuccess();
  }); };

  const sendCode = (e) => { e?.preventDefault(); run(async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    if (error) return setError(error.status === 429 ? "Too many attempts. Wait a minute and try again." : "Could not send the code. Check the email and try again.");
    setCooldown(60); setMode("code"); setInfo(`We sent a 6-digit code to ${email.trim()}.`);
  }); };

  const verify = (e) => { e.preventDefault(); run(async () => {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) return setError("That code is wrong or has expired.");
    setPassword(""); setConfirm(""); go("password");
  }); };

  const savePassword = (e) => {
    e.preventDefault();
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    run(async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setError("Could not save the password. Try again.");
      onSuccess();
    });
  };

  const form = "grid gap-3.5";
  const h2 = "font-display text-xl";
  const note = "text-[0.92rem] text-muted";
  const switchLine = "text-[0.85rem] text-muted";

  const emailField = (
    <label className={labelCls}>Email
      <input className={inputCls} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
    </label>
  );
  const feedback = (<>
    {info && <p className={note} role="status">{info}</p>}
    {error && <p className="text-booked" role="alert">{error}</p>}
  </>);

  return (
    <Modal label="Sign in" onClose={onClose}>
      {mode === "signin" && (
        <form className={form} onSubmit={signIn}>
          <h2 className={h2}>Sign in</h2>
          {reason && <p className={note}>{reason}</p>}
          {emailField}
          <label className={labelCls}>Password
            <input className={inputCls} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {feedback}
          <Btn variant="primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Btn>
          <p className={switchLine}>
            New here? <LinkBtn onClick={() => go("email")}>Create an account</LinkBtn>
            {" · "}<LinkBtn onClick={() => go("email")}>Forgot password?</LinkBtn>
          </p>
        </form>
      )}

      {mode === "email" && (
        <form className={form} onSubmit={sendCode}>
          <h2 className={h2}>Create an account</h2>
          <p className={note}>Enter your email. We'll send a 6-digit code to confirm it, then you'll choose a password. (Forgot your password? Do the same to set a new one.)</p>
          {emailField}
          {feedback}
          <Btn variant="primary" disabled={busy}>{busy ? "Sending…" : "Send code"}</Btn>
          <p className={switchLine}><LinkBtn onClick={() => go("signin")}>Back to sign in</LinkBtn></p>
        </form>
      )}

      {mode === "code" && (
        <form className={form} onSubmit={verify}>
          <h2 className={h2}>Enter your code</h2>
          <label className={labelCls}>6-digit code
            <input className={inputCls} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required autoFocus />
          </label>
          {feedback}
          <Btn variant="primary" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Verify"}</Btn>
          <p className={switchLine}>
            <LinkBtn disabled={cooldown > 0 || busy} onClick={() => sendCode()}>
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </LinkBtn>
            {" · "}<LinkBtn onClick={() => go("email")}>Change email</LinkBtn>
          </p>
        </form>
      )}

      {mode === "password" && (
        <form className={form} onSubmit={savePassword}>
          <h2 className={h2}>Set your password</h2>
          <p className={note}>Email confirmed. Choose a password for next time.</p>
          <label className={labelCls}>Password
            <input className={inputCls} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
          </label>
          <label className={labelCls}>Confirm password
            <input className={inputCls} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>
          {feedback}
          <Btn variant="primary" disabled={busy}>{busy ? "Saving…" : "Save and continue"}</Btn>
        </form>
      )}
    </Modal>
  );
}
