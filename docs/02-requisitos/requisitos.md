# Requisitos do Sistema Stock Master

## RF - 01 - Cadastro de Perfil

### O que é?

É a funcionalidade do sistema que permite que usuários cadastrados acessem a plataforma utilizando login e senha, garantindo que apenas pessoas autorizadas possam entrar no sistema.

### Por que existe?

O login existe para garantir a segurança do sistema, controlando o acesso dos usuários e protegendo as informações armazenadas. Através do login, o sistema identifica ousuário e aplica as permissões de acordo com o seu perfil de acesso.

### Quem usa?

Administrador e técnico.

### Fluxo detalhado

1. Usuário acessa a tela inicial do sistema.
2. Sistema exibe o formulário de login.
3. Usuário informa login e senha.
4. Usuário clica no botão Entrar.
5. Sistema valida as credenciais informadas.
6. Se os dados estiverem corretos, o sistema permite o acesso e redireciona o usuário para a tela principal.
7. Se os dados estiverem incorretos, o sistema exibe uma mensagem informando erro de login ou senha e solicita nova tentativa.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 01.01 | Segurança | As senhas dos usuários devem ser armazenadas deforma criptografada no banco de dados, garantindo a proteção das credenciais. |
| RNF – 01.02 | Desempenho | O sistema deve validar as credenciais de acesso em até 3 segundos. |
| RNF – 01.03 | Usabilidade | O sistema deve apresentar mensagens claras e compreensíveis em caso de erro de login ou senha incorreta. |

## RF - 02 - Cadastro de Usuários

### O que é?

É a funcionalidade do sistema que permite o cadastro de novos usuários, definindo suas informações básicas e seu perfil de acesso no sistema, como Administrador ou Técnico.

### Por que existe?

É a funcionalidade do sistema que permite o cadastro de novos usuários, definindo suas informações básicas e seu perfil de acesso no sistema, como Administrador ou Técnico.

### Quem usa?

Administrador.

### Fluxo detalhado

1. Administrador acessa o sistema.
2. Seleciona a opção Gerenciamento de Usuários.
3. Clica em Novo Usuário.
4. Sistema exibe o formulário de cadastro.
5. Administrador preenche os dados do usuário (nome, login, e-mail, senha e perfil).
6. Administrador clica em Salvar.
7. Sistema valida as informações inseridas.
8. Se os dados estiverem corretos, o sistema registra o novo usuário e exibe uma mensagem de confirmação.
9. Se houver erro, o sistema indica os campos que precisam ser corrigidos, destacando os campos em cor vermelho.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 02.01 | Segurança | O sistema deve exigir senha com no mínimo 8caracteres, garantindo maior proteção das contas dos usuários. |
| RNF – 02.02 | Desempenho | O sistema deve indicar visualmente quando os campos obrigatórios não forem preenchidos corretamente. |
| RNF – 02.03 | Usabilidade | O sistema deve garantir que os dados cadastrados sejam armazenados corretamente no banco de dados. |

## RF - 03 - Editar Usuários

### O que é?

É a funcionalidade do sistema que permite alterar as informações de usuários já cadastrados, como nome, e-mail, senha ou perfil.

### Por que existe?

A edição de usuários existe para manter as informações atualizadas, permitindo correções ou alterações necessárias nos dados dos usuários.

### Quem usa?

Administrador.

### Fluxo detalhado

1. Administrador acessa o sistema e realiza o login.
2. Administrador seleciona Gerenciamento de Usuários.
3. Sistema exibe a lista de usuários cadastrados.
4. Administrador seleciona o usuário que deseja editar.
5. Sistema exibe o formulário com as informações do usuário.
6. Administrador realiza as alterações necessárias.
7. Administrador clica em Salvar.
8. Sistema valida as informações e atualiza os dados no sistema.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 03.01 | Segurança | A edição de usuários deve ser permitida apenas para usuários autorizados. |
| RNF – 03.02 | Desempenho | O sistema deve apresentar interface clara para facilitar a atualização das informações. |
| RNF – 03.03 | Usabilidade | O sistema deve garantir que as alterações sejam armazenadas corretamente no banco de dados. |

## RF - 04 - Excluir Usuários

### O que é?

É a funcionalidade do sistema que permite remover usuários cadastrados do sistema.

