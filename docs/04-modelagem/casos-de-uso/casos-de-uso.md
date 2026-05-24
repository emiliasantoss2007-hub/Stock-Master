# Casos de Uso do Sistema Stock Master

## Convenções de Nomenclatura

- **Sistema:** Stock Master.
- **Usuário:** pessoa cadastrada no sistema.
- **Usuário autenticado:** usuário que realizou login com sucesso.
- **Administrador:** perfil com permissão para gerenciar usuários, permissões e cadastros críticos.
- **Técnico/Funcionário autorizado:** perfil operacional com permissões definidas pelo administrador.
- **Estagiário:** perfil com permissões restritas, principalmente de visualização quando autorizado.
- **Perfil de acesso:** conjunto de permissões associado a um usuário.
- **Produto:** item cadastrado e controlado no estoque.
- **SKU/Código de barras:** identificador usado para localizar ou diferenciar produtos.

## UC01 - Realizar Login com Validação por Hash

### Objetivo

Permitir que o usuário acesse o sistema de forma segura, validando a senha por meio de hash criptográfico, sem armazenar ou comparar senhas em texto puro.

### Atores

- Usuário.
- Administrador.
- Técnico/Funcionário autorizado.

### Pré-condições

- O usuário deve estar cadastrado no sistema.
- A senha do usuário deve estar armazenada no banco de dados em formato hash.
- O sistema deve possuir algoritmo de hash configurado.

### Fluxo Principal

1. O usuário acessa a tela de login.
2. O usuário informa login e senha.
3. O sistema busca o usuário pelo login informado.
4. O sistema recupera o hash da senha armazenada.
5. O sistema aplica o algoritmo de hash à senha informada.
6. O sistema compara o hash gerado com o hash armazenado.
7. Se os hashes forem iguais, o sistema libera o acesso.
8. O sistema inicia a sessão com o perfil de acesso do usuário.
9. O sistema redireciona o usuário para o painel inicial.

### Fluxos Alternativos e Exceções

- **FA01 - Usuário não encontrado:** o sistema não localiza o login informado e exibe a mensagem "Usuário ou senha inválidos".
- **FA02 - Senha incorreta:** o hash gerado não corresponde ao hash armazenado e o sistema exibe a mensagem "Usuário ou senha inválidos".
- **FE01 - Erro interno:** em caso de falha no banco de dados ou no processamento do hash, o sistema exibe a mensagem "Erro interno. Tente novamente mais tarde".

### Pós-condições

- Em caso de sucesso, o usuário fica autenticado e com sessão iniciada.
- Em caso de falha, o acesso é negado e nenhuma sessão é criada.

### Requisitos Relacionados

- RF01 - Realizar Login.
- RNF01 - Login.
- RNF06 - Segurança e controle de acesso.

## UC02 - Controlar Tentativas de Login e Bloqueio Temporário

### Objetivo

Prevenir acessos indevidos e ataques de força bruta, controlando tentativas falhas de login e aplicando bloqueio temporário quando o limite for atingido.

### Atores

- Usuário.
- Administrador.
- Técnico/Funcionário autorizado.

### Pré-condições

- O usuário deve estar na tela de login.
- O sistema deve estar apto a registrar tentativas falhas de autenticação.

### Regras de Validação

- O sistema deve contabilizar cada tentativa falha de login.
- O sistema deve exibir a quantidade de tentativas restantes.
- O limite máximo é de 5 tentativas incorretas consecutivas.
- Após o limite, o acesso deve ser bloqueado por 30 minutos.
- Após login bem-sucedido, o contador de tentativas deve ser reiniciado.

### Fluxo Principal

1. O usuário acessa a tela de login.
2. O usuário informa login e senha.
3. O sistema valida as credenciais conforme o UC01.
4. Se as credenciais estiverem incorretas, o sistema registra uma tentativa falha.
5. O sistema exibe alerta informando o erro e a quantidade de tentativas restantes.
6. O usuário pode corrigir os dados e tentar novamente enquanto houver tentativas disponíveis.
7. Se o usuário informar credenciais válidas antes do bloqueio, o sistema libera o acesso e reinicia o contador.

