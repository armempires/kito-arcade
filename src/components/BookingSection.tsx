import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, Clock, Calendar, Sparkles, ChevronLeft, ChevronRight, 
  Send, ShieldCheck, UserCheck, AlertCircle, Mail, X, RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
import { useEmailVerification } from '../hooks/useEmailVerification';
import { sendKitoBookingConfirmation } from '../services/kitoEmailService';

export interface Professional {
  id: string;
  name: string;
  avatar: string;
}

export const KITO_SERVICES = [
  { id: 's1', name: 'Agendamento Online & CRM', price: 0, tag: 'SOB CONSULTA // ESCOPO ABERTO' },
  { id: 's2', name: 'Desenvolvimento de sites modernos e landing pages 3D', price: 0, tag: 'SOB CONSULTA // ESCOPO ABERTO' },
  { id: 's3', name: 'Aplicativo Mobile (Android & iOS)', price: 0, tag: 'SOB CONSULTA // ESCOPO ABERTO' },
  { id: 's4', name: 'Sistemas de CRM & Gestão Comercial', price: 0, tag: 'SOB CONSULTA // ESCOPO ABERTO' },
  { id: 's5', name: 'Desenvolvimento de SaaS Multi-Tenant', price: 0, tag: 'SOB CONSULTA // ESCOPO ABERTO' },
  { id: 's6', name: 'Agentes de I.A & Chatbots (Direct do Instagram)', price: 0, tag: 'SOB CONSULTA // ESCOPO ABERTO' },
  { id: 's7', name: 'Gestão Orgânica + Automações de IA', price: 500, tag: 'A PARTIR DE R$ 500,00' },
  { id: 's8', name: 'Vídeos UGC (Alta Conversão)', price: 500, tag: 'A PARTIR DE R$ 500,00' },
  { id: 's9', name: 'Criativos de Imagem Avulsos', price: 300, tag: 'A PARTIR DE R$ 300,00' },
  { id: 's10', name: 'Automação Direct do Instagram e Comentários (Meta API)', price: 350, tag: 'R$ 350,00 POR MÊS' },
  { id: 's11', name: 'Automação WhatsApp Cloud API Oficial + MCP', price: 500, tag: 'R$ 500,00 POR MÊS' },
  { id: 's12', name: 'Combo Automação Total (Instagram + WhatsApp + MCP)', price: 700, tag: 'R$ 700,00 POR MÊS' },
];

const DEFAULT_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-kito',
    name: 'Kito Expert (Líder Técnico & Arquiteto)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'prof-dev',
    name: 'Engenheiro de Software Sênior',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'prof-growth',
    name: 'Especialista em Growth & IA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

type Step = 1 | 2 | 3 | 4 | 5;

