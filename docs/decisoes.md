# Decisões e pendências

## Decisões vigentes

| Tema | Decisão |
| --- | --- |
| Aplicação web | Next.js App Router, React e TypeScript |
| Backend compartilhado | Projeto Firebase já usado pelo NailFlow |
| Banco | Cloud Firestore |
| Autenticação | Firebase Authentication do NailFlow |
| Dados compartilhados | Coleções clients e appointments, isoladas por salonId |
| Identidade | Perfil users/{uid} com papel e salonId |
| Hospedagem | Vercel |
| Valores | Inteiros em centavos |
| Telefone | Armazenar telefone para exibição e versão normalizada em dígitos |

## Motivo da mudança de backend

O aplicativo NailFlow e o site ainda estão em fase de testes. Usar o mesmo projeto Firebase evita manter duas fontes de clientes e agenda. Não há dados produtivos a migrar; a integração passa a gravar diretamente nas coleções compartilhadas.

## Pendências de configuração

- Definir o salonId correspondente ao documento salons/{salonId}.
- Criar uma credencial de serviço do mesmo projeto Firebase para o backend web e armazená-la como variável privada na Vercel.
- Criar ou verificar no Firebase Authentication as contas do site e seus perfis users/{uid} com papel, salão e estado ativo.
- Configurar variáveis de ambiente de Firebase em Preview e Production.
- Validar acesso com contas de administradora e profissional.
- Definir backup e recuperação do Firestore.
- Confirmar limites de uso e cobrança dos provedores antes da operação real.
- Obter o contrato integral do salão antes do módulo de contratos.

## Regras para futuras mudanças

Alterações de modelo, papéis, isolamento por salão, autenticação ou infraestrutura devem ser registradas aqui e em modelo-de-dados.md antes da implementação.