### Fluxos Alternativos e Exceções

- **FA01 - Tentativa incorreta:** o sistema exibe a mensagem "Usuário inexistente ou senha incorreta" e informa "Você tem [X] tentativas restantes antes do bloqueio".
- **FA02 - Bloqueio por limite excedido:** ao atingir 5 tentativas falhas, o sistema redireciona o usuário para a tela de bloqueio.
- **FA03 - Aviso de bloqueio:** o sistema exibe a mensagem "Você ultrapassou o limite de 5 tentativas de login, para sua segurança bloqueamos seu acesso ao sistema. Tente novamente após 30 minutos".
- **FE01 - Falha ao registrar tentativa:** se o sistema não conseguir registrar a tentativa falha, o login deve permanecer negado e o sistema deve exibir uma mensagem de erro interno.

### Pós-condições

- Se as credenciais forem válidas, o usuário acessa o sistema.
- Se o limite for excedido, o acesso permanece bloqueado por 30 minutos.

### Requisitos Relacionados

- RF01 - Realizar Login.
- RNF01 - Login.
- RNF06 - Segurança e controle de acesso.

## UC03 - Cadastrar Usuário

### Objetivo

Permitir que um administrador cadastre novos usuários com dados válidos, seguros e associados a um perfil de acesso.

### Atores

- Administrador.
- Usuário cadastrado.

### Pré-condições

- O administrador deve estar autenticado no sistema.
- O administrador deve possuir permissão para cadastrar usuários.
- O sistema deve estar em funcionamento.

### Campos Obrigatórios

- Nome.
- Login.
- E-mail.
- Senha.
- Perfil de acesso.

### Fluxo Principal

1. O administrador acessa o sistema.
2. O administrador seleciona a opção de gerenciamento de usuários.
3. O administrador seleciona a opção de novo usuário.
4. O sistema exibe o formulário de cadastro.
5. O administrador preenche os campos obrigatórios.
6. O administrador solicita o salvamento.
7. O sistema valida os dados informados.
8. O sistema armazena o novo usuário no banco de dados.
9. O sistema exibe mensagem de confirmação do cadastro.

### Fluxos Alternativos e Exceções

- **FA01 - Dados obrigatórios ausentes ou inválidos:** o sistema destaca os campos inválidos, exibe mensagem de erro e solicita correção.
- **FA02 - Senha fora do padrão:** se a senha tiver menos de 8 caracteres ou não cumprir os critérios de segurança definidos, o sistema bloqueia o cadastro e informa o requisito mínimo.
- **FA03 - Login já existente:** se o login informado já estiver em uso, o sistema impede o cadastro e solicita outro login.
- **FA04 - E-mail inválido:** se o e-mail não possuir formato válido, o sistema impede o cadastro e solicita correção.

### Regras de Negócio e Segurança

- O login deve ser único no sistema.
- O e-mail deve possuir formato válido.
- O perfil de acesso deve ser obrigatoriamente definido.
- Senhas devem ser armazenadas de forma criptografada.
- Apenas administradores podem cadastrar usuários.
- Dados sensíveis devem ser protegidos.

### Pós-condições

- O usuário é cadastrado com sucesso no banco de dados.
- O usuário fica apto a acessar o sistema conforme seu perfil.
- Em caso de erro, dados inválidos não são salvos.

### Requisitos Relacionados

- RF02 - Cadastrar Usuários.
- RF06 - Controlar Acesso por Perfil.
- RNF02 - Cadastro de Usuários.

## UC04 - Consultar Usuários do Sistema

### Objetivo

Permitir que usuários autorizados visualizem e pesquisem usuários cadastrados no sistema por meio de listagem, filtros, ordenação e paginação.

### Atores

