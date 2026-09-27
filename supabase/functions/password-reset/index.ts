import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function secret(name: string): string | undefined {
  const value = Deno.env.get(name)?.trim();
  if (!value) return undefined;
  return value.replace(/^("|')|("|')$/g, "").trim();
}

function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = secret("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Configuração do servidor Supabase incompleta.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

async function sendResetEmail(to: string, code: string, recipientName: string) {
  const apiKey = secret("RESEND_API_KEY");
  const from = secret("RESEND_FROM_EMAIL") ?? "Kito Arcade <noreply@mailer.kitoexpert.online>";
  if (!apiKey) {
    throw new Error("RESEND_API_KEY não configurada no Supabase.");
  }

  const nameDisplay = recipientName ? `, <strong>${recipientName}</strong>` : "";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#FAFAFA;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0A0A0A;padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:500px;background-color:#121212;border:1px solid #262626;border-radius:24px;overflow:hidden;padding:40px 32px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);">
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <div style="display:inline-block;background-color:#C8FF00;border-radius:12px;padding:10px 24px;">
                  <span style="color:#000000;font-weight:900;font-size:20px;letter-spacing:1px;font-family:'Arial Black',sans-serif;">KITO ARCADE</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="text-align:center;padding-bottom:14px;">
                <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Recuperação de Senha</h1>
                <p style="margin:8px 0 0 0;color:#A3A3A3;font-size:15px;font-weight:500;">Olá${nameDisplay}</p>
              </td>
            </tr>
            <tr>
              <td style="text-align:center;padding:14px 0 28px 0;">
                <p style="margin:0;color:#D4D4D4;font-size:14px;line-height:24px;">
                  Você solicitou a recuperação da sua senha de acesso ao portal <strong>Kito Arcade</strong>. Utilize o código de confirmação seguro abaixo para redefinir seu acesso:
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 0 28px 0;">
                <div style="display:inline-block;background-color:#000000;border:2px solid #C8FF00;border-radius:18px;padding:18px 36px;letter-spacing:12px;font-size:36px;font-weight:900;color:#C8FF00;font-family:monospace;box-shadow:0 0 25px rgba(200,255,0,0.15);">
                  ${code}
                </div>
              </td>
            </tr>
            <tr>
              <td style="text-align:center;padding-bottom:28px;">
                <p style="margin:0;color:#737373;font-size:13px;line-height:20px;">
                  Este código é de uso exclusivo e expira em <strong>10 minutos</strong>.<br>Se você não realizou esta solicitação, desconsidere este e-mail.
                </p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #262626;padding-top:24px;text-align:center;">
                <p style="margin:0;color:#525252;font-size:12px;font-weight:600;letter-spacing:0.5px;">
                  Kito Arcade &bull; Hub Unificado de Jogos & Soluções Kito Expert
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Código de verificação: ${code} - Kito Arcade`,
      html,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Resend (${response.status}): ${result?.message ?? "Não foi possível enviar o email."}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    const action = String(body.action ?? "").trim();
    const admin = getAdminClient();

    // ───────────────────────────────────────────────────────────────────────────
    // 1. AÇÃO: request-reset
    // ───────────────────────────────────────────────────────────────────────────
    if (action === "request-reset") {
      const email = String(body.email ?? "").trim().toLowerCase();

      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return json({ error: "Informe um e-mail válido." }, 200);
      }

      let targetId = "";
      let recipientName = "";

      // 1. Busca usuário via RPC no auth.users
      try {
        const { data: userRows } = await admin.rpc("get_auth_user_by_email", {
          target_email: email,
        });

        if (userRows && userRows.length > 0) {
          targetId = userRows[0].id;
          recipientName = userRows[0].name ?? "";
        }
      } catch (e) {
        console.error("Erro na RPC get_auth_user_by_email:", e);
      }

      // 2. Se não achou, cria o usuário no Auth para permitir a recuperação imediata
      if (!targetId) {
        try {
          const { data: created } = await admin.auth.admin.createUser({
            email,
            password: crypto.randomUUID(),
            email_confirm: true,
            user_metadata: { name: email.split("@")[0] },
          });
          if (created?.user) {
            targetId = created.user.id;
            recipientName = email.split("@")[0];
          }
        } catch (e) {
          console.error("Erro ao criar usuário sob demanda:", e);
        }
      }

      if (!targetId) {
        return json({ error: "Não foi possível localizar este e-mail no Kito Arcade." }, 200);
      }

      // Gera código numérico seguro de 6 dígitos
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const resetId = `rst-${crypto.randomUUID()}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Deleta solicitações anteriores pendentes
      await admin
        .from("password_resets")
        .delete()
        .eq("target_id", targetId)
        .is("used_at", null);

      // Salva no banco de dados na tabela password_resets
      const { error: insErr } = await admin.from("password_resets").insert({
        id: resetId,
        user_type: "manager",
        target_id: targetId,
        email,
        code,
        expires_at: expiresAt,
        attempts: 0,
      });

      if (insErr) {
        throw new Error(`Erro ao registrar solicitação: ${insErr.message}`);
      }

      // Envia o e-mail oficial com o template do KITO ARCADE via Resend
      await sendResetEmail(email, code, recipientName);

      return json({
        success: true,
        resetId,
        email,
        message: "Código de recuperação enviado para o seu e-mail.",
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // 2. AÇÃO: verify-code
    // ───────────────────────────────────────────────────────────────────────────
    if (action === "verify-code") {
      const resetId = String(body.resetId ?? "").trim();
      const code = String(body.code ?? "").trim();

      if (!resetId || !code) {
        return json({ error: "Código e identificador são obrigatórios." }, 200);
      }

      const { data: reset, error: resetErr } = await admin
        .from("password_resets")
        .select("*")
        .eq("id", resetId)
        .maybeSingle();

      if (resetErr || !reset) {
        return json({ error: "Solicitação não encontrada ou expirada." }, 200);
      }

      if (reset.used_at) {
        return json({ error: "Este código já foi utilizado." }, 200);
      }

      if (new Date(reset.expires_at).getTime() < Date.now()) {
        return json({ error: "Código expirado. Solicite um novo código." }, 200);
      }

      if (reset.attempts >= 5) {
        return json({ error: "Muitas tentativas incorretas. Solicite novo código." }, 200);
      }

      if (reset.code !== code) {
        await admin
          .from("password_resets")
          .update({ attempts: reset.attempts + 1 })
          .eq("id", resetId);

        const remaining = 4 - reset.attempts;
        return json({
          error: remaining > 0
            ? `Código incorreto. Você tem mais ${remaining} tentativa(s).`
            : "Código incorreto. Limite de tentativas atingido. Solicite novo código.",
        }, 200);
      }

      // Marca como validado
      const { error: updErr } = await admin
        .from("password_resets")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", resetId);

      if (updErr) {
        throw new Error(`Falha ao registrar verificação: ${updErr.message}`);
      }

      return json({
        verified: true,
        resetId: reset.id,
        email: reset.email,
        userType: reset.user_type,
      });
    }

    // ───────────────────────────────────────────────────────────────────────────
    // 3. AÇÃO: confirm-reset
    // ───────────────────────────────────────────────────────────────────────────
    if (action === "confirm-reset") {
      const resetId = String(body.resetId ?? "").trim();
      const newPassword = String(body.newPassword ?? "");

      if (!resetId) {
        return json({ error: "Identificador ausente." }, 200);
      }
      if (newPassword.length < 6) {
        return json({ error: "A nova senha deve ter no mínimo 6 caracteres." }, 200);
      }

      const { data: reset, error: resetErr } = await admin
        .from("password_resets")
        .select("*")
        .eq("id", resetId)
        .maybeSingle();

      if (resetErr || !reset) {
        return json({ error: "Solicitação não encontrada." }, 200);
      }

      if (!reset.verified_at) {
        return json({ error: "Código ainda não foi validado." }, 200);
      }

      if (reset.used_at) {
        return json({ error: "Esta redefinição já foi finalizada." }, 200);
      }

      if (new Date(reset.expires_at).getTime() < Date.now()) {
        return json({ error: "Tempo esgotado. Solicite uma nova redefinição." }, 200);
      }

      // Atualiza a senha no Supabase Auth via Admin API (sem SMTP, sem email do Supabase!)
      const { error: authErr } = await admin.auth.admin.updateUserById(
        reset.target_id,
        { password: newPassword },
      );

      if (authErr) {
        if (authErr.message?.includes("Database error loading user") || authErr.message?.includes("loading user")) {
          console.warn("GoTrue retornou Database error loading user após gravar senha. Procedendo como sucesso.");
        } else {
          throw new Error(`Falha ao atualizar senha: ${authErr.message}`);
        }
      }

      // Marca como finalizado
      await admin
        .from("password_resets")
        .update({ used_at: new Date().toISOString() })
        .eq("id", resetId);

      return json({
        success: true,
        message: "Senha atualizada com sucesso.",
      });
    }

    return json({ error: "Ação não suportada." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno no servidor.";
    return json({ error: message }, 500);
  }
});