### Por que existe?

A exclusão de usuários existe para manter o sistema organizado, removendo usuários que não possuem mais acesso ou que foram cadastrados incorretamente.

### Quem usa?

Administrador

### Fluxo detalhado

1. Administrador acessa o sistema e realiza o login.
2. Administrador seleciona Gerenciamento de Usuários.
3. Sistema exibe a lista de usuários cadastrados.
4. Administrador seleciona o usuário que deseja excluir.
5. Administrador clica na opção Excluir.
6. Sistema solicita confirmação da exclusão.
7. Administrador confirma a operação.
8. Sistema remove o usuário e exibe mensagem de confirmação.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 04.01 | Segurança | A exclusão de usuários deve ser permitida apenas para administradores. |
| RNF – 04.02 | Desempenho | O sistema deve garantir que o usuário seja removido corretamente do banco de dados. |

## RF - 05 - Consultar Usuários

### O que é?

É a funcionalidade do sistema que permite visualizar e pesquisar os usuários cadastrados, apresentando suas informações registradas no sistema.

### Por que existe?

A consulta de usuários existe para facilitar a visualização e o acompanhamento dos usuários cadastrados, permitindo que administradores verifiquem as informações e a organização dos acessos ao sistema.

### Quem usa?

Administrador

### Fluxo detalhado

1. Administrador acessa o sistema e realiza o login.
2. Administrador seleciona a opção Gerenciamento de Usuários.
3. Sistema exibe a lista de usuários cadastrados.
4. Administrador pode visualizar as informações dos usuários.
5. Administrador pode utilizar busca ou filtros para localizar um usuário específico.
6. Sistema apresenta os resultados da consulta.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 05.01 | Segurança | O sistema deve apresentar os resultados da consulta em até 3 segundos. |
| RNF – 05.02 | Desempenho | A interface deve apresentar os usuários deforma organizada e de fácil visualização. |
| RNF – 05.03 | Usabilidade | A funcionalidade de consulta deve estar disponível sempre que o sistema estiver em funcionamento. |

## RF - 06 - Login

### O que é?

É a funcionalidade do sistema que controla o acesso dos usuários às diferentes funcionalidades, de acordo com o perfil definido para cada usuário, como Administrador ou Técnico.

### Por que existe?

O controle de acesso existe para garantir a segurança do sistema, permitindo que cada usuário utilize apenas as funcionalidades autorizadas para seu perfil. Isso evita acessos indevidos e ajuda a manter a organização e integridade das operações realizadas no sistema.

### Quem usa?

Administrador e Técnico.

### Fluxo detalhado

1. Usuário acessa o sistema e realiza o login.
2. Sistema identifica o perfil do usuário autenticado.
3. Sistema verifica as permissões associadas ao perfil do usuário.
4. Sistema libera o acesso apenas às funcionalidades permitidas para aquele perfil.
5. Caso o usuário tente acessar uma funcionalidade não permitida, o sistema bloqueia o acesso.
6. Sistema exibe uma mensagem informando que o usuário não possui permissão para acessar aquela funcionalidade.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 06.01 | Segurança | O sistema deve garantir que apenas usuários autorizados possam acessar determinadas funcionalidades, de acordo com seu perfil. |
| RNF – 06.02 | Desempenho | O sistema deve aplicar corretamente as permissões configuradas para cada perfil durante ouso do sistema. |
| RNF – 06.03 | Usabilidade | O controle de acesso deveestar sempre ativo durante o uso do sistema, garantindo que as permissões sejam verificadas continuamente. |

## RF - 07 - Cadastro de Produtos

### O que é?

É a funcionalidade do sistema que permite o cadastro de novos produtos, registrando informações necessárias para sua identificação e controle no sistema, como nome do produto, categoria, quantidade em estoque e outras características relevantes.

### Por que existe?

O cadastro de produtos existe para organizar e controlar os itens disponíveis no sistema, permitindo que os usuários registrem e acompanhem os produtos armazenados. Isso facilita a gestão do estoque e o controle das operações realizadas.

### Quem usa?

Administrador e Técnico.

### Fluxo detalhado

