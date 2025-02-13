# Assistant.ai - Plataforma SaaS de Atendentes Virtuais

## Descrição
Assistant.ai é uma plataforma SaaS inovadora para criação e gestão de atendentes virtuais personalizados com IA. A plataforma oferece funcionalidades diferenciadas para administradores e assinantes, permitindo a configuração flexível de atendentes virtuais.

## Funcionalidades

### Autenticação e Autorização
- Sistema de login e registro de usuários
- Níveis de acesso diferenciados (admin/usuário)
- Rotas protegidas baseadas em permissões

### Dashboard do Usuário
- Visão geral dos atendentes virtuais
- Métricas de uso e interações
- Criação e configuração de atendentes

### Painel Administrativo
- Métricas detalhadas do sistema
- Gestão de usuários
- Configurações globais da plataforma

### Gestão de Documentos
- Upload de documentos para treinamento
- Suporte para diferentes tipos de arquivos (.txt, .pdf, .csv)
- Visualização e gerenciamento de documentos

### Calendário e Eventos
- Agendamento de eventos
- Visualização em calendário
- Gestão de compromissos

### Inteligência Artificial
- Integração com múltiplos modelos de IA (DeepSeek, Perplexity, OpenAI)
- Personalização da personalidade dos atendentes
- Configuração de parâmetros de IA (temperatura, tokens)

## Tecnologias e Bibliotecas

### Frontend
- React + TypeScript
- Vite como bundler
- TanStack Query para gerenciamento de estado e cache
- Wouter para roteamento
- Tailwind CSS + shadcn/ui para estilização
- React Hook Form + Zod para validação de formulários
- Lucide React para ícones

### Backend
- Node.js + Express
- TypeScript
- Passport.js para autenticação
- PostgreSQL como banco de dados
- Drizzle ORM para acesso ao banco
- Zod para validação de schemas

### Integrações
- DeepSeek API para IA
- Suporte planejado para Perplexity e OpenAI

## Estrutura do Projeto

```
├── client/                  # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/         # React hooks personalizados
│   │   ├── lib/           # Utilitários e configurações
│   │   └── pages/         # Páginas da aplicação
├── server/                 # Backend Express
│   ├── llm/               # Integrações com IA
│   ├── auth.ts            # Configuração de autenticação
│   ├── routes.ts          # Rotas da API
│   └── storage.ts         # Camada de acesso a dados
└── shared/                # Código compartilhado
    └── schema.ts          # Schemas do banco de dados
```

## Como Executar

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente em um arquivo `.env`:
```env
DATABASE_URL=sua_url_do_postgres
SESSION_SECRET=seu_segredo_de_sessao
```

4. Execute as migrações do banco de dados:
```bash
npm run db:push
```

5. Inicie a aplicação:
```bash
npm run dev
```

## Credenciais de Teste

### Administrador
- Usuário: adm
- Senha: @adm123

### Usuário Normal
- Usuário: teste
- Senha: @teste123

## Lista de Arquivos Principais

### Frontend
- `client/src/App.tsx`
- `client/src/pages/admin.tsx`
- `client/src/pages/auth-page.tsx`
- `client/src/pages/calendar.tsx`
- `client/src/pages/dashboard.tsx`
- `client/src/pages/documents.tsx`
- `client/src/pages/landing-page.tsx`
- `client/src/pages/settings.tsx`
- `client/src/components/sidebar.tsx`
- `client/src/hooks/use-auth.tsx`
- `client/src/lib/protected-route.tsx`
- `client/src/lib/protected-admin-route.tsx`

### Backend
- `server/auth.ts`
- `server/routes.ts`
- `server/storage.ts`
- `server/db.ts`
- `server/llm/index.ts`
- `server/llm/deepseek.ts`

### Shared
- `shared/schema.ts`

### Configuração
- `drizzle.config.ts`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `theme.json`
