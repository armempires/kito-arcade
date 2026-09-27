// _shared/asaas.ts — Cliente da API REST do Asaas v3
const baseUrl = (Deno.env.get("ASAAS_BASE_URL") ?? "https://api-sandbox.asaas.com").replace(/\/$/, "");

export type BillingType = "PIX" | "CREDIT_CARD";

export async function asaas<T>(path: string, init: RequestInit): Promise<T> {
  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) throw new Error("ASAAS_API_KEY não configurada nos secrets do Supabase.");
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      access_token: apiKey,
      accept: "application/json",
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Asaas error response:", JSON.stringify({ status: response.status, body }));
    const message = body?.errors?.map((item: { description?: string }) => item.description).filter(Boolean).join("; ");
    throw new Error(message || body?.message || `Asaas retornou HTTP ${response.status}`);
  }
  return body as T;
}

export async function createCustomer(input: { name: string; email: string; phone?: string; cpfCnpj?: string }) {
  return asaas<{ id: string }>("/v3/customers", { 
    method: "POST", 
    body: JSON.stringify({ ...input, notificationDisabled: false }) 
  });
}

export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
}

export async function createPayment(input: {
  customer: string;
  billingType: BillingType;
  value: number;
  dueDate: string;
  description?: string;
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
  remoteIp?: string;
}) {
  return asaas<{ id: string; status: string; value: number; netValue: number }>("/v3/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPaymentPixQrCode(paymentId: string) {
  return asaas<{ encodedImage: string; payload: string; expirationDate: string }>(
    `/v3/payments/${encodeURIComponent(paymentId)}/pixQrCode`, 
    { method: "GET" }
  );
}
