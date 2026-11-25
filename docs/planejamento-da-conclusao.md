# Planejamento da conclusão

## Estado atual

A aplicação web migrou o backend para o projeto Firebase já usado pelo NailFlow. Os dois ambientes estão em teste e, conforme informado, não há dados produtivos a importar.

## Etapas pendentes

### 1. Configuração do Firebase

- Obter o ID do documento do salão em salons/{salonId}.
- Configurar a conta de serviço Firebase do lado do servidor, local e Vercel.
- Configurar Firebase Authentication e perfis users/{uid}.
- Definir variáveis para Preview e Production.

### 2. Validação de integração

- Validar criação e busca de clientes nos dois aplicativos.
- Validar leitura e criação de compromissos nos dois aplicativos.
- Conferir isolamento entre salões, papéis e status de usuários.
- Verificar conflitos de agenda, cancelamento, atendimento e reserva pública.
- Confirmar os índices Firestore pedidos pelas consultas.

### 3. Qualidade e operação

- Executar typecheck, lint, testes autorizados e build de produção.
- Validar fluxos manualmente em computador e celular.
- Definir backup e processo de recuperação do Firestore.
- Confirmar limites de uso e condições comerciais dos provedores antes de usar dados reais.
- Corrigir bloqueios e repetir as validações.

## Critério de conclusão

O site e o NailFlow devem ler e gravar os mesmos clientes e compromissos no mesmo salão, com autorização por papel e salonId. Login, recuperação de senha, reserva pública e build devem funcionar após configurar credenciais e variáveis de ambiente.

A etapa de integração só pode ser validada de ponta a ponta depois de informar o salonId, cadastrar a credencial privada no ambiente local/Vercel e confirmar os perfis Firebase Authentication.
