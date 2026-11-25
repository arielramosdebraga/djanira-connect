# Supabase local

O projeto pode ser executado com um Supabase local, sem consumir a cota do projeto hospedado.

## Pré-requisitos

- Docker Desktop instalado e em execução;
- Node.js compatível com o projeto;
- acesso ao terminal na raiz do repositório.

O Supabase CLI é executado via `npx`, portanto não precisa ser instalado globalmente.

## Primeira inicialização

Na raiz do projeto:

```powershell
npm run supabase:start
```

Ao final, o CLI exibirá as chaves locais. O arquivo `.env.local` deve usar:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key exibida pelo CLI>
```

Para conferir os serviços:

```powershell
npm run supabase:status
```

O Studio local fica disponível em `http://127.0.0.1:54323`.

## Criar ou recriar o banco local

O reset aplica todas as migrations de `supabase/migrations` em ordem e depois executa `supabase/seed.sql`:

```powershell
npm run supabase:reset
```

O seed chama `public.seed_demo_data()` e cria os dados fictícios previstos pelo projeto. O procedimento é idempotente.

O seed local também cria a conta de desenvolvimento:

- e-mail: `local@djanira.test`;
- senha: `DjaniraLocal123!`.

Essa conta existe somente no banco local e não deve ser usada em produção.

Depois, inicie a aplicação em outro terminal:

```powershell
npm run dev
```

## Usuário local de desenvolvimento

Com `enable_email_autoconfirm = true`, o cadastro pode ser confirmado automaticamente no ambiente local. Não copie usuários, senhas ou chaves do Supabase hospedado para o ambiente local.

## Encerrar o ambiente

```powershell
npm run supabase:stop
```

Os containers param, mas os volumes locais são preservados até uma remoção explícita pelo Docker/Supabase CLI.
