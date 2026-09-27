// Edge Function: client-auth
// Responsável por criar usuário no auth.users via service_role e vincular a clients.portal_user_id
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

    const body = await req.json();
    const { action, clientId, email, password } = body;

    if (action === "create_account") {
      if (!clientId || !email || !password) {
        return new Response(JSON.stringify({ error: "clientId, email e password são obrigatórios." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 1. Criar usuário no auth.users
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "client", clientId },
      });

      if (userError) {
        // Se já existe, pega o usuário existente
        if (userError.message.includes("already registered") || userError.message.includes("already been registered")) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = listData?.users.find((u: { email?: string }) => u.email === email);
          if (existingUser) {
            await supabaseAdmin
              .from("clients")
              .update({ portal_user_id: existingUser.id, has_portal_access: true })
              .eq("id", clientId);

            return new Response(JSON.stringify({ success: true, userId: existingUser.id, existing: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        return new Response(JSON.stringify({ error: userError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 2. Vincular portal_user_id na tabela clients
      await supabaseAdmin
        .from("clients")
        .update({ portal_user_id: userData.user.id, has_portal_access: true })
        .eq("id", clientId);

      return new Response(JSON.stringify({ success: true, userId: userData.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reset_password") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "email e password são obrigatórios." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Localizar o usuário por e-mail
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      let user = listData?.users.find((u: { email?: string }) => u.email === email);
      
      if (!user) {
        // Se o usuário ainda não existia no Auth, cria diretamente com a senha informada
        const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role: "client" },
        });

        if (createError || !createdUser.user) {
          return new Response(JSON.stringify({ error: createError?.message || "Erro ao criar credencial no Auth." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        user = createdUser.user;

        // Atualiza a tabela clients com o portal_user_id criado
        await supabaseAdmin
          .from("clients")
          .update({ portal_user_id: user.id, has_portal_access: true })
          .eq("email", email);
      } else {
        // Se já existia, atualiza a senha
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password,
        });

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Garante que o vínculo portal_user_id está preenchido
        await supabaseAdmin
          .from("clients")
          .update({ portal_user_id: user.id, has_portal_access: true })
          .eq("email", email);
      }

      return new Response(JSON.stringify({ success: true, message: "Senha atualizada com sucesso!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
