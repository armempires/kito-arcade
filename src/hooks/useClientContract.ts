import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ClientItem, ClientPayment } from '../types/crm';

interface ContractData {
  text: string;
  accepted: boolean;
  acceptedAt: string | null;
}

interface UseClientContractReturn {
  contract: ContractData | null;
  isLoading: boolean;
  error: string;
  generatePreview: (client: ClientItem, payments: ClientPayment[]) => string;
  acceptContract: (client: ClientItem, payments: ClientPayment[]) => Promise<boolean>;
}

// Gera o HTML do contrato oficial completo (10 cláusulas) com dados interpolados
export function buildContractHTML(client: ClientItem, payments: ClientPayment[]): string {
  const today = new Date().toLocaleDateString('pt-BR');
  const docType = client.cpf ? `CPF: ${client.cpf}` : `CNPJ: ${client.cnpj ?? '—'}`;
  const birthDateStr = client.birth_date ? new Date(client.birth_date + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
  
  const address = [
    client.logradouro ? `${client.logradouro}${client.numero ? ', nº ' + client.numero : ''}` : '',
    client.complemento,
    client.bairro,
    (client.cidade || client.estado) ? `${client.cidade ?? ''}/${client.estado ?? ''}` : '',
    client.cep ? `CEP: ${client.cep}` : '',
  ].filter(Boolean).join(', ');

  const isMensalidade = client.contracted_service_type === 'mensalidade';
  const serviceType = isMensalidade ? 'Mensalidade Recorrente' : 'Produto Avulso (Parcelado)';
  const serviceName = client.contracted_service_name || client.pet_name || 'Desenvolvimento de Sites / Software / SaaS';
  const totalValue = client.contracted_total_value ?? 0;
  const installmentsCount = client.contracted_installments ?? (payments.length > 0 ? payments.length : 1);
  const domainText = client.contracted_domain ? client.contracted_domain : 'Domínio indicado pelo CONTRATANTE';

  const installmentsHtml = payments.length > 0
    ? payments
        .map(p =>
          `<tr>
            <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center">${p.installment_number ?? '1'}</td>
            <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center">${new Date(p.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
            <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right">R$ ${p.amount.toFixed(2).replace('.', ',')}</td>
            <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center">
              <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;background:${p.status === 'paid' ? '#dcfce7;color:#166534' : '#fef9c3;color:#854d0e'}">
                ${p.status === 'paid' ? 'PAGO' : 'PENDENTE'}
              </span>
            </td>
          </tr>`
        ).join('')
    : `<tr>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center">1/${installmentsCount}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center">${today}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right">R$ ${totalValue.toFixed(2).replace('.', ',')}</td>
        <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center">
          <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold;background:#fef9c3;color:#854d0e">
            A COBRAR
          </span>
        </td>
      </tr>`;

  const isAccepted = client.contract_accepted;
  const acceptedDate = client.contract_accepted_at 
    ? new Date(client.contract_accepted_at).toLocaleString('pt-BR') 
    : 'Aguardando confirmação digital';

  return `
<div id="contract-print-area" style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:820px;margin:0 auto;color:#0f172a;line-height:1.7;padding:30px 20px;background:#ffffff">
  
  <div style="text-align:center;border-bottom:3px solid #C8FF00;padding-bottom:18px;margin-bottom:24px">
    <h1 style="font-size:20px;font-weight:900;text-transform:uppercase;color:#0f172a;margin:0 0 6px 0;letter-spacing:0.5px">
      CONTRATO DE PRESTAÇÃO DE SERVIÇOS
    </h1>
    <p style="font-size:12px;color:#64748b;margin:0;font-weight:600">
      KITO EXPERT • ECOSSISTEMA TECNOLÓGICO • EMISSÃO: ${today}
    </p>
  </div>

  <p style="font-size:13px;color:#334155;margin-bottom:20px">
    Pelo presente instrumento particular, têm entre si justo e contratado:
  </p>

  <!-- QUALIFICAÇÃO DAS PARTES -->
  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px">
    <p style="margin:0 0 12px 0">
      <strong style="color:#0f172a;text-transform:uppercase">CONTRATADA:</strong><br/>
      <strong>ISA APP - DESENVOLVIMENTO DE PROGRAMAS DE COMPUTADOR LTDA - EPP</strong> (Nome Fantasia: <strong>KITO EXPERT</strong>), pessoa jurídica de direito privado, inscrita no CNPJ sob o nº <strong>61.629.735/0001-73</strong>, com atendimento no Brasil e em âmbito global, neste ato representada por seu Sócio Administrador, <strong>CRISTOPHER RAMOS VIEIRA</strong>, brasileiro, inscrito no CPF sob o nº <strong>386.766.838-83</strong>, doravante denominada simplesmente <strong>CONTRATADA</strong>;
    </p>
    <div style="border-top:1px dashed #cbd5e1;padding-top:12px;margin-top:12px">
      <strong style="color:#0f172a;text-transform:uppercase">CONTRATANTE:</strong><br/>
      <strong>${client.name || 'Nome do Contratante'}</strong><br/>
      Documento: <strong>${docType}</strong> ${client.birth_date ? `| Nasc: <strong>${birthDateStr}</strong>` : ''}<br/>
      Endereço: <strong>${address || 'Conforme cadastro eletrônico do sistema'}</strong><br/>
      E-mail: <strong>${client.email || '—'}</strong> | WhatsApp/Telefone: <strong>${client.whatsapp || client.phone || '—'}</strong><br/>
      Doravante denominado(a) simplesmente <strong>CONTRATANTE</strong>.
    </div>
  </div>

  <p style="font-size:13px;color:#334155;margin-bottom:24px">
    As partes qualificadas acima celebram o presente contrato sob as cláusulas e condições seguintes:
  </p>

  <!-- CLÁUSULA 1 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA PRIMEIRA – DO OBJETO
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      1.1. O presente contrato tem por objeto a prestação de serviços de tecnologia pela <strong>CONTRATADA</strong> em favor do <strong>CONTRATANTE</strong>, referente a: <strong>${serviceName}</strong> (Modalidade: <strong>${serviceType}</strong>), compreendendo, conforme o escopo especificamente acordado:
    </p>
    <ul style="font-size:13px;margin:0;padding-left:24px;color:#334155">
      <li><strong>a) Criação e Desenvolvimento de Sites, Landing Pages de Alta Conversão e Plataformas SaaS;</strong></li>
      <li><strong>b) Desenvolvimento de Aplicativos Mobile (Android & iOS), Softwares Customizados e Jogos;</strong></li>
      <li><strong>c) Gestão de Redes Sociais, Produção de Conteúdo (Criativos de Imagem e Vídeos Reels/UGC) e Automação de Atendimento com Inteligência Artificial para o Direct do Instagram;</strong></li>
      <li><strong>d) Implantação e Configuração de Automações Digitais com Inteligência Artificial e Protocolo MCP via APIs Oficiais da Meta (Instagram Direct, Comentários e WhatsApp Business Cloud API), com servidor externo dedicado para processamento de Webhooks.</strong></li>
    </ul>
  </div>

  <!-- CLÁUSULA 2 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA SEGUNDA – DOS VALORES, FORMAS DE PAGAMENTO, ENCARGOS MORATÓRIOS E VALIDADE JURÍDICA IMEDIATA
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      2.1. O valor monetário total do projeto é de <strong>R$ ${totalValue.toFixed(2).replace('.', ',')}</strong>, distribuído em <strong>${installmentsCount}</strong> parcela(s)/cobrança(s), discriminadas no cronograma financeiro abaixo:
    </p>

    <table style="width:100%;border-collapse:collapse;margin:12px 0 14px 0;font-size:12px">
      <thead>
        <tr style="background:#f1f5f9;color:#0f172a">
          <th style="padding:8px 12px;border:1px solid #cbd5e1;text-align:center">Parcela</th>
          <th style="padding:8px 12px;border:1px solid #cbd5e1;text-align:center">Vencimento</th>
          <th style="padding:8px 12px;border:1px solid #cbd5e1;text-align:right">Valor</th>
          <th style="padding:8px 12px;border:1px solid #cbd5e1;text-align:center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${installmentsHtml}
      </tbody>
    </table>

    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      2.2. <strong>EFICÁCIA E VALIDADE DOS ACORDOS DIGITAIS:</strong> As partes estipulam expressamente que <strong>possuem plena validade jurídica e vinculatória todas as propostas comerciais, escopos, valores, prazos e condições financeiras ajustados por meio de mensagens eletrônicas (WhatsApp, Telegram), e-mail formal ou gravações/registros de chamadas telefônicas e videoconferências</strong>.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      2.3. O pagamento poderá ser liquidado via PIX, Boleto Bancário ou Cartão de Crédito parcelado através do gateway de pagamentos da <strong>CONTRATADA</strong> (Asaas / Stripe), com a devida emissão de recibo e nota fiscal de prestação de serviços.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      2.4. <strong>VALIDADE JURÍDICA A PARTIR DO PRIMEIRO PAGAMENTO:</strong> O presente contrato <strong>torna-se plena e imediatamente válido juridicamente a partir do pagamento do valor do serviço, seja este pagamento parcial (sinal, entrada ou primeira parcela) ou total (à vista)</strong>, vinculando formal e irrevogavelmente ambas as partes aos seus direitos e obrigações.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      2.5. <strong>DOS JUROS E MORA POR INADIMPLEMENTO:</strong> O não pagamento de mensalidades posteriores, parcelamentos decorrentes da compra do serviço, mensalidades de serviços recorrentes ou parcelas em aberto na data aprazada <strong>acarretará juros de 3% (três por cento) ao mês e multa/mora diária de 1% (um por cento) ao dia</strong> sobre o montante em atraso, sem prejuízo da suspensão cautelar dos serviços ou cobrança judicial e extrajudicial.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      2.6. <strong>DOS CUSTOS DE MENSAGERIA DO WHATSAPP CLOUD API (META):</strong> Na contratação de serviços de automação de WhatsApp via API Oficial, o <strong>CONTRATANTE</strong> declara plena ciência de que os custos de envio de mensagens ativas (iniciadas pela empresa através de templates aprovados) são faturados diretamente pela <strong>Meta Platforms, Inc.</strong> de acordo com sua tabela de tarifação por conversa (categorias de Marketing, Utilidade, Autenticação e Serviço). A <strong>CONTRATADA</strong> é responsável exclusivamente pela engenharia de software, integração técnica, configuração de servidor e implantação da lógica de automação, não respondendo pelos consumos e tarifas debitados pela operadora Meta na conta comercial do cliente.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      2.7. <strong>DOS PLANOS DE AUTOMAÇÃO (NATUREZA MENSAL E VIGÊNCIA DE 12 MESES):</strong> Os valores acordados para serviços e produtos de Automação (Instagram Direct e Comentários, WhatsApp Business Cloud API Oficial e Combo Automação Total) possuem natureza jurídica estrita de <strong>assinatura e mensalidade recorrente</strong>, e <strong>NÃO constituem taxa única de desenvolvimento ou pagamento por implantação</strong>. A contratação estabelece <strong>vigência e compromisso de fidelidade contratual mínima de 12 (doze) meses</strong> contados a partir da data de adesão/primeiro pagamento, garantindo a sustentação ininterrupta de servidor externo em nuvem, monitoramento de Webhooks oficiais da Meta e atualizações do protocolo MCP.
    </p>
  </div>

  <!-- CLÁUSULA 3 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA TERCEIRA – DO DOMÍNIO E SUA ANUIDADE VITAL
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      3.1. <strong>CUSTO E PERIODICIDADE ANUAL DO DOMÍNIO:</strong> O custo de registro e manutenção de domínio web (<strong>${domainText}</strong>) <strong>possui periodicidade anual</strong>.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      3.2. <strong>DA VITALIDADE DA ANUIDADE PARA DISPONIBILIDADE DO SISTEMA:</strong> O pagamento tempestivo da renovação anual do domínio é <strong>estritamente vital e obrigatório</strong> para que o site, plataforma SaaS ou qualquer sistema web desenvolvido permaneça online, ativo e disponível <strong>após os 12 (doze) meses da contratação</strong> efetuada no ato da formalização contratual.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      3.3. A <strong>CONTRATADA</strong> não se responsabiliza pela queda, indisponibilidade técnica ou perda de registro de domínio provocadas por inadimplência, atraso ou esquecimento do <strong>CONTRATANTE</strong> quanto ao pagamento de referida anuidade junto à entidade registradora oficial (ex: Registro.br, GoDaddy, Hostinger).
    </p>
  </div>

  <!-- CLÁUSULA 4 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA QUARTA – DAS ESTEIRAS OFICIAIS DE DESENVOLVIMENTO
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      4.1. A execução técnica dos serviços observará rigorosamente as Esteiras Oficiais de Metodologia da <strong>CONTRATADA</strong>, organizadas em cards e etapas monitoradas pelo Portal do Cliente:
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px;margin-bottom:8px">
      <strong>ESTEIRA OFICIAL: SITE E SAAS (10 ETAPAS):</strong><br/>
      1. Desenvolvimento + Envio do Contrato • 2. Aprovação e Ajustes • 3. Confirmação de Pagamento • 4. Compra de Domínio • 5. Configuração de Domínio e Hospedagem • 6. Criação de Rede Social • 7. Configuração de Chat com I.A (Direct do Instagram) • 8. Criação de Conteúdo • 9. Post ou Repost (Agendamento) • 10. Acompanhamento & Suporte Assistido.
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;font-size:12px">
      <strong>ESTEIRA OFICIAL: APP, SOFTWARE E JOGOS (9 ETAPAS):</strong><br/>
      1. Desenvolvimento do App • 2. Aprovação e Ajustes • 3. Configuração do Servidor • 4. Debug e Separação (Android, iOS, Desktop, Web) • 5. Criação de Manifest e Otimização para Plataformas • 6. Criação de Identidade Visual para Plataformas • 7. Criação de Texto e Descrições para Plataformas • 8. Envio do App para Plataformas • 9. Acompanhamento e Métricas Iniciais.
    </div>
  </div>

  <!-- CLÁUSULA 5 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA QUINTA – DA POLÍTICA DE CANCELAMENTO, REEMBOLSO E BONIFICAÇÃO DE MARKETING
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      5.1. <strong>PRAZO PARA SOLICITAÇÃO DE REEMBOLSO (7 DIAS):</strong> O <strong>CONTRATANTE</strong> possui o prazo improrrogável de até <strong>7 (sete) dias corridos</strong>, contados a partir da data de confirmação do primeiro pagamento, para solicitar formalmente o cancelamento e estorno do valor pago, com base no direito de arrependimento (Art. 49 do Código de Defesa do Consumidor).
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      5.2. <strong>PRAZO PARA PROCESSAMENTO E PAGAMENTO DO REEMBOLSO (30 DIAS):</strong> Caso a solicitação seja formalizada dentro do prazo improrrogável de 7 dias, a <strong>CONTRATADA</strong> terá o prazo de até <strong>30 (trinta) dias corridos</strong>, contados a partir do protocolo e homologação da solicitação, para auditar e efetivar a devolução monetária ao cliente via estorno na operadora do cartão de crédito ou transferência bancária.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      5.3. <strong>DA BONIFICAÇÃO DE 90 DIAS DE MARKETING NA COMPRA DE SITE:</strong><br/>
      <strong>a)</strong> Na contratação do serviço de Criação de Site ou Landing Page, o <strong>CONTRATANTE</strong> recebe como <strong>cortesia comercial e bonificação promocional gratuita 90 (noventa) dias</strong> do primeiro pacote de <em>Gestão Orgânica + Automações de IA</em>, composto por <strong>8 (oito) criativos de imagem e 2 (dois) vídeos Reels mensais</strong>, além de automação de chatbot com IA para o Direct do Instagram.<br/>
      <strong>b) DA DESVINCULAÇÃO E INDEPENDÊNCIA DOS SERVIÇOS:</strong> O pacote de marketing é concedido como bônus gratuito atrelado à campanha promocional de aquisição do site. <strong>Os serviços de Criação de Site e de Gestão de Marketing são jurídica e contratualmente desvinculados</strong>.<br/>
      <strong>c) DA OBRIGATORIEDADE DE QUITAÇÃO DO PARCELAMENTO DO SITE E INEXISTÊNCIA DE REEMBOLSO:</strong> Caso o <strong>CONTRATANTE</strong> venha a desistir, cancelar, rescindir ou optar por não utilizar o pacote de marketing bonificado antes ou durante o período de 90 dias, <strong>permanece a obrigação incondicional de pagar e concluir todas as parcelas acordadas da compra do site até a sua integral quitação</strong>. Em nenhuma hipótese haverá direito a reembolso, cancelamento de parcelas vincendas, estorno ou devolução de valores pagos pelo site, em virtude de o pacote de marketing ter sido fornecido a título inteiramente gratuito.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      5.4. <strong>DA RESCISÃO ANTECIPADA DOS PLANOS DE AUTOMAÇÃO E MULTA PRÓ-RATA:</strong><br/>
      Em conformidade com a cláusula 2.7, os planos de Automação possuem periodicidade mensal e fidelidade de <strong>12 (doze) meses</strong> a contar da adesão. Na hipótese de o <strong>CONTRATANTE</strong> solicitar o cancelamento, rescisão ou desistência do serviço de Automação antes de encerrado o prazo de 12 meses (ressalvado o prazo legal de arrependimento de 7 dias previsto no item 5.1), incidirá <strong>multa rescisória calculada de forma pró-rata equivalente a 30% (trinta por cento) do valor total das mensalidades vincendas restantes</strong> até a data final do contrato de 12 meses, a título de liquidação antecipada e compensação de custos de alocação de infraestrutura em nuvem e licenças de servidores já disponibilizados.
    </p>
  </div>

  <!-- CLÁUSULA 6 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA SEXTA – DA HOSPEDAGEM (VERCEL), BANCO DE DADOS (SUPABASE) E MANUTENÇÃO
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      6.1. <strong>ISENÇÃO DE MENSALIDADE DE HOSPEDAGEM:</strong> A <strong>CONTRATADA</strong> não cobra mensalidades fixas de hospedagem do <strong>CONTRATANTE</strong>. Todos os projetos são implantados e hospedados na infraestrutura global da <strong>Vercel</strong> e utilizam banco de dados em nuvem <strong>Supabase</strong>, ambos operando em seus planos gratuitos oficiais de alta performance.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      6.2. <strong>HIPÓTESES EXCEPCIONAIS DE CUSTOS DE INFRAESTRUTURA:</strong> O <strong>CONTRATANTE</strong> apenas arcará com custos de hospedagem e banco de dados diretamente junto aos respectivos provedores terceiros caso: a) Os provedores (Vercel ou Supabase) alterem suas políticas corporativas e passem a tarifar por seus serviços; b) O <strong>CONTRATANTE</strong> demande recursos ou clusterização que não existam no plano gratuito; c) O sistema exceda os limites de tráfego, requisições ou armazenamento da camada gratuita.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      6.3. <strong>MANUTENÇÃO PREVENTIVA PERIÓDICA (PRAZO MÁXIMO DE 3 MESES):</strong> A fim de garantir que o banco de dados e os arquivos permaneçam dentro da cota gratuita sem sofrer gargalos ou cobranças automáticas de excedente, a <strong>CONTRATADA</strong> recomenda expressamente a realização de <strong>serviço de manutenção técnica e limpeza periódica dos registros do banco de dados em prazo máximo de até 3 (três) meses</strong>.
    </p>
  </div>

  <!-- CLÁUSULA 7 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA SÉTIMA – DA PROPRIEDADE INTELECTUAL E ENTREGA DO CÓDIGO-FONTE
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      7.1. Mediante a quitação integral de todas as parcelas e valores contratados, a <strong>CONTRATADA</strong> concede e transfere ao <strong>CONTRATANTE</strong> a <strong>propriedade integral e perpétua do código-fonte desenvolvido sob medida</strong>, banco de dados e aplicações, ressalvadas bibliotecas de código aberto e componentes licenciados publicamente.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      7.2. O <strong>CONTRATANTE</strong> terá livre autonomia sobre sua aplicação, sem dependência de mensalidades de licença ou aprisionamento de software (lock-in).
    </p>
  </div>

  <!-- CLÁUSULA 8 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA OITAVA – DO ACEITE DIGITAL, VALIDADE ELETRÔNICA E COMPROMISSO
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      8.1. <strong>FORMA DO ACEITE DIGITAL:</strong> O aceite do presente contrato dá-se por <strong>via inteiramente digital e eletrônica</strong>, no qual o <strong>CONTRATANTE</strong> informará expressamente seu Nome Completo, número de CPF/CNPJ e Data de Nascimento via aplicativo de mensagens (WhatsApp, Telegram), e-mail formal ou pelo Portal do Cliente no ecossistema <strong>Kito Expert</strong> / <strong>Kito Arcade</strong>.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      8.2. Ao fornecer seus dados cadastrais e manifestar o aceite por qualquer dos meios digitais supramencionados, ou ao efetuar o pagamento parcial ou total do serviço, o <strong>CONTRATANTE</strong> declara ter lido, compreendido e se compromete a cumprir integralmente todas as cláusulas deste instrumento.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      8.3. As partes reconhecem a plena eficácia jurídica, autenticidade e força executiva deste contrato assinado eletronicamente, em estrita conformidade com o <strong>Art. 10, § 2º da Medida Provisória nº 2.200-2/2001</strong> e com a <strong>Lei Federal nº 14.063/2020</strong>.
    </p>
  </div>

  <!-- CLÁUSULA 9 -->
  <div style="margin-bottom:20px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA NONA – DA PROTEÇÃO DE DADOS (LGPD) E CONFIDENCIALIDADE
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      9.1. As partes obrigam-se a tratar dados pessoais em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), garantindo a finalidade exclusiva de execução dos serviços contratados.
    </p>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      9.2. Ambas as partes manterão confidencialidade irrestrita acerca de dados estratégicos, operacionais, lógicas de software e credenciais de acesso disponibilizadas durante a relação contratual.
    </p>
  </div>

  <!-- CLÁUSULA 10 -->
  <div style="margin-bottom:30px">
    <h3 style="font-size:14px;font-weight:800;color:#0f172a;border-left:4px solid #C8FF00;padding-left:10px;margin-bottom:8px;text-transform:uppercase">
      CLÁUSULA DÉCIMA – DO FORO DE ELEIÇÃO
    </h3>
    <p style="font-size:13px;margin:0 0 8px 0;text-align:justify">
      10.1. Para dirimir quaisquer controvérsias decorrentes da interpretação ou execução deste contrato, <strong>as partes elegem de comum acordo o Foro da Comarca de residência atual do Administrador da empresa CONTRATADA</strong>, com renúncia expressa a qualquer outro foro, por mais especial ou privilegiado que seja ou venha a ser.
    </p>
  </div>

  <p style="font-size:13px;color:#334155;text-align:center;margin-bottom:30px;font-style:italic">
    E, por estarem assim justas, contratadas e acordadas, as partes validam o presente instrumento particular por meio de aceite e registro eletrônico, produzindo de imediato seus efeitos jurídicos.
  </p>

  <!-- BLOCO DE ASSINATURAS OFICIAIS -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px;padding-top:20px;border-top:2px solid #e2e8f0">
    
    <!-- ASSINATURA DA CONTRATADA (PRÉ-SALVA E HOMOLOGADA) -->
    <div style="background:#f8fafc;border:2px solid #22c55e;border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <div style="display:inline-block;background:#dcfce7;color:#166534;font-size:10px;font-weight:800;text-transform:uppercase;padding:3px 10px;border-radius:20px;margin-bottom:10px">
        ✔ ASSINADO E HOMOLOGADO PELA CONTRATADA
      </div>
      <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:bold;color:#15803d;padding:8px 0;border-bottom:1px solid #cbd5e1;margin-bottom:8px">
        Cristopher Ramos Vieira
      </div>
      <p style="font-size:12px;font-weight:bold;color:#0f172a;margin:0">
        ISA APP - DESENVOLVIMENTO DE PROGRAMAS DE COMPUTADOR LTDA - EPP
      </p>
      <p style="font-size:11px;color:#475569;margin:2px 0 0 0">
        CNPJ: 61.629.735/0001-73<br/>
        Sócio Administrador: <strong>Cristopher Ramos Vieira</strong><br/>
        CPF: 386.766.838-83 • Kito Expert
      </p>
      <div style="margin-top:8px;font-size:10px;color:#16a34a;font-family:monospace">
        Autenticação: KRV-CERT-${(client.id || 'SYS').substring(0,8).toUpperCase()}-OK
      </div>
    </div>

    <!-- ASSINATURA DO CONTRATANTE -->
    <div style="background:#f8fafc;border:2px solid ${isAccepted ? '#22c55e' : '#f59e0b'};border-radius:10px;padding:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <div style="display:inline-block;background:${isAccepted ? '#dcfce7' : '#fef3c7'};color:${isAccepted ? '#166534' : '#92400e'};font-size:10px;font-weight:800;text-transform:uppercase;padding:3px 10px;border-radius:20px;margin-bottom:10px">
        ${isAccepted ? '✔ ASSINADO ELETRONICAMENTE' : '⏳ AGUARDANDO ASSINATURA DIGITAL'}
      </div>
      <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:bold;color:${isAccepted ? '#0f172a' : '#94a3b8'};padding:8px 0;border-bottom:1px solid #cbd5e1;margin-bottom:8px">
        ${isAccepted ? (client.name || 'Contratante') : 'Assinatura Pendente'}
      </div>
      <p style="font-size:12px;font-weight:bold;color:#0f172a;margin:0">
        ${client.name || 'CONTRATANTE'}
      </p>
      <p style="font-size:11px;color:#475569;margin:2px 0 0 0">
        ${docType}<br/>
        ${client.email || ''}<br/>
        ${client.whatsapp || client.phone || ''}
      </p>
      <div style="margin-top:8px;font-size:10px;color:${isAccepted ? '#16a34a' : '#94a3b8'};font-family:monospace">
        ${isAccepted ? `Aceite Digital: ${acceptedDate}` : 'Validação via Portal do Cliente Kito'}
      </div>
    </div>

  </div>

  <div style="margin-top:30px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:11px">
    Documento emitido eletronicamente pela Kito Expert • Amparado pela MP nº 2.200-2/2001 e Lei nº 14.063/2020.
  </div>

</div>`;
}

export function useClientContract(): UseClientContractReturn {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePreview = useCallback((client: ClientItem, payments: ClientPayment[]): string => {
    return buildContractHTML(client, payments);
  }, []);

  const acceptContract = useCallback(async (client: ClientItem, payments: ClientPayment[]): Promise<boolean> => {
    if (!client.portal_user_id && !client.id) return false;
    setError('');
    setIsLoading(true);

    const now = new Date().toISOString();
    const updatedClient: ClientItem = {
      ...client,
      contract_accepted: true,
      contract_accepted_at: now,
    };

    const html = buildContractHTML(updatedClient, payments);

    let query = supabase
      .from('clients')
      .update({
        contract_accepted: true,
        contract_accepted_at: now,
        contract_text: html,
      });

    if (client.portal_user_id) {
      query = query.eq('portal_user_id', client.portal_user_id);
    } else {
      query = query.eq('id', client.id);
    }

    const { error: err } = await query;

    setIsLoading(false);

    if (err) {
      setError('Erro ao registrar aceite do contrato.');
      return false;
    }

    setContract({ text: html, accepted: true, acceptedAt: now });
    return true;
  }, []);

  return { contract, isLoading, error, generatePreview, acceptContract };
}
