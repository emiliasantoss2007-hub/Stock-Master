# Módulo Usuário e Autenticação

## UC01 – Realizar Login

**Objetivo**

Permitir que usuários cadastrados acessem o sistema por meio da autenticação com login e senha, de acordo com seu perfil de acesso.

**Ator:**
Administrador e Técnico

**Pré-condições:**
1. O usuário deve estar previamente cadastrado no sistema.
2. O sistema deve estar disponível para acesso.

**Fluxo Principal**
```
[Passo 1]: O usuário acessa a tela de login.
[Passo 2]: O sistema exibe os campos de login e senha.
[Passo 3]: O usuário informa suas credenciais.
[Passo 4]: O usuário seleciona a opção "Entrar".
[Passo 5]: O sistema valida as credenciais informadas.
[Passo 6]: O sistema autentica o usuário.
[Passo 7]: O sistema direciona o usuário para a tela principal.
```
**Pós-condições:**
1. O usuário é autenticado com sucesso.
2. O sistema inicia a sessão do usuário.
3. O acesso às funcionalidades é liberado conforme o perfil do usuário.

**Fluxos Alternativos**

[A1] Credenciais inválidas
- O sistema identifica login ou senha incorretos.
- O sistema exibe a mensagem: "Login ou senha inválidos".
- O usuário permanece na tela de login.

**Fluxos de Exceção**

[E1] Falha na autenticação
- Ocorre erro ao validar as credenciais.
- O sistema exibe a mensagem: "Erro ao realizar login. Tente novamente mais tarde".
- A operação é encerrada.

**Requisitos Relacionados:**
RF01 - Realizar Login

---

## UC02 – Cadastrar Usuário

**Objetivo:**
Permitir que o administrador realize o cadastro de novos usuários no sistema, definindo suas informações e perfil de acesso.

**Ator:**
Administrador.

**Pré - Condições:**
1. O administrador deve estar autenticado no sistema.
2. O administrador deve possuir permissão para cadastrar usuários.

**Fluxo Principal:**
``` 
[Passo 1]: O administrador seleciona a opção "Cadastrar Usuário".
[Passo 2]: O sistema exibe o formulário de cadastro de usuário.
[Passo 3]: O administrador preenche os dados solicitados (nome, e-mail, login, senha e perfil de acesso).
[Passo 4]: O administrador confirma o cadastro.
[Passo 5]: O sistema valida os dados, registra o novo usuário e exibe uma mensagem de sucesso.
``` 
**Pós - Condições:**
1. O usuário é cadastrado no sistema.
2. O usuário poderá acessar o sistema conforme as permissões atribuídas.

**Fluxo Alternativo:**

[A3] Dados inválidos
- O sistema identifica campos inválidos ou não preenchidos.
- O sistema solicita a correção dos dados.

[A5] Usuário já cadastrado
- O sistema identifica login ou e-mail já existente.
- O sistema informa que o usuário já está cadastrado.

**Fluxo de Exeções:**

[E1] Falha ao cadastrar usuário
- Ocorre erro ao salvar os dados.
- O sistema informa erro interno e cancela a operação.

**Requisitos Relacionados:**
RF04 - Cadastrar Usuário

---

## UC03 - Excluir Usuário

**Objetivo:**
Permitir a exclusão de usuários cadastrados no sistema, removendo seus acessos.

**Ator:**
Administrador

**Pré - Condições:**
1. O administrador deve estar autenticado no sistema.
2. O administrador deve possuir permissão para excluir usuários.
3. Deve existir ao menos um usuário cadastrado no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O administrador acessa a opção "Perfis" no menu lateral.
[Passo 2]: O sistema exibe as opções disponíveis:
- consultar perfil;
- editar perfil;
- excluir perfil.

