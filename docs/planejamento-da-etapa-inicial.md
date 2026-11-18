# Planejamento da etapa inicial — Sistema de gestão do salão

## 1. Objetivo do documento

Definir o escopo funcional e técnico da primeira versão do sistema, servindo como base para um plano de implementação dividido em tarefas.

O sistema será uma aplicação web em React e Next.js, publicada na Vercel e utilizada inicialmente por duas pessoas. Sua finalidade é organizar a rotina do salão, reduzir controles manuais e facilitar o contato com clientes.

A arquitetura deve permitir crescimento gradual, mas sem antecipar a complexidade de uma plataforma grande.

### Premissas

- Uma única operação: o salão.
- Duas contas individuais de acesso.
- Uso pelo computador e pelo celular.
- Baixo volume inicial de dados e acessos.
- Prioridade para baixo custo de infraestrutura e manutenção.
- Clientes não terão acesso ao sistema nesta etapa.
- Contatos pelo WhatsApp serão enviados manualmente.
- Não haverá agendamento público nesta etapa.
- O documento “Lista de desenvolvimento” é a referência funcional.

## 2. Decisão principal

**Começar por serviços, contatos, registro de atendimentos e lembretes de retorno.**

Embora o cadastro de atendimentos não apareça como módulo separado na lista original, ele é necessário para alimentar o histórico dos clientes e calcular os retornos.

A primeira versão deve permitir este fluxo completo:

1. Cadastrar um serviço e seu prazo de retorno.
2. Cadastrar ou localizar um cliente.
3. Registrar um atendimento concluído.
4. Consultar os clientes que precisam de retorno.
5. Abrir uma conversa no WhatsApp com uma mensagem sugerida.
6. Registrar que o contato foi realizado.

**Resultado esperado:** as duas pessoas conseguem usar o sistema diariamente, sem depender de agenda pública, automações pagas ou um backend separado.

## 3. Escopo da primeira versão

| Módulo | Entrega inicial | Fora desta etapa |
| --- | --- | --- |
| Acesso | Login de duas pessoas e recuperação de acesso | Cadastro público e cobrança por assinatura |
| Serviços | Cadastro, edição e desativação | Pacotes, promoções e comissões |
| Contatos | Cadastro, busca, filtros e histórico | Campanhas e importações complexas |
| Atendimentos | Registro de serviços realizados | Caixa, estoque e pagamentos |
| Retornos | Lista de vencidos e próximos retornos | Disparo automático de mensagens |
| WhatsApp | Link com mensagem e registro manual de contato | API oficial, chatbot e automações |
| Configurações | Nome do salão, fuso e mensagem padrão | Personalização avançada |
| Agenda | Não incluída | Calendário, disponibilidade e reservas |
| Contratos e salas | Não incluídos | Editor de cláusulas, PDF e gestão de locações |

## 4. Perfis de acesso

### Administrador

- Gerencia serviços, contatos e atendimentos.
- Consulta e atualiza retornos.
- Altera configurações do salão.
- Pode corrigir ou cancelar um atendimento registrado incorretamente.

### Operador

- Consulta serviços.
- Cadastra e atualiza contatos.
- Registra atendimentos.
- Consulta retornos e registra contatos realizados.
- Não altera configurações administrativas nem cancela atendimentos.

### Regras

- Cada pessoa terá sua própria conta.
- Não haverá senha compartilhada.
- As duas contas terão acesso aos mesmos clientes e atendimentos.
- A criação de usuários será restrita ao administrador ou ao provisionamento técnico.
- Não haverá tela pública de inscrição.
- As permissões precisam ser verificadas no servidor e no banco; esconder um botão não constitui controle de acesso.

## 5. Funcionalidades detalhadas

### 5.1. Cadastro de serviços

Campos:

- Nome.
- Valor médio opcional.
- Duração média em minutos.
- Prazo de retorno em dias, opcional.
- Situação: ativo ou inativo.