- Administrador.
- Técnico/Funcionário autorizado.
- Estagiário com permissão de visualização.

### Pré-condições

- O usuário deve estar autenticado.
- O usuário deve possuir permissão para visualizar usuários.
- Devem existir usuários cadastrados ou o sistema deve estar apto a informar ausência de resultados.

### Fluxo Principal

1. O usuário acessa a área de gestão ou consulta de usuários.
2. O sistema exibe a lista de usuários cadastrados.
3. O sistema apresenta campos de filtro, como nome, e-mail e perfil de acesso.
4. O usuário informa um ou mais filtros, quando necessário.
5. O usuário aciona a busca ou o sistema filtra os dados em tempo real.
6. O sistema consulta os registros no banco de dados.
7. O sistema exibe os resultados em tabela com ID, nome, e-mail, perfil de acesso e status.
8. O sistema oculta informações sensíveis, como hash de senha.
9. O sistema destaca visualmente o status do usuário, como ativo ou inativo.
10. O sistema apresenta ações permitidas conforme o perfil do ator, como visualizar, editar ou desativar.
11. O sistema organiza os resultados com paginação.

### Fluxos Alternativos e Exceções

- **FA01 - Nenhum resultado encontrado:** o sistema exibe a mensagem "Nenhum usuário encontrado" ou "Nenhum usuário localizado para este critério".
- **FA02 - Usuário sem permissão:** o sistema bloqueia o acesso e exibe a mensagem "Acesso negado".
- **FA03 - Ordenação de colunas:** o usuário seleciona uma coluna e o sistema reordena os resultados, como A-Z ou Z-A.
- **FA04 - Restrição por hierarquia:** o sistema oculta ações de edição ou desativação em registros de usuários com cargo superior ao do ator atual.
- **FE01 - Falha na consulta:** em caso de falha ao recuperar dados, o sistema exibe a mensagem "Não foi possível carregar a lista de usuários. Tente atualizar a página".

### Pós-condições

- A lista é exibida de forma organizada, paginada e atualizada.
- Nenhuma alteração é realizada nos dados durante a consulta.
- O usuário pode prosseguir para ações permitidas, como edição ou desativação, quando autorizado.

### Requisitos Relacionados

- RF05 - Consultar Usuários.
- RNF05 - Consulta de Usuários.
- RNF06 - Segurança e controle de acesso.

## UC05 - Alterar Senha com Validação de Segurança

### Objetivo

Permitir que o usuário autenticado altere sua senha, garantindo validação da senha atual, complexidade da nova senha e armazenamento seguro por hash.

### Atores

- Usuário autenticado.
- Administrador.
- Técnico/Funcionário autorizado.
- Estagiário.

### Pré-condições

- O usuário deve estar autenticado.
- O sistema deve possuir algoritmo de hash configurado.
- O usuário deve ter permissão para acessar o próprio perfil.

### Fluxo Principal

1. O usuário acessa a área de Meu Perfil ou Configurações.
2. O usuário seleciona a opção Alterar Senha.
3. O sistema exibe os campos Senha Atual, Nova Senha e Confirmação da Nova Senha.
4. O usuário preenche os campos e solicita o salvamento.
5. O sistema busca o hash da senha atual no banco de dados.
6. O sistema valida se a senha atual informada corresponde ao hash armazenado.
7. O sistema valida se a nova senha cumpre os requisitos de segurança.
8. O sistema verifica se a nova senha e a confirmação são idênticas.
9. O sistema gera um novo hash para a nova senha.
10. O sistema atualiza a senha no banco de dados.
11. O sistema exibe mensagem de sucesso.
12. O sistema encerra a sessão atual e solicita novo login.

### Regras de Validação

- A nova senha deve conter no mínimo 8 caracteres.
- A nova senha deve conter letra maiúscula e letra minúscula.
- A nova senha deve conter pelo menos um número.
- A nova senha deve conter pelo menos um caractere especial.
- A nova senha não pode ser igual à senha atual.
- Todos os campos devem ser preenchidos antes do salvamento.

