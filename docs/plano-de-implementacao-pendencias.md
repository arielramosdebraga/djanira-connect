# Plano de implementação das pendências

Atualizado em 17/11/2026.

## 1. Objetivo

Concluir a versão operacional do Djanira Connect, corrigindo as pendências
funcionais, técnicas, de segurança e de operação identificadas na documentação
e no código atual.

Este plano considera que agenda, reservas públicas, retornos, relatórios e o
fluxo principal já existem. O foco passa a ser confiabilidade, rastreabilidade,
comissão por funcionário e preparação para uso real.

## 2. Resultado esperado

Ao final do plano, o sistema deverá permitir:

- operar serviços, contatos, atendimentos, retornos, agenda e reservas;
- associar cada atendimento ao profissional responsável;
- calcular comissão por funcionário e período;
- gerar relatório financeiro filtrado e exportável em PDF;
- consultar histórico de alterações críticas;
- proteger operações por papel e por organização;
- suportar crescimento inicial sem depender de limites fixos de consulta;
- ser validado antes da publicação em produção.

## 3. Ordem das fases

| Fase | Entrega | Dependências | Prioridade |
| --- | --- | --- | --- |
| 1 | Atualização documental e preparação do banco | Nenhuma | Alta |
| 2 | Profissionais e comissão real | Fase 1 | Alta |
| 3 | Paginação e robustez das listas | Nenhuma | Alta |
| 4 | Auditoria de operações críticas | Fase 1 | Média |
| 5 | Revisão de segurança e permissões | Fases 2 e 4 | Alta |
| 6 | Validação automatizada e manual | Fases 2 a 5 | Alta |
| 7 | Operação, backup e produção | Fase 6 | Alta |
| 8 | Funcionalidades posteriores | Após produção | Baixa |

## 4. Fase 1 — Documentação e preparação

### Tarefas

- Atualizar o PRD para registrar agenda, reservas públicas e relatórios como
  funcionalidades já implementadas.
- Atualizar o roadmap e as decisões para remover conflitos com o estado atual.
- Atualizar o modelo de dados com agenda, disponibilidade e reservas.
- Atualizar a lista de migrations aplicadas em `status-da-implementacao.md`.
- Revisar a consulta de integridade do banco.
- Confirmar que todas as migrations foram executadas no Supabase de
  desenvolvimento.
- Confirmar organização, membros ativos, expediente e dados fictícios.

### Critério de aceite

A documentação descreve o sistema atual sem indicar como futuro um módulo já
implementado, e o ambiente de desenvolvimento possui todas as tabelas, funções,
políticas e dados necessários.

## 5. Fase 2 — Profissionais e comissão real

### Banco

Criar uma migration com:

- tabela `professionals` ou `employees` vinculada à organização;
- nome, telefone opcional, situação ativa e datas de controle;
- percentual padrão de comissão;
- restrição para percentual entre 0 e 100;
- políticas RLS por organização;
- índice por organização e situação ativa.

Adicionar ao atendimento:

- `professional_id` obrigatório ou opcional conforme decisão do salão;
- snapshot do nome do profissional no atendimento, se o histórico precisar ser
  preservado mesmo após desativação;
- índice para relatórios por profissional.

### Aplicação

- Criar cadastro de profissionais em Configurações.
- Permitir editar, ativar e desativar profissionais.
- Adicionar seleção de profissional no formulário de atendimento.
- Preservar o profissional durante a correção do atendimento.
- Definir como atendimentos antigos sem profissional serão tratados.
- Alterar o relatório para filtrar por profissional.
- Permitir percentual padrão e percentual informado no relatório.
- Calcular comissão somente sobre os atendimentos do profissional selecionado.
- Exibir total bruto, comissão e saldo do salão.
- Manter a opção de relatório geral sem filtro de profissional.

### Decisão necessária antes da migration

Confirmar se o percentual é:

1. fixo por profissional;
2. definido por serviço;
3. informado manualmente a cada relatório;
4. uma combinação de percentual padrão e ajuste no relatório.

Recomendação inicial: percentual padrão por profissional, com possibilidade de
ajuste no relatório sem alterar o cadastro.

### Critério de aceite

Um atendimento vinculado à profissional A não entra no cálculo da profissional
B. O relatório mostra corretamente o período, quantidade, total bruto,
percentual, comissão e saldo.

## 6. Fase 3 — Paginação e crescimento das listas

### Tarefas

- Implementar paginação ou carregamento incremental em Contatos.
- Implementar paginação em Atendimentos.
- Implementar paginação em Retornos.
- Implementar paginação ou navegação por período em Agenda.
- Implementar paginação ou agrupamento por data em Relatórios.
- Mostrar quantidade total e página atual quando aplicável.
- Preservar filtros e busca ao trocar de página.
- Adicionar índices para as consultas mais utilizadas.

### Critério de aceite