1. Usuário acessa o sistema e realiza o login.
2. Usuário seleciona a opção Gerenciamento de Produtos.
3. Usuário clica em Novo Produto.
4. Sistema exibe o formulário de cadastro de produto.
5. Usuário preenche as informações necessárias (nome, categoria, quantidade etc.).
6. Usuário clica em Salvar.
7. Sistema valida os dados inseridos.
8. Se os dados estiverem corretos, o sistema registra o produto no banco de dados e exibe mensagem de confirmação.
9. Se houver erro, o sistema informa quais campos precisam ser corrigidos.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 07.01 | Segurança | O sistema deve apresentar um formulário de cadastro claro e de fácil preenchimento para os usuários. |
| RNF – 07.02 | Desempenho | O sistema deve garantir que as informações do produto sejam armazenadas corretamente no banco de dados. |
| RNF – 07.03 | Usabilidade | O sistema deve registrar o cadastro do produto em até 3 segundos após a confirmação do usuário. |

## RF - 08 - Consultar Produtos

### O que é?

É a funcionalidade do sistema que permite visualizar e pesquisar os produtos cadastrados, apresentando suas informações armazenadas no sistema, como nome, categoria, SKU ou código de barras e quantidade disponível.

### Por que existe?

A consulta de produtos existe para permitir que os usuários visualizem rapidamente os itens cadastrados, facilitando o acompanhamento e o controle das informações registradas no sistema.

### Quem usa?

Administrador e Técnico.

### Fluxo detalhado

1. Usuário acessa o sistema e realiza o login.
2. Usuário seleciona a opção Gerenciamento de Produtos.
3. Sistema exibe a lista de produtos cadastrados.
4. Usuário pode visualizar as informações dos produtos disponíveis.
5. Usuário pode utilizar campos de busca ou filtros para localizar um produto específico.
6. Sistema apresenta os resultados da consulta conforme os critérios informados.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 08.01 | Segurança | A interface de consulta deve apresentar os produtos de forma organizada e de fácil visualização. |
| RNF – 08.02 | Desempenho | A funcionalidade de consulta de produtos deve estar disponível sempre que o sistema estiver em funcionamento. |
| RNF – 08.03 | Usabilidade | O sistema deve exibir os resultados da consulta em até 3 segundos. |

## RF - 09 - Editar Produtos

### O que é?

É a funcionalidade do sistema que permite alterar as informações de umproduto já cadastrado, como nome, SKU ou códigos de barras, categoria, quantidade ou outras características registradas.

### Por que existe?

A edição de produtos existe para permitir a atualização das informações registradas no sistema, garantindo que os dados estejam sempre corretos e atualizados para o controle adequado dos itens.

### Quem usa?

Administrador.

### Fluxo detalhado

1. Usuário acessa o sistema e realiza o login.
2. Usuário seleciona a opção Gerenciamento de Produtos.
3. Sistema exibe a lista de produtos cadastrados.
4. Usuário seleciona o produto que deseja editar.
5. Sistema exibe o formulário com as informações do produto.
6. Usuário realiza as alterações necessárias.
7. Usuário clica em Salvar.
8. Sistema valida as informações inseridas.
9. Se os dados estiverem corretos, o sistema atualiza o produto e exibe mensagem de confirmação.
10. Se houver erro, o sistema indica os campos que precisam ser corrigidos.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 09.01 | Segurança | O sistema deve apresentar uma interface clara para facilitar a edição das informações do produto. |
| RNF – 09.02 | Desempenho | O sistema deve garantir que as alterações realizadas sejam armazenadas corretamente no banco de dados. |
| RNF – 09.03 | Usabilidade | O sistema deve atualizar as informações do produto em até 3 segundos. |

## RF - 10 - Excluir Produtos

### O que é?

É a funcionalidade do sistema que permite remover um produto cadastrado do sistema, quando ele não for mais necessário ou estiver incorreto.

### Por que existe?

A exclusão de produtos existe para manter o sistema organizado e atualizado, removendo registros que não precisam mais permanecer no sistema.

### Quem usa?

Administrado.

### Fluxo detalhado

