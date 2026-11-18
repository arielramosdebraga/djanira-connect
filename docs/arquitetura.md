# Arquitetura

## Direção técnica

O projeto será um monólito modular web, com interface e operações de servidor
no mesmo projeto.

| Camada | Tecnologia ou decisão |
| --- | --- |
| Aplicação | Next.js com App Router e React |
| Linguagem | TypeScript |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui apenas quando necessário |
| Formulários | React Hook Form e Zod |
| Banco | PostgreSQL no Supabase |
| Autenticação | Supabase Auth |
| Hospedagem | Vercel |
| Testes | Vitest e Playwright |

## Organização de código

As regras de negócio devem ficar fora dos componentes visuais. Cada módulo deve
concentrar tipos, validações, funções de domínio, acesso a dados e componentes
específicos.

```text
src/
  app/                 # rotas e telas
  components/          # componentes compartilhados
  domains/             # regras por módulo
  actions/             # escritas via Server Actions
  lib/                 # autenticação, datas e clientes externos
  types/               # tipos compartilhados
supabase/
  migrations/          # alterações versionadas do banco
  seed.sql             # dados fictícios para desenvolvimento
tests/
  unit/
  integration/
  e2e/
```

## Regras de acesso

- Consultas internas passam pela camada de servidor.
- Escritas usam Server Actions com validação e autorização.
- Route Handlers ficam reservados para APIs e integrações futuras.
- A sessão autenticada acompanha as operações no Supabase.
- Row Level Security é obrigatória nas tabelas de negócio.
- Nenhuma chave administrativa pode chegar ao navegador.

## O que não será adotado inicialmente

- Backend separado.
- Microsserviços.
- Redis ou filas.
- ORM adicional sem necessidade concreta.
- Sincronização em tempo real.
- Aplicativo nativo.
- Infraestrutura completa de SaaS multitenant.
