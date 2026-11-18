# PRD — Djanira Connect

## 1. Visão do produto

O Djanira Connect é uma aplicação web para organizar a rotina de um salão,
reduzir controles manuais e facilitar o acompanhamento de clientes. A primeira
operação atendida é o Salão Djanira Montclair, com duas pessoas usando contas
individuais.

O produto evolui em módulos, começando pelo ciclo de serviços, contatos,
atendimentos e retornos. Agenda, reserva pública, confirmações e contratos são
etapas posteriores.

## 2. Problema e oportunidade

Informações sobre serviços, clientes, histórico e retornos precisam ser
organizadas em um só lugar. O sistema deve ajudar as pessoas do salão a saber
quem atenderam, quem precisa de novo contato e qual serviço está relacionado ao
retorno, sem automatizar o envio de mensagens nesta primeira versão.

## 3. Objetivos

- Manter cadastro consultável de serviços e clientes.
- Registrar serviços efetivamente realizados com histórico confiável.
- Calcular retornos a partir do prazo do serviço.
- Ajudar a executar contatos manualmente pelo WhatsApp.
- Permitir que duas pessoas autorizadas usem os mesmos dados com contas próprias.
- Estabelecer uma base segura que possa receber agenda, reservas e contratos em etapas futuras.

## 4. Não objetivos da primeira versão

- Agenda interna ou pública.
- Reserva online por clientes.
- Envio automático de WhatsApp, chatbot ou campanhas.
- Caixa, pagamentos, estoque ou comissões.
- Aplicativo nativo.
- Cadastro público, cobrança por assinatura ou SaaS para múltiplos salões.
- Gestão de contratos e salas.

## 5. Usuários e permissões

### Administrador

Gerencia serviços, contatos, atendimentos, retornos e configurações. Pode
corrigir ou cancelar atendimentos, mantendo rastreabilidade.

### Operador

Consulta serviços, cadastra e atualiza contatos, registra atendimentos,
consulta retornos e registra contatos realizados. Não altera configurações
administrativas nem cancela atendimentos.

Cada pessoa possui uma conta própria. Não há inscrição pública. As permissões
são verificadas no servidor e no banco.

## 6. Escopo e requisitos funcionais

### Fundação e acesso

- Login e recuperação de acesso.
- Provisionamento restrito de duas contas individuais.
- Papéis de administrador e operador.
- Sessão protegida para áreas internas.
- Isolamento dos dados da organização por autorização no servidor e Row Level Security.

### Serviços

- Cadastrar, editar, ativar e desativar serviços.
- Informar nome obrigatório, valor médio opcional, duração média e prazo opcional de retorno.
- Manter serviço inativo disponível para consulta em históricos, sem permitir novos atendimentos.

### Contatos

- Cadastrar, editar, buscar e arquivar clientes.
- Guardar nome, telefone/WhatsApp, observações objetivas e preferência de não receber contato.
- Normalizar telefone com código do país, sugerindo Brasil inicialmente.
- Alertar sobre telefone existente, permitindo confirmação de uso compartilhado.
- Depois da entrega de atendimentos, mostrar histórico de serviços e contatos realizados.
- Oferecer filtros por serviço e retorno quando os dados desses módulos estiverem disponíveis.

### Atendimentos

- Registrar um serviço concluído por registro, vinculado a cliente e serviço.
- Permitir data passada, valor efetivamente praticado e observação opcional.
- Registrar usuário responsável.
- Preservar snapshot dos dados relevantes do serviço no momento do atendimento.
- Permitir correção/cancelamento conforme papel, com auditoria e sem apagar o histórico silenciosamente.

### Retornos

- Criar referência de retorno para atendimento cujo serviço tenha prazo configurado.
- Mostrar retornos vencidos ou previstos para hoje e previsões dos próximos sete dias.
- Mostrar retornos contatados e adiados, preservando histórico.
- Permitir abrir WhatsApp com mensagem sugerida editável.
- Registrar contato somente depois de ação explícita do usuário.
- Permitir adiar ou dispensar um lembrete.

### Configurações

- Nome do salão.
- Fuso horário, inicialmente `America/Sao_Paulo`.
- Mensagem padrão de contato.
- Identificação e papel dos membros provisionados.

## 7. Fluxos principais

### Primeiro cadastro e operação