1. Usuário acessa o sistema e realiza o login.
2. Usuário seleciona a opção Gerenciamento de Produtos.
3. Sistema exibe a lista de produtos cadastrados.
4. Usuário seleciona o produto que deseja excluir.
5. Usuário clica na opção Excluir.
6. Sistema solicita confirmação da exclusão.
7. Usuário confirma a operação.
8. Sistema remove o produto do banco de dados e exibe mensagem de confirmação.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 10.01 | Segurança | A exclusão de produtos deve ser permitida apenas para usuários autorizados. |
| RNF – 10.02 | Desempenho | O sistema deve garantir que o produto seja removido corretamente do banco de dados. |

## RF - 11 - Histórico de Movimentação de Produto

### O que é?

É a funcionalidade do sistema que permite registrar e visualizar o histórico de movimentações dos produtos, como entradas e saídas realizadas no estoque.

### Por que existe?

O histórico de movimentação existe para permitir o acompanhamento das alterações realizadas no estoque, registrando todas as entradas e saídas de produtos. Isso ajuda no controle, organização e rastreabilidade das operações realizadas no sistema.

### Quem usa?

Administrador e Técnico.

### Fluxo detalhado

1. Usuário acessa o sistema e realiza o login.
2. Usuário seleciona a opção Histórico de Movimentação.
3. Sistema exibe a lista de movimentações registradas.
4. Usuário pode visualizar informações como produto, tipo de movimentação (entrada ou saída), quantidade e data da operação.
5. Usuário pode utilizar filtros ou busca para localizar movimentações específicas.
6. Sistema apresenta os resultados da consulta conforme os critérios informados.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 11.01 | Confiabilidade | O sistema deve garantir que todas as movimentações realizadas sejam registradas corretamente no banco de dados. |
| RNF – 11.02 | Desempenho | O sistema deve exibir histórico de movimentações em até 3 segundos. |
| RNF – 11.03 | Usabilidade | As informações do histórico devem ser apresentadas de forma organizada e de fácil visualização. |

## RF - 12 - Alerta de estoque crítico

### O que é?

É a funcionalidade do sistema que permite identificar quando a quantidade de um produto atinge um nível mínimo definido, gerando um alerta para informar que o estoque está baixo.

### Por que existe?

O alerta de estoque crítico existe para evitar a falta de produtos, permitindo que os responsáveis sejam informados quando a quantidade disponível estiver próxima do limite mínimo. Isso ajuda no controle e reposição adequada dos itens.

### Quem usa?

Administrador.

### Fluxo detalhado

1. Usuário acessa o sistema e realiza o login.
2. Sistema verifica automaticamente a quantidade de produtos cadastrados no estoque.
3. Sistema compara a quantidade disponível com o nível mínimo definido para cada produto.
4. Caso a quantidade esteja abaixo ou igual ao limite mínimo, o sistema gera um alerta.
5. Sistema exibe a notificação de estoque crítico para o usuário.
6. Usuário pode acessar as informações do produto para verificar a necessidade de reposição.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 12.01 | Confiabilidade | O sistema deve garantir que a verificação da quantidade de produtos seja realizada corretamente. |
| RNF – 12.02 | Desempenho | O sistema deve identificar e exibir alertas de estoque crítico em tempo adequado durante o uso do sistema. |
| RNF – 13.03 | Usabilidade | O alerta deve ser apresentado de forma clara e visível para facilitar identificação pelos usuários. |

## RF - 13 - Cadastro de Estoque

### O que é?

É a funcionalidade do sistema que permite registrar o estoque inicial de produtos, definindo a quantidade disponível no momento do cadastro.

### Por que existe?

O cadastro de estoque existe para inicializar o controle de quantidades dos produtos, permitindo que o sistema tenha uma base correta para gerenciar entradas e saídas.

### Quem usa?

Administrador.

### Fluxo detalhado

1. Usuário acessa o Gerenciamento de Estoque.
2. Clica em Novo Registro de Estoque.
3. Sistema exibe a lista de produtos cadastrados.
4. Usuário seleciona um produto.
5. Usuário informa dados adicionais (se necessário).
6. Usuário clica em Salvar.
7. Sistema registra o item no estoque e exibe confirmação.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 13.01 | Confiabilidade | O sistema deve garantir que a quantidade inicial seja registrada corretamente no banco de dados. |
| RNF – 13.02 | Usabilidade | A interface deve permitir fácil inserção da quantidade inicial. |

## RF - 14 - Inclusão de Estoque

### O que é?