[Passo 3]: O administrador seleciona a opção "Excluir perfil".
[Passo 4]: O sistema exibe a lista de usuários cadastrados.
[Passo 5]: O administrador seleciona o usuário que deseja excluir.
[Passo 6]: O sistema exibe uma mensagem de confirmação da exclusão.
[Passo 7]: O administrador confirma a operação.
[Passo 8]: O sistema remove o usuário do sistema.
[Passo 9]: O sistema exibe mensagem confirmando a "exclusão realizada com sucesso".
``` 
**Pós - Condições:**
1. O usuário é removido do sistema.
2. Os acessos do usuário são encerrados.

**Fluxo Alternativo:**

[A2] Cancelamento da exclusão
- O administrador cancela a operação antes da confirmação.
- O sistema encerra o processo sem excluir o usuário.

[A1] Usuário não encontrado
- O sistema não localiza o usuário selecionado.
- O sistema informa que o registro não foi encontrado.

**Fluxo de Exeções:**

[E6] Falha ao excluir usuário
- Ocorre erro ao remover os dados do usuário.
- O sistema informa erro interno e cancela a operação.

**Requisitos Relacionados:**
RF06 - Excluir Usuário

---

## UC04 - Consultar Usuário

**Objetivo:**
Permitir a busca e visualização de usuários cadastrados no sistema por meio de filtros como nome, e-mail ou tipo de perfil, exibindo os resultados em lista para facilitar a localização.

**Ator:**
Administrador.

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O usuário deve possuir permissão para visualizar usuários.
3. Deve existir ao menos um usuário cadastrado no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a tela de consulta de usuários.
[Passo 2]: O sistema exibe os campos de filtro:
- nome;
- e-mail;
- tipo de perfil.

[Passo 3]: O usuário informa um ou mais filtros (opcional).
[Passo 4]: O usuário aciona a opção de busca.
[Passo 5]: O sistema consulta os dados cadastrados.
[Passo 6]: O sistema aplica os filtros informados.
[Passo 7]: O sistema exibe uma lista com os resultados contendo:
- nome
- e-mail
- tipo de perfil

[Passo 8]: O usuário visualiza os registros encontrados.
``` 
**Pós - Condições:**
1. O sistema exibe uma lista de usuários conforme os filtros aplicados.
2. Nenhuma alteração é realizada nos dados, sendo apenas uma consulta de leitura.

**Fluxo Alternativo:**

[A5] Nenhum resultado encontrado
- Nenhum usuário corresponde aos filtros informados.
- O sistema exibe a mensagem: "Nenhum usuário encontrado".

[A1] Usuário sem permissão
- O usuário não possui permissão para consultar usuários.
- O sistema bloqueia o acesso.
- O sistema exibe a mensagem: "Acesso negado".

**Fluxo de Exeções:**

[E5] Falha na consulta
- Ocorre erro ao acessar o banco de dados.
- O sistema exibe a mensagem: "Erro ao realizar consulta. Tente novamente".

**Requisitos Relacionados:**
RF07 - Consultar Usuário

---

## UC05 - Editar Usuário

**Objetivo:**
Permitir a atualização das informações de usuários cadastrados no sistema.

**Ator:**
Administrador

**Pré - Condições:**
1. O administrador deve estar autenticado no sistema.
2. O administrador deve possuir permissão para editar usuários.
3. Deve existir ao menos um usuário cadastrado no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O administrador acessa a opção "Perfis" no menu lateral.
[Passo 2]: O sistema exibe as opções disponíveis:
- consultar perfil;
- editar perfil;
- excluir perfil.

[Passo 3]: O administrador seleciona a opção "Editar perfil".
[Passo 4]: O sistema exibe a lista de usuários cadastrados.
[Passo 5]: O administrador seleciona o usuário que deseja editar.
[Passo 6]: O sistema exibe os dados do usuário em formulário editável.
[Passo 7]: O administrador altera as informações desejadas:
- nome
- e-mail
- perfil de acesso
- status