### Fluxos Alternativos e Exceções

- **FA01 - Senha atual inválida:** o sistema identifica que a senha informada não corresponde ao hash armazenado e exibe "Senha atual incorreta".
- **FA02 - Senha fraca:** o sistema destaca os campos com erro e informa quais requisitos não foram atendidos.
- **FA03 - Nova senha igual à anterior:** o sistema exibe "A nova senha não pode ser igual à senha atual".
- **FA04 - Confirmação divergente:** o sistema exibe "A confirmação de senha não coincide".
- **FE01 - Erro de conexão com banco de dados:** o sistema exibe "Erro interno. Tente novamente mais tarde" e nenhuma alteração é gravada.

### Pós-condições

- A nova senha é armazenada exclusivamente em formato hash.
- A sessão anterior é invalidada.
- O usuário deve autenticar-se novamente.

### Requisitos Relacionados

- RF01 - Realizar Login.
- RF03 - Editar Usuários.
- RNF01 - Login.
- RNF06 - Segurança e controle de acesso.

## UC06 - Recuperar Senha por E-mail

### Objetivo

Permitir que o usuário recupere ou redefina sua senha por meio de validação enviada ao e-mail cadastrado.

### Atores

- Usuário.

### Pré-condições

- O usuário deve estar previamente cadastrado no sistema.
- O usuário deve possuir e-mail cadastrado e ativo.
- O sistema deve estar apto a enviar e-mails de recuperação.

### Fluxo Principal

1. O usuário acessa a tela de login.
2. O usuário seleciona a opção Esqueci minha senha.
3. O sistema solicita o e-mail cadastrado.
4. O usuário informa o e-mail.
5. O sistema valida o formato do e-mail.
6. O sistema verifica se o e-mail está cadastrado.
7. O sistema envia código ou link de recuperação ao e-mail validado.
8. O usuário acessa o link ou informa o código recebido.
9. O sistema direciona o usuário para a tela de redefinição de senha.
10. O usuário informa a nova senha e a confirmação.
11. O sistema valida a senha conforme os requisitos de segurança.
12. O sistema atualiza a senha em formato hash.
13. O sistema redireciona o usuário para a tela de login.
14. O sistema envia e-mail de confirmação da alteração realizada com sucesso.

### Fluxos Alternativos e Exceções

- **FA01 - Reenvio de recuperação:** se o usuário não receber o e-mail, ele pode solicitar reenvio; o sistema invalida o link anterior e envia um novo link.
- **FE01 - E-mail inválido:** o sistema identifica formato incorreto e solicita nova digitação.
- **FE02 - E-mail não cadastrado:** o sistema informa que o e-mail não foi encontrado ou exibe mensagem genérica de segurança.
- **FE03 - Link expirado:** o sistema informa que o link expirou e solicita nova requisição.
- **FE04 - Confirmação divergente:** o sistema solicita correção quando os campos de senha não coincidem.
- **FE05 - Senha fraca:** o sistema exige nova senha quando os requisitos mínimos de segurança não são atendidos.

### Pós-condições

- A senha é redefinida com sucesso quando todas as validações são atendidas.
- O usuário deve realizar login com a nova senha.
- Um e-mail de confirmação é enviado ao endereço vinculado à conta.

### Requisitos Relacionados

- RF01 - Realizar Login.
- RNF01 - Login.
- RNF06 - Segurança e controle de acesso.

## UC07 - Excluir Usuário

### Objetivo

Permitir que uma conta seja encerrada pelo próprio usuário ou removida por um administrador autorizado, revogando os acessos associados.

### Atores

- Usuário.
- Administrador.

### Pré-condições

- O usuário deve estar previamente cadastrado.
- A conta deve estar ativa.
- O ator deve estar autenticado.
- O administrador deve possuir permissão para excluir usuários quando a ação for administrativa.

