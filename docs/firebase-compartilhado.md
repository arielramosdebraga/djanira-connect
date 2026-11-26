# Configurar o Firebase compartilhado

O site e o NailFlow usam o mesmo projeto Firebase. A integração do site exige variáveis públicas para o SDK cliente e uma credencial privada para o backend. Nenhuma chave privada deve ser enviada pelo chat ou commitada.

## Configuração local

O arquivo .env.local deve conter a configuração pública copiada do mesmo app Firebase usado pelo NailFlow:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_SALON_ID

O NEXT_PUBLIC_FIREBASE_SALON_ID é o ID do documento salons/{salonId} no Firestore. Ele não é uma chave secreta.

## Credencial privada do backend

Crie uma chave de conta de serviço no mesmo projeto Firebase e configure uma destas variáveis apenas no servidor:

- FIREBASE_SERVICE_ACCOUNT_BASE64 (recomendado para Vercel); ou
- FIREBASE_SERVICE_ACCOUNT_JSON (JSON integral, incluindo chave privada).

Não compartilhe a chave no chat, não a salve no repositório e não use uma conta de outro projeto Firebase. A conta de serviço precisa ter acesso ao Firebase Authentication e ao Firestore.

## Firebase Authentication e perfis

1. Ative o provedor de e-mail e senha no Firebase Authentication.
2. Crie ou confirme a conta da pessoa que acessará o site.
3. Confira se users/{uid} existe para o UID do Firebase Authentication.
4. O documento precisa ter role, salonId e estado ativo coerentes com o perfil do salão.
5. Confirme que salons/{salonId} existe e está ativo.

A conta e a senha antigas do outro provedor não são transferidas. Senhas não podem ser copiadas entre provedores como hash; redefina a senha pelo Firebase Authentication.

## Vercel

Configure as sete variáveis públicas e as credenciais privadas em Preview e Production. Use o mesmo projectId nas variáveis públicas e na conta de serviço. Não conecte Preview a dados reais; use um projeto Firebase de teste quando estiver disponível.

## Índice de busca por telefone

O NailFlow agora procura clientes por telefone normalizado usando o índice composto clients (salonId, phoneNormalized). Depois de integrar essa alteração ao projeto NailFlow, publique o índice com o fluxo Firebase usado pelo projeto antes de validar a busca telefônica.

## Dados compartilhados e regras

- O NailFlow e o site leem e gravam clientes na coleção clients.
- Agendamentos e atendimentos ficam em appointments e pertencem ao mesmo salão.
- O Admin SDK do site ignora Firestore Security Rules. Por isso Route Handlers e Server Actions autenticam a sessão, conferem papel e limitam cada operação ao salonId.
- Não abra leitura ou gravação anônima nas regras do Firestore. Reservas públicas passam pelo endpoint web validado no servidor.

## Situação desta integração

Os ambientes de teste não tinham dados produtivos a migrar. O site está preparado para gravar diretamente nas coleções Firebase compartilhadas. A ativação local e na Vercel depende do salonId, da credencial de serviço e dos perfis de usuário descritos acima.
