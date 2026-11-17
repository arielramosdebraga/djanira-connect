# Status da implementação

Atualizado em 17/11/2026.

## Implementado

- Fundação: autenticação, sessão protegida, organização e papéis.
- Serviços: cadastro, ativação e desativação.
- Contatos: cadastro, edição, arquivamento, máscara de telefone, busca instantânea, filtros e data do último contato.
- Atendimentos: registro, snapshots históricos, retornos e cancelamento administrativo.
- Retornos: fila, adiamento, dispensa, WhatsApp manual e registro explícito de contato.
- Configurações: nome, fuso horário e mensagem padrão.
- Configurações: telefone do WhatsApp do salão.
- Agenda: horários semanais fixos das 09:00 às 18:00 e compromissos internos.
- Reservas públicas: catálogo, validação de disponibilidade e criação de cliente/reserva.
- Reservas públicas: horários livres por serviço/data e contato direto via WhatsApp.
- Início: calendário semanal e modal para novo agendamento.
- Massa fictícia para validação manual.

## Migrations que precisam estar aplicadas

Executar em ordem no projeto Supabase:

1. `20261116000900_public_reservations.sql`
2. `20261116001000_demo_data.sql`
3. `20261116001100_fixed_business_hours.sql`
4. `20261116001200_cancel_attendances.sql`
5. `20261116001300_public_available_slots.sql`
6. `20261116001400_salon_whatsapp.sql`
7. `20261117000100_edit_attendances.sql`

As migrations de `001` a `008` são pré-requisitos dos módulos anteriores.

## Pendências antes da produção

- Executar typecheck, lint, testes e build.
- Validar fluxos principais manualmente em computador e celular.
- Revisar RLS e permissões com contas de administrador e operador.
- Testar recuperação de senha e configuração de e-mail do Supabase.
- Configurar variáveis de ambiente na hospedagem.
- Definir backup, restauração e procedimento de recuperação de acesso.
- Revisar proteção contra abuso da reserva pública.
- Atualizar o PRD e o roadmap para refletir que agenda, horários públicos e contato via WhatsApp já foram implementados.
- Integrar a branch do módulo em `develop` após a validação.

## Critério de liberação

O sistema só deve ser usado com dados reais depois de aplicar as migrations,
concluir a validação manual e obter sucesso em typecheck, lint, testes e build.