Regras:

- Nome obrigatório.
- Duração positiva.
- Valor não negativo, quando informado.
- Prazo de retorno positivo, quando informado.
- Sem prazo de retorno, o serviço não gera lembrete.
- Serviço inativo permanece no histórico, mas não pode ser escolhido em novos atendimentos.
- Alterações no serviço não modificam os dados históricos dos atendimentos já registrados.

**Simplificação:** usar um valor médio, não uma faixa de preços, na primeira versão.

### 5.2. Cadastro de contatos

Campos:

- Nome.
- Telefone/WhatsApp.
- Observações.
- Data de criação.
- Data do último contato realizado.
- Situação: ativo ou arquivado.
- Indicador para não realizar contatos de retorno.

Funcionalidades:

- Buscar por nome ou telefone.
- Editar dados.
- Consultar histórico de atendimentos e de contatos realizados.
- Filtrar por serviço realizado.
- Filtrar clientes com retorno pendente.
- Filtrar clientes sem contato há determinada quantidade de dias.
- Identificar separadamente quem nunca recebeu contato registrado.

Regras:

- Normalizar o telefone para um formato consistente, com código do país.
- Sugerir o Brasil como país padrão, permitindo correção.
- Exigir telefone válido no cadastro inicial.
- Alertar quando o telefone já existir, mas permitir confirmação: pessoas diferentes podem compartilhar um número.
- Não interpretar atendimento realizado como mensagem enviada.
- Clientes arquivados ou marcados para não receber contato ficam fora da fila de retorno.
- Observações devem ser objetivas; evitar informações sensíveis desnecessárias.

### 5.3. Registro de atendimentos

Campos:

- Cliente.
- Serviço.
- Data e horário do atendimento.
- Valor praticado opcional.
- Observações opcionais.
- Usuário responsável pelo registro.

Regras:

- Registrar apenas atendimentos já realizados.
- Permitir informar uma data passada.
- Um registro representa um serviço realizado.
- Se um cliente realizou vários serviços, registrar um atendimento para cada serviço.
- Guardar uma cópia do nome, duração e prazo de retorno do serviço no momento do atendimento.
- Calcular a data prevista de retorno com base na data local do atendimento.
- Guardar o valor efetivamente informado, sem depender de mudanças futuras no cadastro do serviço.
- Impedir envio duplicado causado por duplo clique ou repetição da requisição.
- Correções que afetem o cálculo devem atualizar a referência de retorno.
- Cancelamentos devem manter rastreabilidade, sem apagar silenciosamente o histórico.

### 5.4. Painel de retornos

Listas:

- **Para chamar hoje:** retornos vencidos ou previstos para hoje.
- **Próximos retornos:** previsões dos próximos sete dias.
- **Já chamados:** retornos com contato registrado.
- **Adiados:** retornos com nova data de acompanhamento.

Informações por item:

- Cliente.
- Serviço de referência.
- Último atendimento daquele serviço.
- Data prevista de retorno.
- Último contato realizado.
- Situação do acompanhamento.

Ações:

- Abrir WhatsApp.
- Já chamei.
- Adiar retorno.
- Dispensar este lembrete.
- Abrir ficha do cliente.

#### Regra de cálculo

- Cada atendimento válido com prazo de retorno gera uma referência de acompanhamento.
- A data prevista corresponde à data local do atendimento acrescida do prazo registrado.
- Para cada combinação de cliente e serviço, apenas o atendimento válido mais recente mantém um retorno ativo.
- Se um novo atendimento for registrado com data anterior ao mais recente, ele entra no histórico, mas não substitui o retorno ativo.
- Um novo atendimento mais recente encerra o acompanhamento anterior daquele serviço.
- Se o atendimento mais recente for cancelado, o sistema reavalia o atendimento válido anterior.

#### Regra de contato

