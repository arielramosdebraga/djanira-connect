# Instruções para agentes

## Contexto do projeto

- Projeto: Djanira Connect, sistema web de gestão de salão.
- Stack: Next.js App Router, React, TypeScript, Firebase Authentication,
  Cloud Firestore e Vercel.
- O site e o NailFlow compartilham o projeto Firebase, as coleções `clients` e
  `appointments` e os perfis de usuário.
- Consulte `prd.md` para requisitos e `planejamento-da-etapa-inicial.md` para o
  recorte da primeira versão.
- Consulte `decisoes.md` antes de alterar escopo, arquitetura, segurança ou
  modelo de dados.

## Idioma e nomenclatura

- Código, identificadores, nomes de tipos, funções, variáveis e arquivos de
  código em inglês.
- Textos apresentados na interface em português brasileiro (pt-BR).
- Documentação, commits, títulos e descrições de PR, reviews e comentários de
  código em português.
- Use nomes claros e consistentes com o domínio já estabelecido.

## Forma de trabalhar

- Implemente as mudanças solicitadas diretamente no código, ponta a ponta
  quando aplicável.
- Leia os documentos do módulo antes de implementar e mantenha decisões
  importantes registradas em `decisoes.md`.
- Preserve alterações preexistentes do usuário; não reverta mudanças alheias à
  tarefa.
- Use branches `feature/modulo-*` quando um módulo entrar em implementação e
  atualize a branch a partir de `develop` antes de começar, salvo instrução
  diferente do responsável pelo projeto.
- Faça commits semânticos em português, pequenos e fáceis de revisar, com corpo
  explicando o que foi feito e por quê.
- Não faça push, merge ou publicação sem solicitação explícita para aquela
  ação.

## Arquitetura e segurança

- Mantenha a aplicação como monólito modular Next.js; não introduza backend
  separado, microsserviços ou dependências estruturais sem necessidade
  concreta.
- Mantenha regras de negócio fora dos componentes visuais.
- Valide entradas e autorize operações no servidor.
- O Firebase Admin SDK ignora as regras do Firestore; toda operação do site no
  servidor deve validar sessão, papel e `salonId`.
- O NailFlow usa as regras do Firestore para acesso direto. Não abra leitura ou
  gravação anônima das coleções compartilhadas.
- Nunca exponha chaves administrativas ou segredos no navegador, em logs ou no
  controle de versão.
- Use dados fictícios em desenvolvimento e não conecte previews ao banco de
  produção.
- Evite registrar telefones completos e observações de clientes em logs.
- Preserve snapshots e rastreabilidade de dados históricos de atendimentos,
  retornos e comissões.

## Banco de dados

- Mantenha compatibilidade de campos entre o site e o NailFlow nas coleções
  compartilhadas.
- Versione no projeto os índices compostos exigidos por consultas do Firestore.
- Operações que criam ou atualizam atendimento e retorno devem ser atômicas e
  protegidas contra duplicação quando o fluxo exigir isso.
- Toda consulta e escrita deve respeitar o salão e o vínculo do usuário.
- Não use o Admin SDK para contornar a autorização das operações comuns.

## Validação

- Execute typecheck, lint e build de produção quando forem relevantes às
  mudanças.
- Execute testes automatizados somente após autorização explícita do
  responsável pelo projeto.
- Informe validações executadas e falhas. Não afirme que uma validação passou
  sem executá-la.
- Revise autorização, estados de carregamento/erro/vazio/sucesso e
  comportamento responsivo.

## Interface

- Priorize uso responsivo em celular e computador.
- Use rótulos, foco visível, contraste adequado e mensagens claras em pt-BR.
- Desabilite ações durante envios quando isso reduzir submissões duplicadas.
- Confirme ações destrutivas e apresente erros sem expor detalhes internos.

## Git e conclusão de trabalho

- Não use operações destrutivas como `reset --hard` ou descarte de alterações
  sem pedido explícito.
- Ao finalizar, informe arquivos alterados, comportamento implementado e
  validações realizadas.
- Consulte `guia-de-desenvolvimento.md` para o fluxo de branches e commits.
