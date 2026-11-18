# Decisões e pendências

## Decisões assumidas

| Tema | Decisão atual |
| --- | --- |
| Operação | Um salão na primeira versão |
| Usuários | Duas contas individuais |
| Papéis | Administrador e operador |
| Aplicação | Aplicação web com React e Next.js |
| Banco | PostgreSQL no Supabase |
| Hospedagem | Vercel, com plano comercial a confirmar |
| Telefone | Obrigatório e normalizado com código do país |
| Atendimento | Um serviço por registro |
| Retorno | Previsão automática e contato manual |
| Agenda | Fora da primeira entrega |
| Reserva pública | Posterior ao piloto interno |
| Contratos | Módulo independente |

## Pendências para validação

- Confirmar durante a fundação a integração de servidor entre Next.js e Supabase
  (sessão, consultas, Server Actions e políticas RLS).
- Confirmar se ambas as pessoas precisam de permissões de administrador.
- Verificar se existe uma base de clientes para importação.
- Confirmar se todos os clientes possuem telefone.
- Validar a rotina de retornos com as duas pessoas.
- Confirmar planos, limites e uso comercial de Vercel e Supabase.
- Definir a rotina de backup e testar restauração.
- Obter o contrato integral do Salão Djanira Montclair antes do módulo de contratos.
- Decidir posteriormente se haverá integração oficial do WhatsApp.

## Fluxo de branches

As branches de módulo serão utilizadas quando a implementação de cada módulo
começar. Antes de iniciar um módulo, sua branch deve ser criada ou atualizada a
partir de `develop`, para incluir as decisões e alterações integradas mais
recentes.

## Regra para novas decisões

Mudanças que alterem escopo, segurança, modelo de dados, infraestrutura ou ordem
dos módulos devem ser registradas neste arquivo antes da implementação.