- Abrir o WhatsApp não significa que uma mensagem foi enviada.
- O usuário deve clicar em “Já chamei” após realizar o contato.
- Essa ação registra data, usuário e retorno correspondente.
- O lembrete sai da fila ativa, mas o cliente continua com a data prevista e o histórico visíveis.
- Adiar muda a próxima data de acompanhamento, preservando a previsão original.
- Dispensar encerra somente aquele lembrete, sem bloquear contatos futuros.
- O sistema não confirma entrega nem leitura da mensagem.

**Não será necessário um agendador automático:** a fila será consultada no banco conforme a data corrente.

### 5.5. WhatsApp

- Usar link de abertura do WhatsApp com telefone normalizado.
- Preencher uma mensagem sugerida.
- Permitir edição da mensagem antes de abrir o aplicativo.
- Usar nome do cliente, serviço e nome do salão como variáveis.
- Codificar corretamente o texto no endereço do link.

Exemplo de mensagem:

> Olá, Maria! Aqui é do Salão. Estamos entrando em contato para saber se você gostaria de marcar um novo atendimento de corte. Podemos combinar um horário?

**Limitação assumida:** o envio depende da ação da pessoa no WhatsApp e não tem integração paga nesta etapa.

### 5.6. Configurações

- Nome do salão.
- Fuso horário, inicialmente America/Sao_Paulo.
- Texto padrão de contato.
- Identificação e papel das duas contas.

A gestão completa de usuários pode ficar fora da interface inicial. O provisionamento de contas pode ser feito de forma administrativa.

## 6. Telas e navegação

| Tela | Objetivo |
| --- | --- |
| Login | Acesso das duas pessoas |
| Recuperação de acesso | Recuperar credenciais |
| Início | Resumo de retornos e atalhos |
| Serviços | Listar e gerenciar serviços |
| Contatos | Buscar, filtrar e cadastrar clientes |
| Ficha do cliente | Dados, atendimentos e contatos realizados |
| Registrar atendimento | Informar um serviço concluído |
| Retornos | Executar a rotina diária de acompanhamento |
| Configurações | Ajustes administrativos |

### Diretrizes de interface

- Layout responsivo, priorizando tarefas frequentes no celular.
- Navegação simples e poucos níveis de menu.
- Botão de “Registrar atendimento” facilmente acessível.
- Formulários curtos e mensagens de validação claras.
- Estados de carregamento, lista vazia, erro e sucesso.
- Confirmação em ações destrutivas.
- Paginação em contatos e históricos.
- Pesquisa com pequeno atraso para evitar requisições a cada tecla.
- Foco visível, campos rotulados e contraste adequado.
- Botões bloqueados durante o envio para reduzir duplicações.

## 7. Arquitetura recomendada

### Stack

| Camada | Escolha | Justificativa |
| --- | --- | --- |
| Aplicação | Next.js com App Router e React | Interface e lógica de servidor no mesmo projeto |
| Linguagem | TypeScript | Contratos e validações mais claros |
| Estilos | Tailwind CSS | Desenvolvimento rápido de telas responsivas |
| Componentes | shadcn/ui, usando apenas o necessário | Base acessível e código controlado pelo projeto |
| Formulários | React Hook Form e Zod | Validação reutilizável |
| Banco | PostgreSQL no Supabase | Banco relacional adequado ao histórico e crescimento |
| Autenticação | Supabase Auth | Evita implementar gestão de credenciais |
| Acesso a dados | Cliente oficial do Supabase | Menos camadas na primeira versão |
| Hospedagem | Vercel | Compatível com Next.js |
| Versionamento | Git e repositório privado | Histórico e deploy integrado |
| Testes | Vitest e Playwright | Regras unitárias e fluxos essenciais |

Usar versões estáveis e compatíveis entre si, com dependências travadas no arquivo de lock.

### Organização

Adotar um **monólito modular**:

