# Guia de desenvolvimento

## Branches

- `main`: referência estável.
- `develop`: integração da sprint.
- `feature/modulo-*`: desenvolvimento isolado de cada módulo, aberta ou
  atualizada quando o módulo entrar em implementação.

Branches existentes:

- `feature/modulo-fundacao`
- `feature/modulo-servicos`
- `feature/modulo-contatos`
- `feature/modulo-atendimentos`
- `feature/modulo-retornos-whatsapp`
- `feature/modulo-agenda`
- `feature/modulo-reservas-publicas`
- `feature/modulo-confirmacoes`
- `feature/modulo-contratos-salas`

## Fluxo de trabalho

1. Atualizar `develop`.
2. Criar ou atualizar a branch do módulo a partir de `develop` quando o trabalho
   naquele módulo começar.
3. Implementar banco, servidor, interface e testes necessários.
4. Executar as validações locais.
5. Criar commit semântico em português.
6. Abrir revisão para integração em `develop`.
7. Atualizar a documentação quando houver mudança de decisão ou operação.

## Validações obrigatórias

Antes de integrar um módulo:

- typecheck;
- lint;
- testes unitários e de integração;
- testes E2E aplicáveis;
- build de produção;
- revisão das migrações;
- verificação de autorização e dados sensíveis.

## Dados de desenvolvimento

- Usar dados fictícios localmente.
- Não conectar preview ao banco de produção sem isolamento explícito.
- Não registrar telefone completo ou observações sensíveis em logs.
- Manter o arquivo de ambiente fora do versionamento.

## Commits

Usar Conventional Commits, em português, com escopo pequeno. Exemplos:

```text
feat(servicos): criar cadastro de serviços
fix(retornos): corrigir cálculo de data prevista
test(contatos): cobrir normalização de telefone
docs(arquitetura): registrar fluxo de acesso ao banco
```

O corpo do commit deve explicar:

- o que foi feito;
- por que foi feito.
