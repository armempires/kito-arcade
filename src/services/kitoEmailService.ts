import { supabase } from '../lib/supabase';
import {
  BookingEmailData,
  generateKitoBookingEmail,
  generateKitoVerificationEmail,
} from '../lib/kitoEmailTemplates';

const EDGE_FUNCTIONS_URL = 'https://monwyxbvkgldkdnxdbwj.supabase.co/functions/v1';
const B2_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbnd5eGJ2a2dsZGtkbnhkYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzMwNzgsImV4cCI6MjEwNTg0OTA3OH0.TuyN4eyX3bveY4zWw0KInqeEPGAMhi_fzvJgVRJEFIQ';

const DEFAULT_FROM = 'Kito Arcade | Ecossistema <atendimento@mailer.kitoexpert.online>';
const DEFAULT_ADMIN = 'atendimento@mailer.kitoexpert.online';

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  reply_to?: string;
}

/**
 * Disparo de email via Edge Function oficial Kito Arcade (com suporte a CORS para o navegador)
 */
export async function sendEmailViaResend(payload: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const toEmail = Array.isArray(payload.to) ? payload.to[0] : payload.to;
    const res = await fetch(`${EDGE_FUNCTIONS_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': B2_ANON_KEY,
        'Authorization': `Bearer ${B2_ANON_KEY}`,
      },
      body: JSON.stringify({
        booking: {
          service_name: payload.subject,
          serviceName: payload.subject,
          email: toEmail,
        },
        adminEmail: payload.reply_to || DEFAULT_ADMIN,
        customHtml: payload.html,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.warn('Falha na resposta do send-email:', data);
      return { success: false, error: data?.error || 'Erro ao enviar e-mail' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro de conexão ao enviar email:', err);
    return { success: false, error: err?.message || 'Erro de rede' };
  }
}

/**
 * Envia o Código OTP de Verificação de E-mail estilizado Kito Arcade
 */
export async function sendKitoVerificationCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const html = generateKitoVerificationEmail(code, 15);

  try {
    const res = await fetch(`${EDGE_FUNCTIONS_URL}/send-verification-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': B2_ANON_KEY,
        'Authorization': `Bearer ${B2_ANON_KEY}`,
      },
      body: JSON.stringify({
        email,
        code,
        customHtml: html,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.warn('Falha na resposta do send-verification-code:', data);
      return { success: false, error: data?.error || 'Erro ao enviar código' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro de rede ao enviar código:', err);
    return { success: false, error: err?.message || 'Erro de rede' };
  }
}

/**
 * Envia a Confirmação de Agendamento Oficial (Cliente + Cópia Equipe)
 */
export async function sendKitoBookingConfirmation(
  bookingData: BookingEmailData,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  const clientHtml = generateKitoBookingEmail(bookingData);
  const subject = `🚀 Agendamento Confirmado: ${bookingData.serviceName} // Kito Arcade`;

  try {
    const res = await fetch(`${EDGE_FUNCTIONS_URL}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': B2_ANON_KEY,
        'Authorization': `Bearer ${B2_ANON_KEY}`,
      },
      body: JSON.stringify({
        booking: {
          id: bookingId,
          service_name: bookingData.serviceName,
          serviceName: bookingData.serviceName,
          date: bookingData.date,
          time: bookingData.time,
          professional_name: bookingData.professionalName,
          professionalName: bookingData.professionalName,
          tutor_name: bookingData.clientName,
          clientName: bookingData.clientName,
          pet_name: 'Projeto sob medida',
          phone: bookingData.phone,
          email: bookingData.email,
          notes: bookingData.notes,
        },
        professional: {
          name: bookingData.professionalName,
        },
        adminEmail: DEFAULT_ADMIN,
        customHtml: clientHtml,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.warn('Falha no envio de confirmação:', data);
      return { success: false, error: data?.error || 'Erro ao disparar confirmação' };
    }

    // Registra log na tabela de auditoria email_logs do Banco 1 (Kito Arcade)
    try {
      if (bookingData.email) {
        await supabase.from('email_logs').insert({
          booking_id: bookingId || null,
          recipient_email: bookingData.email,
          recipient_type: 'client',
          subject,
          status: 'sent',
        });
      }
    } catch (logErr) {
      console.warn('Erro ao salvar email_log do cliente:', logErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro de conexão ao confirmar agendamento:', err);
    return { success: false, error: err?.message || 'Erro de rede' };
  }
}
