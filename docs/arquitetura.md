# Arquitetura

O Djanira Connect é um monólito web Next.js. Seu backend usa o mesmo projeto Firebase do aplicativo NailFlow.

## Direção técnica

| Camada | Tecnologia ou decisão |
| --- | --- |
| Aplicação | Next.js App Router e React |
| Linguagem | TypeScript |
| Estilos | Tailwind CSS |
| Autenticação no navegador | Firebase Authentication |
| Sessão do site | Cookie HttpOnly criado e validado no servidor |
| Banco | Cloud Firestore compartilhado com NailFlow |
| Hospedagem | Vercel |
| Validação | Zod |

## Limite de compartilhamento

- clients contém clientes e contatos por salonId.
- appointments contém agendamentos e atendimentos. O campo status distingue compromissos (scheduled/confirmed) de atendimentos (completed).
- users e salons fornecem identidade, papel e escopo do salão.
- services, professionals, availabilityRules, followUps e contactLogs são coleções usadas pelo site; o aplicativo não precisa consumi-las para compartilhar clientes e agenda.
- Os campos compartilhados preservam os nomes camelCase do modelo Firebase. O adaptador web traduz o formato de leitura usado pelas telas atuais.

## Segurança

- O Firebase Admin SDK é exclusivo do servidor e ignora regras do Firestore.
- Páginas e Server Actions validam cookie de sessão, papel e vínculo ativo ao salonId antes de acessar dados.
- O login valida Firebase Authentication e confere o perfil em users/{uid} e o salão em salons/{salonId}.
- A reserva pública é validada em Route Handlers no servidor. Não há permissão de leitura ou escrita anônima nas regras do Firestore.
- O SDK cliente é usado apenas para autenticação e recuperação de senha.
- A credencial de serviço fica em FIREBASE_SERVICE_ACCOUNT_BASE64 ou FIREBASE_SERVICE_ACCOUNT_JSON, somente no ambiente de servidor.

## Estrutura relacionada

- src/app: rotas, telas, Server Actions e Route Handlers.
- src/components: componentes compartilhados.
- src/lib/firebase: SDK cliente/admin, sessão e acesso ao Firestore.
- src/lib/auth: autorização das rotas web.
- docs/firebase-compartilhado.md e docs/modelo-de-dados.md: operação e dados.

## Fora do escopo atual

- Migração de dados produtivos: os dois projetos ainda estão em teste e não possuem dados produtivos a preservar.
- Sincronização do Google Calendar e notificações por WhatsApp.
- Acesso público direto ao Firestore.
