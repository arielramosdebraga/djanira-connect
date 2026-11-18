# Documentação do projeto

## Referências de produto

- [Lista inicial de desenvolvimento](lista-de-desenvolvimento.pdf): lista ampla de funcionalidades desejadas.
- [Planejamento da etapa inicial](planejamento-da-etapa-inicial.md): recorte funcional e técnico da primeira versão.

## Documentos de execução

- [Instruções para agentes](AGENTS.md): regras de trabalho, arquitetura, segurança e validação no repositório.
- [PRD](prd.md): visão, usuários, escopo, requisitos e critérios de aceite do produto.
- [Roadmap e módulos](roadmap.md): ordem de implementação, escopo e critérios de conclusão.
- [Arquitetura](arquitetura.md): stack, organização do código e fronteiras dos módulos.
- [Modelo de dados](modelo-de-dados.md): entidades, relacionamentos e convenções persistentes.
- [Regras de negócio](regras-de-negocio.md): comportamentos que devem ser preservados na implementação.
- [Guia de desenvolvimento](guia-de-desenvolvimento.md): fluxo local, branches, validações e publicação.
- [Decisões e pendências](decisoes.md): decisões assumidas e pontos que precisam de confirmação.
- [Planejamento de conclusão](planejamento-da-conclusao.md): fases, pendências e critérios para liberar o MVP.
- [Plano de implementação das pendências](plano-de-implementacao-pendencias.md): ordem prática para concluir comissão, segurança, auditoria, validação e produção.

## Como usar esta documentação

1. Consulte o roadmap para escolher o módulo da tarefa.
2. Consulte as regras de negócio antes de alterar o domínio.
3. Atualize o modelo de dados quando houver mudança de persistência.
4. Registre decisões que alterem escopo, segurança ou arquitetura.
5. Atualize os critérios de aceite antes de considerar o módulo concluído.

Documentos funcionais descrevem o que o sistema precisa fazer. Este índice e os
documentos técnicos descrevem como organizar a implementação. Em caso de
conflito, uma decisão deve ser registrada em `decisoes.md` antes do código ser
alterado.