interface BookingSectionProps {
  initialServiceName?: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ initialServiceName }) => {
  const [step, setStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<string>(initialServiceName || '');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional>(DEFAULT_PROFESSIONALS[0]);
  const [professionals, setProfessionals] = useState<Professional[]>(DEFAULT_PROFESSIONALS);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  
  // Client details
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  
  // OTP Email Verification
  const {
    sendVerificationCode,
    verifyCode,
    sending: sendingCode,
    verifying: verifyingCode,
    error: otpError,
    setError: setOtpError,
  } = useEmailVerification();

  const [emailVerified, setEmailVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setOtpError('Por favor informe um e-mail válido.');
      return;
    }
    const res = await sendVerificationCode(email);
    if (res.success) {
      setCodeSent(true);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.trim().length < 6) {
      setOtpError('Digite o código de 6 dígitos.');
      return;
    }
    const res = await verifyCode(email, verificationCode.trim());
    if (res.success) {
      setEmailVerified(true);
      setShowOtpModal(false);
      setCodeSent(false);
      setVerificationCode('');
      setError('');
    }
  };

  // Fetch real professionals from Supabase if available
  useEffect(() => {
    async function loadProfessionals() {
      try {
        const { data } = await supabase.from('professionals').select('*');
        if (data && data.length > 0) {
          setProfessionals(data.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar || DEFAULT_PROFESSIONALS[0].avatar
          })));
          setSelectedProfessional(data[0]);
        }
      } catch {
        // Fallback to default professionals
      }
    }
    loadProfessionals();
  }, []);

  // Update initial service if passed from parent
  useEffect(() => {
    if (initialServiceName) {
      setSelectedService(initialServiceName);
      // Auto-advance to step 2 if service matched
      setStep(2);
    }
  }, [initialServiceName]);

  // Generate 30 available days
  const dates = useMemo(() => {
    const arr: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d.toISOString().split('T')[0]);
    }
    return arr;
  }, []);

  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
    setStep(2);
  };

  const handleProfessionalSelect = (prof: Professional) => {
    setSelectedProfessional(prof);
    setStep(3);
  };

  const handleDateSelect = (d: string) => {
    setDate(d);
    setStep(4);
  };

  const handleTimeSelect = (t: string) => {
    setTime(t);
    setStep(5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone || !email || !date || !time) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }

    if (!emailVerified) {
      setError('Por favor valide seu e-mail com o código OTP de 6 dígitos antes de confirmar.');
      setShowOtpModal(true);
      if (email && !codeSent) {
        handleSendCode();
      }
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: bookingData, error: insertError } = await supabase.from('bookings').insert({
        service_name: selectedService || initialServiceName || 'Consultoria Geral',
        date,
        time,
        professional_id: selectedProfessional.id,
        professional_name: selectedProfessional.name,
        tutor_name: clientName,
        pet_name: projectName || 'Projeto sob medida',
        phone,
        email,
        notes,
        status: 'Pendente'
      }).select().maybeSingle();

      if (insertError) {
        console.warn('Erro Supabase ao inserir booking:', insertError);
      }

      // Upsert client record in CRM
      try {
        const cleanEmail = email.trim().toLowerCase();
        const { data: existingClientRows } = await supabase
          .from('clients')
          .select('id')
          .ilike('email', cleanEmail)
          .order('created_at', { ascending: false })
          .limit(1);

        const existingClient = existingClientRows && existingClientRows.length > 0 ? existingClientRows[0] : null;

        if (existingClient) {
          await supabase.from('clients').update({
            name: clientName,
            pet_name: projectName || 'Projeto sob medida',
            phone,
            email: cleanEmail,
          }).eq('id', existingClient.id);
        } else {
          await supabase.from('clients').insert({
            name: clientName,
            pet_name: projectName || 'Projeto sob medida',
            phone,
            email: cleanEmail,
          });
        }
      } catch (clientErr) {
        console.warn('Erro ao registrar cliente:', clientErr);
      }

      // Dispatch confirmation email via official Kito Email Service (Template Personalizado)
      try {
        const emailPayload = {
          clientName,
          serviceName: selectedService || initialServiceName || 'Consultoria Geral',
          professionalName: selectedProfessional.name,
          date,
          time,
          phone,
          email,
          notes,
          portalUrl: `${window.location.origin}/#portal`
        };

        const emailResult = await sendKitoBookingConfirmation(emailPayload, bookingData?.id);
        if (!emailResult.success) {
          console.warn('Aviso: Falha ao enviar e-mail de confirmação:', emailResult.error);
        }
      } catch (emailErr) {
        console.warn('Erro ao disparar envio de e-mail:', emailErr);
      }

      setConfirmed(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      setConfirmed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsLabel = ['Serviço', 'Profissional', 'Data', 'Horário', 'Confirmação'];

  return (
    <div className="w-full bg-[#0D0D10] border-2 border-[#C8FF00]/40 rounded-3xl p-4 sm:p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden text-white font-['Montserrat']">
      
      {/* Background neon glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8FF00]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-lime-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Stepper Progress Bar */}
      <div className="relative z-10 mb-8 sm:mb-12">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (s < step) setStep(s as Step);
                  }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all duration-300 relative ${
                    step >= s
                      ? 'bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.4)] scale-105'
                      : 'bg-[#18181C] border border-white/10 text-zinc-500'
                  }`}
                >
                  {step > s ? (
                    <Check className="w-5 h-5 text-black stroke-[3]" />
                  ) : (
                    <span>{s}</span>
                  )}
                </button>
                <span className={`text-[10px] sm:text-xs mt-2 font-black uppercase tracking-wider transition-colors ${
                  step >= s ? 'text-[#C8FF00]' : 'text-zinc-600'
                }`}>
                  {stepsLabel[s - 1]}
                </span>
              </div>

              {s < 5 && (
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full transition-all duration-500 ${
                    step > s ? 'bg-[#C8FF00] shadow-[0_0_10px_rgba(200,255,0,0.5)]' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SELEÇÃO DE SERVIÇO */}
      {step === 1 && !confirmed && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="text-center max-w-lg mx-auto mb-6">
            <span className="text-[11px] font-mono text-[#C8FF00] uppercase tracking-widest font-black block mb-1">
              ETAPA 01 // SELEÇÃO DO SERVIÇO
            </span>
            <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
              Qual solução você deseja agendar?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {KITO_SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleServiceSelect(s.name)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                  selectedService === s.name
                    ? 'border-[#C8FF00] bg-[#C8FF00]/10 text-white shadow-[0_0_20px_rgba(200,255,0,0.15)] scale-[1.02]'
                    : 'border-white/10 bg-[#141418] hover:border-[#C8FF00]/50 hover:bg-[#1a1a20] text-zinc-300'
                }`}
              >
                <p className="font-black text-sm sm:text-base text-white group-hover:text-[#C8FF00] transition-colors leading-snug">
                  {s.name}
                </p>
                <p className="font-['Anton'] text-xs uppercase tracking-wider mt-2.5 text-[#C8FF00]">
                  {s.tag}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: ESCOLHA DO PROFISSIONAL */}
      {step === 2 && !confirmed && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#C8FF00] uppercase tracking-widest font-black block mb-1">
                ETAPA 02 // ESPECIALISTA RESPONSÁVEL
              </span>
              <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                Escolha o Profissional
              </h3>
            </div>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white uppercase transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trocar Serviço</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {professionals.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProfessionalSelect(p)}
                className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 relative overflow-hidden group ${
                  selectedProfessional.id === p.id
                    ? 'border-[#C8FF00] bg-[#C8FF00]/10 shadow-[0_0_20px_rgba(200,255,0,0.2)]'
                    : 'border-white/10 bg-[#141418] hover:border-white/30 hover:bg-[#1a1a20]'
                }`}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#C8FF00]/40 shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-black text-sm text-white truncate group-hover:text-[#C8FF00] transition-colors">
                    {p.name}
                  </p>
                  <span className="text-[11px] text-[#C8FF00] font-bold block mt-0.5">
                    Disponível para Sessão
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SELETOR DE DATA */}
      {step === 3 && !confirmed && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#C8FF00] uppercase tracking-widest font-black block mb-1">
                ETAPA 03 // CALENDÁRIO DISPONÍVEL
              </span>
              <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                Escolha o Dia do Atendimento
              </h3>
            </div>
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white uppercase transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {dates.map((d) => {
              const dateObj = new Date(d + 'T00:00:00');
              const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
              const day = dateObj.getDate();
              const isSelected = date === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDateSelect(d)}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'border-[#C8FF00] bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.4)] scale-105 font-black'
                      : 'border-white/10 bg-[#141418] hover:border-[#C8FF00]/40 text-zinc-300'
                  }`}
                >
                  <span className={`text-[11px] uppercase font-bold block ${isSelected ? 'text-black' : 'text-zinc-400'}`}>
                    {weekday}
                  </span>
                  <span className={`text-2xl font-black mt-1 block ${isSelected ? 'text-black' : 'text-white'}`}>
                    {day}
                  </span>
                  <span className={`text-[10px] block ${isSelected ? 'text-black/80' : 'text-zinc-500'}`}>
                    {dateObj.toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: SELETOR DE HORÁRIO */}
      {step === 4 && !confirmed && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#C8FF00] uppercase tracking-widest font-black block mb-1">
                ETAPA 04 // GRADE DE HORÁRIOS
              </span>
              <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                Escolha o Horário de Atendimento
              </h3>
            </div>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white uppercase transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trocar Data</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTimeSelect(t)}
                className={`py-4 px-4 rounded-xl border font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  time === t
                    ? 'border-[#C8FF00] bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.3)] scale-105'
                    : 'border-white/10 bg-[#141418] hover:border-[#C8FF00]/40 text-zinc-300 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: DADOS DO CLIENTE & CONFIRMAÇÃO */}
      {step === 5 && !confirmed && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in relative z-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#C8FF00] uppercase tracking-widest font-black block mb-1">
                ETAPA 05 // IDENTIFICAÇÃO & CONFIRMAÇÃO
              </span>
              <h3 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                Seus Dados para Contato
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white uppercase transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trocar Horário</span>
            </button>
          </div>

          {/* Resumo do Agendamento */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#141418] border border-[#C8FF00]/30 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 font-bold uppercase text-[10px] block">Serviço:</span>
              <span className="text-white font-black">{selectedService}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-bold uppercase text-[10px] block">Especialista:</span>
              <span className="text-white font-black">{selectedProfessional.name}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-bold uppercase text-[10px] block">Data:</span>
              <span className="text-[#C8FF00] font-black">{date}</span>
            </div>
            <div>
              <span className="text-zinc-500 font-bold uppercase text-[10px] block">Horário:</span>
              <span className="text-[#C8FF00] font-black">{time}</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulário de Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Seu Nome Completo *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Empresa ou Projeto
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Minha Startup / Marca"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                WhatsApp com DDD *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] transition-colors text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  E-mail para Confirmação *
                </label>
                {emailVerified ? (
                  <span className="text-[11px] font-black text-[#C8FF00] flex items-center gap-1 bg-[#C8FF00]/10 px-2 py-0.5 rounded-full border border-[#C8FF00]/30 animate-pulse">
                    <Check className="w-3 h-3 stroke-[3]" />
                    E-mail Validado (OTP)
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Requer código de 6 dígitos
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailVerified) setEmailVerified(false);
                    setCodeSent(false);
                  }}
                  placeholder="seuemail@empresa.com"
                  className={`w-full px-4 py-3 rounded-xl bg-black/60 border text-white placeholder-zinc-600 focus:outline-none transition-colors text-sm ${
                    emailVerified 
                      ? 'border-[#C8FF00]/60 bg-[#C8FF00]/5' 
                      : 'border-white/10 focus:border-[#C8FF00]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setOtpError('');
                    setShowOtpModal(true);
                    if (email && !codeSent && !emailVerified) {
                      handleSendCode();
                    }
                  }}
                  className={`px-4 sm:px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    emailVerified
                      ? 'bg-[#C8FF00]/20 border border-[#C8FF00] text-[#C8FF00]'
                      : 'bg-[#C8FF00] hover:bg-[#b5e600] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)] hover:scale-105 active:scale-95'
                  }`}
                >
                  {emailVerified ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Validado</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Validar OTP</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Observações / Objetivo do Projeto (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Conte brevemente o que deseja construir ou alcançar com a solução..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] transition-colors text-sm resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              emailVerified
                ? 'bg-[#C8FF00] hover:bg-[#b5e600] text-black shadow-[0_0_25px_rgba(200,255,0,0.4)] hover:scale-[1.01] active:scale-95'
                : 'bg-zinc-800 hover:bg-[#C8FF00] text-zinc-300 hover:text-black border border-white/10 hover:border-[#C8FF00]'
            }`}
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Confirmando Agendamento...</span>
              </>
            ) : !emailVerified ? (
              <>
                <Mail className="w-4 h-4" />
                <span>Validar E-mail & Concluir Agendamento</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 fill-black" />
                <span>Concluir & Agendar Reunião</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* CONFIRMAÇÃO DE SUCESSO */}
      {confirmed && (
        <div className="text-center py-10 sm:py-16 space-y-6 animate-fade-in relative z-10 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#C8FF00] text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(200,255,0,0.6)]">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-[#C8FF00] uppercase tracking-widest font-black block">
              SESSÃO CONFIRMADA COM SUCESSO
            </span>
            <h3 className="font-['Anton'] text-3xl uppercase tracking-wider text-white">
              Agendamento Concluído!
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Obrigado, <strong className="text-white">{clientName}</strong>! Sua sessão para <strong>{selectedService}</strong> foi agendada para <strong>{date} às {time}</strong> com <strong>{selectedProfessional.name}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs text-zinc-400 text-left space-y-1">
            <div className="flex items-center gap-2 text-white font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
              <span>Próximos Passos:</span>
            </div>
            <p>• Enviamos os detalhes e link de acesso para o e-mail: <strong className="text-[#C8FF00]">{email}</strong>.</p>
            <p>• Nossa equipe técnica também fará contato via WhatsApp: <strong className="text-[#C8FF00]">{phone}</strong>.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmed(false);
              setStep(1);
            }}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition-colors"
          >
            Fazer Outro Agendamento
          </button>
        </div>
      )}

      {/* MODAL DE VALIDAÇÃO OTP DE EMAIL (kito-agenda) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D0D10] border-2 border-[#C8FF00]/50 rounded-3xl shadow-[0_0_50px_rgba(200,255,0,0.25)] p-6 sm:p-8 max-w-md w-full text-white font-['Montserrat'] relative animate-fade-in">
            {/* Fechar */}
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false);
                setOtpError('');
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#C8FF00] text-black flex items-center justify-center shadow-[0_0_20px_rgba(200,255,0,0.4)]">
                <Mail className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#C8FF00] uppercase tracking-widest font-black block">
                  AUTENTICAÇÃO SEGURA // RESEND OTP
                </span>
                <h3 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
                  Validação de E-mail
                </h3>
              </div>
            </div>

            {!codeSent ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para proteger seu agendamento contra spam e garantir o envio das credenciais da reunião, enviaremos um código de 6 dígitos para o seu e-mail:
                </p>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Endereço de E-mail:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@empresa.com"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] text-sm"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || !email}
                  className="w-full py-3.5 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {sendingCode ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Enviando Código Seguro...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 fill-black" />
                      <span>Enviar Código OTP (6 Dígitos)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300">
                  Enviamos um código de verificação para:<br />
                  <strong className="text-[#C8FF00] text-sm font-mono block mt-1">{email}</strong>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2 text-center">
                    Digite os 6 dígitos abaixo:
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    placeholder="000000"
                    autoFocus
                    className="w-full py-3.5 rounded-xl bg-black/80 border-2 border-[#C8FF00]/50 text-white text-center text-3xl font-mono tracking-[0.35em] focus:outline-none focus:border-[#C8FF00] shadow-[0_0_20px_rgba(200,255,0,0.2)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={verifyingCode || verificationCode.trim().length < 6}
                  className="w-full py-3.5 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {verifyingCode ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Validando Código...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Validar & Confirmar E-mail</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setCodeSent(false);
                      setVerificationCode('');
                      setOtpError('');
                    }}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Trocar e-mail
                  </button>

                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="text-[#C8FF00] hover:underline font-bold"
                  >
                    {sendingCode ? 'Reenviando...' : 'Reenviar código'}
                  </button>
                </div>
              </div>
            )}

            {otpError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
