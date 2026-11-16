# Roadmap e módulos

## Primeira entrega funcional

Fluxo validável de ponta a ponta:

`Acesso -> Serviços -> Contatos -> Atendimento -> Retorno -> WhatsApp manual`

### Ordem de implementação

| Ordem | Módulo | Branch | Resultado esperado |
| --- | --- | --- | --- |
| 1 | Fundação | `feature/modulo-fundacao` | Aplicação privada, autenticação e permissões |
| 2 | Serviços | `feature/modulo-servicos` | Catálogo de serviços ativo/inativo |
| 3 | Contatos | `feature/modulo-contatos` | Cadastro, busca, filtros e histórico básico |
| 4 | Atendimentos | `feature/modulo-atendimentos` | Registro histórico de serviços realizados |
| 5 | Retornos e WhatsApp | `feature/modulo-retornos-whatsapp` | Fila de retorno e contato manual |
| 6 | Agenda | `feature/modulo-agenda` | Horários, folgas e agenda interna |
| 7 | Reservas públicas | `feature/modulo-reservas-publicas` | Cliente escolhe serviço e horário |
| 8 | Confirmações | `feature/modulo-confirmacoes` | Confirmações e lembretes de reserva |
| 9 | Contratos e salas | `feature/modulo-contratos-salas` | Contratos versionados e gestão de salas |

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
