import { supabase } from "./supabase";

export type BillingCycle = "month" | "year";
export type Plan = "essencial" | "caminhada" | "semeador";

export async function createMpPreference(plan: Plan, billing_cycle: BillingCycle) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Usuário não autenticado (sem access_token).");

  const baseUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  if (!baseUrl) throw new Error("VITE_SUPABASE_FUNCTIONS_URL não definido no .env.local");

  const url = `${baseUrl}/mp-create-preference`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ plan, billing_cycle }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `Falha ao criar checkout (${res.status})`);
  }

  // você pode estar retornando checkout_url OU init_point dependendo da tua edge function
  const checkout_url = json.checkout_url || json.init_point;
  if (!checkout_url) throw new Error("Resposta sem checkout_url/init_point.");

  return { checkout_url, raw: json };
}
