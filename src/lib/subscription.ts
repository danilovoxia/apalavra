import { supabase } from "./supabase";

export type BillingCycle = "month" | "year";
export type Plan = "essencial" | "caminhada" | "semeador";

export async function createMpPreference(plan: Plan, billing_cycle: BillingCycle) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Usuário não autenticado (sem access_token).");

  // Aceita VITE_SUPABASE_FUNCTIONS_URL (preferido) ou calcula a partir de VITE_SUPABASE_URL
  const functionsBaseUrl =
    import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : "");

  if (!functionsBaseUrl) {
    throw new Error(
      "Base URL das Functions não definida. Configure VITE_SUPABASE_FUNCTIONS_URL (ex.: https://<ref>.supabase.co/functions/v1)."
    );
  }

  const url = `${functionsBaseUrl}/mp-create-preference`;

  // Timeout para não ficar preso em loading infinito caso a function trave
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const res = await fetch(url, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    // manda os dois nomes (billing_cycle e cycle) pra compatibilidade com versões antigas da edge function
    body: JSON.stringify({ plan, billing_cycle, cycle: billing_cycle }),
  });

  clearTimeout(timeout);

  // Nem sempre a function retorna JSON em erro (pode vir HTML/texto). Lê texto primeiro.
  const rawText = await res.text().catch(() => "");
  let json: any = {};
  try {
    json = rawText ? JSON.parse(rawText) : {};
  } catch {
    json = {};
  }

  if (!res.ok) {
    const msg = json?.error || json?.message || rawText || `Falha ao criar checkout (${res.status})`;
    throw new Error(msg);
  }

  // Pode estar retornando checkout_url, init_point, sandbox_init_point ou estruturas aninhadas
  const checkout_url =
    json.checkout_url ||
    json.init_point ||
    json.sandbox_init_point ||
    json.preference?.init_point;

  if (!checkout_url) throw new Error("Resposta sem checkout_url/init_point.");

  return { checkout_url, raw: json };
}