- Uma aplicação Next.js.
- Um banco PostgreSQL.
- Módulos separados por domínio: serviços, clientes, atendimentos e retornos.
- Componentes de interface compartilhados.
- Regras de negócio fora dos componentes visuais.
- Acesso ao banco concentrado em funções de dados.
- Migrações SQL versionadas.

### Fluxo de acesso

- Consultas internas passam preferencialmente pela camada de servidor do Next.js.
- Componentes de cliente ficam restritos às partes interativas.
- Escritas usam Server Actions com validação e autorização.
- Route Handlers ficam reservados para futuras APIs ou integrações.
- A sessão autenticada acompanha as operações no Supabase.
- Políticas de segurança no banco continuam obrigatórias.

Não adotar agora:

- Backend separado em outro framework.
- Microsserviços.
- Redis.
- Filas de processamento.
- ORM adicional sem necessidade concreta.
- Sincronização em tempo real.
- Aplicativo nativo.
- Infraestrutura de SaaS multitenant completa.

## 8. Modelo de dados inicial

| Entidade | Responsabilidade |
| --- | --- |
| Organização | Identificação e configurações do salão |
| Membro da organização | Ligação entre usuário autenticado, salão e papel |
| Serviço | Catálogo de serviços |
| Cliente | Dados de contato e preferências |
| Atendimento | Serviço realizado e dados históricos |
| Retorno | Previsão e situação de acompanhamento |
| Registro de contato | Histórico de contatos realizados |
| Evento de auditoria | Alterações críticas e responsáveis |

### Dados essenciais de cada entidade

**Organização**

- Identificador.
- Nome.
- Fuso horário.
- Mensagem padrão.

**Membro**

- Usuário autenticado.
- Organização.
- Papel.
- Situação ativa.

**Serviço**

- Organização.
- Nome.
- Valor médio em centavos.
- Duração em minutos.
- Prazo de retorno em dias.
- Situação ativa.

**Cliente**

- Organização.
- Nome.
- Telefone normalizado.
- Observações.
- Preferência de não receber contato.
- Data do último contato.
- Situação.
- Datas de criação e atualização.

**Atendimento**

- Organização.
- Cliente e serviço.
- Data e horário.
- Cópias dos dados históricos relevantes do serviço.
- Valor praticado em centavos.
- Observações.
- Usuário responsável.
- Situação e dados de eventual cancelamento.

**Retorno**

- Organização.
- Cliente, serviço e atendimento de origem.
- Data prevista original.
- Próxima data de acompanhamento.
- Situação: pendente, contatado, dispensado ou substituído.
- Datas e responsáveis pelas alterações.

**Registro de contato**

- Organização.
- Cliente.
- Retorno relacionado, quando houver.
- Canal.
- Data e horário.
- Usuário responsável.
- Observação opcional.

### Convenções

- Identificadores UUID.
- Valores monetários em centavos.
- Eventos com data e horário armazenados como timestamps com fuso.
- Datas previstas de retorno armazenadas como datas de calendário.
- Cálculos de calendário feitos no fuso do salão, não no fuso padrão do servidor.
- Índices para buscas frequentes e filtros de retorno.
- Chaves estrangeiras e restrições de integridade.
- Apenas um acompanhamento ativo por cliente e serviço.
- Organização presente nos dados desde o início, com um único salão provisionado.

Essa última decisão facilita uma possível expansão, mas não implica criar cadastro de empresas, planos ou cobrança nesta etapa.

## 9. Integridade e segurança

### Operações atômicas

O registro de atendimento e a atualização do retorno correspondente devem ocorrer na mesma transação.

A implementação deve prever uma função de banco chamada com a identidade do usuário, ou mecanismo transacional equivalente, para evitar:

- Atendimento sem retorno.
- Retorno sem atendimento.
- Dois retornos ativos para o mesmo cliente e serviço.
- Duplicações decorrentes de tentativas repetidas.