[Passo 8]: O administrador confirma a edição.
[Passo 9]: O sistema valida os dados informados.
[Passo 10]: O sistema salva as alterações realizadas.
[Passo 11]: O sistema exibe mensagem de confirmação da edição realizada com sucesso.
```
**Pós - Condições:**
1. Os dados do usuário são atualizados no sistema.
2. As alterações realizadas são salvas no banco de dados.

**Fluxo Alternativo:**

[A7] Dados inválidos
- O sistema identifica campos obrigatórios não preenchidos ou inválidos.
- O sistema solicita a correção dos dados.

[A9] Usuário não encontrado
- O sistema não localiza o usuário selecionado.
- O sistema informa que o registro não está disponível.

[A7] Cancelamento da edição
- O administrador cancela a operação antes da confirmação.
- O sistema encerra a edição sem salvar alterações.

**Fluxo de Exeções:**

[E1] Falha ao salvar alterações
- Ocorre erro ao atualizar os dados no banco de dados.
- O sistema informa erro interno e cancela a operação.

**Requisitos Relacionados:**
RF05 - Editar Usuário

---

## UC06 - Alterar Senha

**Objetivo:**
Permitir que o usuário altere sua senha de acesso ao sistema com segurança.

**Ator:**
Administrador e Técnico.

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O usuário deve possuir acesso ao próprio perfil.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a área "Meu Perfil" ou "Configurações".
[Passo 2]: O usuário seleciona a opção "Alterar Senha".
[Passo 3]: O sistema exibe os campos:
- senha atual
- nova senha
- confirmação da nova senha

[Passo 4]: O usuário preenche os dados solicitados e confirma a alteração.
[Passo 5]: O sistema valida a senha atual informada.
[Passo 6]: O sistema valida os requisitos de segurança da nova senha.
[Passo 7]: O sistema verifica se a nova senha e a confirmação são iguais.
[Passo 8]: O sistema atualiza a senha do usuário.
[Passo 9]: O sistema exibe mensagem de sucesso e solicita novo login.
``` 
**Pós - Condições:**
1. A senha do usuário é atualizada no sistema.
2. O sistema solicita novo login após a alteração da senha.

**Fluxo Alternativo:**

[A5] Senha atual incorreta
- O sistema identifica que a senha atual está incorreta.
- O sistema exibe a mensagem: "Senha atual incorreta".

[A6] Senha fora do padrão
- O sistema identifica que a nova senha não atende aos requisitos de segurança.
- O sistema solicita uma nova senha válida.

[A7] Confirmação de senha inválida
- A nova senha e a confirmação estão diferentes.
- O sistema exibe a mensagem: "A confirmação de senha não coincide".

**Fluxo de Exeções:**

[E1] Falha ao alterar senha
- Ocorre erro ao atualizar a senha no sistema.
- O sistema informa erro interno e cancela a operação.

**Requisitos Relacionados:**
RF02 - Alterar Senha

---

## UC07 - Recuperar Senha

**Objetivo:**
Permitir que o usuário solicite a recuperação de senha através da opção "Esqueci minha senha" disponível na tela de login, utilizando um processo seguro de redefinição de acesso.

**Ator:**
Administrador e Técnico.

