# Instruções para agentes

## Contexto do projeto

- Projeto: Djanira Connect, sistema web de gestão de salão.
- Stack definida: React e Next.js com App Router, TypeScript, Supabase (PostgreSQL e Auth) e Vercel.
- Consulte `prd.md` para requisitos de produto e `planejamento-da-etapa-inicial.md` para o recorte detalhado da primeira versão.
- Consulte `decisoes.md` antes de alterar escopo, arquitetura, segurança ou modelo de dados.

## Idioma e nomenclatura

- Código, identificadores, nomes de tipos, funções, variáveis e arquivos de código em inglês.
- Textos apresentados na interface em português brasileiro (pt-BR).
- Documentação, commits, títulos e descrições de PR, reviews e comentários de código em português.
- Use nomes claros e consistentes com o domínio já estabelecido.

## Forma de trabalhar

- Implemente as mudanças solicitadas diretamente no código, ponta a ponta quando aplicável.
- Leia os documentos do módulo antes de implementar e mantenha decisões importantes registradas em `decisoes.md`.
- Preserve alterações preexistentes do usuário; não reverta mudanças alheias à tarefa.
- Use branches `feature/modulo-*` quando o módulo entrar em implementação. Atualize a branch a partir de `develop` antes de começar.
- Faça commits semânticos em português, pequenos e fáceis de revisar, com corpo explicando o que foi feito e por quê.
- Não faça push, merge ou publicação sem solicitação explícita para aquela ação.

## Arquitetura e segurança

- Mantenha a aplicação como monólito modular Next.js; não introduza backend separado, microsserviços ou dependências estruturais sem necessidade concreta.
- Mantenha regras de negócio fora dos componentes visuais.
- Valide entradas e autorize operações no servidor.
- Proteja tabelas de negócio com Row Level Security; permissões não podem depender apenas de elementos ocultos na interface.
- Nunca exponha chaves administrativas ou segredos no navegador, em logs ou no controle de versão.
- Use dados fictícios em desenvolvimento e não conecte previews ao banco de produção.
- Evite registrar telefones completos e observações de clientes em logs.
- Preserve snapshots e rastreabilidade de dados históricos de atendimentos, retornos e contratos.

## Banco de dados

- Versione alterações de schema em migrações.
- Inclua chaves estrangeiras, restrições e índices necessários.
- Operações que criam/atualizam atendimento e retorno devem ser atômicas e protegidas contra duplicação.
- Toda consulta e escrita deve respeitar a organização e o vínculo ativo do usuário.
- Não use chave de serviço privilegiada para contornar políticas em operações comuns.

## Validação

Antes de considerar uma implementação concluída, execute as validações disponíveis e relevantes no projeto:

- typecheck;
- lint;
- testes unitários e de integração;
- testes E2E para fluxos afetados;
- build de produção.

Revise também migrações, autorização, estados de carregamento/erro/vazio/sucesso e comportamento responsivo. Informe claramente validações executadas e falhas. Se o repositório ainda não tiver scripts ou dependências para uma validação, registre isso como pendência em vez de afirmar que passou.

## Interface

- Priorize uso responsivo em celular e computador.
- Use rótulos, foco visível, contraste adequado e mensagens claras em pt-BR.
- Desabilite ações durante envios quando isso reduzir submissões duplicadas.
- Confirme ações destrutivas e apresente erros sem expor detalhes internos.

## Git e conclusão de trabalho

- Não use operações destrutivas como `reset --hard` ou descarte de alterações sem pedido explícito.
- Ao finalizar, informe arquivos alterados, comportamento implementado e validações realizadas.
- Consulte `guia-de-desenvolvimento.md` para o fluxo de branches e commits.
