/**
 * Templates de E-mail de Alta Fidelidade e Identidade Visual Kito Arcade
 * Cores oficiais da marca: #07080A (Dark Bg), #0D0F15 (Card Bg), #C8FF00 (Brand Neon Lime), #A0A0A0 (Muted Text)
 */

export interface BookingEmailData {
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  phone?: string;
  email?: string;
  notes?: string;
  whatsappLink?: string;
  portalUrl?: string;
}

/**
 * Formata data no formato brasileiro humanizado (ex: segunda-feira, 28 de setembro de 2026)
 */
export function formatLongDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}

/**
 * Gera URL do Google Agenda com clique único
 */
export function generateGoogleCalendarUrl(data: BookingEmailData): string {
  try {
    const [year, month, day] = data.date.split("-");
    const [hours, minutes] = (data.time || "10:00").split(":");
    
    const startIso = `${year}${month}${day}T${hours || "10"}${minutes || "00"}00`;
    const endHour = String(Number(hours || 10) + 1).padStart(2, "0");
    const endIso = `${year}${month}${day}T${endHour}${minutes || "00"}00`;

    const title = encodeURIComponent(`Alinhamento de Projeto: ${data.serviceName} • Kito Expert`);
    const details = encodeURIComponent(
      `Sessão estratégica de alinhamento técnico para o projeto ${data.serviceName}.\n\n` +
      `👤 Especialista: ${data.professionalName}\n` +
      `Cliente: ${data.clientName}\n` +
      `Telefone/WhatsApp: ${data.phone || "Não informado"}\n\n` +
      `Plataforma: Kito Arcade // Ecossistema Digital`
    );
    const location = encodeURIComponent("Reunião Online / Google Meet");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  } catch {
    return "https://calendar.google.com";
  }
}

/**
 * Renderiza o Bloco Oficial do Logo Kito Arcade
 */