**Pré - Condições:**
1. O usuário deve estar cadastrado no sistema.
2. O usuário deve possuir um e-mail válido registrado.
3. O sistema deve permitir envio de e-mails.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a tela de login.
[Passo 2]: O usuário seleciona a opção "Esqueci minha senha".
[Passo 3]: O sistema solicita o e-mail cadastrado.
[Passo 4]: O usuário informa o e-mail.
[Passo 5]: O sistema verifica o e-mail informado.
[Passo 6]: O sistema envia um link de recuperação para o e-mail do usuário.
[Passo 7]: O usuário acessa o link recebido.
[Passo 8]: O sistema solicita a nova senha.
[Passo 9]: O usuário informa e confirma a nova senha.
[Passo 10]: O sistema valida se a nova senha atende os requisitos necessários.
[Passo 11]: O sistema atualiza a senha do usuário.
[Passo 12]: O sistema exibe mensagem confirmando a alteração da senha.
``` 
**Pós - Condições:**
1. A senha do usuário é redefinida com sucesso.
2. O usuário pode acessar o sistema com a nova senha.

**Fluxo Alternativo:**

[A5] E-mail não encontrado
- O sistema não identifica o e-mail informado.
- O sistema exibe mensagem informando que o e-mail não foi localizado.

[A6] Link inválido ou expirado
- O sistema identifica que o link de recuperação expirou ou é inválido.
- O sistema solicita uma nova recuperação de senha.

[A3] Senhas diferentes
- A nova senha e a confirmação não coincidem.
- O sistema solicita a correção dos dados.

**Fluxo de Exeções:**

[E1] Falha no envio de e-mail
- Ocorre erro ao enviar o e-mail de recuperação.
- O sistema informa erro interno e solicita nova tentativa.

**Requisitos Relacionados:**
RF03 - Recuperar Senha

---

# Módulo de Gestão de Produtos

## UC08 - Cadastrar Produtos

**Objetivo:**
Permitir o cadastro de novos produtos no sistema, registrando informações como nome, código do produto, quantidade em estoque, categoria e descrição, para apoiar o controle e gerenciamento do estoque.

**Ator:**
Administrador e Técnico.

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O usuário deve possuir permissão para cadastrar produtos.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Produtos".
[Passo 2]: O usuário seleciona a opção "Cadastrar Produto".
[Passo 3]: O sistema exibe o formulário de cadastro.
[Passo 4]: O usuário preenche os dados do produto.
[Passo 5]: O usuário confirma o cadastro.
[Passo 6]: O sistema valida os dados informados.
[Passo 7]: O sistema registra o produto no banco de dados.
[Passo 8]: O sistema exibe mensagem de confirmação do cadastro.
```
**Pós - Condições:**
1. O produto é cadastrado com sucesso no sistema.
2. O produto fica disponível para consulta e movimentação de estoque.

**Fluxo Alternativo:**

[A4] Campos obrigatórios não preenchidos
- O sistema identifica campos obrigatórios vazios.
- O sistema solicita o preenchimento dos campos.

[A6] – Dados inválidos
- O sistema identifica informações preenchidas incorretamente.
- O sistema solicita a correção dos dados.

[A6] – Produto já cadastrado
- O sistema identifica que o produto já existe.
- O sistema informa que o produto já está cadastrado.

**Fluxo de Exeções:**

[E1] Falha ao cadastrar produto
- Ocorre erro ao salvar os dados.
- O sistema informa erro interno e cancela a operação.

**Requisitos Relacionados:**
RF08 - Cadastrar Produto

---

## UC09 - Consultar Produto

**Objetivo:**
Permitir que o usuário consulte produtos cadastrados no sistema por meio de critérios de pesquisa, visualizando suas informações para auxiliar no controle de estoque.

