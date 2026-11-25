# Pendências de implementação

## Integração Firebase com NailFlow

- Configurar o ID do documento salons/{salonId} para o site.
- Criar credencial de serviço restrita e armazená-la como segredo local e na Vercel.
- Confirmar perfis users/{uid}, papéis e salonId no Firebase Authentication/Firestore.
- Configurar variáveis públicas Firebase em Preview e Production.
- Conferir índices compostos Firestore indicados pelas consultas.

## Validação funcional

- Validar clientes compartilhados em ambos os sentidos.
- Validar agendamentos compartilhados em ambos os sentidos.
- Conferir campos phoneNormalized, status, manicureId, clientId, startTime e endTime.
- Validar permissões administrativas e de profissional.
- Validar reservas públicas, conflitos simultâneos, limite diário e idempotência.
- Testar comportamento responsivo.

## Operação

- Definir política de backup e restauração do Firestore.
- Monitorar uso, cotas e custo dos projetos Firebase e Vercel.
- Configurar Preview com dados de teste isolados de Production.
- Revisar mensagens e logs para não expor informações pessoais ou segredos.

## Critério de aceite

A tarefa estará concluída quando os dois aplicativos compartilharem clientes e agenda no Firebase e a validação manual de autorização, reservas e navegação passar.