### Fluxo Principal

1. O usuário realiza login e acessa sua conta ativa.
2. O usuário acessa as configurações do sistema.
3. O usuário seleciona a opção de exclusão de conta.
4. O sistema solicita confirmação da exclusão.
5. O usuário confirma a operação.
6. O sistema solicita login e senha para validar a identidade do usuário.
7. O sistema valida as credenciais.
8. O sistema inicia o processo de exclusão da conta.
9. O sistema remove ou inativa os dados conforme as regras de negócio.
10. O sistema encerra a sessão atual.
11. O sistema exibe mensagem confirmando que a operação foi concluída com sucesso.

### Fluxos Alternativos e Exceções

- **FA01 - Exclusão por administrador:** o administrador seleciona um usuário em uma lista, confirma a ação e valida sua própria senha para concluir a exclusão do usuário selecionado.
- **FE01 - Pendências vinculadas à conta:** se houver pendências ou processos em aberto que impeçam a exclusão, o sistema bloqueia a operação e informa que a conta não pode ser excluída enquanto houver pendências ativas.
- **FE02 - Credenciais inválidas:** se a validação de identidade falhar, o sistema impede a exclusão e solicita nova autenticação.

### Pós-condições

- A conta é removida ou inativada conforme regra definida pelo sistema.
- Todos os acessos associados são revogados.
- A sessão atual é encerrada.
- Um e-mail de confirmação é enviado ao endereço vinculado à conta.

### Requisitos Relacionados

- RF04 - Excluir Usuários.
- RNF04 - Exclusão de Usuários.
- RNF06 - Segurança e controle de acesso.

## UC08 - Cadastrar Produto

### Objetivo

Permitir o registro de novos produtos no sistema com validação de dados obrigatórios, possibilitando controle de estoque, entrada, saída e consulta de itens.

### Atores

- Administrador.
- Técnico/Funcionário autorizado.

### Pré-condições

- O usuário deve estar autenticado.
- O usuário deve possuir permissão para cadastrar produtos.
- O sistema deve estar disponível.

### Campos Obrigatórios

- Nome do produto.
- Categoria.
- Quantidade inicial.
- Código de barras ou SKU.

### Fluxo Principal

1. O usuário acessa o sistema.
2. O usuário acessa o gerenciamento de produtos.
3. O usuário seleciona a opção Novo Produto.
4. O sistema exibe o formulário de cadastro de produto.
5. O usuário preenche os dados obrigatórios.
6. O usuário solicita o salvamento.
7. O sistema valida as informações informadas.
8. O sistema armazena o produto.
9. O sistema confirma o cadastro.

### Fluxos Alternativos e Exceções

- **FA01 - Campos obrigatórios não preenchidos:** o sistema impede a finalização do cadastro e solicita o preenchimento dos campos.
- **FA02 - Dados inválidos:** o sistema informa inconsistências e solicita correção antes do salvamento.
- **FA03 - Usuário sem permissão:** o sistema bloqueia a operação e informa que o usuário não está autorizado.

### Regras de Negócio

- Todos os campos obrigatórios devem estar preenchidos.
- Os dados do produto devem estar corretos antes do salvamento.
- Apenas usuários autorizados podem cadastrar ou alterar dados de produtos.
- O cadastro deve evitar inconsistências nas informações do estoque.

### Pós-condições

- O produto é cadastrado no sistema.
- O produto fica disponível para operações de estoque.

### Requisitos Relacionados

- RF07 - Cadastrar Produtos.
- RNF07 - Cadastro de Produtos.

## UC09 - Consultar Produtos

### Objetivo

Permitir que usuários autorizados visualizem e busquem produtos cadastrados no sistema.

### Atores

- Administrador.
- Técnico/Funcionário autorizado.

### Pré-condições

- O usuário deve estar autenticado.
- O usuário deve possuir permissão para consultar produtos.

### Fluxo Principal