**Ator:**
Administrador e Técnico.

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O produto deve estar cadastrado no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Produtos".
[Passo 2]: O usuário seleciona a opção "Consultar Produto".
[Passo 3]: O sistema exibe a tela de pesquisa.
[Passo 4]: O usuário informa o nome, código ou outro critério de busca.
[Passo 5]: O sistema realiza a consulta do produto.
[Passo 6]: O sistema exibe as informações do produto localizado.
[Passo 7]: O usuário visualiza os dados do produto.
``` 
**Pós - Condições:**
1. As informações do produto são exibidas ao usuário.

**Fluxo Alternativo:**

[A5] Produto não encontrado
- O sistema não localiza o produto informado.
- O sistema exibe a mensagem: "Produto não encontrado".
- O usuário pode realizar uma nova consulta.

**Fluxo de Exeções:**

[E1] Falha na consulta
- Ocorre erro ao consultar os dados do produto.
- O sistema exibe mensagem de erro.
- O processo é interrompido.

[E2] Produto com dados inconsistentes
- O sistema identifica informações incompletas no cadastro do produto.
- O sistema exibe mensagem informando a inconsistência dos dados.
- A consulta é encerrada.

**Requisitos Relacionados:**
RF11 - Consultar Produtos

---

## UC10 - Editar Produto

**Objetivo:**
Permitir a atualização das informações de produtos cadastrados no sistema, mantendo os dados do estoque atualizados.

**Ator:**
Administrador e Técnico

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O produto deve estar cadastrado no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Produtos".
[Passo 2]: O usuário seleciona a opção "Editar Produto".
[Passo 3]: O sistema exibe a lista de produtos cadastrados.
[Passo 4]: O usuário seleciona o produto que deseja editar.
[Passo 5]: O sistema exibe os dados atuais do produto.
[Passo 6]: O usuário altera as informações desejadas.
[Passo 7]: O usuário confirma a edição.
[Passo 8]: O sistema valida os dados informados.
[Passo 9]: O sistema salva as alterações.
[Passo 10]: O sistema exibe a mensagem "Produto atualizado com sucesso".
```
**Pós - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O produto deve estar cadastrado no sistema.

**Fluxo Alternativo:**

[A6] Cancelamento da edição
- O usuário cancela a operação.
- O sistema descarta as alterações realizadas.
- O sistema retorna à tela de produtos.

**Fluxo de Exeções:**

[E1] Dados inválidos
- O sistema identifica informações inválidas.
- O sistema solicita a correção dos dados.

[E2] Falha ao salvar alterações
- Ocorre erro ao atualizar o produto.
- O sistema exibe mensagem de erro.
- A operação é cancelada.

**Requisitos Relacionados:**
RF09 - Editar Produto

---

## UC11 - Excluir Produto

**Objetivo:**
Permitir que o usuário remova produtos cadastrados no sistema de forma segura, contribuindo para a manutenção e atualização das informações de estoque.

**Ator:**
Administrador e Técnico.

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O produto deve estar previamente cadastrado no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Produtos".
[Passo 2]: O sistema exibe os produtos cadastrados.
[Passo 3]: O usuário seleciona o produto que deseja excluir.
[Passo 4]: O sistema solicita a confirmação da exclusão.
[Passo 5]: O usuário confirma a operação.
[Passo 6]: O sistema exclui o produto.
[Passo 7]: O sistema exibe a mensagem "Produto excluído com sucesso".
``` 
**Pós - Condições:**
1. O produto é excluído do sistema com sucesso.

**Fluxo Alternativo:**

[A3] Cancelamento da exclusão
- O usuário cancela a operação.
- O sistema interrompe o processo de exclusão.
- O sistema retorna à tela de produtos.

**Fluxo de Exeções:**

[E1] Produto não encontrado
- O sistema não localiza o produto selecionado.
- O sistema exibe a mensagem "Produto não encontrado".
- A operação é encerrada.

[E2] Falha na exclusão
- Ocorre erro durante a exclusão do produto.
- O sistema exibe a mensagem "Erro ao excluir produto. Tente novamente mais tarde".
- A operação é cancelada.

**Requisitos Relacionados**
RF10 - Excluir Produtos

---

# Módulo Controle de Estoque

## UC12 - Registrar Entrada de Produtos no Estoque

**Objetivo:**
Permitir o registro da entrada de produtos no estoque, atualizando automaticamente a quantidade disponível e registrando a movimentação realizada.

**Ator:**
Administrador e Técnico.

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O produto deve estar cadastrado no sistema.
3. O usuário deve possuir permissão para movimentar o estoque.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Movimentação de Estoque".
[Passo 2]: O usuário seleciona a opção "Entrada de Produto".
[Passo 3]: O sistema exibe os produtos cadastrados.
[Passo 4]: O usuário seleciona o produto desejado.
[Passo 5]: O sistema exibe as informações do produto.
[Passo 6]: O usuário informa a quantidade a ser adicionada ao estoque.
[Passo 7]: O usuário confirma a operação.
[Passo 8]: O sistema valida os dados informados.
[Passo 9]: O sistema atualiza a quantidade disponível do produto.
[Passo 10]: O sistema registra a movimentação no histórico.
[Passo 11]: O sistema exibe mensagem de confirmação da operação.
``` 
**Pós - Condições:**
1. A quantidade do produto é atualizada no estoque.
2. A movimentação de entrada é registrada no histórico do sistema.

