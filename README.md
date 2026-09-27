# Kito Arcade

Plataforma unificada de entretenimento digital, jogos retrô & modernos, aplicações web, catálogo de soluções SaaS e ecossistema de serviços da **Kito Expert**.

## 🎮 Funcionalidades Principais

- **Hub de Jogos Clássicos & Retrô:** Neon Tetris, Damas Clássicas em Madeira Nobre, Xadrez Tático com regras oficiais FIDE, Cobrinha Neon e jogos de raciocínio.
- **Sistema de Autenticação Segura de Jogadores:** Registro e proteção de apelidos com senha individual criptografada via SHA-256 e emissão de Chave de Recuperação de Emergência.
- **Rankings Competitivos Dedicados:** Leaderboards individuais por jogo com sincronização em tempo real via Supabase e persistência em cache local.
- **Portal do Cliente & CRM Administrativo:** Gestão de solicitações, agendamentos, serviços contratados e área logada com redefinição segura de senha via OTP.
- **Design System Responsivo:** Interface otimizada com paleta dark premium, animações fluidas e suporte a gestos touch em dispositivos móveis e desktops.

## 🛠️ Stack Tecnológica

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Roteamento & Estado:** React Router DOM v7
- **Backend & Banco de Dados:** Supabase (PostgreSQL, Realtime, Edge Functions & Security Rules)
- **Bundler & Build Tool:** Vite 5

## 🚀 Instalação e Execução Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build otimizado para produção
npm run build

# Pré-visualizar build de produção localmente
npm run preview
```

## 🌐 Deploy na Vercel

O projeto está configurado para deploy imediato na Vercel através do arquivo `vercel.json` com reescrita para Single Page Application (SPA) e cabeçalhos de segurança e cache.

---

© 2026 Kito Expert. Todos os direitos reservados.