É a funcionalidade que permite adicionar novas quantidades a um produto já existente no estoque.

### Por que existe?

Permite atualizar o estoque quando há reposição de produtos.

### Quem usa?

Administrador e Técnico.

### Fluxo detalhado

1. Usuário acessa o Gerenciamento de Estoque.
2. Seleciona o produto desejado.
3. Informa a quantidade a ser adicionada.
4. Confirma a operação.
5. Sistema atualiza o estoque e registra a movimentação.
6. Sistema exibe mensagem de confirmação.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 14.01 | Confiabilidade | O sistema deve garantir que a quantidade seja atualizada corretamente. |
| RNF – 14.02 | Desempenho | A atualização deve ocorrer em até 3 segundos. |

## RF - 15 - Saída de Estoque e Venda

### O que é?

É a funcionalidade que permite registrar a saída de produtos do estoque devido a vendas.

### Por que existe?

Permite controlar a redução de estoque quando produtos são vendidos.

### Quem usa?

Administrador e Técnico.

### Fluxo detalhado

1. Usuário acessa a funcionalidade de saída de estoque.
2. Seleciona o produto.
3. Informa a quantidade a ser retirada.
4. Confirma a operação.
5. Sistema valida a disponibilidade.
6. Sistema atualiza o estoque e registra a saída.
7. Sistema exibe mensagem de confirmação.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 15.01 | Confiabilidade | O sistema deve impedir saída maior que o estoque disponível. |
| RNF – 15.02 | Segurança | A operação deve ser permitida apenas para usuários autorizados. |

## RF - 16 - Expurgo de Estoque

### O que é?

É a funcionalidade que permite retirar produtos do estoque por perda, dano ou vencimento.

### Por que existe?

Permite manter o estoque fiel à realidade, removendo itens inutilizáveis.

### Quem usa?

Administrador.

### Fluxo detalhado

1. Usuário acessa a funcionalidade de saída por expurgo.
2. Seleciona o produto.
3. Informa a quantidade e o motivo.
4. Confirma a operação.
5. Sistema atualiza o estoque e registra a movimentação.
6. Sistema exibe mensagem de confirmação.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 16.01 | Confiabilidade | O sistema deve registrar corretamente o motivo do expurgo. |
| RNF – 16.02 | Segurança | A funcionalidade deve ser restrita a administradores. |

## RF - 17 - Relatório de Usuários

### O que é?

Permite gerar relatórios com informações dos usuários cadastrados.

### Por que existe?

Permite manter o estoque fiel à realidade, removendo itens inutilizáveis.

### Quem usa?

Administrador.

### Fluxo detalhado

1. Usuário acessa a área de relatórios.
2. Seleciona Relatório de Usuários.
3. Solicita a geração do relatório.
4. Sistema exibe ou exporta os dados.

### Requisitos Não Funcional associados

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF – 17.01 | Desempenho | O relatório deve ser gerado em até 5 segundos. |
| RNF – 17.02 | Usabilidade | O relatório deve ser apresentado de forma clara e organizada. |

## RNF - 18 - Criptografia

### O que é?

É o requisito não funcional que define que o sistema deve proteger dados sensíveis por meio de criptografia, como senhas e informações dos usuários.

### Por que existe?

A criptografia existe para garantir a segurança das informações armazenadas e trafegadas no sistema, evitando acessos não autorizados e protegendo os dados contra vazamentos.

### Quem usa?

Administrador.

### Regras associadas

1. O sistema deve armazenar senhas de forma criptografada no banco de dados.
2. O sistema deve proteger dados sensíveis durante o tráfego de informações.
3. O sistema deve utilizar algoritmos seguros e atualizados.

## RNF - 19 - Compatibilidade

### O que é?

É o requisito não funcional que define que o sistema deve funcionar corretamente em diferentes ambientes e navegadores.

### Por que existe?

A compatibilidade existe para garantir que os usuários consigam acessar e utilizar o sistema independentemente do navegador ou dispositivo utilizado.

### Quem usa?

Administrador e técnico.

### Regras associadas

1. O sistema deve ser compatível com os principais navegadores (Chrome, Edge e Firefox).
2. O sistema deve manter funcionamento adequado em diferentes resoluções de tela.
3. O sistema deve apresentar interface responsiva e adaptável.