A função deve validar organização, autorização e integridade, sem depender apenas das verificações da interface.

### Proteção de acesso

- Autenticação obrigatória nas áreas internas.
- Row Level Security nas tabelas de negócio.
- Políticas baseadas no vínculo ativo do usuário com a organização.
- Validação de entrada no servidor.
- Nenhuma chave administrativa enviada ao navegador.
- Variáveis sensíveis apenas no ambiente de servidor.
- Cadastro público de usuários desabilitado.
- Testes de acesso direto ao banco, além dos testes de navegação.

### Privacidade

- Coletar somente dados necessários.
- Não registrar telefone completo ou observações de clientes em logs técnicos.
- Restringir o acesso às duas pessoas autorizadas.
- Respeitar pedidos para não realizar contatos.
- Definir procedimento para correção e exclusão ou anonimização de dados.
- Não considerar o simples cadastro como autorização irrestrita para campanhas.
- Registrar orientações internas de uso e uma política de privacidade compatível com o tratamento realizado.

## 10. Infraestrutura e custo

### Estratégia inicial

- Um projeto Next.js.
- Um projeto Supabase para produção.
- Desenvolvimento e testes de banco preferencialmente locais.
- Sem ambiente de homologação permanentemente pago.
- Sem domínio próprio obrigatório para começar.
- Sem serviços pagos de WhatsApp.
- Sem armazenamento de documentos nesta etapa.
- Sem tarefas agendadas para gerar retornos.

### Atenção aos planos

| Item | Orientação |
| --- | --- |
| Vercel | Confirmar o plano permitido para uso comercial antes da produção |
| Supabase | Começar no plano gratuito se os limites e condições atenderem ao uso |
| Domínio | Opcional; tem custo próprio |
| E-mail de autenticação | Validar limites e configuração de SMTP antes do uso real |
| WhatsApp | Abertura manual por link, sem custo de API |
| Backups | Definir rotina externa e protegida, sem pressupor backups gerenciados no plano gratuito |

O fato de existirem apenas dois usuários não torna o uso do salão não comercial. **Não planejar a operação comercial presumindo que o Vercel Hobby pode ser utilizado.**

O plano gratuito do Supabase pode ter limites e suspensão por baixa atividade. Ele pode servir ao início, mas não deve ser tratado como garantia de disponibilidade.

Os valores e condições dos provedores devem ser confirmados na contratação. Este planejamento não fixa orçamento mensal.

### Controle de gastos

- Ativar alertas e controles de consumo disponíveis.
- Evitar consultas sem paginação.
- Não executar consultas periódicas em segundo plano sem necessidade.
- Carregar apenas os dados utilizados na tela.
- Não adicionar ferramentas pagas antes de existir um problema concreto.
- Acompanhar uso do banco e custos após o início da operação.

## 11. Deploy e operação

### Ambientes

- **Local:** desenvolvimento, banco de testes e dados fictícios.
- **Preview:** revisão de interface, usando dados fictícios ou ambiente isolado.
- **Produção:** dados reais do salão.

Previews não devem escrever no banco de produção nem expor dados reais sem controle adequado.

### Processo de publicação

1. Executar verificações de tipos, lint, testes e build.
2. Revisar alterações de banco.
3. Aplicar migrações controladas.
4. Publicar a aplicação na Vercel.
5. Verificar login e o fluxo principal.
6. Registrar a versão publicada.

### Cuidados operacionais

- Aplicação e banco em regiões próximas, quando disponível no plano escolhido.
- Nenhum arquivo importante salvo no disco temporário da Vercel.
- Backup lógico diário em armazenamento externo protegido, enquanto não houver alternativa gerenciada adequada.
- Teste de restauração antes de começar a depender do sistema.
- Documentação de recuperação de acesso e falhas.
- Logs técnicos sem conteúdo sensível.
- Migrações compatíveis com a versão anterior sempre que possível.

