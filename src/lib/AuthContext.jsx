import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const Ctx = createContext({ user: null, loading: true, signOut: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ user, loading, signOut: () => supabase.auth.signOut() }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
