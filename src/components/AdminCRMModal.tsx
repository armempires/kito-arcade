import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, LogOut, Calendar, Users, Mail, Phone,
  Search, CheckCircle, Clock, AlertCircle, 
  Trash2, RefreshCw, Lock, Sparkles, MessageCircle, ExternalLink, 
  UserCheck, ShieldCheck, Plus, Save, ChevronLeft, ChevronRight,
  Filter, Scissors, CalendarDays, Loader2, Maximize2, Minimize2,
  Globe, Server, FileText, CreditCard, ChevronUp, ChevronDown, Eye, KeyRound,
  LayoutGrid, CheckCircle2, Circle, Pencil, RotateCcw, Layers, Printer,
  Megaphone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { useProfessionalSchedules, ALL_TIME_SLOTS } from '../hooks/useProfessionalSchedules';
import { ManualBookingModal } from './ManualBookingModal';
import type { ClientItem, ClientPayment, PipelineId, ServiceType } from '../types/crm';
import { ESTEIRA_APP_SOFTWARE_JOGOS, ESTEIRA_SITE_SAAS, getEsteiraForProject, getClientSteps, type EsteiraStep } from '../data/esteirasData';
import { buildContractHTML } from '../hooks/useClientContract';
import { BlogAdminTab } from './blog/BlogAdminTab';
import { AdsAdminTab } from './ads/AdsAdminTab';

export type BookingStatus = 'Pendente' | 'Confirmado' | 'Em atendimento' | 'Concluído' | 'Cancelado';

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
  date: string;
  time: string;
  professional_id: string;
  professional_name: string;
  tutor_name: string; // Nome do Cliente
  pet_name: string;   // Assunto / Projeto
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  created_at: string;
}

