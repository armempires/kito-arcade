// Edge Function: asaas-client-webhook
// Recebe notificações de confirmação de pagamento do Asaas e atualiza client_payments
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const webhookToken = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
    const receivedToken = req.headers.get("asaas-access-token");

    if (webhookToken && receivedToken !== webhookToken) {
      console.warn("Token de webhook inválido recebido.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const payload = await req.json();
    const event = payload?.event;
    const payment = payload?.payment;

    if (!payment?.id) {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Eventos de sucesso de pagamento
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      await supabaseAdmin
        .from("client_payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: payment.billingType === "PIX" ? "pix" : "credit_card",
        })
        .eq("asaas_payment_id", payment.id);
    } else if (event === "PAYMENT_OVERDUE") {
      await supabaseAdmin
        .from("client_payments")
        .update({ status: "overdue" })
        .eq("asaas_payment_id", payment.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Erro no processamento do webhook Asaas:", message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
