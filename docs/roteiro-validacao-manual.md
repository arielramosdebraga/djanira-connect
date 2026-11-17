# Roteiro de validação manual

Use este roteiro depois de aplicar as migrations e iniciar a aplicação.

## Preparação

- [ ] Confirmar que o `.env.local` aponta para o projeto Supabase correto.
- [ ] Executar as migrations em ordem.
- [ ] Executar `select public.seed_demo_data();` no ambiente de desenvolvimento.
- [ ] Confirmar que o usuário de teste possui membro ativo na organização.

## Acesso e permissões

- [ ] Entrar como administrador.
- [ ] Entrar como operador.
- [ ] Confirmar que operador consulta os módulos permitidos.
- [ ] Confirmar que operador não altera configurações.
- [ ] Confirmar que operador não corrige ou cancela atendimentos.
- [ ] Confirmar que usuário sem membro ativo não acessa dados do salão.

## Contatos

- [ ] Cadastrar contato com telefone de 11 dígitos.
- [ ] Confirmar máscara de telefone.
- [ ] Pesquisar por nome enquanto digita.
- [ ] Pesquisar por telefone enquanto digita.
- [ ] Filtrar por serviço.
- [ ] Filtrar por retorno pendente.
- [ ] Filtrar por nunca contatado e por 30/60/90 dias.
- [ ] Confirmar exibição do último contato.
- [ ] Editar e arquivar contato.

## Atendimentos e retornos

- [ ] Registrar atendimento com data e horário em 24 horas.
- [ ] Confirmar criação ou atualização do retorno.
- [ ] Abrir WhatsApp a partir de um retorno.
- [ ] Registrar contato realizado.
- [ ] Adiar retorno.
- [ ] Dispensar retorno.
- [ ] Como administrador, corrigir um atendimento e confirmar o recálculo.
- [ ] Como administrador, cancelar um atendimento e confirmar a reavaliação.

## Agenda e reservas

- [ ] Criar agendamento interno pela página inicial.
- [ ] Confirmar que o calendário da página inicial exibe o compromisso.
- [ ] Abrir `/reservar` em janela anônima.
- [ ] Selecionar serviço e data.
- [ ] Confirmar horários no padrão 24 horas.
- [ ] Confirmar que horários ocupados não aparecem.
- [ ] Confirmar mensagem quando não houver horários livres.
- [ ] Solicitar uma reserva pública.
- [ ] Confirmar cadastro ou atualização do contato.
- [ ] Confirmar botão de WhatsApp após a reserva.
- [ ] Tentar duas reservas simultâneas no mesmo horário.
- [ ] Tentar ultrapassar três reservas públicas para o mesmo telefone no dia.

## Responsividade

- [ ] Repetir o fluxo principal em tela de celular.
- [ ] Confirmar que calendário, formulários e botões não ultrapassam a largura da tela.

## Resultado

Registre aqui falhas encontradas, rota, passos para reproduzir e mensagem exibida.