**Fluxo Alternativo:**

[A5] Produto não encontrado
- O sistema não localiza o produto informado.
- O sistema exibe a mensagem "Produto não cadastrado".
- O usuário pode realizar uma nova pesquisa.

[A8] Quantidade inválida
- O sistema identifica quantidade inválida ou não informada.
- O sistema exibe a mensagem "Informe uma quantidade válida".
- O usuário corrige os dados e continua a operação.

**Fluxo de Exeções:**

[E1] Falha ao atualizar o estoque
- Ocorre erro ao atualizar as informações do produto.
- O sistema interrompe a operação.
- O sistema exibe a mensagem "Não foi possível atualizar o estoque no momento".

[E2] Sistema indisponível
- O sistema não está acessível.
- O usuário não consegue registrar a entrada do produto.
- O sistema exibe mensagem de indisponibilidade.

**Requisitos Relacionados:**
RF12 - Registrar Entrada de Produto no Estoque

---

## UC13 - Registrar Saída de Produtos no Estoque

**Objetivo:**
Permitir que usuários autorizados registrem a saída de produtos do estoque, atualizando automaticamente a quantidade disponível e registrando a movimentação realizada.

**Ator:**
Administrador e Técnico.

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O usuário deve possuir permissão para movimentar o estoque.
3. O produto deve estar previamente cadastrado no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Saída de Produto".
[Passo 2]: O sistema exibe os produtos cadastrados.
[Passo 3]: O usuário seleciona o produto e informa a quantidade a ser retirada.
[Passo 4]: O usuário confirma a operação.
[Passo 5]: O sistema valida os dados informados.
[Passo 6]: O sistema atualiza automaticamente a quantidade disponível em estoque.
[Passo 7]: O sistema registra a movimentação no histórico.
[Passo 8]: O sistema verifica a necessidade de gerar alerta de estoque mínimo.
[Passo 9]: O sistema exibe a mensagem de confirmação da operação.
``` 
**Pós - Condições:**
1. A quantidade do produto é atualizada no estoque.
2. A movimentação é registrada no histórico do sistema.
3. Caso o estoque atinja o limite mínimo, o sistema gera um alerta de estoque crítico.

**Fluxo Alternativo:**

[A5] Quantidade insuficiente em estoque
- O sistema identifica que a quantidade solicitada é maior que a disponível.
- O sistema exibe a mensagem "Estoque insuficiente".
- A operação é cancelada.

[A3] Dados inválidos
- O sistema identifica informações inválidas ou não preenchidas.
- O sistema solicita a correção dos dados informados.

**Fluxo de Exeções:**

[E1] Falha na atualização do estoque
- Ocorre erro ao atualizar as informações do produto.
- O sistema cancela a operação.
- O sistema exibe a mensagem "Não foi possível atualizar o estoque no momento".

**Requisitos Relacionados:**
RF13 - Registrar Saída de Produtos no Estoque

---

## UC15 - Consultar Histórico de Estoque

**Objetivo:**
Permitir que usuários autorizados consultem o histórico de movimentações de estoque, visualizando registros de entradas e saídas de produtos para acompanhamento e controle das operações realizadas.

**Ator:**
Administrador e Técnico

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O usuário deve possuir permissão para consultar o histórico de estoque.
3. Devem existir movimentações registradas no sistema.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Histórico de Estoque".
[Passo 2]: O sistema exibe a tela de consulta.
[Passo 3]: O usuário informa os filtros desejados (produto, data ou tipo de movimentação).
[Passo 4]: O usuário solicita a pesquisa.
[Passo 5]: O sistema consulta os registros de movimentação.
[Passo 6]: O sistema exibe o histórico conforme os filtros informados.
``` 
**Pós - Condições:**
1. O histórico de movimentações é exibido ao usuário conforme os filtros aplicados.

