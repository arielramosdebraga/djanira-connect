# Modelo de dados compartilhado

O site e o NailFlow usam documentos do Cloud Firestore. Dados de cada salão levam salonId; o backend web confere o escopo no servidor.

## Coleções compartilhadas

### salons/{salonId}

- name, active.
- settings.timezone e settings.currency.
- O site também usa settings.defaultMessage e settings.whatsappPhone.

### users/{uid}

- uid, email, displayName, role, salonId e active.
- Papéis esperados: super_admin, salon_owner, nail_technician ou manicure (compatibilidade com perfis existentes).

### clients/{clientId}

- salonId, name, phone, phoneNormalized, email e birthDate.
- notes, tags, status, doNotContact, createdAt, lastVisit e lastContactAt.
- phoneNormalized contém somente dígitos e inclui o código do país quando conhecido.

### appointments/{appointmentId}

- salonId, manicureId, clientId, serviceId e professionalId.
- status, startTime, endTime, notes e priceCents.
- Snapshots históricos do serviço e profissional, commissionRateSnapshot, idempotencyKey, source, createdBy, createdAt e updatedAt.
- Estados usados pelo site: scheduled, confirmed, completed e cancelled.

## Coleções específicas do site

- services: catálogo, preço em centavos, duração e prazo de retorno.
- professionals: profissionais e percentual padrão de comissão.
- availabilityRules: dias e horários de funcionamento do salão.
- followUps: previsão e estado de retorno de cliente.
- contactLogs: histórico de contatos feitos.

## Integridade e autorização

- Todo documento de negócio deve ser validado contra o salonId da sessão.
- clients e appointments são as coleções compartilhadas com NailFlow.
- Agendamentos e atendimentos referenciam o mesmo cliente e são distinguidos pelo estado; dados históricos usam snapshots para manter valores originais.
- Criação de reserva usa chave idempotente e verifica conflitos de horário no servidor.
- O SDK Admin ignora as regras do Firestore; as operações web fazem validação e autorização explicitamente.
- O aplicativo NailFlow continua sujeito às regras do Firestore; nenhuma regra de acesso anônimo deve ser adicionada para o site.