const tagColors: Record<string, string> = {
  'Desenvolvimento': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Homologação': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Infraestrutura': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Multiplataforma': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Otimização': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Design de Lojas': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'ASO & Copy': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'Publicação': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Garantia': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Financeiro': 'bg-[#C8FF00]/20 text-[#C8FF00] border-[#C8FF00]/30',
  'Contrato & Dev': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Domínio': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Infra Web': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'Presença Digital': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Automação I.A': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Conteúdo': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Agendamento': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Suporte & Métricas': 'bg-green-500/20 text-green-300 border-green-500/30',
};

const AVAILABLE_TAGS = [
  'Desenvolvimento',
  'Homologação',
  'Infra Web',
  'Infraestrutura',
  'Multiplataforma',
  'Otimização',
  'Design de Lojas',
  'ASO & Copy',
  'Publicação',
  'Garantia',
  'Financeiro',
  'Contrato & Dev',
  'Domínio',
  'Presença Digital',
  'Automação I.A',
  'Conteúdo',
  'Agendamento',
  'Suporte & Métricas'
];

interface AdminCRMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'bookings' | 'services' | 'professionals' | 'clients' | 'blog' | 'ads';

export const AdminCRMModal: React.FC<AdminCRMModalProps> = ({ isOpen, onClose }) => {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab & Data states
  const [tab, setTab] = useState<TabType>('bookings');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Container Extended Display Mode (Full screen/viewport by default)
  const [isExtended, setIsExtended] = useState(true);

  // Filters for Bookings Tab
  const [bookingViewMode, setBookingViewMode] = useState<'month' | 'day'>('month');
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [professionalFilter, setProfessionalFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const prevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToToday = () => {
    const now = new Date();
    setCalendarMonth(now);
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  // Modals & Sub-views
  const [selectedProfessionalForSchedule, setSelectedProfessionalForSchedule] = useState<string | null>(null);
  const [selectedProfessionalForBooking, setSelectedProfessionalForBooking] = useState<string | null>(null);

  // States para Criação e Gestão de Clientes com Portal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientCreationMode, setClientCreationMode] = useState<'simple' | 'portal'>('simple');
  const [clientFormStep, setClientFormStep] = useState<1 | 2>(1);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [isCreatingPortalAccount, setIsCreatingPortalAccount] = useState(false);
  const [clientPaymentsMap, setClientPaymentsMap] = useState<Record<string, ClientPayment[]>>({});
  const [contractPreviewClient, setContractPreviewClient] = useState<ClientItem | null>(null);

  // Reset de Senha do Cliente
  const [resetPasswordModalClient, setResetPasswordModalClient] = useState<ClientItem | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Gestão de Etapas da Esteira (Cards Não-Sequenciais)
  const [pipelineManagerClient, setPipelineManagerClient] = useState<ClientItem | null>(null);
  const [editingStep, setEditingStep] = useState<{ index: number; step: EsteiraStep } | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepForm, setNewStepForm] = useState({
    title: '',
    description: '',
    tag: 'Desenvolvimento'
  });

  // Formulário do Novo Cliente
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    pet_name: '',
    temp_password: '',
    contracted_service_type: 'avulso' as ServiceType,
    contracted_service_name: '',
    contracted_total_value: 0,
    contracted_installments: 1,
    first_payment_date: new Date().toISOString().split('T')[0],
    pipeline_id: 'site-saas' as PipelineId,
    admin_notes: '',
    contracted_domain: '',
    contracted_hosting: '',
  });

  // Schedules Hook
  const {
    schedules,
    loading: schedulesLoading,
    createDefaultSchedules,
    toggleSlot,
    addSlot,
  } = useProfessionalSchedules(selectedProfessionalForSchedule || undefined);

  // Check Supabase session
  useEffect(() => {
    if (!isOpen) return;

    const checkAuth = async () => {
      setIsCheckingSession(true);
      try {
        const { data } = await supabase.auth.getSession();
        setSessionUser(data.session?.user || null);
      } catch (err) {
        console.error('Erro ao verificar sessão Supabase:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSessionUser(sess?.user || null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [isOpen]);

  // Load all CRM tables
  const loadCRMData = async () => {
    setIsLoadingData(true);
    try {
      const [sRes, profsRes, bksRes, clsRes] = await Promise.all([
        supabase.from('services').select('*').order('display_order', { ascending: true }),
        supabase.from('professionals').select('*').order('created_at', { ascending: true }),
        supabase.from('bookings').select('*').order('date', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
      ]);

      if (sRes.data) setServices(sRes.data as ServiceItem[]);
      if (profsRes.data) setProfessionals(profsRes.data as ProfessionalItem[]);
      if (bksRes.data) setBookings(bksRes.data as BookingItem[]);
      if (clsRes.data) setClients(clsRes.data as ClientItem[]);
    } catch (err) {
      console.error('Erro ao carregar dados do CRM:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (sessionUser && isOpen) {
      loadCRMData();
    }
  }, [sessionUser, isOpen]);

  const showSaved = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 3500);
  };

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos.' 
          : error.message);
      } else if (data.session) {
        const userRole = data.session.user.user_metadata?.role;
        if (userRole === 'client') {
          setLoginError('Acesso restrito a administradores. Use o portal do cliente.');
          await supabase.auth.signOut();
          return;
        }
        setSessionUser(data.session.user);
        showSaved('Autenticado com sucesso!');
      }
    } catch {
      setLoginError('Falha ao autenticar no Supabase.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
  };

  // ==========================================
  // 1. CRUD SERVIÇOS
  // ==========================================
  const updateServiceLocal = (id: string, field: keyof ServiceItem, value: any) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addService = async () => {
    const newService = {
      name: 'Novo Serviço / Pacote',
      description: 'Descrição do escopo do serviço...',
      price: 500,
      display_order: services.length + 1,
      image_url: '/assets/covers/card_mkt_organico.png'
    };

    const { data, error } = await supabase.from('services').insert(newService).select().single();
    if (!error && data) {
      setServices([...services, data as ServiceItem]);
      showSaved('Novo serviço adicionado!');
    } else {
      alert('Erro ao criar serviço: ' + (error?.message || 'Falha no banco.'));
    }
  };

  const saveService = async (s: ServiceItem) => {
    const { error } = await supabase.from('services').update({
      name: s.name,
      description: s.description,
      price: s.price,
      image_url: s.image_url,
      display_order: s.display_order
    }).eq('id', s.id);

    if (error) alert('Erro ao salvar serviço: ' + error.message);
    else showSaved(`Serviço "${s.name}" salvo com sucesso!`);
  };

  const deleteService = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente excluir o serviço "${name}"?`)) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) {
      setServices(services.filter(s => s.id !== id));
      showSaved('Serviço excluído.');
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  // ==========================================
  // 2. CRUD PROFISSIONAIS
  // ==========================================
  const updateProfessionalLocal = (id: string, field: keyof ProfessionalItem, value: string) => {
    setProfessionals(professionals.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addProfessional = async () => {
    const newProf = {
      name: 'Novo Consultor / Desenvolvedor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'especialista@kitoexpert.com'
    };

    const { data, error } = await supabase.from('professionals').insert(newProf).select().single();
    if (!error && data) {
      setProfessionals([...professionals, data as ProfessionalItem]);
      await createDefaultSchedules(data.id);
      showSaved('Profissional adicionado com grade padrão de horários!');
    } else {
      alert('Erro ao cadastrar profissional: ' + (error?.message || 'Falha no banco.'));
    }
  };

  const saveProfessional = async (p: ProfessionalItem) => {
    const { error } = await supabase.from('professionals').update({
      name: p.name,
      avatar: p.avatar,
      email: p.email
    }).eq('id', p.id);

    if (error) alert('Erro ao salvar profissional: ' + error.message);
    else showSaved(`Profissional "${p.name}" salvo com sucesso!`);
  };

  const deleteProfessional = async (id: string, name: string) => {
    // Verificar se o profissional possui agendamentos vinculados
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('professional_id', id);

    let confirmMsg = `Deseja realmente remover o profissional "${name}"?`;
    if (count && count > 0) {
      confirmMsg = `Atenção: O profissional "${name}" possui ${count} agendamento(s) vinculado(s).\n\nDeseja excluir o profissional juntamente com todos os seus agendamentos e horários vinculados?`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      // 1. Limpa os agendamentos e horários vinculados para não violar a chave estrangeira (FK)
      if (count && count > 0) {
        await supabase.from('bookings').delete().eq('professional_id', id);
        setBookings(prev => prev.filter(b => b.professional_id !== id));
      }
      await supabase.from('professional_schedules').delete().eq('professional_id', id);

      // 2. Remove o profissional da tabela
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (!error) {
        setProfessionals(professionals.filter(p => p.id !== id));
        if (selectedProfessionalForSchedule === id) setSelectedProfessionalForSchedule(null);
        showSaved(`Profissional "${name}" removido com sucesso.`);
      } else {
        alert('Erro ao excluir profissional: ' + error.message);
      }
    } catch (err: any) {
      alert('Erro inesperado ao excluir: ' + err.message);
    }
  };

  // ==========================================
  // 3. CRUD CLIENTES
  // ==========================================
  const updateClientLocal = (id: string, field: keyof ClientItem, value: any) => {
    setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addClient = () => {
    setClientCreationMode('contact');
    setClientFormStep(1);
    setNewClientForm({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      pet_name: '',
      temp_password: '',
      contracted_service_type: 'avulso',
      contracted_service_name: '',
      contracted_total_value: 0,
      contracted_installments: 1,
      first_payment_date: new Date().toISOString().split('T')[0],
      pipeline_id: 'pipeline-app-software-jogos',
      admin_notes: '',
      contracted_domain: '',
      contracted_hosting: '',
    });
    setIsClientModalOpen(true);
  };

  const saveClient = async (c: ClientItem) => {
    const cleanEmail = c.email?.trim().toLowerCase();
    if (cleanEmail) {
      const { data: duplicate } = await supabase
        .from('clients')
        .select('id, name')
        .ilike('email', cleanEmail)
        .neq('id', c.id)
        .limit(1);

      if (duplicate && duplicate.length > 0) {
        alert(`O e-mail "${cleanEmail}" já está em uso pelo cliente "${duplicate[0].name}".\n\nOperação cancelada para evitar duplicidade de e-mails.`);
        return;
      }
    }

    const { error } = await supabase.from('clients').update({
      name: c.name,
      pet_name: c.pet_name,
      phone: c.phone,
      email: cleanEmail || c.email,
      whatsapp: c.whatsapp,
      cpf: c.cpf,
      cnpj: c.cnpj,
      birth_date: c.birth_date,
      cep: c.cep,
      logradouro: c.logradouro,
      numero: c.numero,
      complemento: c.complemento,
      bairro: c.bairro,
      cidade: c.cidade,
      estado: c.estado,
      admin_notes: c.admin_notes,
      contracted_domain: c.contracted_domain,
      contracted_hosting: c.contracted_hosting,
      contracted_extras: c.contracted_extras,
      contracted_service_name: c.contracted_service_name,
      contracted_service_type: c.contracted_service_type,
      contracted_total_value: Number(c.contracted_total_value) || 0,
      contracted_installments: Number(c.contracted_installments) || 1,
      first_payment_date: c.first_payment_date,
      pipeline_id: c.pipeline_id,
      pipeline_current_step: c.pipeline_current_step,
      custom_pipeline_steps: c.custom_pipeline_steps
    }).eq('id', c.id);

    if (error) alert('Erro ao salvar cliente: ' + error.message);
    else showSaved(`Cliente "${c.name}" salvo com sucesso!`);
  };

  const deleteClient = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente excluir o cliente "${name}"?`)) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (!error) {
      setClients(clients.filter(c => c.id !== id));
      showSaved('Cliente removido.');
    } else {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  // Funções de Gestão de Etapas (Cards da Esteira Não-Sequencial)
  const toggleStepCompletion = async (client: ClientItem, stepNumber: number) => {
    const currentSteps = getClientSteps(client);
    const updatedSteps = currentSteps.map(s => 
      s.step === stepNumber ? { ...s, completed: !s.completed } : s
    );
    const completedCount = updatedSteps.filter(s => s.completed).length;

    const updatedClient: ClientItem = {
      ...client,
      custom_pipeline_steps: updatedSteps,
      pipeline_current_step: completedCount
    };

    setClients(prev => prev.map(c => c.id === client.id ? updatedClient : c));
    if (pipelineManagerClient?.id === client.id) {
      setPipelineManagerClient(updatedClient);
    }

    const { error } = await supabase
      .from('clients')
      .update({
        custom_pipeline_steps: updatedSteps,
        pipeline_current_step: completedCount
      })
      .eq('id', client.id);

    if (error) {
      alert('Erro ao atualizar etapa: ' + error.message);
    } else {
      const toggled = updatedSteps.find(s => s.step === stepNumber);
      showSaved(`Etapa "${toggled?.title}" ${toggled?.completed ? 'marcada como Concluída' : 'reaberta'}!`);
    }
  };

  const handleSaveEditedStep = async (stepNumber: number, newTitle: string, newDesc: string, newTag: string) => {
    if (!pipelineManagerClient) return;
    const currentSteps = getClientSteps(pipelineManagerClient);
    const updatedSteps = currentSteps.map(s => 
      s.step === stepNumber ? { ...s, title: newTitle.trim(), description: newDesc.trim(), tag: newTag.trim() } : s
    );

    const updatedClient: ClientItem = {
      ...pipelineManagerClient,
      custom_pipeline_steps: updatedSteps
    };

    setClients(prev => prev.map(c => c.id === pipelineManagerClient.id ? updatedClient : c));
    setPipelineManagerClient(updatedClient);
    setEditingStep(null);

    const { error } = await supabase
      .from('clients')
      .update({ custom_pipeline_steps: updatedSteps })
      .eq('id', pipelineManagerClient.id);

    if (error) {
      alert('Erro ao salvar etapa: ' + error.message);
    } else {
      showSaved('Etapa atualizada com sucesso!');
    }
  };

  const handleAddNewStep = async () => {
    if (!pipelineManagerClient) return;
    if (!newStepForm.title.trim()) {
      alert('Informe o título da etapa.');
      return;
    }

    const currentSteps = getClientSteps(pipelineManagerClient);
    const maxStep = currentSteps.length > 0 ? Math.max(...currentSteps.map(s => s.step || 0)) : 0;
    const newStepItem: EsteiraStep = {
      step: maxStep + 1,
      title: newStepForm.title.trim(),
      description: newStepForm.description.trim(),
      tag: newStepForm.tag.trim() || 'Desenvolvimento',
      completed: false
    };

    const updatedSteps = [...currentSteps, newStepItem];
    const updatedClient: ClientItem = {
      ...pipelineManagerClient,
      custom_pipeline_steps: updatedSteps
    };

    setClients(prev => prev.map(c => c.id === pipelineManagerClient.id ? updatedClient : c));
    setPipelineManagerClient(updatedClient);
    setIsAddingStep(false);
    setNewStepForm({ title: '', description: '', tag: 'Desenvolvimento' });

    const { error } = await supabase
      .from('clients')
      .update({ custom_pipeline_steps: updatedSteps })
      .eq('id', pipelineManagerClient.id);

    if (error) {
      alert('Erro ao adicionar etapa: ' + error.message);
    } else {
      showSaved(`Etapa "${newStepItem.title}" adicionada com sucesso!`);
    }
  };

  const handleDeleteStep = async (stepNumber: number) => {
    if (!pipelineManagerClient) return;
    const currentSteps = getClientSteps(pipelineManagerClient);
    const stepToDelete = currentSteps.find(s => s.step === stepNumber);
    if (!window.confirm(`Deseja realmente excluir a etapa "${stepToDelete?.title || stepNumber}"?`)) return;

    const updatedSteps = currentSteps.filter(s => s.step !== stepNumber);
    const completedCount = updatedSteps.filter(s => s.completed).length;

    const updatedClient: ClientItem = {
      ...pipelineManagerClient,
      custom_pipeline_steps: updatedSteps,
      pipeline_current_step: completedCount
    };

    setClients(prev => prev.map(c => c.id === pipelineManagerClient.id ? updatedClient : c));
    setPipelineManagerClient(updatedClient);

    const { error } = await supabase
      .from('clients')
      .update({
        custom_pipeline_steps: updatedSteps,
        pipeline_current_step: completedCount
      })
      .eq('id', pipelineManagerClient.id);

    if (error) {
      alert('Erro ao excluir etapa: ' + error.message);
    } else {
      showSaved('Etapa removida.');
    }
  };

  const handleRestoreDefaultSteps = async () => {
    if (!pipelineManagerClient) return;
    if (!window.confirm('Deseja restaurar todas as etapas originais da esteira padrão? Suas customizações serão sobrescritas.')) return;

    const defaultPipeline = getEsteiraForProject(pipelineManagerClient.pipeline_id === 'app-software-jogos' ? 'mobile' : undefined);
    const restoredSteps: EsteiraStep[] = defaultPipeline.steps.map(s => ({
      ...s,
      completed: false
    }));

    const updatedClient: ClientItem = {
      ...pipelineManagerClient,
      custom_pipeline_steps: restoredSteps,
      pipeline_current_step: 0
    };

    setClients(prev => prev.map(c => c.id === pipelineManagerClient.id ? updatedClient : c));
    setPipelineManagerClient(updatedClient);

    const { error } = await supabase
      .from('clients')
      .update({
        custom_pipeline_steps: restoredSteps,
        pipeline_current_step: 0
      })
      .eq('id', pipelineManagerClient.id);

    if (error) {
      alert('Erro ao restaurar padrão: ' + error.message);
    } else {
      showSaved('Etapas padrão restauradas!');
    }
  };

  // Funções legadas de Esteira e Pagamentos do Portal
  const advancePipelineStep = async (c: ClientItem, delta: number) => {
    const newStep = Math.max(0, (c.pipeline_current_step ?? 0) + delta);
    const { error } = await supabase
      .from('clients')
      .update({ pipeline_current_step: newStep })
      .eq('id', c.id);

    if (!error) {
      setClients(clients.map(item => item.id === c.id ? { ...item, pipeline_current_step: newStep } : item));
      showSaved(`Etapa atualizada para: Passo ${newStep}`);
    } else {
      alert('Erro ao atualizar etapa: ' + error.message);
    }
  };

  const loadClientPayments = async (clientId: string) => {
    const { data } = await supabase
      .from('client_payments')
      .select('*')
      .eq('client_id', clientId)
      .order('installment_number', { ascending: true });
    if (data) {
      setClientPaymentsMap(prev => ({ ...prev, [clientId]: data as ClientPayment[] }));
    }
  };

  const markPaymentPaidAdmin = async (paymentId: string, clientId: string) => {
    const { error } = await supabase
      .from('client_payments')
      .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'manual' })
      .eq('id', paymentId);

    if (!error) {
      showSaved('Parcela marcada como paga!');
      loadClientPayments(clientId);
    } else {
      alert('Erro ao marcar como pago: ' + error.message);
    }
  };

  // Criar Conta de Cliente com Portal Completo
  const handleCreatePortalClient = async () => {
    const cleanEmail = newClientForm.email.trim().toLowerCase();
    const cleanName = newClientForm.name.trim();

    if (!cleanName || !cleanEmail) {
      alert('Nome e E-mail são obrigatórios!');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      alert('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    setIsCreatingPortalAccount(true);
    try {
      // 0. VERIFICAÇÃO CRÍTICA DE DUPLICIDADE EM CLIENTES:
      // Impede cadastro caso o e-mail já exista no banco de dados
      const { data: existingInClients } = await supabase
        .from('clients')
        .select('id, name, email')
        .ilike('email', cleanEmail)
        .limit(1);

      if (existingInClients && existingInClients.length > 0) {
        alert(
          `O e-mail "${cleanEmail}" já está cadastrado no sistema para o cliente "${existingInClients[0].name}".\n\nNão é permitido cadastrar o mesmo e-mail novamente para evitar conflitos de login e recuperação de senha.`
        );
        setIsCreatingPortalAccount(false);
        return;
      }

      // Se for criação com portal, cria a credencial oficial no Supabase Auth
      let authUserId: string | null = null;
      if (clientCreationMode === 'portal') {
        const tempPassword = newClientForm.temp_password?.trim() || 'Kito@123456';
        if (tempPassword.length < 6) {
          alert('A senha provisória de acesso deve ter no mínimo 6 caracteres.');
          setIsCreatingPortalAccount(false);
          return;
        }

        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://syxdhtlxafgbxflkrddp.supabase.co';
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eGRodGx4YWZnYnhmbGtyZGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTY3MDcsImV4cCI6MjEwNDE3MjcwN30.avfziPMfvmzSdDtKGg9lwhE2v2r1S31hwjUwGT97nwg';

        // Cliente isolado do auth para não sobrescrever a sessão do gestor logado
        const tempAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: signUpData, error: signUpError } = await tempAuthClient.auth.signUp({
          email: cleanEmail,
          password: tempPassword,
          options: {
            data: {
              name: cleanName,
              role: 'client',
            },
          },
        });

        if (signUpError) {
          if (
            signUpError.message?.toLowerCase().includes('already') ||
            (signUpError as any).code === 'user_already_exists'
          ) {
            alert(
              `O e-mail "${cleanEmail}" já possui uma conta cadastrada no sistema. Por segurança, utilize outro e-mail ou vincule ao cliente existente.`
            );
            setIsCreatingPortalAccount(false);
            return;
          }
          console.warn('Aviso ao registrar credencial Auth do cliente:', signUpError.message);
        } else if (signUpData?.user?.id) {
          authUserId = signUpData.user.id;
        }
      }

      // 1. Inserir no clients com flag has_portal_access e portal_user_id
      const clientPayload = {
        name: cleanName,
        email: cleanEmail,
        phone: newClientForm.phone || newClientForm.whatsapp,
        whatsapp: newClientForm.whatsapp || newClientForm.phone,
        pet_name: newClientForm.contracted_service_name || newClientForm.pet_name || 'Projeto Customizado',
        has_portal_access: clientCreationMode === 'portal',
        portal_user_id: authUserId,
        contracted_service_type: newClientForm.contracted_service_type,
        contracted_service_name: newClientForm.contracted_service_name,
        contracted_total_value: Number(newClientForm.contracted_total_value) || 0,
        contracted_installments: Number(newClientForm.contracted_installments) || 1,
        first_payment_date: newClientForm.first_payment_date,
        pipeline_id: newClientForm.pipeline_id,
        pipeline_current_step: 1,
        admin_notes: newClientForm.admin_notes,
        contracted_domain: newClientForm.contracted_domain,
        contracted_hosting: newClientForm.contracted_hosting,
      };

      const { data: createdClient, error: clientErr } = await supabase
        .from('clients')
        .insert(clientPayload)
        .select()
        .single();

      if (clientErr || !createdClient) {
        throw new Error(clientErr?.message || 'Falha ao salvar cliente');
      }

      // 2. Se for criação com portal, criar cobranças iniciais (client_payments)
      if (clientCreationMode === 'portal') {
        const installments = Number(newClientForm.contracted_installments) || 1;
        const totalVal = Number(newClientForm.contracted_total_value) || 0;
        const installmentVal = installments > 0 ? Number((totalVal / installments).toFixed(2)) : totalVal;

        const paymentsToInsert = [];
        const baseDate = new Date(newClientForm.first_payment_date + 'T12:00:00');

        for (let i = 1; i <= installments; i++) {
          const d = new Date(baseDate);
          d.setMonth(d.getMonth() + (i - 1));
          paymentsToInsert.push({
            client_id: createdClient.id,
            due_date: d.toISOString().split('T')[0],
            amount: installmentVal,
            status: 'pending',
            installment_number: i,
          });
        }

        if (paymentsToInsert.length > 0) {
          await supabase.from('client_payments').insert(paymentsToInsert);
        }
      }

      setClients([createdClient as ClientItem, ...clients]);
      setIsClientModalOpen(false);
      showSaved(`Cliente "${createdClient.name}" cadastrado com sucesso!`);

      // Reset form
      setNewClientForm({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        pet_name: '',
        temp_password: '',
        contracted_service_type: 'avulso',
        contracted_service_name: '',
        contracted_total_value: 0,
        contracted_installments: 1,
        first_payment_date: new Date().toISOString().split('T')[0],
        pipeline_id: 'site-saas',
        admin_notes: '',
        contracted_domain: '',
        contracted_hosting: '',
      });
      setClientFormStep(1);
    } catch (err: any) {
      alert('Erro ao cadastrar cliente: ' + err.message);
    } finally {
      setIsCreatingPortalAccount(false);
    }
  };

  const handleResetClientPassword = async () => {
    if (!resetPasswordModalClient?.email) return;
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const SUPABASE_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
      const { data: { session } } = await supabase.auth.getSession();
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (anonKey) headers['apikey'] = anonKey;
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else if (anonKey) {
        headers['Authorization'] = `Bearer ${anonKey}`;
      }

      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/client-auth`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'reset_password',
          email: resetPasswordModalClient.email,
          password: newPasswordInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao redefinir senha');
      }

      showSaved(`Senha de "${resetPasswordModalClient.name}" redefinida com sucesso!`);
      setResetPasswordModalClient(null);
      setNewPasswordInput('');
    } catch (err: any) {
      alert('Erro ao alterar senha: ' + err.message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // ==========================================
  // 4. GESTÃO DE AGENDAMENTOS
  // ==========================================
  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (!error) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      showSaved(`Status atualizado para "${status}"!`);
    } else {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const deleteBooking = async (id: string, clientName: string) => {
    if (!window.confirm(`Deseja realmente excluir o agendamento de "${clientName}"?`)) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      setBookings(bookings.filter(b => b.id !== id));
      showSaved('Agendamento removido com sucesso!');
    } else {
      alert('Erro ao excluir agendamento: ' + error.message);
    }
  };

  // Counters for the selected date
  const dateBookings = useMemo(() => bookings.filter(b => b.date === selectedDate), [bookings, selectedDate]);
  const pendingCount = useMemo(() => dateBookings.filter(b => b.status === 'Pendente').length, [dateBookings]);
  const confirmedCount = useMemo(() => dateBookings.filter(b => b.status === 'Confirmado').length, [dateBookings]);
  const inProgressCount = useMemo(() => dateBookings.filter(b => b.status === 'Em atendimento').length, [dateBookings]);
  const completedCount = useMemo(() => dateBookings.filter(b => b.status === 'Concluído').length, [dateBookings]);

  // Calendar Days computation for Month View
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth(); // 0-indexed

    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Dom, 1=Seg...
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill a complete 7-day grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [calendarMonth]);

  // Bookings count by date (respecting professional and status filters)
  const bookingsCountByDate = useMemo(() => {
    const map: Record<string, { total: number; pending: number; confirmed: number; inProgress: number; completed: number; canceled: number }> = {};
    
    bookings.forEach(b => {
      if (professionalFilter !== 'Todos' && b.professional_name !== professionalFilter) {
        return;
      }
      if (statusFilter !== 'Todos' && b.status !== statusFilter) {
        return;
      }

      if (!map[b.date]) {
        map[b.date] = { total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0, canceled: 0 };
      }
      map[b.date].total += 1;
      if (b.status === 'Pendente') map[b.date].pending += 1;
      else if (b.status === 'Confirmado') map[b.date].confirmed += 1;
      else if (b.status === 'Em atendimento') map[b.date].inProgress += 1;
      else if (b.status === 'Concluído') map[b.date].completed += 1;
      else if (b.status === 'Cancelado') map[b.date].canceled += 1;
    });

    return map;
  }, [bookings, professionalFilter, statusFilter]);

  // Month statistics
  const monthStats = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth() + 1;
    const prefix = `${year}-${String(month).padStart(2, '0')}`;

    let total = 0;
    let pending = 0;
    let confirmed = 0;
    let inProgress = 0;
    let completed = 0;

    bookings.forEach(b => {
      if (!b.date.startsWith(prefix)) return;
      if (professionalFilter !== 'Todos' && b.professional_name !== professionalFilter) return;
      if (statusFilter !== 'Todos' && b.status !== statusFilter) return;

      total++;
      if (b.status === 'Pendente') pending++;
      else if (b.status === 'Confirmado') confirmed++;
      else if (b.status === 'Em atendimento') inProgress++;
      else if (b.status === 'Concluído') completed++;
    });

    return { total, pending, confirmed, inProgress, completed };
  }, [bookings, calendarMonth, professionalFilter, statusFilter]);

  const formattedMonth = useMemo(() => {
    const str = calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [calendarMonth]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] animate-fade-in font-['Montserrat'] ${
      isExtended
        ? 'bg-[#0E0E12] w-screen h-screen flex flex-col overflow-hidden text-white'
        : 'bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden text-white'
    }`}>
      
      {/* Modal Container (Exibição Estendida ou Janela) */}
      <div className={`flex flex-col overflow-hidden text-white relative transition-all duration-300 ${
        isExtended
          ? 'w-full h-full bg-[#0E0E12]'
          : 'bg-[#0E0E12] border-2 border-[#C8FF00]/40 rounded-3xl w-full max-w-6xl max-h-[94vh] shadow-[0_0_60px_rgba(0,0,0,0.95)]'
      }`}>
        
        {/* Floating Saved Toast Notification */}
        {savedMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#C8FF00] text-black px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 fill-black" />
            <span>{savedMsg}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#141418] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/40 flex items-center justify-center text-[#C8FF00] shadow-[0_0_15px_rgba(200,255,0,0.2)]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Anton'] text-lg sm:text-xl uppercase tracking-wider text-white">
                  Kito Expert <span className="text-[#C8FF00]">// Painel CRM</span>
                </h2>
                <span className="text-[9px] font-mono font-bold bg-[#C8FF00]/20 text-[#C8FF00] border border-[#C8FF00]/40 px-2 py-0.5 rounded uppercase">
                  Gestão Central
                </span>
                {isExtended && (
                  <span className="hidden sm:inline-block text-[9px] font-mono font-bold bg-white/10 text-zinc-300 border border-white/10 px-2 py-0.5 rounded uppercase">
                    Exibição Estendida
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Central oficial de agendamentos, clientes, serviços e especialistas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {sessionUser && (
              <>
                <button
                  onClick={loadCRMData}
                  disabled={isLoadingData}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                  title="Atualizar dados do Supabase"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-[#C8FF00]' : ''}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                  title="Encerrar sessão"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            )}

            {/* Alternador de Exibição Estendida / Janela */}
            <button
              onClick={() => setIsExtended(!isExtended)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer"
              title={isExtended ? "Modo Janela" : "Exibição Estendida (Tela Cheia)"}
            >
              {isExtended ? (
                <Minimize2 className="w-5 h-5 text-[#C8FF00]" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className={`flex-1 overflow-y-auto space-y-6 ${
          isExtended ? 'p-4 sm:p-6 lg:p-8 w-full' : 'p-4 sm:p-6'
        }`}>
          
          {/* Checking initial session */}
          {isCheckingSession ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-9 h-9 text-[#C8FF00] animate-spin mx-auto" />
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                Conectando à infraestrutura Supabase...
              </p>
            </div>
          ) : !sessionUser ? (
            
            /* TELA DE LOGIN SUPABASE AUTH */
            <div className="max-w-md mx-auto py-12 px-4 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#C8FF00]/10 border border-[#C8FF00]/40 text-[#C8FF00] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(200,255,0,0.25)]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-['Anton'] text-2xl uppercase tracking-wider text-white">
                  Autenticação Administrativa
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Digite suas credenciais de administrador cadastradas no Supabase para gerenciar agendamentos, clientes, serviços e equipe.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 bg-[#141418] border border-white/10 p-6 rounded-2xl shadow-xl">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kitoexpert.com"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#C8FF00] transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-[#C8FF00] transition-colors font-medium"
                  />
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingIn ? 'Autenticando...' : 'Entrar no Sistema'}
                </button>
              </form>
            </div>

          ) : (

            /* PAINEL COMPLETO DE GESTÃO CRM */
            <div className="space-y-6">

              {/* 4 Tabs de Navegação */}
              <div className="flex gap-2.5 overflow-x-auto pb-2 border-b border-white/10">
                {[
                  { id: 'bookings' as TabType, label: 'Agendamentos', icon: <CalendarDays className="w-4 h-4" />, count: bookings.length },
                  { id: 'services' as TabType, label: 'Serviços & Pacotes', icon: <Scissors className="w-4 h-4" />, count: services.length },
                  { id: 'professionals' as TabType, label: 'Profissionais & Equipe', icon: <Users className="w-4 h-4" />, count: professionals.length },
                  { id: 'clients' as TabType, label: 'Base de Clientes', icon: <Users className="w-4 h-4" />, count: clients.length },
                  { id: 'blog' as TabType, label: 'Blog & Artigos', icon: <FileText className="w-4 h-4" />, count: undefined },
                  { id: 'ads' as TabType, label: 'Anúncios & Banners', icon: <Megaphone className="w-4 h-4 text-emerald-400" />, count: undefined },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      tab === t.id
                        ? 'bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.3)] scale-[1.02]'
                        : 'bg-[#141418] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        tab === t.id ? 'bg-black text-[#C8FF00]' : 'bg-black/60 text-zinc-400'
                      }`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ====================================================
                  TAB 1: AGENDAMENTOS (Calendário Mensal & Pauta Diária)
                 ==================================================== */}
              {tab === 'bookings' && (
                <div className="space-y-6">
                  
                  {/* Barra Superior: Alternador de Visualização & Navegação de Mês/Dia */}
                  <div className="flex items-center justify-between flex-wrap gap-4 bg-[#141418] border border-white/10 p-4 rounded-2xl shadow-xl">
                    
                    {/* Botões de Alternância: Mês (Calendário) vs Dia (Pauta) */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-black/70 p-1 rounded-xl border border-white/10 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setBookingViewMode('month')}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            bookingViewMode === 'month'
                              ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)] scale-[1.02]'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Mês</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingViewMode('day')}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            bookingViewMode === 'day'
                              ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)] scale-[1.02]'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>Dia</span>
                        </button>
                      </div>

                      {/* Navegação de Mês / Dia */}
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          onClick={bookingViewMode === 'month' ? prevMonth : () => {
                            const d = new Date(selectedDate + 'T00:00:00');
                            d.setDate(d.getDate() - 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                          }}
                          className="p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#C8FF00]/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title={bookingViewMode === 'month' ? 'Mês anterior' : 'Dia anterior'}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 font-bold text-white text-xs sm:text-sm font-mono flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#C8FF00]" />
                          <span>
                            {bookingViewMode === 'month'
                              ? formattedMonth
                              : new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                  weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' 
                                })}
                          </span>
                        </div>

                        <button
                          onClick={bookingViewMode === 'month' ? nextMonth : () => {
                            const d = new Date(selectedDate + 'T00:00:00');
                            d.setDate(d.getDate() + 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                          }}
                          className="p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-[#C8FF00]/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title={bookingViewMode === 'month' ? 'Próximo mês' : 'Próximo dia'}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={goToToday}
                          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold font-mono transition-colors border border-white/10 cursor-pointer"
                          title="Voltar para a data de hoje"
                        >
                          Hoje
                        </button>
                      </div>
                    </div>

                    {/* Chips de Status (Mensal ou Diário) */}
                    <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
                      {bookingViewMode === 'month' ? (
                        <>
                          <span className="px-3 py-1.5 rounded-xl bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/40 shadow-sm">
                            Total no Mês: {monthStats.total}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Pendentes: {monthStats.pending}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Confirmados: {monthStats.confirmed}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Pendentes: {pendingCount}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-[#C8FF00]/15 text-[#C8FF00] border border-[#C8FF00]/40">
                            Confirmados: {confirmedCount}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                            Em atendimento: {inProgressCount}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Concluídos: {completedCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Filtros de Profissional e Status (Aplicam no Mês e no Dia) */}
                  <div className="flex items-center gap-3 flex-wrap bg-[#141418] border border-white/10 p-4 rounded-2xl shadow-xl">
                    <Filter className="w-4 h-4 text-[#C8FF00]" />
                    
                    {/* Filtro Profissional */}
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Profissional:
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {['Todos', ...professionals.map(p => p.name)].map(name => (
                        <button
                          key={name}
                          onClick={() => setProfessionalFilter(name)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            professionalFilter === name
                              ? 'bg-[#C8FF00] text-black shadow-md'
                              : 'bg-black/60 text-zinc-400 hover:text-white border border-white/5'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>

                    {/* Filtro Status */}
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 ml-3">
                      Status:
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {['Todos', 'Pendente', 'Confirmado', 'Em atendimento', 'Concluído', 'Cancelado'].map(status => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            statusFilter === status
                              ? 'bg-[#C8FF00] text-black shadow-md'
                              : 'bg-black/60 text-zinc-400 hover:text-white border border-white/5'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ====================================================
                      VISUALIZAÇÃO 1: CALENDÁRIO MENSAL (COMPACTO E QUADRADO LADO A LADO)
                     ==================================================== */}
                  {bookingViewMode === 'month' && (
                    <div className="flex flex-col md:flex-row gap-6 items-start justify-start w-full">
                      
                      {/* CARD 1: CALENDÁRIO QUADRADO (440px) */}
                      <div className="w-[440px] max-w-full flex-shrink-0 bg-[#141418] border border-white/10 p-3.5 rounded-2xl shadow-xl space-y-2">
                        
                        {/* Cabeçalho dos Dias da Semana */}
                        <div className="grid grid-cols-7 gap-1.5">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, idx) => (
                            <div 
                              key={dayName} 
                              className={`text-center py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border border-white/5 font-mono ${
                                idx === 0 || idx === 6 
                                  ? 'bg-[#C8FF00]/10 text-[#C8FF00] border-[#C8FF00]/20' 
                                  : 'bg-[#101014] text-zinc-400'
                              }`}
                            >
                              {dayName}
                            </div>
                          ))}
                        </div>

                        {/* Células de Dias do Mês (Células Quadradas aspect-square) */}
                        <div className="grid grid-cols-7 gap-1.5">
                          {calendarDays.map((cell) => {
                            const countData = bookingsCountByDate[cell.dateStr];
                            const hasBookings = countData && countData.total > 0;
                            const isSelected = selectedDate === cell.dateStr;

                            return (
                              <button
                                key={cell.dateStr}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(cell.dateStr);
                                  if (!cell.isCurrentMonth) {
                                    const [y, m] = cell.dateStr.split('-').map(Number);
                                    setCalendarMonth(new Date(y, m - 1, 1));
                                  }
                                }}
                                className={`aspect-square p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                                  !cell.isCurrentMonth
                                    ? 'opacity-20 bg-[#0b0b0e] border-white/5 hover:opacity-40'
                                    : isSelected
                                    ? 'border-[#C8FF00] bg-[#C8FF00]/10 shadow-[0_0_10px_rgba(200,255,0,0.2)] scale-[1.02] z-10'
                                    : hasBookings
                                    ? 'bg-[#16161c] border-white/15 hover:border-[#C8FF00]/50 hover:bg-[#1a1a22]'
                                    : 'bg-[#121216] border-white/5 hover:border-white/20 hover:bg-[#16161c]'
                                }`}
                              >
                                {/* Número do Dia */}
                                <div className="flex items-center justify-between w-full">
                                  <span className={`text-[11px] font-bold font-mono leading-none ${
                                    cell.isToday
                                      ? 'w-4 h-4 rounded-full bg-[#C8FF00] text-black flex items-center justify-center text-[9px] font-black'
                                      : isSelected
                                      ? 'text-[#C8FF00]'
                                      : cell.isCurrentMonth
                                      ? 'text-white'
                                      : 'text-zinc-600'
                                  }`}>
                                    {cell.dayNumber}
                                  </span>

                                  {cell.isToday && !isSelected && (
                                    <span className="hidden sm:inline text-[7px] font-mono text-[#C8FF00] font-black uppercase">
                                      Hoje
                                    </span>
                                  )}
                                </div>

                                {/* QUANTIDADE DE AGENDAMENTOS: Apenas exibido se houver agendamentos! */}
                                {hasBookings && (
                                  <div className="w-full">
                                    <div className="px-1 py-0.5 rounded bg-[#C8FF00] text-black font-black text-[8px] leading-tight text-center truncate shadow-[0_0_6px_rgba(200,255,0,0.2)]">
                                      {countData.total} {countData.total === 1 ? 'agend.' : 'agend.'}
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* CARD 2 (DIREITA): Sessões do Dia Clicado (Cards de agendamentos Lado a Lado) */}
                      <div className="flex-1 min-w-[320px] bg-[#141418] border border-white/10 p-3.5 rounded-2xl shadow-xl space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#C8FF00]" />
                            <h4 className="font-['Anton'] text-sm uppercase tracking-wider text-white">
                              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                weekday: 'short', day: '2-digit', month: 'short'
                              })}
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-[#C8FF00]/20 text-[#C8FF00] border border-[#C8FF00]/40 text-[10px] font-mono font-bold">
                              {dateBookings.length} {dateBookings.length === 1 ? 'sessão' : 'sessões'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setBookingViewMode('day')}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-[#C8FF00] hover:text-white transition-colors cursor-pointer border border-white/10"
                          >
                            <span>Ver Pauta</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Cards de Agendamento do Dia Selecionado (Exatamente o mesmo card quadrado do Modo Dia) */}
                        {dateBookings.length === 0 ? (
                          <div className="text-center py-8 text-zinc-500 text-xs">
                            Nenhum agendamento para este dia.<br />
                            <span className="text-[10px] text-zinc-600 block mt-1">
                              Clique em qualquer dia com agendamentos no calendário ao lado.
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-4 items-stretch justify-start max-h-[560px] overflow-y-auto pr-1">
                            {dateBookings
                              .filter(b => {
                                if (professionalFilter !== 'Todos' && b.professional_name !== professionalFilter) return false;
                                if (statusFilter !== 'Todos' && b.status !== statusFilter) return false;
                                return true;
                              })
                              .sort((a, b) => a.time.localeCompare(b.time))
                              .map((b) => {
                                const cleanPhone = (b.phone || '').replace(/\D/g, '');
                                const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${b.tutor_name}, aqui é da equipe do Kito Expert referente ao seu agendamento de "${b.service_name}".`)}` : null;

                                return (
                                  <div key={b.id} className="w-[300px] h-[280px] p-3.5 rounded-2xl border border-white/10 bg-black/60 shadow-lg hover:border-[#C8FF00]/40 transition-all flex flex-col justify-between flex-shrink-0">
                                    <div>
                                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                        <span className="text-xs font-black text-white flex items-center gap-1.5 font-mono">
                                          <Clock className="w-3.5 h-3.5 text-[#C8FF00]" /> {b.time}
                                        </span>
                                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                                          b.status === 'Confirmado'
                                            ? 'bg-[#C8FF00]/20 text-[#C8FF00] border-[#C8FF00]/50'
                                            : b.status === 'Pendente'
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                            : b.status === 'Concluído'
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                            : b.status === 'Cancelado'
                                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                                            : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                                        }`}>
                                          {b.status}
                                        </span>
                                      </div>

                                      <div className="text-xs space-y-1 text-zinc-300 pt-2">
                                        <p><strong className="text-zinc-400">Cliente:</strong> {b.tutor_name}</p>
                                        <p><strong className="text-zinc-400">Serviço:</strong> <span className="text-[#C8FF00] font-bold">{b.service_name}</span></p>
                                        {b.pet_name && b.pet_name !== 'Projeto sob medida' && (
                                          <p><strong className="text-zinc-400">Projeto:</strong> {b.pet_name}</p>
                                        )}
                                        {b.notes && (
                                          <p className="text-[10px] text-zinc-400 italic bg-black/40 px-2 py-1 rounded border border-white/5 line-clamp-2">
                                            "{b.notes}"
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Ações de Status */}
                                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 flex-wrap">
                                      {b.status === 'Pendente' && (
                                        <button
                                          onClick={() => updateBookingStatus(b.id, 'Confirmado')}
                                          className="flex-1 py-1.5 px-2 rounded-lg bg-[#C8FF00] text-black text-[11px] font-black uppercase tracking-wider hover:bg-[#b5e600] transition-colors cursor-pointer"
                                        >
                                          Confirmar
                                        </button>
                                      )}
                                      {b.status === 'Confirmado' && (
                                        <button
                                          onClick={() => updateBookingStatus(b.id, 'Em atendimento')}
                                          className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-cyan-400 transition-colors cursor-pointer"
                                        >
                                          Iniciar
                                        </button>
                                      )}
                                      {b.status === 'Em atendimento' && (
                                        <button
                                          onClick={() => updateBookingStatus(b.id, 'Concluído')}
                                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-emerald-400 transition-colors cursor-pointer"
                                        >
                                          Concluir
                                        </button>
                                      )}
                                      {b.status !== 'Cancelado' && b.status !== 'Concluído' && (
                                        <button
                                          onClick={() => {
                                            if (window.confirm('Cancelar este agendamento?')) updateBookingStatus(b.id, 'Cancelado');
                                          }}
                                          className="py-1.5 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
                                        >
                                          Cancelar
                                        </button>
                                      )}
                                      {waLink && (
                                        <a
                                          href={waLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                                          title="Chamar no WhatsApp"
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                      <button
                                        onClick={() => deleteBooking(b.id, b.tutor_name)}
                                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                        title="Excluir agendamento"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ====================================================
                      VISUALIZAÇÃO 2: PAUTA DIÁRIA AGRUPADA POR PROFISSIONAL
                     ==================================================== */}
                  {bookingViewMode === 'day' && (
                    <div className="space-y-6">
                      {professionals
                        .filter((p) => {
                          if (professionalFilter !== 'Todos' && p.name !== professionalFilter) return false;
                          if (statusFilter === 'Todos') return true;
                          return bookings.some(b => b.date === selectedDate && b.professional_id === p.id && b.status === statusFilter);
                        })
                        .map((prof) => {
                          const profBookings = bookings
                            .filter(b => b.date === selectedDate && b.professional_id === prof.id)
                            .filter(b => statusFilter === 'Todos' || b.status === statusFilter);

                          const sorted = [...profBookings].sort((a, b) => a.time.localeCompare(b.time));

                          return (
                            <div key={prof.id} className="bg-[#141418] rounded-2xl border border-white/10 p-5 space-y-5 shadow-xl w-full">
                              
                              {/* Card Top: Profissional + Botão Agendar Manual */}
                              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prof.avatar}
                                    alt={prof.name}
                                    className="w-12 h-12 rounded-2xl object-cover border border-[#C8FF00]/40 shadow-md"
                                  />
                                  <div>
                                    <h4 className="font-bold text-sm text-white">{prof.name}</h4>
                                    <p className="text-[11px] text-[#C8FF00] font-semibold">{sorted.length} agendamento(s)</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedProfessionalForBooking(prof.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8FF00]/15 hover:bg-[#C8FF00] text-[#C8FF00] hover:text-black font-black text-[11px] uppercase tracking-wider border border-[#C8FF00]/40 transition-all cursor-pointer shadow-sm"
                                  title="Inserir agendamento manual para este especialista"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Manual</span>
                                </button>
                              </div>

                              {/* Lista de Sessões do Dia em Grid Lado a Lado (Cards Quadrados e Proporcionais) */}
                              <div>
                                {sorted.length === 0 ? (
                                  <p className="text-xs text-zinc-500 text-center py-8">
                                    Nenhum agendamento para este dia.
                                  </p>
                                ) : (
                                  <div className="flex flex-wrap gap-4 items-stretch justify-start">
                                    {sorted.map((b) => {
                                      const cleanPhone = (b.phone || '').replace(/\D/g, '');
                                      const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${b.tutor_name}, aqui é da equipe do Kito Expert referente ao seu agendamento de "${b.service_name}".`)}` : null;

                                      return (
                                        <div key={b.id} className="w-[300px] h-[280px] p-3.5 rounded-2xl border border-white/10 bg-black/60 shadow-lg hover:border-[#C8FF00]/40 transition-all flex flex-col justify-between flex-shrink-0">
                                          <div>
                                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                              <span className="text-xs font-black text-white flex items-center gap-1.5 font-mono">
                                                <Clock className="w-3.5 h-3.5 text-[#C8FF00]" /> {b.time}
                                              </span>
                                              <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                                                b.status === 'Confirmado'
                                                  ? 'bg-[#C8FF00]/20 text-[#C8FF00] border-[#C8FF00]/50'
                                                  : b.status === 'Pendente'
                                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                                  : b.status === 'Concluído'
                                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                                  : b.status === 'Cancelado'
                                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                                                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                                              }`}>
                                                {b.status}
                                              </span>
                                            </div>

                                            <div className="text-xs space-y-1 text-zinc-300 pt-2">
                                              <p><strong className="text-zinc-400">Cliente:</strong> {b.tutor_name}</p>
                                              <p><strong className="text-zinc-400">Serviço:</strong> <span className="text-[#C8FF00] font-bold">{b.service_name}</span></p>
                                              {b.pet_name && b.pet_name !== 'Projeto sob medida' && (
                                                <p><strong className="text-zinc-400">Projeto:</strong> {b.pet_name}</p>
                                              )}
                                              {b.notes && (
                                                <p className="text-[10px] text-zinc-400 italic bg-black/40 px-2 py-1 rounded border border-white/5 line-clamp-2">
                                                  "{b.notes}"
                                                </p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Ações de Status Compactas */}
                                          <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 flex-wrap">
                                            {b.status === 'Pendente' && (
                                              <button
                                                onClick={() => updateBookingStatus(b.id, 'Confirmado')}
                                                className="flex-1 py-1.5 px-2 rounded-lg bg-[#C8FF00] text-black text-[11px] font-black uppercase tracking-wider hover:bg-[#b5e600] transition-colors cursor-pointer"
                                              >
                                                Confirmar
                                              </button>
                                            )}
                                            {b.status === 'Confirmado' && (
                                              <button
                                                onClick={() => updateBookingStatus(b.id, 'Em atendimento')}
                                                className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-cyan-400 transition-colors cursor-pointer"
                                              >
                                                Iniciar
                                              </button>
                                            )}
                                            {b.status === 'Em atendimento' && (
                                              <button
                                                onClick={() => updateBookingStatus(b.id, 'Concluído')}
                                                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-emerald-400 transition-colors cursor-pointer"
                                              >
                                                Concluir
                                              </button>
                                            )}
                                            {b.status !== 'Cancelado' && b.status !== 'Concluído' && (
                                              <button
                                                onClick={() => {
                                                  if (window.confirm('Cancelar este agendamento?')) updateBookingStatus(b.id, 'Cancelado');
                                                }}
                                                className="py-1.5 px-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
                                              >
                                                Cancelar
                                              </button>
                                            )}
                                            {waLink && (
                                              <a
                                                href={waLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                                                title="Chamar no WhatsApp"
                                              >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                              </a>
                                            )}
                                            <button
                                              onClick={() => deleteBooking(b.id, b.tutor_name)}
                                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                              title="Excluir agendamento"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* ====================================================
                  TAB 2: SERVIÇOS (Adicionar, Editar e Excluir Serviços)
                 ==================================================== */}
              {tab === 'services' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
                        Catálogo de Serviços Oficiais
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Edite valores, nomes e ordem de exibição ou insira novos serviços no Supabase.
                      </p>
                    </div>

                    <button
                      onClick={addService}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:bg-[#b5e600] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 fill-black" />
                      <span>Adicionar Serviço</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s) => (
                      <div key={s.id} className="bg-[#141418] rounded-2xl border border-white/10 shadow-xl p-5 space-y-4 hover:border-[#C8FF00]/40 transition-all flex flex-col justify-between">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                              Nome do Serviço
                            </label>
                            <input
                              type="text"
                              value={s.name}
                              onChange={(e) => updateServiceLocal(s.id, 'name', e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                              Descrição / Escopo
                            </label>
                            <textarea
                              rows={2}
                              value={s.description || ''}
                              onChange={(e) => updateServiceLocal(s.id, 'description', e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-medium resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                Preço Base (R$)
                              </label>
                              <input
                                type="number"
                                value={s.price}
                                onChange={(e) => updateServiceLocal(s.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                Ordem
                              </label>
                              <input
                                type="number"
                                value={s.display_order}
                                onChange={(e) => updateServiceLocal(s.id, 'display_order', parseInt(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                              URL da Imagem / Capa
                            </label>
                            <input
                              type="text"
                              value={s.image_url || ''}
                              onChange={(e) => updateServiceLocal(s.id, 'image_url', e.target.value)}
                              placeholder="/assets/covers/card_mkt_organico.png"
                              className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Botões Salvar e Excluir */}
                        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                          <button
                            onClick={() => saveService(s)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b5e600] transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5 fill-black" />
                            <span>Salvar</span>
                          </button>
                          <button
                            onClick={() => deleteService(s.id, s.name)}
                            className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer"
                            title="Excluir este serviço"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ====================================================
                  TAB 3: PROFISSIONAIS (Adicionar, Editar e Grade de Horários)
                 ==================================================== */}
              {tab === 'professionals' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
                        Equipe Técnica & Especialistas
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Edite nomes, fotos, e-mails ou clique em "Horários" para ativar ou pausar slots semanais de atendimento.
                      </p>
                    </div>

                    <button
                      onClick={addProfessional}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:bg-[#b5e600] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 fill-black" />
                      <span>Adicionar Profissional</span>
                    </button>
                  </div>

                  {/* Painel Expansível de Grade de Horários */}
                  {selectedProfessionalForSchedule && (
                    <div className="bg-[#16161c] rounded-2xl border-2 border-[#C8FF00]/50 shadow-2xl p-6 space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <Clock className="w-6 h-6 text-[#C8FF00]" />
                          <div>
                            <h3 className="font-bold text-base text-white">
                              Grade de Horários Semanais de Atendimento
                            </h3>
                            <p className="text-xs text-[#C8FF00] font-semibold">
                              Especialista: {professionals.find(p => p.id === selectedProfessionalForSchedule)?.name}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedProfessionalForSchedule(null)}
                          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {schedulesLoading ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 text-[#C8FF00] animate-spin mx-auto mb-2" />
                          <p className="text-xs text-zinc-400">Carregando slots da semana...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                            const daySlots = schedules.filter((s) => s.day_of_week === day);
                            const slotMap = new Map(daySlots.map((s) => [s.time, s]));
                            const dayNames = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

                            return (
                              <div key={day} className="bg-black/60 border border-white/10 rounded-xl p-3.5 space-y-2.5">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-[#C8FF00]">
                                  {dayNames[day]}-feira
                                </h4>

                                <div className="grid grid-cols-3 gap-1.5">
                                  {ALL_TIME_SLOTS.map((time) => {
                                    const slot = slotMap.get(time);
                                    if (slot) {
                                      return (
                                        <button
                                          key={time}
                                          type="button"
                                          onClick={() => toggleSlot(slot.id, !slot.available)}
                                          className={`px-1.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                            slot.available
                                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                              : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 line-through opacity-50'
                                          }`}
                                          title={slot.available ? 'Horário Ativo (clique para pausar)' : 'Horário Pausado (clique para ativar)'}
                                        >
                                          {time}
                                        </button>
                                      );
                                    }
                                    return (
                                      <button
                                        key={time}
                                        type="button"
                                        onClick={() => addSlot(selectedProfessionalForSchedule || '', day, time)}
                                        className="px-1.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/5 text-zinc-500 border border-dashed border-white/10 hover:border-[#C8FF00]/40 hover:text-white transition-all cursor-pointer"
                                        title="Clique para adicionar este slot"
                                      >
                                        {time}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grid de Profissionais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.map((p) => (
                      <div
                        key={p.id}
                        className={`bg-[#141418] rounded-2xl border p-5 space-y-4 shadow-xl transition-all flex flex-col justify-between ${
                          selectedProfessionalForSchedule === p.id
                            ? 'border-[#C8FF00] ring-2 ring-[#C8FF00]/30'
                            : 'border-white/10 hover:border-[#C8FF00]/40'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3.5 pb-3 border-b border-white/10">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#C8FF00]/40 shadow-md shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h3 className="font-bold text-sm text-white truncate">{p.name || 'Sem nome'}</h3>
                              <p className="text-xs text-zinc-400 truncate">{p.email || 'Sem e-mail'}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                Nome do Especialista
                              </label>
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => updateProfessionalLocal(p.id, 'name', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                E-mail Oficial
                              </label>
                              <input
                                type="email"
                                value={p.email || ''}
                                onChange={(e) => updateProfessionalLocal(p.id, 'email', e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                URL da Foto / Avatar
                              </label>
                              <input
                                type="text"
                                value={p.avatar}
                                onChange={(e) => updateProfessionalLocal(p.id, 'avatar', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Botões Salvar, Horários e Excluir */}
                        <div className="flex items-center gap-2 pt-3 border-t border-white/10 flex-wrap">
                          <button
                            onClick={() => saveProfessional(p)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b5e600] transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5 fill-black" />
                            <span>Salvar</span>
                          </button>

                          <button
                            onClick={() => setSelectedProfessionalForSchedule(selectedProfessionalForSchedule === p.id ? null : p.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedProfessionalForSchedule === p.id
                                ? 'bg-cyan-500 text-black shadow-md'
                                : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Horários</span>
                          </button>

                          <button
                            onClick={() => deleteProfessional(p.id, p.name)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer ml-auto"
                            title="Remover profissional"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ====================================================
                  TAB 4: CLIENTES (Com Suporte a Portal do Cliente)
                 ==================================================== */}
              {tab === 'clients' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
                        Base de Clientes & Portal
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Gerencie clientes, esteiras de entrega, status de pagamentos e contas do portal.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={addClient}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-white/80 font-bold text-xs hover:bg-white/10 transition-all cursor-pointer"
                        title="Cadastra apenas na lista de clientes, sem criar acesso ao portal"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Apenas Cadastrar</span>
                      </button>

                      <button
                        onClick={() => {
                          setClientCreationMode('portal');
                          setClientFormStep(1);
                          setIsClientModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:bg-[#b5e600] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 fill-black" />
                        <span>Criar Conta de Cliente</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((c) => {
                      const cleanPhone = (c.whatsapp || c.phone || '').replace(/\D/g, '');
                      const waLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;
                      const hasPortal = c.has_portal_access;
                      const isExpanded = expandedClientId === c.id;
                      const pipeline = getEsteiraForProject(c.pipeline_id === 'app-software-jogos' ? 'mobile' : undefined);
                      const currentStep = c.pipeline_current_step ?? 1;

                      return (
                        <div 
                          key={c.id} 
                          className={`bg-[#141418] rounded-2xl border shadow-xl p-5 space-y-4 transition-all flex flex-col justify-between ${
                            hasPortal ? 'border-[#C8FF00]/30 hover:border-[#C8FF00]/60' : 'border-white/10 hover:border-white/20'
                          } ${isExpanded ? 'lg:col-span-2 md:col-span-2' : ''}`}
                        >
                          <div className="space-y-3">
                            {/* Badges de Topo */}
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                hasPortal 
                                  ? 'bg-[#C8FF00]/15 text-[#C8FF00] border-[#C8FF00]/30' 
                                  : 'bg-zinc-800 text-zinc-400 border-white/5'
                              }`}>
                                {hasPortal ? '● Portal Ativo' : 'Apenas Contato'}
                              </span>

                              {c.contracted_service_type && (
                                <span className="text-[10px] text-zinc-400 uppercase font-mono">
                                  {c.contracted_service_type}
                                </span>
                              )}
                            </div>

                            {/* Informações Básicas */}
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                Nome do Cliente
                              </label>
                              <input
                                type="text"
                                value={c.name}
                                onChange={(e) => updateClientLocal(c.id, 'name', e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-bold"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                  Telefone / WhatsApp
                                </label>
                                <input
                                  type="text"
                                  value={c.whatsapp || c.phone || ''}
                                  onChange={(e) => {
                                    updateClientLocal(c.id, 'phone', e.target.value);
                                    updateClientLocal(c.id, 'whatsapp', e.target.value);
                                  }}
                                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                  E-mail Oficial
                                </label>
                                <input
                                  type="email"
                                  value={c.email || ''}
                                  onChange={(e) => updateClientLocal(c.id, 'email', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                                />
                              </div>
                            </div>

                            {/* Produto / Serviço Contratado */}
                            <div>
                              <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                Produto / Serviço
                              </label>
                              <input
                                type="text"
                                value={c.contracted_service_name || c.pet_name || ''}
                                onChange={(e) => {
                                  updateClientLocal(c.id, 'pet_name', e.target.value);
                                  updateClientLocal(c.id, 'contracted_service_name', e.target.value);
                                }}
                                placeholder="Landing Page 3D, App Mobile, etc."
                                className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-medium"
                              />
                            </div>

                            {/* Controle de Esteira (Se tiver Portal) */}
                            {hasPortal && (() => {
                              const steps = getClientSteps(c);
                              const total = steps.length;
                              const completed = steps.filter(s => s.completed).length;
                              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                              return (
                                <div className="p-3.5 bg-black/50 border border-white/10 rounded-xl space-y-2.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                                      <Layers className="w-3.5 h-3.5 text-[#C8FF00]" />
                                      Etapas da Esteira
                                    </span>
                                    <span className="text-[#C8FF00] font-mono font-bold">
                                      {completed}/{total} ({percent}%)
                                    </span>
                                  </div>

                                  {/* Barra de Progresso */}
                                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#C8FF00] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(200,255,0,0.5)]"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>

                                  {/* Botão de Abrir Gerenciador de Cards */}
                                  <button
                                    type="button"
                                    onClick={() => setPipelineManagerClient(c)}
                                    className="w-full py-2 px-3 bg-[#C8FF00]/15 hover:bg-[#C8FF00]/25 border border-[#C8FF00]/30 hover:border-[#C8FF00]/60 rounded-xl text-xs font-bold text-[#C8FF00] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.1)]"
                                  >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Gerenciar Cards da Esteira</span>
                                  </button>
                                </div>
                              );
                            })()}

                            {/* Detalhes Expandidos (Produto, Preço, Dados do Contrato, Domínio, Hospedagem e Pagamentos) */}
                            {isExpanded && (
                              <div className="space-y-4 pt-4 border-t border-white/10 text-xs animate-in fade-in duration-200">
                                
                                {/* 1. DADOS DO PRODUTO & PREÇO (EDITÁVEL PELO FRONT) */}
                                <div className="p-3.5 bg-black/40 border border-[#C8FF00]/20 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#C8FF00] flex items-center gap-1.5 uppercase font-mono">
                                      <CreditCard className="w-3.5 h-3.5" />
                                      Condições do Produto & Contrato
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      Editável pelo Gestor
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        Modalidade
                                      </label>
                                      <select
                                        value={c.contracted_service_type || 'avulso'}
                                        onChange={(e) => updateClientLocal(c.id, 'contracted_service_type', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs focus:outline-none focus:border-[#C8FF00]"
                                      >
                                        <option value="avulso" className="bg-[#141418] text-white">Produto Avulso (Parcelado)</option>
                                        <option value="mensalidade" className="bg-[#141418] text-white">Mensalidade Recorrente</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        Valor Total (R$)
                                      </label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={c.contracted_total_value ?? 0}
                                        onChange={(e) => updateClientLocal(c.id, 'contracted_total_value', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        Nº de Parcelas
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        max="48"
                                        value={c.contracted_installments ?? 1}
                                        onChange={(e) => updateClientLocal(c.id, 'contracted_installments', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        Primeiro Vencimento
                                      </label>
                                      <input
                                        type="date"
                                        value={c.first_payment_date ? c.first_payment_date.split('T')[0] : ''}
                                        onChange={(e) => updateClientLocal(c.id, 'first_payment_date', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        Nome de Exibição do Serviço
                                      </label>
                                      <input
                                        type="text"
                                        value={c.contracted_service_name || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'contracted_service_name', e.target.value)}
                                        placeholder="Ex: Landing Page 3D de Alta Conversão"
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* 2. DADOS DO CONTRATANTE PARA O CONTRATO */}
                                <div className="p-3.5 bg-black/30 border border-white/10 rounded-xl space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase font-mono">
                                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                                      Qualificação do Contratante (Contrato)
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      Jurídico / LGPD
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        CPF
                                      </label>
                                      <input
                                        type="text"
                                        value={c.cpf || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'cpf', e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        CNPJ (se PJ)
                                      </label>
                                      <input
                                        type="text"
                                        value={c.cnpj || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'cnpj', e.target.value)}
                                        placeholder="00.000.000/0000-00"
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                        Data de Nascimento
                                      </label>
                                      <input
                                        type="date"
                                        value={c.birth_date ? c.birth_date.split('T')[0] : ''}
                                        onChange={(e) => updateClientLocal(c.id, 'birth_date', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                  </div>

                                  {/* Endereço */}
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">CEP</label>
                                      <input
                                        type="text"
                                        value={c.cep || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'cep', e.target.value)}
                                        placeholder="00000-000"
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">Logradouro / Rua</label>
                                      <input
                                        type="text"
                                        value={c.logradouro || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'logradouro', e.target.value)}
                                        placeholder="Rua, Av, Alameda"
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">Número</label>
                                      <input
                                        type="text"
                                        value={c.numero || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'numero', e.target.value)}
                                        placeholder="123"
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">Bairro</label>
                                      <input
                                        type="text"
                                        value={c.bairro || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'bairro', e.target.value)}
                                        placeholder="Bairro"
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">Cidade</label>
                                      <input
                                        type="text"
                                        value={c.cidade || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'cidade', e.target.value)}
                                        placeholder="Campinas, São Paulo, etc."
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">Estado (UF)</label>
                                      <input
                                        type="text"
                                        value={c.estado || ''}
                                        onChange={(e) => updateClientLocal(c.id, 'estado', e.target.value)}
                                        placeholder="SP, RJ, MG"
                                        maxLength={2}
                                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white uppercase text-xs focus:outline-none focus:border-[#C8FF00]"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* 3. DOMÍNIO E HOSPEDAGEM */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                      Domínio Contratado
                                    </label>
                                    <input
                                      type="text"
                                      value={c.contracted_domain || ''}
                                      onChange={(e) => updateClientLocal(c.id, 'contracted_domain', e.target.value)}
                                      placeholder="exemplo.com.br"
                                      className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white font-mono text-xs focus:outline-none focus:border-[#C8FF00]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                      Hospedagem / Servidor
                                    </label>
                                    <input
                                      type="text"
                                      value={c.contracted_hosting || ''}
                                      onChange={(e) => updateClientLocal(c.id, 'contracted_hosting', e.target.value)}
                                      placeholder="Vercel, AWS, Supabase"
                                      className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 text-white text-xs focus:outline-none focus:border-[#C8FF00]"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold mb-1">
                                    Observações da Contratação (Visível no Portal)
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={c.admin_notes || ''}
                                    onChange={(e) => updateClientLocal(c.id, 'admin_notes', e.target.value)}
                                    placeholder="Orientações e escopo detalhado..."
                                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/60 text-white text-xs resize-none focus:outline-none focus:border-[#C8FF00]"
                                  />
                                </div>

                                {/* 4. Seção de Pagamentos do Cliente */}
                                <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white flex items-center gap-1.5">
                                      <CreditCard className="w-3.5 h-3.5 text-[#C8FF00]" />
                                      Parcelas & Cobranças
                                    </span>
                                    <button
                                      onClick={() => loadClientPayments(c.id)}
                                      className="text-[10px] text-[#C8FF00] hover:underline cursor-pointer"
                                    >
                                      Carregar / Atualizar
                                    </button>
                                  </div>

                                  {(clientPaymentsMap[c.id] || []).length === 0 ? (
                                    <p className="text-zinc-500 text-[11px] py-1">
                                      Clique em "Carregar" para ver as parcelas cadastradas.
                                    </p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                      {(clientPaymentsMap[c.id] || []).map((pay) => (
                                        <div key={pay.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-[11px]">
                                          <div>
                                            <span className="font-bold text-white">
                                              Parcela {pay.installment_number ?? 1}
                                            </span>
                                            <span className="text-zinc-400 ml-2">
                                              Venc: {pay.due_date}
                                            </span>
                                            <span className="text-zinc-300 font-mono ml-2">
                                              R$ {pay.amount.toFixed(2)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                              pay.status === 'paid' ? 'bg-green-500/20 text-[#C8FF00]' : 'bg-yellow-500/20 text-yellow-300'
                                            }`}>
                                              {pay.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </span>
                                            {pay.status !== 'paid' && (
                                              <button
                                                onClick={() => markPaymentPaidAdmin(pay.id, c.id)}
                                                className="px-2 py-0.5 bg-[#C8FF00] text-black font-bold text-[9px] rounded hover:bg-[#b5e600] cursor-pointer"
                                              >
                                                Confirmar
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Botões Salvar, Ver Contrato, WhatsApp, Detalhes e Excluir */}
                          <div className="flex items-center gap-2 pt-3 border-t border-white/10 flex-wrap">
                            <button
                              onClick={() => saveClient(c)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b5e600] transition-colors cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.2)]"
                            >
                              <Save className="w-3.5 h-3.5 fill-black" />
                              <span>Salvar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setContractPreviewClient(c);
                                loadClientPayments(c.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
                              title="Visualizar Contrato Oficial Preparado"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Ver Contrato</span>
                            </button>

                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                                title="Chamar no WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <button
                              onClick={() => {
                                const willExpand = !isExpanded;
                                setExpandedClientId(willExpand ? c.id : null);
                                if (willExpand) loadClientPayments(c.id);
                              }}
                              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-all cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              <span>{isExpanded ? 'Recolher' : 'Editar Produto & Dados'}</span>
                            </button>

                            {hasPortal && (
                              <button
                                type="button"
                                onClick={() => {
                                  setResetPasswordModalClient(c);
                                  setNewPasswordInput('');
                                }}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                                title="Redefinir Senha de Acesso do Cliente"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Redefinir Senha</span>
                              </button>
                            )}

                            <button
                              onClick={() => deleteClient(c.id, c.name)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer ml-auto"
                              title="Excluir cliente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ====================================================
                  TAB 5: BLOG & ARTIGOS DO ECOSSISTEMA
                 ==================================================== */}
              {tab === 'blog' && (
                <BlogAdminTab />
              )}

              {/* ====================================================
                  TAB 6: ANÚNCIOS DINÂMICOS & CAMPANHAS
                 ==================================================== */}
              {tab === 'ads' && (
                <AdsAdminTab />
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#101014] border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono">
            Kito Expert Ecosystem • CRM & Booking Engine
          </span>
          <span className="text-[11px] text-[#C8FF00]/80 font-mono">
            ● Supabase PostgreSQL Ativo
          </span>
        </div>

      </div>

      {/* Modal de Agendamento Manual */}
      {selectedProfessionalForBooking && (
        <ManualBookingModal
          professional={professionals.find((p) => p.id === selectedProfessionalForBooking)!}
          services={services}
          initialDate={selectedDate}
          onClose={() => setSelectedProfessionalForBooking(null)}
          onCreated={(booking) => {
            setBookings((current) => [booking as BookingItem, ...current]);
            showSaved('Agendamento manual registrado com sucesso!');
          }}
        />
      )}

      {/* Modal de Criação de Cliente com Portal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141418] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-['Anton'] text-lg uppercase tracking-wider text-white">
                  Cadastrar Cliente no CRM
                </h3>
                <p className="text-xs text-zinc-400">
                  {clientCreationMode === 'portal' ? 'Criação com acesso ao Portal do Cliente e Esteira' : 'Cadastro simples para controle interno'}
                </p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternância de Modo */}
            <div className="p-4 bg-black/40 border-b border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setClientCreationMode('portal');
                  setClientFormStep(1);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  clientCreationMode === 'portal'
                    ? 'bg-[#C8FF00] text-black shadow-md'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                ✓ Criar com Conta no Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientCreationMode('simple');
                  setClientFormStep(1);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  clientCreationMode === 'simple'
                    ? 'bg-[#C8FF00] text-black shadow-md'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                Apenas Cadastrar Contato
              </button>
            </div>

            {/* Formulário com Scroll */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {clientCreationMode === 'portal' && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${clientFormStep === 1 ? 'bg-[#C8FF00] text-black' : 'bg-white/10 text-zinc-400'}`}>
                    1. Dados Básicos
                  </span>
                  <span className="text-zinc-600">→</span>
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${clientFormStep === 2 ? 'bg-[#C8FF00] text-black' : 'bg-white/10 text-zinc-400'}`}>
                    2. Contrato & Esteira
                  </span>
                </div>
              )}

              {/* ETAPA 1 */}
              {(clientFormStep === 1 || clientCreationMode === 'simple') && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={newClientForm.name}
                      onChange={(e) => setNewClientForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: João da Silva"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        E-mail de Acesso *
                      </label>
                      <input
                        type="email"
                        value={newClientForm.email}
                        onChange={(e) => setNewClientForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="cliente@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        WhatsApp / Celular *
                      </label>
                      <input
                        type="text"
                        value={newClientForm.whatsapp}
                        onChange={(e) => setNewClientForm(f => ({ ...f, whatsapp: e.target.value, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white focus:outline-none focus:border-[#C8FF00] text-xs font-mono"
                      />
                    </div>
                  </div>

                  {clientCreationMode === 'portal' && (
                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Senha Temporária do Cliente
                      </label>
                      <input
                        type="text"
                        value={newClientForm.temp_password || 'Kito@123456'}
                        onChange={(e) => setNewClientForm(f => ({ ...f, temp_password: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-[#C8FF00] font-mono text-xs font-bold"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        O cliente usará essa senha para logar em /portal.
                      </span>
                    </div>
                  )}

                  {clientCreationMode === 'simple' && (
                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Demanda / Projeto Resumido
                      </label>
                      <input
                        type="text"
                        value={newClientForm.pet_name}
                        onChange={(e) => setNewClientForm(f => ({ ...f, pet_name: e.target.value }))}
                        placeholder="Site Institucional, Landing Page, etc."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ETAPA 2 (Apenas Portal) */}
              {clientCreationMode === 'portal' && clientFormStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                      Nome do Produto / Serviço Contratado *
                    </label>
                    <input
                      type="text"
                      value={newClientForm.contracted_service_name}
                      onChange={(e) => setNewClientForm(f => ({ ...f, contracted_service_name: e.target.value }))}
                      placeholder="Ex: Landing Page 3D + Tráfego Pago"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Modalidade
                      </label>
                      <select
                        value={newClientForm.contracted_service_type}
                        onChange={(e) => setNewClientForm(f => ({ ...f, contracted_service_type: e.target.value as ServiceType }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white text-xs"
                      >
                        <option value="avulso">Produto Avulso (Parcelado)</option>
                        <option value="mensalidade">Mensalidade Recorrente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Esteira de Produção
                      </label>
                      <select
                        value={newClientForm.pipeline_id}
                        onChange={(e) => setNewClientForm(f => ({ ...f, pipeline_id: e.target.value as PipelineId }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white text-xs"
                      >
                        <option value="site-saas">Site e SaaS (11 Etapas)</option>
                        <option value="app-software-jogos">App, Software e Jogos (10 Etapas)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Valor Total (R$)
                      </label>
                      <input
                        type="number"
                        value={newClientForm.contracted_total_value || ''}
                        onChange={(e) => setNewClientForm(f => ({ ...f, contracted_total_value: Number(e.target.value) }))}
                        placeholder="2500"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white font-mono text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Nº Parcelas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={newClientForm.contracted_installments}
                        onChange={(e) => setNewClientForm(f => ({ ...f, contracted_installments: Number(e.target.value) }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        1º Vencimento
                      </label>
                      <input
                        type="date"
                        value={newClientForm.first_payment_date}
                        onChange={(e) => setNewClientForm(f => ({ ...f, first_payment_date: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Domínio (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newClientForm.contracted_domain}
                        onChange={(e) => setNewClientForm(f => ({ ...f, contracted_domain: e.target.value }))}
                        placeholder="cliente.com.br"
                        className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                        Hospedagem (Opcional)
                      </label>
                      <input
                        type="text"
                        value={newClientForm.contracted_hosting}
                        onChange={(e) => setNewClientForm(f => ({ ...f, contracted_hosting: e.target.value }))}
                        placeholder="Vercel, AWS, etc."
                        className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-zinc-400 uppercase font-bold mb-1">
                      Observações da Contratação
                    </label>
                    <textarea
                      rows={2}
                      value={newClientForm.admin_notes}
                      onChange={(e) => setNewClientForm(f => ({ ...f, admin_notes: e.target.value }))}
                      placeholder="Detalhes para o contrato e painel do cliente..."
                      className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white text-xs resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ações do Rodapé do Modal */}
            <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between">
              {clientCreationMode === 'portal' && clientFormStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setClientFormStep(1)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold cursor-pointer"
                >
                  ◀ Voltar
                </button>
              ) : (
                <div />
              )}

              {clientCreationMode === 'portal' && clientFormStep === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!newClientForm.name.trim() || !newClientForm.email.trim()) {
                      alert('Preencha Nome e E-mail para avançar!');
                      return;
                    }
                    setClientFormStep(2);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider hover:bg-[#b5e600] cursor-pointer"
                >
                  Avançar para Contrato ▶
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreatePortalClient}
                  disabled={isCreatingPortalAccount}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C8FF00] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:bg-[#b5e600] disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingPortalAccount ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 fill-black" />
                  )}
                  <span>{isCreatingPortalAccount ? 'Salvando...' : 'Concluir Cadastro'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reset de Senha do Cliente */}
      {resetPasswordModalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141418] border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-['Anton'] text-lg uppercase tracking-wider text-white">
                  Redefinir Senha do Cliente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordModalClient(null)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="text-zinc-400">
                Cliente: <strong className="text-white">{resetPasswordModalClient.name}</strong>
              </p>
              <p className="text-zinc-400">
                E-mail: <strong className="text-[#C8FF00] font-mono">{resetPasswordModalClient.email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold">
                Nova Senha de Acesso
              </label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Ex: NovaSenha@123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-[#C8FF00] font-mono text-sm font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-zinc-500 block">
                Ao salvar, a senha do usuário será imediatamente substituída no Supabase Auth.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setResetPasswordModalClient(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleResetClientPassword}
                disabled={isResettingPassword || !newPasswordInput || newPasswordInput.length < 6}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
              >
                {isResettingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Save className="w-4 h-4 fill-black" />
                )}
                <span>{isResettingPassword ? 'Atualizando...' : 'Salvar Nova Senha'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerenciador de Etapas da Esteira (Cards Quadrados) */}
      {pipelineManagerClient && (() => {
        const client = pipelineManagerClient;
        const steps = getClientSteps(client);
        const total = steps.length;
        const completed = steps.filter(s => s.completed).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0E0E11] border border-[#C8FF00]/30 rounded-3xl w-full max-w-5xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
              {/* Top Header */}
              <div className="p-6 border-b border-white/10 bg-[#141418] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5 text-[#C8FF00]" />
                    </div>
                    <div>
                      <h3 className="font-['Anton'] text-xl uppercase tracking-wider text-white">
                        Gerenciador de Etapas da Esteira
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Cliente: <strong className="text-white">{client.name}</strong> •{' '}
                        <span className="text-[#C8FF00] font-medium">
                          {client.contracted_service_name || client.pet_name || 'Projeto'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingStep(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(200,255,0,0.25)] cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Nova Etapa</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreDefaultSteps}
                    title="Restaurar etapas padrão"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Restaurar Padrão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPipelineManagerClient(null);
                      setEditingStep(null);
                      setIsAddingStep(false);
                    }}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status and instructions bar */}
              <div className="px-6 py-3 bg-black/40 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Sparkles className="w-4 h-4 text-[#C8FF00]" />
                    <span>Progresso:</span>
                  </div>
                  <span className="font-mono font-bold text-[#C8FF00]">
                    {completed} de {total} concluídas ({percent}%)
                  </span>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C8FF00] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(200,255,0,0.5)]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400">
                  ⚡ Clique em <strong className="text-[#C8FF00]">"Marcar como Concluído"</strong> no card para atualizar em tempo real o portal do cliente.
                </div>
              </div>

              {/* Scrollable Square Cards Grid */}
              <div className="p-6 overflow-y-auto flex-1 max-h-[65vh]">
                {steps.length === 0 ? (
                  <div className="text-center py-16 text-zinc-500">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhuma etapa cadastrada para este cliente.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddingStep(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#C8FF00] text-black text-xs font-bold cursor-pointer"
                    >
                      Adicionar Primeira Etapa
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {steps.map((step, idx) => {
                      const isDone = Boolean(step.completed);

                      return (
                        <div
                          key={step.step || idx}
                          className={`rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 min-h-[210px] relative group ${
                            isDone
                              ? 'border-[#C8FF00]/40 bg-gradient-to-br from-[#C8FF00]/10 via-[#18181f] to-[#121216] shadow-[0_0_20px_rgba(200,255,0,0.06)]'
                              : 'border-white/10 bg-[#16161b] hover:border-white/20'
                          }`}
                        >
                          {/* Top: Tag + Action Icons */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                #{step.step || idx + 1}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColors[step.tag] ?? 'bg-white/10 text-white/50 border-white/10'}`}>
                                {step.tag}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                title="Editar Etapa"
                                onClick={() => setEditingStep({ index: idx, step: { ...step } })}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Excluir Etapa"
                                onClick={() => handleDeleteStep(step.step)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Middle: Title & Description */}
                          <div className="space-y-1.5 my-auto py-1">
                            <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${isDone ? 'text-white' : 'text-zinc-200'}`}>
                              {step.title}
                            </h4>
                            <p className={`text-xs leading-relaxed line-clamp-3 ${isDone ? 'text-zinc-300/80' : 'text-zinc-400'}`}>
                              {step.description}
                            </p>
                          </div>

                          {/* Bottom: The Direct 1-Click Confirmation Button */}
                          <div className="pt-3 mt-3 border-t border-white/5">
                            {isDone ? (
                              <button
                                type="button"
                                onClick={() => toggleStepCompletion(client, step.step)}
                                className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.35)] hover:bg-[#d6ff33] transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                <span>Concluído (Clique p/ Reabrir)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleStepCompletion(client, step.step)}
                                className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-zinc-300 hover:bg-[#C8FF00]/15 hover:border-[#C8FF00]/40 hover:text-[#C8FF00] transition-all cursor-pointer"
                              >
                                <Circle className="w-4 h-4 text-zinc-500 group-hover:text-[#C8FF00]" />
                                <span>Marcar como Concluído</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sub-Modal: Editar Etapa */}
      {editingStep && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141418] border border-[#C8FF00]/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#C8FF00]" />
                <h3 className="font-['Anton'] text-lg uppercase tracking-wider text-white">
                  Editar Etapa #{editingStep.step.step}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStep(null)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold mb-1">
                  Título da Etapa
                </label>
                <input
                  type="text"
                  value={editingStep.step.title}
                  onChange={(e) => setEditingStep({
                    ...editingStep,
                    step: { ...editingStep.step, title: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white text-xs font-bold focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold mb-1">
                  Descrição dos Entregáveis
                </label>
                <textarea
                  rows={3}
                  value={editingStep.step.description}
                  onChange={(e) => setEditingStep({
                    ...editingStep,
                    step: { ...editingStep.step, description: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-zinc-300 text-xs focus:outline-none focus:border-[#C8FF00] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold mb-1">
                  Tag / Categoria
                </label>
                <select
                  value={editingStep.step.tag}
                  onChange={(e) => setEditingStep({
                    ...editingStep,
                    step: { ...editingStep.step, tag: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-zinc-200 text-xs focus:outline-none focus:border-[#C8FF00]"
                >
                  {AVAILABLE_TAGS.map(tag => (
                    <option key={tag} value={tag} className="bg-[#141418] text-white">
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingStep(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveEditedStep(
                  editingStep.step.step,
                  editingStep.step.title,
                  editingStep.step.description,
                  editingStep.step.tag
                )}
                className="px-5 py-2 rounded-xl bg-[#C8FF00] hover:bg-[#d6ff33] text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.3)]"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Adicionar Nova Etapa */}
      {isAddingStep && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141418] border border-[#C8FF00]/40 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#C8FF00]" />
                <h3 className="font-['Anton'] text-lg uppercase tracking-wider text-white">
                  Nova Etapa da Esteira
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingStep(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold mb-1">
                  Título da Etapa
                </label>
                <input
                  type="text"
                  value={newStepForm.title}
                  onChange={(e) => setNewStepForm({ ...newStepForm, title: e.target.value })}
                  placeholder="Ex: Integração com Gateway de Pagamento"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-white text-xs font-bold focus:outline-none focus:border-[#C8FF00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold mb-1">
                  Descrição dos Entregáveis
                </label>
                <textarea
                  rows={3}
                  value={newStepForm.description}
                  onChange={(e) => setNewStepForm({ ...newStepForm, description: e.target.value })}
                  placeholder="Descreva o que será construído e entregue nesta etapa..."
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-zinc-300 text-xs focus:outline-none focus:border-[#C8FF00] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 uppercase font-bold mb-1">
                  Tag / Categoria
                </label>
                <select
                  value={newStepForm.tag}
                  onChange={(e) => setNewStepForm({ ...newStepForm, tag: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-black/60 text-zinc-200 text-xs focus:outline-none focus:border-[#C8FF00]"
                >
                  {AVAILABLE_TAGS.map(tag => (
                    <option key={tag} value={tag} className="bg-[#141418] text-white">
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddingStep(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddNewStep}
                disabled={!newStepForm.title.trim()}
                className="px-5 py-2 rounded-xl bg-[#C8FF00] hover:bg-[#d6ff33] text-black font-black text-xs uppercase tracking-wider disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.3)]"
              >
                Adicionar Etapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pré-visualização do Contrato Oficial Completo */}
      {contractPreviewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141418] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C8FF00]" />
                <div>
                  <h3 className="font-['Anton'] text-lg uppercase tracking-wider text-white">
                    Contrato Oficial — {contractPreviewClient.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Visualização formal com 10 cláusulas e assinatura homologada da Contratada
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const html = buildContractHTML(
                      contractPreviewClient,
                      clientPaymentsMap[contractPreviewClient.id] || []
                    );
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(`<!DOCTYPE html><html><head><title>Contrato — ${contractPreviewClient.name}</title><meta charset="utf-8"/><style>body{padding:20px;font-family:Arial,sans-serif}</style></head><body>${html}</body></html>`);
                      win.document.close();
                      win.print();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8FF00] text-black font-bold text-xs uppercase hover:bg-[#b5e600] transition-all cursor-pointer shadow-[0_0_15px_rgba(200,255,0,0.2)]"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContractPreviewClient(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(92vh-80px)] bg-white text-slate-900 rounded-b-2xl">
              <div
                dangerouslySetInnerHTML={{
                  __html: buildContractHTML(
                    contractPreviewClient,
                    clientPaymentsMap[contractPreviewClient.id] || []
                  )
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
