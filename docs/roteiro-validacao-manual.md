# Roteiro de validação manual

Use este roteiro depois de configurar o Firebase local e a credencial de serviço.

## Preparação

- [ ] Confirmar que as variáveis NEXT_PUBLIC_FIREBASE_* e NEXT_PUBLIC_FIREBASE_SALON_ID apontam ao mesmo projeto e salão.
- [ ] Confirmar que FIREBASE_SERVICE_ACCOUNT_BASE64 ou FIREBASE_SERVICE_ACCOUNT_JSON existe apenas no ambiente de servidor.
- [ ] Confirmar conta no Firebase Authentication, perfil users/{uid} ativo e salão ativo em salons/{salonId}.
- [ ] Usar dados de teste; não conectar ambiente Preview a dados reais.

## Acesso e permissões

- [ ] Entrar como administradora.
- [ ] Entrar como profissional.
- [ ] Confirmar que cada usuário só consulta dados do próprio salonId.
- [ ] Confirmar que profissional não altera configurações administrativas.
- [ ] Confirmar que usuário sem perfil ativo não acessa o salão.
- [ ] Sair e confirmar que o cookie de sessão foi removido.

## Clientes, atendimentos e agenda

- [ ] Criar cliente no NailFlow e confirmar que aparece no Djanira Connect.
- [ ] Criar cliente no Djanira Connect e confirmar que aparece no NailFlow.
- [ ] Conferir telefone e phoneNormalized em ambos os aplicativos.
- [ ] Criar agendamento no Djanira Connect e confirmar na agenda do NailFlow.
- [ ] Criar agendamento no NailFlow e confirmar no calendário do site.
- [ ] Confirmar que atendimentos concluídos mantêm estado e snapshots corretos.
- [ ] Tentar consultar ou alterar documento de outro salonId e confirmar acesso negado.

## Reserva pública

- [ ] Abrir /reservar em janela anônima.
- [ ] Selecionar serviço e data.
- [ ] Confirmar horários em padrão 24 horas e indisponibilidade de horários ocupados.
- [ ] Solicitar reserva e confirmar gravação em appointments e vínculo em clients.
- [ ] Tentar reservar horário ocupado e confirmar mensagem compreensível.
- [ ] Confirmar limite de reservas e idempotência.

## Responsividade e resultado

- [ ] Repetir os fluxos principais em tela de celular.
- [ ] Registrar erros com rota, passos para reproduzir e mensagem exibida.
- [ ] Confirmar que logs não expõem credenciais, telefones completos ou observações pessoais.