1. Administrador acessa a aplicação.
2. Cadastra serviços e clientes.
3. Localiza ou cadastra o cliente durante a rotina.
4. Registra cada serviço concluído.
5. O sistema cria ou atualiza a referência de retorno quando aplicável.
6. A pessoa consulta a fila, abre a conversa sugerida no WhatsApp e realiza o contato manualmente.
7. Após o contato, registra “Já chamei”.

### Testabilidade incremental

- Após a Fundação: validar login, sessão e autorização.
- Após Serviços e o cadastro inicial de Contatos: testar criação, edição e busca.
- Após Atendimentos: validar histórico por cliente.
- Após Retornos: validar o fluxo de ponta a ponta até o registro manual do contato.

## 8. Regras de negócio essenciais

- Serviço sem prazo de retorno não gera lembrete.
- Alterações no catálogo não modificam snapshots de atendimentos antigos.
- A data prevista usa a data local do atendimento acrescida do prazo registrado naquele momento.
- Para cada cliente e serviço, somente o atendimento válido mais recente mantém acompanhamento ativo.
- Atendimento retroativo não substitui atendimento válido mais recente.
- Cancelar o atendimento mais recente reavalia o atendimento válido anterior.
- Abrir WhatsApp não significa que o contato foi realizado.
- Adiar altera a próxima data de acompanhamento e preserva a previsão original.
- Dispensar encerra somente aquele lembrete.
- Clientes arquivados ou com restrição de contato não aparecem na fila.
- Atendimento e atualização do retorno são atômicos e protegidos contra repetição.

O detalhamento normativo está em `regras-de-negocio.md` e `planejamento-da-etapa-inicial.md`.

## 9. Requisitos não funcionais

- Interface responsiva para computador e celular.
- Aplicação e interface em português brasileiro.
- Validação no servidor para todas as entradas relevantes.
- Row Level Security nas tabelas de negócio.
- Segredos administrativos somente no ambiente de servidor.
- Paginação em listas e histórico.
- Estados explícitos de carregamento, erro, vazio e sucesso.
- Logs sem telefone completo ou observações de clientes.
- Migrações versionadas e procedimento de backup/restauração testável antes do uso real.
- Preview isolado de dados de produção.

## 10. Métricas de sucesso do piloto

- As duas pessoas acessam com contas próprias.
- Ambas conseguem cadastrar/localizar clientes e serviços conforme suas permissões.
- Um atendimento pode ser registrado sem duplicação e aparece no histórico correto.
- Retornos são calculados de acordo com o serviço e o fuso do salão.
- A fila diária pode ser operada sem que abrir o WhatsApp marque falsamente um contato.
- Não há acesso a dados por usuário sem autorização.
- O fluxo principal pode ser concluído no celular.

## 11. Critérios de aceite da primeira versão

- Login e recuperação funcionam para contas provisionadas.
- Usuário sem sessão ou membro inativo não acessa dados internos.
- Operador não consegue executar ações administrativas por requisição direta.
- Serviços e contatos podem ser criados, editados, buscados e listados.
- Registro de atendimento preserva os dados históricos do serviço.
- Regras de retorno e cancelamento passam nos testes relevantes.
- WhatsApp abre com mensagem editável e o contato só é registrado explicitamente.
- Migrações, typecheck, lint, testes e build passam antes da publicação.
- Backup foi restaurado em ambiente de teste antes de iniciar uso real.

## 12. Dependências e decisões abertas

- Definir na Fundação o fluxo de sessão entre Next.js e Supabase e aplicar políticas RLS por papel.
- Confirmar se ambas as pessoas precisam de papel de administrador.
- Verificar existência de dados para importação e clientes sem telefone.
- Definir procedimento de backup e recuperação de acesso.
- Confirmar plano comercial, limites, região e configuração de e-mail dos provedores antes da produção.
- Obter o contrato integral do salão antes de iniciar o módulo de contratos.
- Definir posteriormente se confirmações serão manuais ou usarão integração oficial de mensagens.

## 13. Roadmap

1. Fundação e acesso.
2. Serviços.
3. Contatos: cadastro e busca.
4. Atendimentos.
5. Contatos: histórico e filtros dependentes.
6. Retornos e WhatsApp manual.
7. Agenda interna.
8. Reserva pública.
9. Confirmações e lembretes.
10. Contratos e gestão de salas, como módulo independente.

Consulte `roadmap.md` para as branches e critérios de conclusão por módulo.
