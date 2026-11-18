# Modelo de dados inicial

## Entidades

| Entidade | Responsabilidade |
| --- | --- |
| Organização | Identificação e configurações do salão |
| Membro | Usuário autenticado, organização e papel |
| Serviço | Catálogo de serviços |
| Cliente | Dados de contato e preferências |
| Atendimento | Serviço realizado e snapshot histórico |
| Retorno | Previsão e situação do acompanhamento |
| Registro de contato | Histórico de contatos realizados |
| Evento de auditoria | Alterações críticas e responsáveis |

## Convenções

- Identificadores usam UUID.
- Valores monetários usam inteiros em centavos.
- Timestamps são armazenados com fuso.
- Datas previstas são datas de calendário.
- Cálculos usam o fuso da organização, inicialmente `America/Sao_Paulo`.
- Todas as entidades de negócio possuem vínculo com a organização.
- Chaves estrangeiras e restrições de integridade são obrigatórias.
- Consultas frequentes devem possuir índices adequados.

## Campos principais

### Organização

`id`, `name`, `timezone`, `default_message`, `created_at`, `updated_at`

### Membro

`id`, `organization_id`, `user_id`, `role`, `active`, `created_at`

### Serviço

`id`, `organization_id`, `name`, `average_price_cents`,
`duration_minutes`, `return_period_days`, `active`, `created_at`, `updated_at`

### Cliente

`id`, `organization_id`, `name`, `phone_normalized`, `notes`,
`do_not_contact`, `status`, `last_contact_at`, `created_at`, `updated_at`

### Atendimento

`id`, `organization_id`, `customer_id`, `service_id`, `performed_at`,
`service_name_snapshot`, `service_duration_snapshot`,
`return_period_days_snapshot`, `price_cents`, `notes`, `created_by`,
`status`, `cancelled_at`, `cancelled_by`, `created_at`, `updated_at`

### Retorno

`id`, `organization_id`, `customer_id`, `service_id`, `appointment_id`,
`original_due_date`, `next_follow_up_date`, `status`, `contacted_at`,
`contacted_by`, `postponed_at`, `dismissed_at`, `created_at`, `updated_at`

### Registro de contato

`id`, `organization_id`, `customer_id`, `follow_up_id`, `channel`,
`contacted_at`, `created_by`, `notes`, `created_at`

## Integridade

- Deve existir no máximo um retorno ativo por combinação de cliente e serviço.
- Atendimento e retorno devem ser criados ou atualizados na mesma transação.
- RLS deve limitar registros ao vínculo ativo do usuário com a organização.
- Dados históricos não podem depender de valores atuais do catálogo.
