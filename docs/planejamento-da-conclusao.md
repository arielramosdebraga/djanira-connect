# Planejamento de conclusão — Djanira Connect

Atualizado em 18/11/2026.

## 1. Objetivo

Concluir o MVP operacional do Djanira Connect, validar os fluxos usados no dia a
dia do salão e preparar a aplicação para uma publicação segura e sustentável.

Este documento separa o que já está entregue do que ainda precisa de validação,
configuração ou decisão. Ele não inclui funcionalidades futuras sem prioridade
confirmada.

## 2. Estado atual

### Entregue no código

- Autenticação, recuperação de acesso e sessão protegida.
- Organização, membros, papéis e proteção de rotas.
- Serviços com cadastro, edição, ativação e desativação.
- Contatos com cadastro, edição, arquivamento, máscara e normalização de telefone.
- Busca instantânea de contatos por nome ou telefone.
- Filtros de contatos e paginação da listagem.
- Atendimentos com histórico, snapshots, correção e cancelamento administrativo.
- Retornos com fila, adiamento, dispensa, WhatsApp manual e registro de contato.
- Agenda semanal com expediente fixo das 09:00 às 18:00.
- Calendário de compromissos no início e na agenda.
- Novo agendamento em modal e permanência na página após o cadastro.
- Reservas públicas com serviços, horários disponíveis, cadastro automático do
  cliente e contato direto via WhatsApp.
- Proteções de reserva contra duplicidade, concorrência, horário passado e
  excesso de solicitações por telefone.
- Configurações do salão e telefone de contato.
- Cadastro de profissionais e vínculo do profissional ao atendimento.
- Comissão por profissional no relatório, mantendo snapshot histórico do
  atendimento.
- Filtros e geração de relatório em PDF.
- Home pública com identidade visual, slider, menu, redes sociais, endereço,
  mapa, rodapé e página 404 coerente com o layout.
- Dados fictícios para facilitar a validação manual.
- Paginação preparada para o crescimento inicial das listagens.

### Banco e integração

- Migrations versionadas até `20261117000800_professionals_and_commissions.sql`.
- Migrations aplicadas no Supabase, conforme confirmação do responsável pelo
  projeto.
- Código consolidado e publicado nas branches `develop` e `main`.
- Deploy iniciado/configurado na Vercel; falta concluir a verificação operacional
  do ambiente publicado.

## 3. O que falta para concluir

### Prioridade 1 — Validar o ambiente publicado

