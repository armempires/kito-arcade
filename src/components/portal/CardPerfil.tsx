import React, { useState, useEffect } from 'react';
import { User, MapPin, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { ClientItem } from '../../types/crm';

interface CardPerfilProps {
  profile: ClientItem;
  onSave: (data: Partial<ClientItem>) => Promise<boolean>;
}

// Validação de CPF (módulo 11)
function validarCPF(cpf: string): boolean {
  const n = cpf.replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(n[i]) * (10 - i);
  let r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  if (r !== parseInt(n[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(n[i]) * (11 - i);
  r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  return r === parseInt(n[10]);
}

// Validação de CNPJ (módulo 11 com pesos oficiais da Receita Federal)
function validarCNPJ(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(n[i], 10) * weights1[i];
  }
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  if (d1 !== parseInt(n[12], 10)) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(n[i], 10) * weights2[i];
  }
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  return d2 === parseInt(n[13], 10);
}

function maskCPF(v: string) { return v.replace(/\D/g,'').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'); }
function maskCNPJ(v: string) { return v.replace(/\D/g,'').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5'); }
function maskCEP(v: string) { return v.replace(/\D/g,'').replace(/(\d{5})(\d{3})/,'$1-$2'); }

export const CardPerfil: React.FC<CardPerfilProps> = ({ profile, onSave }) => {
  const isComplete = profile.profile_completed;
  const [editAddress, setEditAddress] = useState(false);
  const [docType, setDocType] = useState<'cpf' | 'cnpj'>(profile.cpf ? 'cpf' : 'cnpj');

  const [form, setForm] = useState({
    cpf: profile.cpf ?? '',
    cnpj: profile.cnpj ?? '',
    birth_date: profile.birth_date ?? '',
    cep: profile.cep ?? '',
    logradouro: profile.logradouro ?? '',
    numero: profile.numero ?? '',
    complemento: profile.complemento ?? '',
    bairro: profile.bairro ?? '',
    cidade: profile.cidade ?? '',
    estado: profile.estado ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const buscarCEP = async () => {
    const cep = form.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setIsSearchingCEP(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({
          ...f,
          logradouro: data.logradouro ?? f.logradouro,
          bairro: data.bairro ?? f.bairro,
          cidade: data.localidade ?? f.cidade,
          estado: data.uf ?? f.estado,
        }));
      }
    } catch { /* ignora */ } finally {
      setIsSearchingCEP(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (docType === 'cpf') {
      if (!validarCPF(form.cpf)) e.doc = 'CPF inválido.';
    } else {
      if (!validarCNPJ(form.cnpj)) e.doc = 'CNPJ inválido.';
    }
    if (!form.birth_date) e.birth_date = 'Data de nascimento obrigatória.';
    else {
      const age = (Date.now() - new Date(form.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) e.birth_date = 'É necessário ter 18 anos ou mais.';
    }
    if (!form.logradouro.trim()) e.logradouro = 'Logradouro obrigatório.';
    if (!form.numero.trim()) e.numero = 'Número obrigatório.';
    if (!form.cidade.trim()) e.cidade = 'Cidade obrigatória.';
    if (!form.estado.trim()) e.estado = 'Estado obrigatório.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    const payload: Partial<ClientItem> = {
      birth_date: form.birth_date,
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado,
      profile_completed: true,
    };
    if (docType === 'cpf') payload.cpf = form.cpf.replace(/\D/g, '');
    else payload.cnpj = form.cnpj.replace(/\D/g, '');

    const ok = await onSave(payload);
    setIsSaving(false);
    if (ok) { setSuccessMsg('Perfil salvo com sucesso!'); setEditAddress(false); }
  };

  const fieldClass = (field: string) =>
    `w-full px-3 py-2 bg-black/40 border ${errors[field] ? 'border-red-500/60' : 'border-white/10'} rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C8FF00]/50 transition-all`;

  // ── Estado B: perfil completo ────────────────────────────────────────────────
  if (isComplete && !editAddress) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C8FF00]" />
            <h3 className="font-semibold text-white">Dados Cadastrais</h3>
          </div>
          <span className="flex items-center gap-1 text-xs text-[#C8FF00] bg-[#C8FF00]/10 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Completo
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-white/40">Nome</span><p className="text-white font-medium">{profile.name}</p></div>
          <div><span className="text-white/40">E-mail</span><p className="text-white">{profile.email}</p></div>
          <div><span className="text-white/40">WhatsApp</span><p className="text-white">{profile.whatsapp ?? profile.phone}</p></div>
          <div>
            <span className="text-white/40">{profile.cpf ? 'CPF' : 'CNPJ'}</span>
            <p className="text-white">{profile.cpf ? maskCPF(profile.cpf) : maskCNPJ(profile.cnpj ?? '')}</p>
          </div>
          {profile.birth_date && (
            <div><span className="text-white/40">Nascimento</span><p className="text-white">{new Date(profile.birth_date + 'T12:00:00').toLocaleDateString('pt-BR')}</p></div>
          )}
          <div className="sm:col-span-2">
            <span className="text-white/40">Endereço</span>
            <p className="text-white">{[profile.logradouro, profile.numero, profile.complemento, profile.bairro, `${profile.cidade}/${profile.estado}`, profile.cep].filter(Boolean).join(', ')}</p>
          </div>
        </div>
        <button
          onClick={() => setEditAddress(true)}
          className="mt-4 text-xs text-[#C8FF00]/70 hover:text-[#C8FF00] underline transition-colors"
        >
          Editar endereço
        </button>
      </div>
    );
  }

  // ── Estado A: completar perfil / editar endereço ─────────────────────────────
  return (
    <div className="bg-white/5 border border-[#C8FF00]/30 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-5 h-5 text-[#C8FF00]" />
        <h3 className="font-semibold text-white">
          {editAddress ? 'Editar Endereço' : 'Complete seu Perfil'}
        </h3>
      </div>
      {!editAddress && (
        <p className="text-white/50 text-sm mb-5">Preencha os dados abaixo para desbloquear todas as funcionalidades do portal.</p>
      )}

      <div className="space-y-4">
        {/* Documento (apenas no cadastro inicial) */}
        {!editAddress && (
          <div>
            <label className="block text-xs text-white/50 mb-2">Documento</label>
            <div className="flex gap-2 mb-2">
              {(['cpf', 'cnpj'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${docType === type ? 'bg-[#C8FF00] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
            {docType === 'cpf' ? (
              <input
                value={maskCPF(form.cpf)}
                onChange={e => set('cpf', e.target.value.replace(/\D/g,'').slice(0,11))}
                placeholder="000.000.000-00"
                maxLength={14}
                className={fieldClass('doc')}
              />
            ) : (
              <input
                value={maskCNPJ(form.cnpj)}
                onChange={e => set('cnpj', e.target.value.replace(/\D/g,'').slice(0,14))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={fieldClass('doc')}
              />
            )}
            {errors.doc && <p className="text-red-400 text-xs mt-1">{errors.doc}</p>}
          </div>
        )}

        {/* Data de nascimento (apenas no cadastro inicial) */}
        {!editAddress && (
          <div>
            <label className="block text-xs text-white/50 mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={form.birth_date}
              onChange={e => set('birth_date', e.target.value)}
              className={fieldClass('birth_date')}
            />
            {errors.birth_date && <p className="text-red-400 text-xs mt-1">{errors.birth_date}</p>}
          </div>
        )}

        {/* CEP */}
        <div>
          <label className="block text-xs text-white/50 mb-1">CEP</label>
          <div className="flex gap-2">
            <input
              value={maskCEP(form.cep)}
              onChange={e => set('cep', e.target.value.replace(/\D/g,'').slice(0,8))}
              placeholder="00000-000"
              maxLength={9}
              className={`flex-1 ${fieldClass('cep')}`}
            />
            <button
              type="button"
              onClick={buscarCEP}
              disabled={isSearchingCEP || form.cep.replace(/\D/g,'').length < 8}
              className="px-3 py-2 bg-[#C8FF00]/10 border border-[#C8FF00]/30 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/20 transition-all disabled:opacity-40"
            >
              {isSearchingCEP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Logradouro + Número */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs text-white/50 mb-1">Logradouro</label>
            <input value={form.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder="Rua, Avenida..." className={fieldClass('logradouro')} />
            {errors.logradouro && <p className="text-red-400 text-xs mt-1">{errors.logradouro}</p>}
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Número</label>
            <input value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" className={fieldClass('numero')} />
            {errors.numero && <p className="text-red-400 text-xs mt-1">{errors.numero}</p>}
          </div>
        </div>

        {/* Complemento + Bairro */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-white/50 mb-1">Complemento</label>
            <input value={form.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Apto, Bloco..." className={fieldClass('complemento')} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Bairro</label>
            <input value={form.bairro} onChange={e => set('bairro', e.target.value)} placeholder="Bairro" className={fieldClass('bairro')} />
          </div>
        </div>

        {/* Cidade + Estado */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block text-xs text-white/50 mb-1">Cidade</label>
            <input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="São Paulo" className={fieldClass('cidade')} />
            {errors.cidade && <p className="text-red-400 text-xs mt-1">{errors.cidade}</p>}
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">UF</label>
            <input value={form.estado} onChange={e => set('estado', e.target.value.toUpperCase().slice(0,2))} placeholder="SP" maxLength={2} className={fieldClass('estado')} />
            {errors.estado && <p className="text-red-400 text-xs mt-1">{errors.estado}</p>}
          </div>
        </div>

        {/* Sucesso */}
        {successMsg && (
          <p className="flex items-center gap-2 text-sm text-[#C8FF00] bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </p>
        )}

        {/* Botões */}
        <div className="flex gap-2 pt-1">
          {editAddress && (
            <button onClick={() => setEditAddress(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm transition-all">
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#C8FF00] text-black font-semibold rounded-xl hover:bg-[#d4ff33] transition-all disabled:opacity-50"
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><MapPin className="w-4 h-4" /> Salvar Perfil</>}
          </button>
        </div>
      </div>
    </div>
  );
};
