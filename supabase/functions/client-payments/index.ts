// Edge Function: client-payments
// Gera cobrança no Asaas e obtém QR Code PIX dinâmico
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { getPaymentPixQrCode, createPayment, createCustomer } from "../_shared/asaas.ts";

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

    const body = await req.json();
    const { action, paymentId } = body;

    if (action === "generate_pix") {
      if (!paymentId) {
        return new Response(JSON.stringify({ error: "paymentId é obrigatório." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 1. Buscar a parcela no banco
      const { data: payment, error: pError } = await supabaseAdmin
        .from("client_payments")
        .select("*, clients(*)")
        .eq("id", paymentId)
        .single();

      if (pError || !payment) {
        return new Response(JSON.stringify({ error: "Parcela não encontrada." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Se já tem QR Code gerado, retorna
      if (payment.asaas_pix_qr_code && payment.asaas_pix_copy_paste) {
        return new Response(
          JSON.stringify({
            qrCode: payment.asaas_pix_qr_code,
            copyPaste: payment.asaas_pix_copy_paste,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 2. Se tiver asaas_payment_id, consulta o QR Code direto
      let asaasPayId = payment.asaas_payment_id;

      if (!asaasPayId) {
        // Precisa criar o cliente no Asaas caso não tenha
        let asaasCustId = payment.clients?.asaas_customer_id;
        if (!asaasCustId) {
          try {
            const newCust = await createCustomer({
              name: payment.clients?.name || "Cliente Kito",
              email: payment.clients?.email || "contato@cliente.com",
              phone: payment.clients?.whatsapp || payment.clients?.phone || "",
              cpfCnpj: payment.clients?.cpf || payment.clients?.cnpj || undefined,
            });
            asaasCustId = newCust.id;
            await supabaseAdmin
              .from("clients")
              .update({ asaas_customer_id: asaasCustId })
              .eq("id", payment.client_id);
          } catch (custErr: unknown) {
            console.warn("Aviso ao criar cliente no Asaas:", custErr);
          }
        }

        if (asaasCustId) {
          const newPayment = await createPayment({
            customer: asaasCustId,
            billingType: "PIX",
            value: payment.amount,
            dueDate: payment.due_date,
            description: `Kito Arcade — Parcela ${payment.installment_number || 1}`,
          });
          asaasPayId = newPayment.id;
          await supabaseAdmin
            .from("client_payments")
            .update({ asaas_payment_id: asaasPayId, payment_method: "pix" })
            .eq("id", paymentId);
        }
      }

      if (asaasPayId) {
        const pixData = await getPaymentPixQrCode(asaasPayId);
        await supabaseAdmin
          .from("client_payments")
          .update({
            asaas_pix_qr_code: pixData.encodedImage,
            asaas_pix_copy_paste: pixData.payload,
          })
          .eq("id", paymentId);

        return new Response(
          JSON.stringify({
            qrCode: pixData.encodedImage,
            copyPaste: pixData.payload,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Integração Asaas aguardando chaves de API nos secrets." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "pay_card") {
      const { card, holderInfo } = body;
      if (!paymentId || !card || !holderInfo) {
        return new Response(JSON.stringify({ error: "paymentId, card e holderInfo são obrigatórios." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 1. Buscar a parcela no banco
      const { data: payment, error: pError } = await supabaseAdmin
        .from("client_payments")
        .select("*, clients(*)")
        .eq("id", paymentId)
        .single();

      if (pError || !payment) {
        return new Response(JSON.stringify({ error: "Parcela não encontrada." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (payment.status === "paid") {
        return new Response(JSON.stringify({ error: "Esta parcela já consta como paga." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. Garantir cliente no Asaas
      let asaasCustId = payment.clients?.asaas_customer_id;
      if (!asaasCustId) {
        try {
          const newCust = await createCustomer({
            name: holderInfo.name || payment.clients?.name || "Cliente Kito",
            email: holderInfo.email || payment.clients?.email || "contato@cliente.com",
            phone: holderInfo.phone || payment.clients?.whatsapp || payment.clients?.phone || "",
            cpfCnpj: holderInfo.cpfCnpj || payment.clients?.cpf || payment.clients?.cnpj || undefined,
          });
          asaasCustId = newCust.id;
          await supabaseAdmin
            .from("clients")
            .update({ asaas_customer_id: asaasCustId })
            .eq("id", payment.client_id);
        } catch (custErr: unknown) {
          console.warn("Aviso ao criar cliente no Asaas:", custErr);
        }
      }

      if (!asaasCustId) {
        return new Response(JSON.stringify({ error: "Não foi possível vincular o cliente ao Asaas." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 3. Processar cobrança por Cartão de Crédito
      const cardPayment = await createPayment({
        customer: asaasCustId,
        billingType: "CREDIT_CARD",
        value: payment.amount,
        dueDate: new Date().toISOString().split("T")[0],
        description: `Kito Arcade — Parcela ${payment.installment_number || 1}`,
        creditCard: {
          holderName: card.holderName,
          number: card.number.replace(/\D/g, ""),
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          ccv: card.ccv,
        },
        creditCardHolderInfo: {
          name: holderInfo.name,
          email: holderInfo.email,
          cpfCnpj: holderInfo.cpfCnpj.replace(/\D/g, ""),
          postalCode: (holderInfo.postalCode || "01001000").replace(/\D/g, ""),
          addressNumber: holderInfo.addressNumber || "1",
          phone: (holderInfo.phone || "11999999999").replace(/\D/g, ""),
        },
      });

      // 4. Se aprovado, atualizar status no banco
      const isApproved = cardPayment.status === "CONFIRMED" || cardPayment.status === "RECEIVED";
      await supabaseAdmin
        .from("client_payments")
        .update({
          asaas_payment_id: cardPayment.id,
          payment_method: "credit_card",
          status: isApproved ? "paid" : "pending",
          paid_at: isApproved ? new Date().toISOString() : null,
        })
        .eq("id", paymentId);

      return new Response(
        JSON.stringify({
          success: true,
          status: cardPayment.status,
          paymentId: cardPayment.id,
          isPaid: isApproved,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Ação não suportada." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
