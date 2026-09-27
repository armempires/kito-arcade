// CRM Types — Kito Arcade
// Todos os tipos do sistema de agendamento, CRM e portal do cliente

import type { EsteiraStep } from '../data/esteirasData';

export type BookingStatus = 'Pendente' | 'Confirmado' | 'Em atendimento' | 'Concluído' | 'Cancelado';
export type PipelineId = 'app-software-jogos' | 'site-saas';
export type ServiceType = 'mensalidade' | 'avulso';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'anticipated';
export type PaymentMethod = 'pix' | 'credit_card' | 'boleto' | 'manual';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  display_order: number;
  image_url?: string;
}

export interface ProfessionalItem {
  id: string;
  name: string;
  avatar: string;
  email?: string;
}

export interface BookingItem {
  id: string;
  service_name: string;
  service_id?: string;
  date: string;
  time: string;
  professional_id: string;
  professional_name: string;
  tutor_name: string;
  pet_name: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  created_at: string;
}

// ─── Client (base + portal) ───────────────────────────────────────────────────
export interface ClientItem {
  id: string;

  // Campos base do agendamento
  name: string;
  pet_name: string;       // Demanda / assunto / projeto
  phone: string;
  email: string;
  created_at?: string;

  // Dados pessoais complementares
  whatsapp?: string;
  birth_date?: string;    // ISO date string
  cpf?: string;
  cnpj?: string;

  // Endereço completo
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;

  // Portal de acesso
  has_portal_access?: boolean;
  portal_user_id?: string;
  profile_completed?: boolean;

  // Observações do admin
  admin_notes?: string;
  contracted_domain?: string;
  contracted_hosting?: string;
  contracted_extras?: string;

  // Produto contratado
  contracted_service_type?: ServiceType;
  contracted_service_name?: string;
  contracted_total_value?: number;
  contracted_installments?: number;
  first_payment_date?: string;    // ISO date string

  // Esteira de entrega
  pipeline_id?: PipelineId;
  pipeline_current_step?: number;
  custom_pipeline_steps?: EsteiraStep[];

  // Contrato digital
  contract_accepted?: boolean;
  contract_accepted_at?: string;  // ISO datetime string
  contract_text?: string;         // snapshot HTML do contrato

  // Asaas
  asaas_customer_id?: string;
  asaas_subscription_id?: string;
}

// ─── Client Payment ───────────────────────────────────────────────────────────
export interface ClientPayment {
  id: string;
  client_id: string;
  due_date: string;               // ISO date string
  amount: number;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  paid_at?: string;               // ISO datetime string
  asaas_payment_id?: string;
  asaas_pix_qr_code?: string;     // base64
  asaas_pix_copy_paste?: string;  // copia e cola
  notes?: string;
  installment_number?: number;    // 1, 2, 3... | null para mensalidade
  created_at?: string;
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
export interface NewClientPortalForm {
  // Etapa 1
  name: string;
  email: string;
  whatsapp: string;
  temp_password: string;

  // Etapa 2
  contracted_service_type: ServiceType;
  contracted_service_name: string;
  contracted_total_value: number;
  contracted_installments: number;
  first_payment_date: string;
  pipeline_id: PipelineId;
}

export interface PixPaymentResult {
  encodedImage: string;   // base64
  payload: string;        // copia e cola
  expirationDate: string;
}