**Fluxo Alternativo:**

[A5] Nenhum registro encontrado
- O sistema não localiza movimentações para os filtros informados.
- O sistema exibe a mensagem: "Nenhum registro encontrado".

**Fluxo de Exeções:**

[E1] Falha na consulta
- Ocorre erro ao acessar os registros de movimentação.
- O sistema exibe a mensagem: "Erro ao consultar histórico de estoque".
- A operação é encerrada.

**Requisitos Relacionados:**
RF14 - Consultar Histórico de Estoque

---

## UC16 - Expurgar Produto de Estoque

**Objetivo:**
Permitir o registro de perdas, danos ou descarte de produtos, atualizando a quantidade disponível em estoque e registrando a movimentação realizada.

**Ator:**
Administrador e Técnico

**Pré - Condições:**
1. O usuário deve estar autenticado no sistema.
2. O produto deve estar cadastrado no sistema.
3. O usuário deve possuir permissão para movimentar o estoque.

**Fluxo Principal:**
``` 
[Passo 1]: O usuário acessa a opção "Expurgo de Estoque".
[Passo 2]: O sistema exibe os produtos cadastrados.
[Passo 3]: O usuário seleciona o produto desejado.
[Passo 4]: O usuário informa a quantidade a ser expurgada e a justificativa.
[Passo 5]: O usuário confirma a operação.
[Passo 6]: O sistema valida os dados informados.
[Passo 7]: O sistema atualiza a quantidade disponível em estoque.
[Passo 8]: O sistema registra a movimentação no histórico.
[Passo 9]: O sistema exibe mensagem de confirmação da operação.
``` 
**Pós - Condições:**
1. A quantidade do produto é atualizada no estoque.
2. A movimentação de expurgo é registrada no histórico.

**Fluxo Alternativo:**

[A6] Quantidade inválida
- O sistema identifica quantidade inválida.
- O sistema solicita a correção dos dados.

**Fluxo de Exeções:**

[E1] Falha na atualização do estoque
- Ocorre erro ao processar o expurgo.
- O sistema cancela a operação e exibe mensagem de erro.

**Requisitos Relacionados:**
RF15 - Expurgar Produto de Estoque.

---

# Módulo de Movimentações e Relatório

## UC17 - Gerar Relatório de Movimentação de Estoque

**Objetivo:**
Permitir a geração de relatórios contendo o histórico de movimentações de estoque, incluindo entradas, saídas e expurgos de produtos.

**Ator:**
Administrador

**Pré - Condições:**
1. O administrador deve estar autenticado no sistema.
2. Devem existir movimentações registradas no estoque.

**Fluxo Principal:**
```
[Passo 1]: O administrador acessa a opção "Relatórios".
[Passo 2]: O administrador seleciona "Relatório de Movimentação".
[Passo 3]: O sistema exibe os filtros disponíveis.
[Passo 4]: O administrador informa os critérios de consulta.
[Passo 5]: O sistema gera o relatório.
[Passo 6]: O sistema exibe o relatório solicitado.
```
**Pós - Condições:**
1. O relatório de movimentação é gerado e exibido ao administrador.

**Fluxo Alternativo:**