## 12. Ordem de implementação

### Entrega 1 — Fundação

- Criar projeto e estrutura modular.
- Configurar banco e migrações.
- Criar organização e duas contas.
- Implementar login, sessão e recuperação de acesso.
- Implementar permissões e políticas de banco.
- Publicar uma versão privada inicial.

**Critério de conclusão:** as duas pessoas acessam com contas individuais e usuários não autorizados não conseguem consultar dados.

### Entrega 2 — Serviços e contatos

- Implementar catálogo de serviços.
- Implementar contatos.
- Implementar busca, paginação e validações.
- Implementar arquivamento e alerta de telefone duplicado.

**Critério de conclusão:** é possível cadastrar um serviço e um cliente, localizá-los e editar os dados.

### Entrega 3 — Atendimentos e histórico

- Implementar registro de atendimento.
- Salvar cópias históricas do serviço.
- Criar transação de atendimento e retorno.
- Exibir histórico na ficha do cliente.
- Implementar correção e cancelamento com rastreabilidade.

**Critério de conclusão:** alterações posteriores no serviço não modificam atendimentos anteriores.

### Entrega 4 — Retornos e WhatsApp

- Implementar fila diária.
- Implementar próximos retornos e filtros.
- Implementar mensagem sugerida.
- Implementar “Já chamei”, adiamento e dispensa.
- Registrar histórico de contatos.

**Critério de conclusão:** o ciclo completo de atendimento e acompanhamento funciona sem envio automático.

### Entrega 5 — Validação e uso real

- Executar testes de segurança e regras.
- Revisar a experiência no celular.
- Testar backup e restauração.
- Configurar produção e limites de infraestrutura.
- Orientar as duas pessoas.
- Iniciar piloto e corrigir problemas encontrados.

**Critério de conclusão:** as duas pessoas executam a rotina com dados reais, sem falhas bloqueadoras.

Não é necessário estimar prazo total antes de decompor essas entregas em tarefas e definir quem implementará o sistema.

## 13. Testes e critérios de aceite

### Regras de negócio

- Serviço sem prazo não gera retorno.
- Serviço com prazo gera a data correta.
- Cálculo funciona em viradas de mês e de ano.
- Alteração de prazo não muda retornos históricos.
- Atendimento retroativo não substitui incorretamente um atendimento mais recente.
- Novo atendimento mais recente substitui o retorno anterior do mesmo serviço.
- Serviços diferentes mantêm acompanhamentos independentes.
- Cancelamento do atendimento mais recente reavalia a referência anterior.
- Abrir WhatsApp não atualiza o último contato.
- “Já chamei” registra usuário, data e retorno.
- Adiamento preserva a data prevista original.
- Clientes arquivados ou com restrição de contato não aparecem na fila.

### Segurança

- Usuário sem sessão não acessa dados.
- Usuário inativo não mantém autorização de negócio.
- Operador não executa ações administrativas, mesmo por requisição direta.
- Consultas diretas respeitam as políticas do banco.
- Nenhum segredo administrativo aparece no bundle do navegador.

### Experiência e confiabilidade

- Busca funciona com telefones normalizados.
- Duplo clique não duplica atendimento.
- Falha de gravação não exibe sucesso.
- Listas possuem paginação e estados vazios.
- Fluxo principal funciona no celular.
- As duas pessoas conseguem operar simultaneamente sem comprometer o histórico.
- Backup pode ser restaurado em um ambiente de teste.

## 14. Evolução após a primeira versão

### Próxima etapa — Agenda interna

- Profissionais ou recursos de atendimento.
- Dias, horários, intervalos e folgas.
- Agendamentos internos.
- Visões de dia e semana.
- Cancelamentos e remarcações.
- Bloqueio de sobreposição no banco.

A duração registrada nos serviços será aproveitada nessa etapa.

### Etapa seguinte — Reserva pública