function renderLogoHeader(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; text-align: center;">
      <tr>
        <td align="center" style="padding-bottom: 6px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display: inline-table; vertical-align: middle;">
            <tr>
              <td style="vertical-align: middle;">
                <span style="font-family: 'Anton', Impact, 'Arial Black', -apple-system, sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 0.05em; color: #FFFFFF; text-transform: uppercase; line-height: 1;">
                  KITO<span style="color: #C8FF00;">ARCADE</span>
                </span>
              </td>
              <td style="vertical-align: middle; padding-left: 8px;">
                <span style="display: inline-block; padding: 3px 8px; background-color: #C8FF00; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; font-weight: 900; color: #000000; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.2;">
                  ECOSSISTEMA
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center">
          <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 600; color: #A0A0A0; letter-spacing: 0.12em; text-transform: uppercase;">
            SITE, APP, MARKETING E AUTOMAÇÃO
          </span>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Template Oficial: Confirmação de Agendamento Kito Arcade (#C8FF00)
 */
export function generateKitoBookingEmail(data: BookingEmailData): string {
  const formattedDate = formatLongDate(data.date);
  const calendarUrl = generateGoogleCalendarUrl(data);
  const phoneClean = (data.phone || "").replace(/\D/g, "");
  const whatsappUrl = data.whatsappLink || (phoneClean ? `https://wa.me/55${phoneClean}?text=${encodeURIComponent(`Olá ${data.clientName}! Confirmando seu agendamento de ${data.serviceName} para o dia ${data.date} às ${data.time}.`)}` : "https://wa.me/5511999999999");
  const portalUrl = data.portalUrl || "http://localhost:5174/#portal";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agendamento Confirmado // Kito Arcade</title>
  <style>
    body { margin: 0; padding: 0; background-color: #07080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f3f4f6; }
    table { border-collapse: collapse; }
    a { text-decoration: none; }
    @media only screen and (max-width: 580px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 24px 16px !important; }
      .header-padding { padding: 24px 16px 16px !important; }
      .cta-button { display: block !important; width: 100% !important; margin-bottom: 8px !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #07080a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #07080a; padding: 32px 10px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" class="container-table" width="100%" style="max-width: 580px; background-color: #0d0f15; border: 1px solid #1a1e2b; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);">
          
          <!-- Faixa Superior Neon Kito (#C8FF00) -->
          <tr>
            <td style="background: linear-gradient(90deg, #C8FF00 0%, #84CC16 50%, #06B6D4 100%); height: 3px; line-height: 3px; font-size: 3px;">&nbsp;</td>
          </tr>

          <!-- Header da Marca Kito Arcade Oficial -->
          <tr>
            <td class="header-padding" style="padding: 28px 32px 18px; border-bottom: 1px solid #161a26; background: radial-gradient(ellipse at top, rgba(200, 255, 0, 0.05) 0%, rgba(13, 15, 21, 0) 70%);">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    ${renderLogoHeader()}
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="display: inline-block; padding: 5px 11px; background: rgba(200, 255, 0, 0.08); border: 1px solid rgba(200, 255, 0, 0.25); border-radius: 9999px; font-size: 10px; font-weight: 800; color: #C8FF00; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap;">
                      <span style="display: inline-block; width: 6px; height: 6px; background-color: #C8FF00; border-radius: 50%; margin-right: 5px; box-shadow: 0 0 8px #C8FF00;"></span>
                      CONFIRMADO
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo do E-mail -->
          <tr>
            <td class="content-padding" style="padding: 28px 32px;">
              <!-- Título & Saudação -->
              <h1 style="margin: 0 0 8px; font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                Agendamento Confirmado! 🚀
              </h1>
              <p style="margin: 0 0 22px; font-size: 13px; line-height: 1.5; color: #9ca3af;">
                Olá, <strong style="color: #ffffff;">${data.clientName}</strong>! Sua sessão estratégica para desenvolvimento e alinhamento de projeto foi reservada com sucesso.
              </p>

              <!-- Card de Detalhes -->
              <table role="presentation" width="100%" style="background-color: #121520; border: 1px solid #1f2536; border-radius: 12px; overflow: hidden; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 14px 18px; background-color: #151926; border-bottom: 1px solid #1f2536;">
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #C8FF00;">
                      // RESUMO DA SESSÃO AGENDADA
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; color: #9ca3af; width: 36%; font-weight: 500;">Solução / Escopo</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #ffffff; font-weight: 700;">${data.serviceName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; color: #9ca3af; border-top: 1px solid #1a2030; font-weight: 500;">Especialista</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #C8FF00; border-top: 1px solid #1a2030; font-weight: 700;">${data.professionalName} <span style="font-size: 10px; color: #6b7280; font-weight: 500;">(Kito Expert)</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; color: #9ca3af; border-top: 1px solid #1a2030; font-weight: 500;">Data Marcada</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #ffffff; border-top: 1px solid #1a2030; font-weight: 700;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; color: #9ca3af; border-top: 1px solid #1a2030; font-weight: 500;">Horário</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #C8FF00; border-top: 1px solid #1a2030; font-weight: 800;">${data.time} <span style="font-size: 10px; color: #9ca3af; font-weight: 500;">(Horário de Brasília)</span></td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; color: #9ca3af; border-top: 1px solid #1a2030; font-weight: 500;">Formato</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #d1d5db; border-top: 1px solid #1a2030; font-weight: 600;">Reunião Remota / Atendimento Digital</td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 12px; color: #9ca3af; border-top: 1px solid #1a2030; font-weight: 500;">Seu Contato</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #d1d5db; border-top: 1px solid #1a2030; font-weight: 600;">${data.phone || "Não informado"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${data.notes ? `
                <tr>
                  <td style="padding: 12px 18px; background-color: #0b0d14; border-top: 1px solid #1f2536;">
                    <div style="font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px;">Detalhes do Projeto / Observações:</div>
                    <div style="font-size: 12px; color: #e5e7eb; line-height: 1.4; font-style: italic;">"${data.notes}"</div>
                  </td>
                </tr>` : ""}
              </table>

              <!-- Ações Principais -->
              <table role="presentation" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${calendarUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 11px 20px; background: #C8FF00; color: #08090C; font-size: 12px; font-weight: 800; border-radius: 8px; margin-right: 8px; margin-bottom: 6px; box-shadow: 0 4px 12px rgba(200, 255, 0, 0.25);">
                      📅 Adicionar ao Google Agenda
                    </a>
                    <a href="${whatsappUrl}" target="_blank" class="cta-button" style="display: inline-block; padding: 11px 18px; background: #161b26; border: 1px solid #2b3247; color: #38bdf8; font-size: 12px; font-weight: 700; border-radius: 8px; margin-bottom: 6px;">
                      💬 Abrir no WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Próximos Passos -->
              <table role="presentation" width="100%" style="background: rgba(200, 255, 0, 0.03); border: 1px solid rgba(200, 255, 0, 0.12); border-radius: 10px; padding: 14px 16px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: #C8FF00; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 5px;">
                      ⚡ Próximos Passos
                    </div>
                    <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                      <li>Nossa equipe técnica pré-analisará a demanda informada.</li>
                      <li>Você receberá o link da chamada diretamente no seu e-mail e WhatsApp minutos antes do horário.</li>
                      <li>Você já pode acompanhar a esteira do seu projeto em nosso <a href="${portalUrl}" style="color: #C8FF00; font-weight: 600;">Portal do Cliente</a>.</li>
                    </ul>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0a0b10; border-top: 1px solid #161a26; text-align: center;">
              <p style="margin: 0 0 5px; font-size: 11px; font-weight: 700; color: #d1d5db;">Kito Arcade • Ecossistema de Softwares &amp; Automação</p>
              <p style="margin: 0 0 8px; font-size: 10px; color: #6b7280; line-height: 1.4;">
                Em caso de dúvidas, contate <a href="mailto:atendimento@mailer.kitoexpert.online" style="color: #C8FF00;">atendimento@mailer.kitoexpert.online</a>
              </p>
              <div style="font-size: 9px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.08em;">© 2026 Kito Expert • Todos os direitos reservados.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Template Oficial: Código de Verificação OTP Kito Arcade (6 Slots Compactos em 1 Linha)
 */
export function generateKitoVerificationEmail(code: string, expiryMinutes = 15): string {
  const digits = String(code).trim().split("");

  const digitsHtml = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; white-space: nowrap; border-collapse: separate;">
      <tr>
        ${digits.map(d => `
          <td align="center" style="padding: 0 4px;">
            <div style="width: 40px; height: 50px; line-height: 50px; background-color: #0b0c10; border: 1.5px solid #C8FF00; border-radius: 10px; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 24px; font-weight: 900; color: #C8FF00; text-align: center; box-shadow: 0 0 14px rgba(200, 255, 0, 0.22); white-space: nowrap;">
              ${d}
            </div>
          </td>
        `).join("")}
      </tr>
    </table>
  `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificação // Kito Arcade</title>
  <style>
    body { margin: 0; padding: 0; background-color: #07080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f3f4f6; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 480px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 24px 16px !important; }
      .header-padding { padding: 24px 16px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #07080a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #07080a; padding: 32px 10px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" class="container-table" width="100%" style="max-width: 500px; background-color: #0d0f15; border: 1px solid #1a1e2b; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);">
          
          <!-- Faixa Superior Neon Kito (#C8FF00) -->
          <tr>
            <td style="background: linear-gradient(90deg, #C8FF00 0%, #84CC16 50%, #06B6D4 100%); height: 3px; line-height: 3px; font-size: 3px;">&nbsp;</td>
          </tr>

          <!-- Header da Marca Kito Arcade Oficial -->
          <tr>
            <td class="header-padding" style="padding: 30px 32px 20px; text-align: center; border-bottom: 1px solid #161a26; background: radial-gradient(ellipse at top, rgba(200, 255, 0, 0.05) 0%, rgba(13, 15, 21, 0) 70%);">
              ${renderLogoHeader()}
            </td>
          </tr>

          <!-- Corpo do Código -->
          <tr>
            <td class="content-padding" style="padding: 32px 32px 24px; text-align: center;">
              
              <!-- Badge de Segurança -->
              <div style="display: inline-block; padding: 5px 14px; background: rgba(200, 255, 0, 0.08); border: 1px solid rgba(200, 255, 0, 0.25); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #C8FF00; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;">
                🔐 VALIDAÇÃO EM 2 ETAPAS
              </div>

              <h1 style="margin: 0 0 10px; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                Seu Código de Confirmação
              </h1>
              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.5; color: #9ca3af; max-width: 380px; margin-left: auto; margin-right: auto;">
                Insira os 6 dígitos abaixo na tela do agendamento para validar sua identidade com segurança:
              </p>

              <!-- Caixa do Código (6 Slots Compactos com White-Space Nowrap) -->
              <div style="background-color: #08090e; border: 1.5px dashed rgba(200, 255, 0, 0.5); border-radius: 14px; padding: 20px 16px; margin: 0 auto 20px; max-width: 340px; box-shadow: 0 0 20px rgba(200, 255, 0, 0.1);">
                ${digitsHtml}
              </div>

              <!-- Temporizador / Alerta de Expiração -->
              <div style="display: inline-block; padding: 5px 14px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; font-size: 12px; color: #f59e0b; margin-bottom: 22px;">
                ⏱️ Este código expira em <strong>${expiryMinutes} minutos</strong>.
              </div>

              <!-- Aviso de Segurança -->
              <div style="background-color: #121520; border: 1px solid #1a2030; border-radius: 10px; padding: 12px 16px; font-size: 11px; line-height: 1.5; color: #6b7280; text-align: center;">
                Por motivos de segurança, nunca compartilhe este código. Se você não solicitou este agendamento, desconsidere este e-mail.
              </div>

            </td>
          </tr>

          <!-- Rodapé Oficial -->
          <tr>
            <td style="padding: 18px 32px; background-color: #0a0b10; border-top: 1px solid #161a26; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                Mensagem gerada pelo sistema de segurança Kito Arcade.<br>
                © 2026 Kito Expert • Infraestrutura Protegida
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