- [ ] Confirmar que a Vercel usa o repositório, branch e projeto corretos.
- [ ] Conferir as variáveis `NEXT_PUBLIC_SUPABASE_URL` e
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` na Vercel para Preview e Production.
- [ ] Executar um deploy de produção e conferir os logs da aplicação.
- [ ] Confirmar login, logout, recuperação de senha e redirecionamentos no domínio
  publicado.
- [ ] Confirmar que a URL pública `/reservar` funciona sem login.
- [ ] Confirmar que uma página inexistente mostra o 404 correto para usuário
  anônimo e para usuário autenticado.

**Aceite:** o ambiente publicado abre sem erro, autentica usuários e permite uma
reserva pública de ponta a ponta.

### Prioridade 2 — Validação manual dos fluxos de negócio

- [ ] Validar login com administrador.
- [ ] Validar login com operador.
- [ ] Confirmar que administrador pode alterar configurações e profissionais.
- [ ] Confirmar que operador não altera configurações protegidas.
- [ ] Cadastrar, editar, ativar e desativar um serviço.
- [ ] Cadastrar e editar um contato com telefone formatado.
- [ ] Pesquisar contato por nome e telefone.
- [ ] Registrar atendimento com profissional, valor, data e horário.
- [ ] Corrigir atendimento existente e conferir o histórico preservado.
- [ ] Cancelar atendimento como administrador.
- [ ] Consultar retorno, adiar, dispensar e abrir WhatsApp.
- [ ] Criar agendamento interno pela home e pela agenda.
- [ ] Criar reserva pública com horário disponível.
- [ ] Tentar reservar horário ocupado e conferir a mensagem ao usuário.
- [ ] Aplicar filtros de relatório e exportar PDF.
- [ ] Conferir cálculo bruto, comissão e saldo do salão.
- [ ] Testar os fluxos em celular e computador.

**Aceite:** a rotina diária pode ser executada sem SQL manual:

`acessar → cadastrar contato → registrar atendimento → consultar retorno → abrir WhatsApp → gerar relatório`

### Prioridade 3 — Validação técnica

Executar depois da autorização já combinada para iniciar os testes.

- [x] Typecheck.
- [x] Lint.
- [x] Build de produção.
- [x] Testes unitários das regras de validação, telefone e datas com Vitest.
- [ ] Testes de integração das funções e permissões do Supabase.
- [ ] Testes E2E dos fluxos de login, atendimento e reserva pública (Playwright
  está fora desta etapa, conforme decisão do projeto).
- [x] Corrigir falhas encontradas e repetir as validações.

**Resultado atual:** typecheck, lint, build e Vitest passam sem falhas. A suíte
possui 10 testes e cobertura de 100% em linhas, funções e statements e 93,47%
em branches no núcleo de regras coberto (`src/domains` e `src/lib/dates`).

**Pendência:** ainda faltam testes de integração com Supabase e testes de
interface; o percentual de 90% está garantido para o núcleo testável configurado
na cobertura, não para todos os componentes visuais e rotas server-side.

### Prioridade 4 — Segurança e autorização

- [ ] Revisar RLS de todas as tabelas de negócio no Supabase.
- [ ] Testar acesso direto às funções RPC com usuário administrador e operador.
- [ ] Confirmar isolamento entre organizações.
- [ ] Confirmar que usuário inativo não acessa dados protegidos.
- [ ] Confirmar que operações administrativas falham fora da interface quando o
  papel não tem permissão.
- [ ] Revisar mensagens e logs para evitar exposição de telefone, observações e
  dados internos.
- [ ] Revisar limites adicionais para abuso da reserva pública.
- [ ] Confirmar que nenhuma chave administrativa está no navegador ou no Git.

**Aceite:** a autorização continua efetiva mesmo quando alguém chama a API ou
as funções do banco diretamente.

### Prioridade 5 — Operação e recuperação

- [ ] Configurar recuperação de senha e SMTP no Supabase.
- [ ] Definir política de backup do banco.
- [ ] Executar e documentar uma restauração de backup.
- [ ] Configurar limites e alertas de consumo do Supabase e da Vercel.
- [ ] Definir procedimento para recuperar acesso administrativo.
- [ ] Documentar como aplicar migrations em produção.
- [ ] Separar claramente desenvolvimento, preview e produção.
- [ ] Registrar domínio definitivo, se houver, e revisar configurações de DNS.

**Aceite:** outra pessoa autorizada consegue publicar, recuperar acesso e
restaurar o banco seguindo a documentação.

## 4. Ordem recomendada

1. Concluir a configuração e o primeiro deploy de produção na Vercel.
2. Fazer a validação manual dos fluxos principais.
3. Executar typecheck, lint e build.
4. Executar os testes de segurança e RLS no Supabase.
5. Configurar backup, recuperação de acesso e monitoramento.
6. Corrigir bloqueios encontrados e repetir as validações.
7. Obter o aceite final dos usuários do salão.
8. Publicar a versão considerada estável.

## 5. Pendências que não bloqueiam o MVP

Podem ser planejadas depois do aceite da primeira versão:

- Confirmações e lembretes automáticos.
- Integração oficial com WhatsApp, além do link direto atual.
- Contratos de locação e gestão de salas.
- Pagamentos, estoque e campanhas.
- Histórico avançado e indicadores adicionais de clientes.
- Melhorias de observabilidade e auditoria detalhada.

## 6. Definição de concluído

O MVP será considerado concluído quando:

- o deploy de produção estiver funcional;
- as migrations estiverem aplicadas no ambiente correto;
- os fluxos principais forem validados por usuários do salão;
- as permissões forem verificadas no banco e na aplicação;
- typecheck, lint, build e testes relevantes passarem;
- backup e restauração forem testados;
- recuperação de senha e acesso administrativo estiverem documentados;
- não existirem falhas bloqueadoras conhecidas.

## 7. Registro de execução

| Data | Item | Resultado | Responsável |
| --- | --- | --- | --- |
| 17/11/2026 | Migrations até profissionais e comissões | Aplicadas no Supabase | Responsável pelo projeto |
| 17/11/2026 | Integração em `develop` | Concluída e enviada ao remoto | Desenvolvimento |
| 17/11/2026 | Promoção para `main` | Concluída e enviada ao remoto | Desenvolvimento |
| 18/11/2026 | Typecheck, lint e build | Passaram | Desenvolvimento |
| 18/11/2026 | Testes Vitest | 10 testes; cobertura do núcleo acima de 90% | Desenvolvimento |
| — | Validação de integração com Supabase | Pendente | — |
| — | Aceite manual final | Pendente | — |