1. O usuário acessa o gerenciamento de produtos.
2. O sistema exibe a lista de produtos cadastrados.
3. O usuário informa critérios de busca, quando necessário.
4. O sistema consulta os produtos cadastrados.
5. O sistema exibe os produtos encontrados com suas informações principais.
6. O usuário visualiza os registros para apoiar operações de estoque.

### Fluxos Alternativos e Exceções

- **FA01 - Nenhum produto encontrado:** o sistema informa que não há produtos correspondentes aos critérios pesquisados.
- **FA02 - Usuário sem permissão:** o sistema bloqueia o acesso à consulta.
- **FE01 - Falha na consulta:** o sistema informa erro ao recuperar os produtos e solicita nova tentativa.

### Pós-condições

- Os produtos são exibidos para consulta.
- Nenhuma alteração é realizada nos registros durante a consulta.

### Requisitos Relacionados

- RF08 - Consultar Produtos.
- RNF08 - Consulta de Produtos.

## UC10 - Editar Produto

### Objetivo

Permitir que usuários autorizados alterem informações de produtos já cadastrados, mantendo os dados atualizados e consistentes.

### Atores

- Administrador.
- Técnico/Funcionário autorizado, conforme permissão definida.

### Pré-condições

- O usuário deve estar autenticado.
- O usuário deve possuir permissão para editar produtos.
- O produto deve estar cadastrado no sistema.

### Fluxo Principal

1. O usuário acessa o gerenciamento de produtos.
2. O usuário localiza o produto desejado.
3. O usuário seleciona a opção de edição.
4. O sistema exibe os dados atuais do produto.
5. O usuário altera as informações necessárias.
6. O usuário solicita o salvamento.
7. O sistema valida os dados alterados.
8. O sistema atualiza o produto no cadastro.
9. O sistema exibe mensagem de confirmação.

### Fluxos Alternativos e Exceções

- **FA01 - Dados inválidos ou incompletos:** o sistema impede o salvamento e solicita correção.
- **FA02 - Usuário sem permissão:** o sistema bloqueia a edição.
- **FE01 - Produto não localizado:** o sistema informa que o produto não está disponível para edição.

### Pós-condições

- As informações do produto são atualizadas.
- O estoque passa a utilizar os dados atualizados.

### Requisitos Relacionados

- RF09 - Editar Produtos.
- RNF09 - Edição de Produtos.

## UC11 - Excluir Produto

### Objetivo

Permitir que usuários autorizados removam produtos do sistema quando a exclusão estiver de acordo com as regras de negócio.

### Atores

- Administrador.
- Técnico/Funcionário autorizado, conforme permissão definida.

### Pré-condições

- O usuário deve estar autenticado.
- O usuário deve possuir permissão para excluir produtos.
- O produto deve estar cadastrado no sistema.

### Fluxo Principal

1. O usuário acessa o gerenciamento de produtos.
2. O usuário localiza o produto desejado.
3. O usuário seleciona a opção de exclusão.
4. O sistema solicita confirmação da operação.
5. O usuário confirma a exclusão.
6. O sistema valida se o produto pode ser removido.
7. O sistema remove ou inativa o produto conforme a regra de negócio.
8. O sistema exibe mensagem de confirmação.

### Fluxos Alternativos e Exceções

- **FA01 - Cancelamento da exclusão:** o usuário cancela a confirmação e o sistema mantém o produto sem alterações.
- **FA02 - Usuário sem permissão:** o sistema bloqueia a exclusão.
- **FE01 - Produto com vínculo operacional:** se o produto possuir movimentações ou vínculos que impeçam a remoção direta, o sistema bloqueia a exclusão e orienta a inativação, quando aplicável.

### Pós-condições

- O produto é removido ou inativado conforme as regras do sistema.
- O produto deixa de estar disponível para novas operações quando removido ou inativado.

### Requisitos Relacionados

- RF10 - Excluir Produtos.
- RNF10 - Exclusão de Produtos.