- Link público do salão.
- Escolha de serviço e horários disponíveis.
- Cadastro automático ou associação segura do cliente.
- Validação da reserva no servidor.
- Controle transacional contra reservas simultâneas.
- Proteção contra abuso e submissões automatizadas.
- Exposição apenas dos dados necessários à reserva.

### Automação de mensagens

- Confirmações e lembretes.
- Avaliação da API oficial do WhatsApp e seus custos.
- Preferências de comunicação.
- Controle de duplicação e tentativas.
- Rotina agendada ou fila apenas quando necessária.

### Contratos e salas — Módulo independente

- Cadastro e ocupação das salas.
- Modelo de contrato.
- Campos preenchíveis.
- Cláusulas editáveis e reordenáveis.
- Geração de PDF com campos de assinatura.
- Histórico de versões.
- Alertas de vencimento e reajuste.

**Dependência:** o texto integral do contrato do Salão Djanira Montclair não consta na lista de desenvolvimento e deverá ser fornecido antes da implementação desse módulo.

Campos de assinatura no PDF não equivalem a assinatura eletrônica. Esse recurso deve ser tratado separadamente, se necessário.

## 15. Itens que não devem entrar por antecipação

- Painel financeiro completo.
- Pagamento online.
- Controle de estoque.
- Comissões.
- Campanhas em massa.
- Inteligência artificial.
- Aplicativo para lojas de celular.
- Assinaturas e cobrança de outros salões.
- Editor genérico de processos.
- Infraestrutura distribuída.
- Integrações sem demanda validada.

A aplicação deve estar preparada para receber módulos, não implementar módulos ainda sem utilidade.

## 16. Decisões assumidas e validações pendentes

| Tema | Decisão inicial | Validação necessária |
| --- | --- | --- |
| Operação | Um salão | Confirmar antes de ampliar o escopo |
| Usuários | Um administrador e um operador | Confirmar se ambas as pessoas precisam ser administradoras |
| Telefone | Obrigatório | Confirmar existência de clientes sem telefone |
| Atendimento | Um serviço por registro | Avaliar agrupamento em visitas numa etapa futura |
| Retorno | Manual após previsão automática | Validar a rotina com as duas pessoas |
| Agenda | Fora da primeira versão | Confirmar se há dependência operacional urgente |
| Dados existentes | Cadastro manual no início | Avaliar importação simples caso exista uma base |
| Infraestrutura | Next.js, Vercel e Supabase | Confirmar planos, limites e uso comercial |
| Contratos | Posteriores e independentes | Obter o modelo integral |

Essas premissas permitem iniciar o planejamento técnico sem esperar por decisões de funcionalidades futuras.

## 17. Como transformar este documento em plano de implementação

Cada entrega deve ser decomposta em tarefas com:

- Objetivo.
- Dependências.
- Telas ou componentes afetados.
- Alterações de banco.
- Regras de autorização.
- Validações.
- Critérios de aceite.
- Testes.
- Estimativa.
- Procedimento de publicação.

### Definição de tarefa concluída

Uma tarefa só estará concluída quando:

- Estiver implementada.
- Tiver validação no servidor.
- Respeitar as permissões aplicáveis.
- Tratar erros e estados de carregamento.
- Passar nos testes relevantes.
- Passar em tipos, lint e build.
- Possuir migração versionada, quando necessária.
- Não expuser credenciais nem dados indevidos.
- Estiver documentada quando afetar operação ou recuperação.

## 18. Resumo da recomendação

Construir uma aplicação Next.js modular, com autenticação e PostgreSQL no Supabase, publicada na Vercel.

A primeira versão deverá entregar somente:

**Acesso individual → serviços → contatos → atendimentos → retornos → contato manual pelo WhatsApp.**

Esse recorte resolve a necessidade imediata das duas pessoas, limita o custo operacional e estabelece uma base consistente para agenda, reservas, automações e contratos.