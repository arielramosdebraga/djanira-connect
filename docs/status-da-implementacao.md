# Status da implementação

Atualizado em 25/11/2026.

## Implementado no site

- Login, cookie de sessão HttpOnly e recuperação de senha pelo Firebase Authentication.
- Consultas e gravações de servidor no Firestore com validação de salão e papel.
- Clientes, compromissos e atendimentos mapeados para coleções Firebase.
- Reserva pública validada por Route Handler e gravação com verificação de disponibilidade e idempotência.
- Serviços, profissionais, horários, retornos e histórico de contatos no Firestore.
- Projeto e documentação preparados para compartilhar clients e appointments com o NailFlow.

## Configuração externa ainda necessária

- Configurar NEXT_PUBLIC_FIREBASE_SALON_ID com o ID real do documento salons/{salonId}.
- Criar e cadastrar FIREBASE_SERVICE_ACCOUNT_BASE64 ou FIREBASE_SERVICE_ACCOUNT_JSON em ambiente local e Vercel.
- Confirmar contas Firebase Authentication e documentos users/{uid} para cada pessoa do salão.
- Configurar as variáveis de Firebase na Vercel para Preview e Production.
- Publicar no Firebase o índice composto de clients (salonId, phoneNormalized) incluído no NailFlow.
- Confirmar índices compostos adicionais do Firestore quando as consultas forem executadas.

## Validações deste trabalho

- Typecheck do Djanira Connect: passou após a limpeza final.
- Lint do Djanira Connect: passou após a limpeza final.
- Vitest no Djanira Connect: 10 testes passaram; 100% de linhas nos módulos incluídos atualmente na configuração de cobertura.
- Typecheck, lint e Vitest do NailFlow: passaram; 79 testes passaram.
- A cobertura do Djanira Connect mede os módulos de domínio configurados, não todas as rotas e componentes da aplicação.
- Build de produção do Djanira Connect: passou; páginas com dados Firebase são renderizadas por requisição.
- Nenhum dado produtivo foi importado; os dois projetos foram descritos como ambientes de teste.

## Próximos passos

1. Fornecer o salonId e configurar a credencial de serviço sem compartilhá-la no chat.
2. Ativar o provedor de e-mail/senha e revisar os perfis users/{uid}.
3. Validar login, leitura/gravação compartilhada, atendimento e reserva pública.
4. Monitorar limites e configurar backups do Firestore.
