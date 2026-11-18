# Roadmap e módulos

## Primeira entrega funcional

Fluxo validável de ponta a ponta:

`Acesso -> Serviços -> Contatos -> Atendimento -> Retorno -> WhatsApp manual`

### Ordem de implementação

| Ordem | Módulo | Branch | Resultado esperado |
| --- | --- | --- | --- |
| 1 | Fundação | `feature/modulo-fundacao` | Aplicação privada, autenticação e permissões |
| 2 | Serviços | `feature/modulo-servicos` | Catálogo de serviços ativo/inativo |
| 3 | Contatos - cadastro e busca | `feature/modulo-contatos` | Cadastro, edição, normalização de telefone e busca |
| 4 | Atendimentos | `feature/modulo-atendimentos` | Registro histórico de serviços realizados |
| 5 | Contatos - histórico e filtros dependentes | `feature/modulo-contatos` | Histórico de serviços e filtros que dependem de atendimentos/retornos |
| 6 | Retornos e WhatsApp | `feature/modulo-retornos-whatsapp` | Fila de retorno e contato manual |
| 7 | Agenda | `feature/modulo-agenda` | Horários, folgas e agenda interna |
| 8 | Reservas públicas | `feature/modulo-reservas-publicas` | Cliente escolhe serviço e horário |
| 9 | Confirmações | `feature/modulo-confirmacoes` | Confirmações e lembretes de reserva |
| 10 | Contratos e salas | `feature/modulo-contratos-salas` | Contratos versionados e gestão de salas |

Status atual da implementação e pendências de liberação estão em
`status-da-implementacao.md`. Agenda interna e reservas públicas já foram
implementadas no branch de desenvolvimento, embora permaneçam etapas de
validação e operação antes da produção.

O módulo de contatos é entregue em duas partes por dependência funcional. O
cadastro e a busca podem ser testados antes de atendimentos. Histórico de
serviços, filtros por serviço e filtros de retorno são concluídos quando os
módulos de atendimentos e retornos fornecerem os dados necessários.

## Critério de conclusão de módulo

Um módulo só deve ser integrado em `develop` quando:

- sua regra de negócio estiver implementada no servidor;
- as permissões estiverem protegidas no banco e na aplicação;
- estados de carregamento, erro, vazio e sucesso estiverem tratados;
- houver testes relevantes;
- typecheck, lint, testes e build passarem;
- migrações estiverem versionadas, quando aplicável;
- o fluxo principal estiver validado em tela responsiva.

## Fora da primeira entrega

Agenda, reservas públicas, confirmações automáticas e contratos ficam fora do
primeiro piloto. O código deve permitir sua evolução sem implementar essas
funcionalidades antecipadamente.
