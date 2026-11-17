# Planejamento de conclusão — Djanira Connect

Atualizado em 16/11/2026.

## 1. Objetivo

Concluir a versão operacional do Djanira Connect, validar os fluxos principais,
preparar o ambiente de produção e deixar os módulos futuros organizados sem
misturar funcionalidades ainda não necessárias ao piloto.

## 2. Estado atual

### Implementado

- Autenticação, recuperação de acesso e sessão protegida.
- Organização, membros e papéis de administrador e operador.
- Serviços ativos e inativos.
- Contatos com máscara, normalização, edição e arquivamento.
- Busca instantânea por nome ou telefone.
- Filtros de contatos por serviço e situação de retorno.
- Atendimentos com snapshot histórico e idempotência.
- Cancelamento administrativo de atendimentos.
- Retornos, adiamento, dispensa e contato manual pelo WhatsApp.
- Configurações do salão.
- Telefone do salão e contato direto via WhatsApp após reserva pública.
- Agenda interna com expediente de 09:00 às 18:00.
- Calendário semanal na página inicial.
- Modal de novo agendamento na página inicial.
- Reservas públicas com cadastro automático de cliente e horários livres por serviço/data.
- Migrations e dados fictícios para desenvolvimento.

### Fora do escopo imediato

- Confirmações e lembretes automáticos.
- Integração oficial com WhatsApp (o MVP possui apenas link direto para conversa).
- Contratos e gestão de salas.
- Pagamentos, estoque, comissões e campanhas.

## 3. Fases de conclusão

## Fase 1 — Banco e ambiente de desenvolvimento

### Tarefas

- [ ] Aplicar todas as migrations no Supabase na ordem correta.
- [ ] Aplicar os dados fictícios em ambiente de desenvolvimento.
- [ ] Confirmar organização e membros ativos.
- [ ] Confirmar que o expediente está sem intervalos e entre 09:00 e 18:00.
- [ ] Executar consultas de integridade das tabelas e funções.

### Critério de aceite

As tabelas, funções, políticas e dados de demonstração existem no Supabase sem
erros de migration.

## Fase 2 — Ajustes funcionais do MVP

### Reservas públicas

- [x] Substituir a escolha livre de horário por horários realmente disponíveis.
- [x] Ocultar horários ocupados.
- [x] Considerar dias inativos da agenda.
- [x] Exibir mensagem clara quando não houver horários.
- [x] Adicionar botão para contato direto com o salão após a solicitação.
- [ ] Validar submissões repetidas e reservas simultâneas.

### Contatos

- [ ] Adicionar filtro “sem contato há X dias”.
- [ ] Adicionar filtro de clientes que nunca receberam contato.
- [ ] Exibir a data do último contato na lista e na ficha.
- [ ] Adicionar paginação quando o volume ultrapassar o limite da tela.
- [x] Exibir a data do último contato e o estado de nunca contatado.

### Atendimentos e retornos

- [x] Permitir correção de atendimento conforme o papel do usuário.
- [ ] Revisar a reavaliação de retornos após cancelamento.
- [ ] Exibir mensagens de erro específicas nas ações restantes.
- [ ] Confirmar que clientes arquivados ou com restrição não entram na fila.

### Critério de aceite

O fluxo diário pode ser executado sem SQL manual:

`cadastrar contato → registrar atendimento → consultar retorno → abrir WhatsApp → registrar contato`

## Fase 3 — Segurança e autorização

### Tarefas

- [ ] Revisar RLS de todas as tabelas de negócio.
- [ ] Testar acesso direto às funções RPC como operador.
- [ ] Confirmar que operador não altera configurações.
- [ ] Confirmar que operador não cancela atendimentos.
- [ ] Validar usuário inativo sem acesso aos dados.
- [x] Adicionar proteção básica contra abuso da reserva pública por limite diário do telefone.
- [x] Serializar reservas concorrentes e bloquear horários passados no banco.
- [ ] Revisar mensagens e logs para não expor dados sensíveis.

### Critério de aceite

As permissões continuam protegidas mesmo quando a requisição é feita fora da
interface visual.

## Fase 4 — Validação técnica

Executar somente após autorização para testes automatizados.

### Tarefas

- [ ] Typecheck.
- [ ] Lint.
- [ ] Testes unitários de regras de negócio.
- [ ] Testes de integração das funções do Supabase.
- [ ] Testes E2E dos fluxos principais.
- [ ] Build de produção.
- [ ] Corrigir falhas e repetir as validações.

### Critério de aceite

Typecheck, lint, testes e build passam sem falhas bloqueadoras.

## Fase 5 — Operação e produção

### Tarefas

- [ ] Configurar variáveis de ambiente na Vercel.
- [ ] Configurar domínio, quando definido.
- [ ] Configurar recuperação de senha e SMTP do Supabase.
- [ ] Definir política de backup.
- [ ] Executar e documentar restauração de backup.
- [ ] Configurar limites e alertas de consumo.
- [ ] Revisar logs e monitoramento.
- [ ] Criar procedimento de recuperação de acesso.
- [ ] Separar claramente dados de desenvolvimento, preview e produção.

### Critério de aceite

O sistema pode ser publicado, monitorado e recuperado sem depender de uma
única pessoa ou de procedimentos não documentados.

## Fase 6 — Aceite com usuários

### Roteiro manual

- [ ] Login com administrador.
- [ ] Login com operador.
- [ ] Cadastro e edição de serviço.
- [ ] Cadastro de contato com telefone formatado.
- [ ] Busca instantânea por nome e telefone.
- [ ] Registro de atendimento.
- [ ] Cancelamento administrativo.
- [ ] Consulta e adiamento de retorno.
- [ ] Abertura do WhatsApp.
- [ ] Registro manual do contato.
- [ ] Agendamento interno.
- [ ] Reserva pública.
- [ ] Teste em tela de celular.

### Critério de aceite

As duas pessoas responsáveis conseguem concluir a rotina principal com dados de
teste e sem intervenção técnica.

## Fase 7 — Integração e liberação

### Tarefas

- [ ] Revisar commits da branch do módulo.
- [ ] Fazer push da branch.
- [ ] Abrir PR para `develop`.
- [ ] Atualizar descrição da sprint com validações e pendências.
- [ ] Integrar em `develop` após aprovação.
- [ ] Criar versão candidata de produção.
- [ ] Publicar após aceite manual.

## 4. Ordem recomendada de execução

1. Aplicar e conferir migrations.
2. Completar paginação de contatos.
3. Revisar cancelamento e correção de atendimentos.
4. Fazer revisão de segurança e permissões.
5. Executar validações técnicas.
6. Configurar operação e backups.
7. Realizar aceite manual.
8. Integrar a branch e publicar.

## 5. Módulos posteriores

Depois da liberação do MVP, podem ser planejados separadamente:

- Confirmação e lembrete automático de reservas.
- Integração oficial com WhatsApp.
- Contratos de locação de salas.
- Gestão de salas e ocupação.
- Geração de PDF e assinaturas.
- Pagamentos, estoque ou comissões, somente se houver necessidade validada.

## 6. Definição de concluído

O projeto será considerado concluído quando:

- O fluxo principal estiver validado pelos usuários.
- As migrations estiverem aplicadas no ambiente correto.
- As permissões forem verificadas no banco e na aplicação.
- Typecheck, lint, testes e build passarem.
- Backup e restauração tiverem sido testados.
- O deploy de produção estiver configurado.
- O procedimento de operação e recuperação estiver documentado.
