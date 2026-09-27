import { supabase } from './supabase';

async function invokeReset(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("password-reset", { body });
  if (data?.error) throw new Error(data.error);
  if (error) {
    let customMsg: string | null = null;
    try {
      if ("context" in error && error.context) {
        const res = error.context as Response;
        const errBody = await res.clone().json();
        if (errBody?.error) customMsg = errBody.error;
      }
    } catch {
      // fallback caso body não seja JSON
    }

    if (customMsg) {
      throw new Error(customMsg);
    }
    if (error.message?.includes("non-2xx status code")) {
      throw new Error("Usuário não cadastrado.");
    }
    throw new Error(error.message || "Falha na comunicação com o servidor.");
  }
  return data;
}

/** Solicita código de recuperação para Gestor / Cliente do Portal (Email) */
export async function requestManagerPasswordReset(email: string) {
  return invokeReset({
    action: "request-reset",
    userType: "manager",
    email: email.trim().toLowerCase(),
  }) as Promise<{ success: boolean; resetId: string; email: string; message: string }>;
}

/** Valida o código numérico de 6 dígitos no servidor */
export async function verifyPasswordResetCode(resetId: string, code: string) {
  return invokeReset({
    action: "verify-code",
    resetId,
    code: code.trim(),
  }) as Promise<{ verified: boolean; resetId: string; email: string; userType: "employee" | "manager" }>;
}

/** Define a nova senha autorizada pelo código */
export async function confirmPasswordReset(resetId: string, newPassword: string) {
  return invokeReset({
    action: "confirm-reset",
    resetId,
    newPassword,
  }) as Promise<{ success: boolean; message: string }>;
}
