import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle, Loader2, Mail, MessageCircle, X, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ManualBookingProfessional {
  id: string;
  name: string;
  avatar: string;
  email?: string;
}

interface ManualBookingService {
  id: string;
  name: string;
}

export interface ManualBookingRecord {
  id: string;
  service_name: string;
  date: string;
  time: string;
  professional_id: string;
  professional_name: string;
  tutor_name: string;
  pet_name: string;
  phone: string;
  email: string;
  notes: string;
  status: string;
  created_at: string;
}

interface ManualBookingModalProps {
  professional: ManualBookingProfessional;
  services: ManualBookingService[];
  initialDate: string;
  onClose: () => void;
  onCreated: (booking: ManualBookingRecord) => void;
}

interface ScheduleSlot {
  time: string;
  available: boolean;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  professional,
  services,
  initialDate,
  onClose,
  onCreated,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [petName, setPetName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<ManualBookingRecord | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      setLoadingSlots(true);
      setTime('');
      setError('');
      const javascriptDay = new Date(`${date}T00:00:00`).getDay();
      const dayOfWeek = javascriptDay === 0 ? 7 : javascriptDay;
      const [{ data: scheduleData }, { data: bookingData }] = await Promise.all([
        supabase
          .from('professional_schedules')
          .select('time, available')
          .eq('professional_id', professional.id)
          .eq('day_of_week', dayOfWeek)
          .eq('available', true)
          .order('time', { ascending: true }),
        supabase
          .from('bookings')
          .select('time, status')
          .eq('professional_id', professional.id)
          .eq('date', date),
      ]);

      if (!active) return;
      const occupied = new Set(
        (bookingData || [])
          .filter((booking: any) => booking.status !== 'Cancelado')
          .map((booking: any) => booking.time),
      );

      const availableSlots = (scheduleData || []).filter((slot: any) => !occupied.has(slot.time));
      // Fallback slots if none configured
      if (availableSlots.length === 0) {
        const defaultSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
          .filter(t => !occupied.has(t))
          .map(t => ({ time: t, available: true }));
        setSlots(defaultSlots);
      } else {
        setSlots(availableSlots);
      }
      setLoadingSlots(false);
    }

    if (date) loadAvailability();
    return () => {
      active = false;
    };
  }, [date, professional.id]);

  const canSubmit = useMemo(() => (
    !!serviceName && !!date && !!time && !!tutorName && !!phone
  ), [date, phone, serviceName, time, tutorName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          service_name: serviceName,
          date,
          time,
          professional_id: professional.id,
          professional_name: professional.name,
          tutor_name: tutorName,
          pet_name: petName || 'Projeto sob medida',
          phone,
          email,
          notes,
          status: 'Confirmado',
        })
        .select()
        .single();

      if (bookingError || !booking) {
        setError(bookingError?.message || 'Não foi possível criar o agendamento.');
        setSubmitting(false);
        return;
      }

      if (email || phone) {
        const cleanEmail = email?.trim().toLowerCase();
        let query = supabase.from('clients').select('id');
        if (cleanEmail && phone) {
          query = query.or(`email.ilike.${cleanEmail},phone.eq.${phone.trim()}`);
        } else if (cleanEmail) {
          query = query.ilike('email', cleanEmail);
        } else {
          query = query.eq('phone', phone.trim());
        }

        const { data: existingRows } = await query.order('created_at', { ascending: false }).limit(1);
        const existingClient = existingRows && existingRows.length > 0 ? existingRows[0] : null;

        if (existingClient) {
          await supabase.from('clients').update({ 
            name: tutorName, 
            pet_name: petName || 'Projeto', 
            phone, 
            email: cleanEmail || email 
          }).eq('id', existingClient.id);
        } else {
          await supabase.from('clients').insert({ 
            name: tutorName, 
            pet_name: petName || 'Projeto', 
            phone, 
            email: cleanEmail || email 
          });
        }
      }

      setCreatedBooking(booking);
      onCreated(booking);
      setMessage('Agendamento cadastrado com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao salvar.');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    if (!createdBooking || !phone) return;
    const whatsappPhone = phone.replace(/\D/g, '');
    const text = [
      `Olá, ${tutorName}!`,
      '',
      'Seu agendamento foi confirmado pela equipe do Kito Expert:',
      `Serviço: ${serviceName}`,
      `Data: ${date}`,
      `Horário: ${time}`,
      `Especialista: ${professional.name}`,
      petName ? `Projeto/Escopo: ${petName}` : '',
      notes ? `Observações: ${notes}` : '',
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/55${whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-['Montserrat']">
      <div className="bg-[#121216] border-2 border-[#C8FF00]/40 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto text-white">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#16161c] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3.5">
            <img 
              src={professional.avatar} 
              alt={professional.name} 
              className="w-11 h-11 rounded-xl object-cover border border-[#C8FF00]/40 shadow-sm" 
            />
            <div>
              <h2 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Agendamento Manual</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#C8FF00]/20 text-[#C8FF00] border border-[#C8FF00]/30">CRM</span>
              </h2>
              <p className="text-xs text-[#C8FF00] font-semibold">{professional.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!createdBooking ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Serviço Contratado *
                  </label>
                  <select
                    required
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                  >
                    <option value="" className="bg-[#121216]">Selecione um serviço</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.name} className="bg-[#121216]">
                        {s.name}
                      </option>
                    ))}
                    <option value="Gestão Orgânica + Automações de IA" className="bg-[#121216]">Gestão Orgânica + Automações de IA</option>
                    <option value="Vídeos UGC (Alta Conversão)" className="bg-[#121216]">Vídeos UGC (Alta Conversão)</option>
                    <option value="Criativos de Imagem Avulsos" className="bg-[#121216]">Criativos de Imagem Avulsos</option>
                    <option value="Desenvolvimento de Sites & Apps" className="bg-[#121216]">Desenvolvimento de Sites & Apps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Data da Sessão *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Horário Disponível *
                </label>
                {loadingSlots ? (
                  <p className="text-xs text-[#C8FF00] font-medium py-2">Consultando grade do especialista...</p>
                ) : (
                  <select
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                  >
                    <option value="" className="bg-[#121216]">Selecione um horário</option>
                    {slots.map((s) => (
                      <option key={s.time} value={s.time} className="bg-[#121216]">
                        {s.time}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={tutorName}
                    onChange={(e) => setTutorName(e.target.value)}
                    placeholder="Ex: Roberto Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    E-mail do Cliente
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@empresa.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Projeto / Empresa / Assunto
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Ex: Landing Page 3D"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Briefing / Observações
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes combinados via WhatsApp ou telefone..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8FF00] text-xs font-medium resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full py-3.5 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Gravando no Supabase...' : 'Confirmar Agendamento Manual'}
              </button>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
                Agendamento Cadastrado!
              </h3>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                O atendimento para <strong className="text-white">{tutorName}</strong> foi registrado para <strong className="text-[#C8FF00]">{date} às {time}</strong>.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Confirmação WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