Nenhuma tela depende de um limite fixo baixo para exibir registros, e a busca
continua funcionando com filtros ativos em todas as páginas.

## 7. Fase 4 — Auditoria

### Banco

Criar tabela de eventos de auditoria com:

- organização;
- usuário responsável;
- tipo de ação;
- entidade e identificador afetado;
- dados resumidos anterior e posterior, quando necessário;
- data e horário;
- índice por organização, entidade e data.

### Eventos mínimos

- criação, edição, ativação e desativação de serviço;
- criação, edição e arquivamento de contato;
- criação, correção e cancelamento de atendimento;
- alteração de retorno;
- alteração de configurações;
- criação e cancelamento de agendamento;
- alteração de disponibilidade.

### Regras

- Não registrar telefone completo ou observações sensíveis sem necessidade.
- Não permitir que o usuário comum altere ou apague auditoria.
- Manter os eventos associados à organização correta.

### Critério de aceite

Uma alteração crítica pode ser rastreada até o usuário, data, ação e registro
afetado sem expor dados desnecessários.

## 8. Fase 5 — Segurança e autorização

### Tarefas

- Revisar RLS de todas as tabelas.
- Revisar `SECURITY DEFINER`, `search_path`, `revoke` e `grant` das funções.
- Testar chamadas diretas de RPC como administrador, operador e usuário sem
  vínculo.
- Confirmar que usuário inativo não lê nem altera dados.
- Confirmar que operador não altera configurações.
- Confirmar que operador não cancela nem corrige atendimentos, se essa regra
  permanecer.
- Confirmar isolamento entre organizações.
- Revisar limites e proteção contra abuso das reservas públicas.
- Revisar mensagens e logs para evitar dados sensíveis.

### Critério de aceite

As regras de autorização continuam válidas mesmo quando as requisições são
executadas diretamente, sem utilizar a interface visual.

## 9. Fase 6 — Validação

### Automação

Adicionar e configurar:

- typecheck;
- lint;
- Vitest para regras de domínio e validações;
- testes de integração das funções críticas do Supabase;
- Playwright para os fluxos principais;
- build de produção.

### Fluxos mínimos

- login e recuperação de acesso;
- bloqueio de usuário sem membro ativo;
- cadastro e edição de serviço;
- cadastro, busca e arquivamento de contato;
- registro de atendimento;
- correção e cancelamento administrativo;
- criação e atualização de retorno;
- contato via WhatsApp e registro manual;
- criação de agendamento;
- reserva pública;
- relatório por período;
- comissão por profissional;
- geração do PDF;
- operação em tela de celular.

### Critério de aceite

Typecheck, lint, testes e build passam. O roteiro manual também é executado em
conta de administrador e operador, em computador e celular.

## 10. Fase 7 — Operação e produção

### Tarefas

- Configurar variáveis de ambiente na Vercel.
- Configurar domínio, caso definido.
- Configurar SMTP e recuperação de senha do Supabase.
- Separar desenvolvimento, preview e produção.
- Definir rotina de backup lógico.
- Executar restauração em ambiente separado.
- Configurar limites e alertas de consumo.
- Documentar recuperação de acesso.
- Documentar aplicação de migrations.
- Documentar procedimento de rollback compatível.
- Fazer revisão final de dados fictícios antes do primeiro uso real.

### Critério de aceite

O salão consegue operar, recuperar acesso e restaurar os dados sem depender de
um procedimento informal ou de uma única pessoa.

## 11. Fase 8 — Depois do MVP operacional

Estas funcionalidades não devem bloquear a primeira publicação:

- confirmações e lembretes automáticos;
- integração oficial com WhatsApp;
- contratos e gestão de salas;
- pagamentos;
- estoque;
- campanhas;
- aplicação mobile;
- múltiplos salões e cobrança SaaS.

## 12. Branches e commits

Cada fase deve ser implementada em branch própria, atualizada a partir de
`develop`:

- `feature/modulo-documentacao-operacao`
- `feature/modulo-profissionais-comissoes`
- `feature/modulo-paginacao`
- `feature/modulo-auditoria`
- `feature/modulo-seguranca`
- `feature/modulo-validacao`
- `feature/modulo-producao`

Os commits devem ser pequenos, em português e seguir Conventional Commits.
Cada fase deve ser integrada somente depois da revisão e das validações
correspondentes.

## 13. Definição final de concluído

O projeto poderá ser considerado pronto para o uso real quando:

- o fluxo principal for validado pelos usuários;
- o relatório puder calcular comissão por profissional corretamente;
- as migrations estiverem aplicadas no ambiente correto;
- as permissões forem verificadas no banco e na aplicação;
- as listas suportarem crescimento inicial;
- auditoria existir para operações críticas;
- typecheck, lint, testes e build passarem;
- backup e restauração forem testados;
- deploy, monitoramento e recuperação estiverem documentados.
