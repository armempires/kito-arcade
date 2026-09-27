import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { email, otp_code } = await req.json();

    if (!email || !otp_code) {
      return new Response(
        JSON.stringify({ authenticated: false, error: "Email e codigo sao obrigatorios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Busca token valido
    const { data: tokenEntry, error: tokenError } = await supabaseAdmin
      .from("admin_login_tokens")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp_code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (tokenError) {
      console.error("Token lookup error:", tokenError);
    }

    if (!tokenEntry) {
      // Incrementa tentativas do ultimo token valido
      const { data: latestToken, error: latestErr } = await supabaseAdmin
        .from("admin_login_tokens")
        .select("*")
        .eq("email", email)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (latestToken && latestToken.attempts < latestToken.max_attempts) {
        await supabaseAdmin
          .from("admin_login_tokens")
          .update({ attempts: latestToken.attempts + 1 })
          .eq("id", latestToken.id);
      }

      return new Response(
        JSON.stringify({ authenticated: false, error: "Codigo invalido ou expirado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marca token como usado
    await supabaseAdmin
      .from("admin_login_tokens")
      .update({ used: true })
      .eq("id", tokenEntry.id);

    return new Response(
      JSON.stringify({ authenticated: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ authenticated: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
