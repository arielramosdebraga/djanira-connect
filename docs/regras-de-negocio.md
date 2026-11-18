# Regras de negócio

## Serviços

- Nome é obrigatório.
- Duração deve ser positiva.
- Valor, quando informado, não pode ser negativo.
- Prazo de retorno, quando informado, deve ser positivo.
- Serviço sem prazo não gera retorno.
- Serviço inativo não pode ser selecionado em novos atendimentos.
- Serviço inativo permanece no histórico.
- Alterações no serviço não alteram atendimentos existentes.

## Contatos

- Nome e telefone são obrigatórios no cadastro inicial.
- O telefone deve ser normalizado com código do país.
- Telefone duplicado gera alerta, mas não bloqueia a confirmação.
- Pessoas arquivadas não aparecem na fila de retornos.
- Pessoas que não desejam contato ficam fora da fila.
- Atendimento realizado não significa contato realizado.

## Atendimentos

- Cada registro representa um serviço realizado.
- É permitido informar uma data passada.
- O atendimento guarda um snapshot do serviço usado na ocasião.
- O valor praticado é independente do valor atual do serviço.
- Atendimento e retorno correspondente devem ser persistidos atomicamente.
- Duplo clique ou repetição da requisição não pode gerar duplicação.
- Cancelamento preserva a rastreabilidade do registro.

## Retornos

- A data prevista é a data local do atendimento mais o prazo do serviço.
- Para cada cliente e serviço, apenas o atendimento válido mais recente mantém retorno ativo.
- Atendimento retroativo não substitui um atendimento mais recente.
- Atendimento mais recente substitui o acompanhamento anterior daquele serviço.
- Cancelamento do atendimento mais recente reavalia o atendimento válido anterior.
- Adiamento preserva a data prevista original.
- Dispensa encerra apenas o lembrete atual.

## WhatsApp

- Abrir o WhatsApp não registra contato.
- O contato só é registrado após a ação explícita “Já chamei”.
- A mensagem deve ser editável antes da abertura.
- O sistema não confirma entrega ou leitura.

## Permissões

### Administrador

- Gerencia serviços, contatos, atendimentos, retornos e configurações.
- Pode corrigir ou cancelar atendimentos.

### Operador

- Consulta serviços.
- Gerencia contatos.
- Registra atendimentos.
- Consulta retornos e registra contatos.
- Não altera configurações nem cancela atendimentos.

As permissões devem ser verificadas no servidor e no banco. Ocultar botões não é
um mecanismo de autorização.
