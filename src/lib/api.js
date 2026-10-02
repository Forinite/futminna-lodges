import { supabase } from "./supabase";

export async function getLodges() {
  const { data, error } = await supabase
    .from("lodges")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getLodge(id) {
  const { data, error } = await supabase
    .from("lodges")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function submitInterest({ lodgeId, name, phone }) {
  const { data, error } = await supabase
    .from("interests")
    .insert({
      lodge_id: lodgeId,
      name: name.trim(),
      phone: phone.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function bookLodge({ lodgeId, name, phone }) {
  const { data, error } = await supabase.rpc("book_lodge", {
    p_lodge_id: lodgeId,
    p_name: name.trim(),
    p_phone: phone.trim(),
  });

  if (error) throw error;
  return data;
}

export async function getAdminRequests() {
  const [{ data: interests, error: interestsError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase
        .from("interests")
        .select("*, lodges(name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("*, lodges(name)")
        .order("created_at", { ascending: false }),
    ]);

  if (interestsError) throw interestsError;
  if (bookingsError) throw bookingsError;

  return { interests: interests ?? [], bookings: bookings ?? [] };
}