[A5] Nenhum registro encontrado
- O sistema não localiza movimentações para os filtros informados.
- O sistema exibe mensagem informativa.

**Fluxo de Exeções:**

[E1] Falha na geração do relatório
- O sistema não consegue gerar o relatório.
- O sistema exibe mensagem de erro.

**Requisitos Relacionados:**
RF16 - Gerar Relatório de movimentação de estoque

---

## UC18 - Gerar Relatório de Estoque

**Objetivo:**
Permitir a geração de relatórios contendo informações sobre a situação atual do estoque.

**Ator:**
Administrador

**Pré-condições**
1. O administrador deve estar autenticado no sistema.

**Fluxo Principal**
``` 
[Passo 1]: O administrador acessa a opção "Relatórios".
[Passo 2]: O administrador seleciona "Relatório de Estoque".
[Passo 3]: O sistema processa as informações do estoque.
[Passo 4]: O sistema gera o relatório.
[Passo 5]: O sistema exibe o relatório solicitado.
```
**Pós-condições**
1. O relatório de estoque é gerado e exibido.

**Fluxos de Exceção**

[E1] Falha na geração do relatório.
- O sistema exibe mensagem de erro.
- A operação é encerrada.

**Requisitos Relacionados:**
RF17 - Gerar relatório de estoque

---

## UC19 - Gerar Relatório de Produtos

**Objetivo**
Permitir a geração de relatórios contendo informações dos produtos cadastrados no sistema.

**Ator:**
Administrador

**Pré-condições**
1. O administrador deve estar autenticado no sistema.
2. Devem existir produtos cadastrados.

**Fluxo Principal:**
``` 
[Passo 1]: O administrador acessa a opção "Relatórios".
[Passo 2]: O administrador seleciona "Relatório de Produtos".
[Passo 3]: O sistema consulta os produtos cadastrados.
[Passo 4]: O sistema gera o relatório.
[Passo 5]: O sistema exibe o relatório solicitado.
``` 
**Pós-condições**
- O relatório de produtos é gerado e exibido.
- Fluxo Principal

**Fluxos de Exceção**

[E1] Falha na geração do relatório.
- O sistema exibe mensagem de erro.
- A operação é encerrada.

**Requisitos Relacionados:**
RF18 - Gerar Relatório de produtos

---

## UC20 - Exportar Relatórios

**Objetivo**
Permitir que o administrador exporte relatórios gerados pelo sistema nos formatos PDF e Excel, facilitando o armazenamento, compartilhamento, impressão e análise das informações.

**Ator:**
Administrador

**Pré-condições:**
1. O administrador deve estar autenticado no sistema.
2. Um relatório deve ter sido gerado pelo sistema.

**Fluxo Principal:**
```
[Passo 1]: O administrador acessa um relatório gerado pelo sistema.
[Passo 2]: O administrador seleciona a opção "Exportar Relatório".
[Passo 3]: O sistema exibe os formatos disponíveis para exportação.
[Passo 4]: O administrador escolhe o formato desejado (PDF ou Excel).
[Passo 5]: O sistema gera o arquivo no formato selecionado.
[Passo 6]: O sistema disponibiliza o relatório para download.
``` 
**Pós-condições:**
1. O relatório é exportado no formato selecionado pelo administrador.

**Fluxos Alternativos**

[A1] Formato não selecionado
- O administrador não seleciona um formato de exportação.
- O sistema solicita a seleção de um formato para continuar.

**Fluxos de Exceção**

[E1] Falha na geração do arquivo
- Ocorre um erro durante a exportação.
- O sistema exibe a mensagem: "Não foi possível exportar o relatório".
- A operação é cancelada.

[E2] Sistema indisponível
- O sistema não consegue processar a solicitação.
- O sistema exibe mensagem de indisponibilidade.
- A operação é encerrada.

**Requisitos Relacionados:**
RF19 e RF20 - Exportar Reltórios em PDF e Excel.
