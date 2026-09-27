import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "https://esm.sh/resend@4";

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

    const { email } = await req.json();

    let targetEmail = email;

    // Se email não fornecido, pega o primeiro email ativo da whitelist
    if (!targetEmail) {
      const { data: whitelistEntry, error: wlError } = await supabaseAdmin
        .from("admin_login_whitelist")
        .select("email")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (wlError || !whitelistEntry) {
        return new Response(
          JSON.stringify({ success: false, error: "Nenhum e-mail autorizado encontrado." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      targetEmail = whitelistEntry.email;
    }

    // Gera OTP de 6 dígitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Salva token no banco com expiração de 15 minutos
    await supabaseAdmin
      .from("admin_login_tokens")
      .insert({
        email: targetEmail,
        otp_code: otpCode,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        used: false,
        attempts: 0,
        max_attempts: 3,
      });

    // Envia email com o código
    const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

    await resend.emails.send({
      from: "Kito Arcade // Segurança <atendimento@mailer.kitoexpert.online>",
      to: targetEmail,
      subject: `🔐 Código de Acesso Kito Arcade: ${otpCode}`,
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codigo de Acesso // Kito Arcade</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #07080a; padding: 32px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #0d0f15; border: 1px solid #1a1e2b; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);">
          <tr>
            <td style="background: linear-gradient(90deg, #C8FF00 0%, #84CC16 50%, #06B6D4 100%); height: 3px; line-height: 3px; font-size: 3px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-bottom: 1px solid #161a26;">
              <span style="font-family: 'Anton', Impact, 'Arial Black', sans-serif; font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.05em;">
                KITO<span style="color: #C8FF00;">ARCADE</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; text-align: center;">
              <div style="display: inline-block; padding: 5px 14px; background: rgba(200, 255, 0, 0.08); border: 1px solid rgba(200, 255, 0, 0.25); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #C8FF00; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;">
                Acesso Restrito ao CRM
              </div>
              <h1 style="margin: 0 0 10px; font-size: 20px; font-weight: 800; color: #ffffff;">Codigo de Confirmacao</h1>
              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.5; color: #9ca3af;">Insira este codigo na tela do CRM para acessar:</p>
              <div style="background-color: #08090e; border: 1.5px dashed rgba(200, 255, 0, 0.5); border-radius: 14px; padding: 20px 16px; margin: 0 auto 20px; max-width: 300px; box-shadow: 0 0 20px rgba(200, 255, 0, 0.1);">
                <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 900; color: #C8FF00; letter-spacing: 0.15em; text-align: center;">${otpCode}</span>
              </div>
              <div style="display: inline-block; padding: 5px 14px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; font-size: 12px; color: #f59e0b; margin-bottom: 22px;">
                Este codigo expira em <strong>15 minutos</strong>.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 32px; background-color: #0a0b10; border-top: 1px solid #161a26; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                Mensagem gerada pelo sistema de seguranca Kito Arcade.<br>
                &copy; 2026 Kito Expert • Infraestrutura Protegida
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    return new Response(
      JSON.stringify({ success: true, email_sent_to: targetEmail }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
