# Requisitos do Sistema Stock Master

## 1. Convenções de Nomenclatura

- **Administrador:** usuário com permissão total para gerenciar usuários, produtos, estoque, relatórios e configurações.
- **Técnico:** usuário com permissão operacional para consultar produtos e registrar movimentações autorizadas.
- **Produto:** item controlado pelo sistema de estoque.
- **Estoque:** quantidade disponível de produtos registrada no sistema.
- **Movimentação de estoque:** qualquer entrada, saída, venda ou expurgo que altere a quantidade disponível de um produto.
- **Estoque crítico:** situação em que a quantidade disponível de um produto está igual ou abaixo do limite mínimo definido.

## 2. Requisitos Funcionais

### RF01 - Realizar Login

- **Descrição:** O sistema deve permitir que usuários cadastrados acessem a plataforma por meio de login e senha.
- **Usuários:** Administrador e Técnico.
- **Regras principais:**
  - O sistema deve exibir um formulário de login.
  - O usuário deve informar login e senha.
  - O sistema deve validar as credenciais informadas.
  - Se as credenciais forem válidas, o sistema deve liberar o acesso e redirecionar o usuário para a tela principal.
  - Se as credenciais forem inválidas, o sistema deve informar o erro e permitir uma nova tentativa.
- **RNFs relacionados:** RNF01.01, RNF01.02, RNF01.03.

### RF02 - Cadastrar Usuários

- **Descrição:** O sistema deve permitir o cadastro de novos usuários, registrando dados básicos e perfil de acesso.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar o gerenciamento de usuários.
  - O sistema deve exibir o formulário de cadastro.
  - O administrador deve informar nome, login, e-mail, senha e perfil.
  - O sistema deve validar os campos obrigatórios.
  - Se os dados forem válidos, o sistema deve salvar o usuário e exibir confirmação.
  - Se houver erro, o sistema deve indicar os campos que precisam ser corrigidos.
- **RNFs relacionados:** RNF02.01, RNF02.02, RNF02.03.

### RF03 - Editar Usuários

- **Descrição:** O sistema deve permitir a alteração das informações de usuários cadastrados.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar o gerenciamento de usuários.
  - O sistema deve listar os usuários cadastrados.
  - O administrador deve selecionar o usuário que deseja editar.
  - O sistema deve exibir o formulário com os dados atuais.
  - O administrador deve alterar as informações necessárias.
  - O sistema deve validar e salvar as alterações.
- **RNFs relacionados:** RNF03.01, RNF03.02, RNF03.03.

### RF04 - Excluir Usuários

- **Descrição:** O sistema deve permitir a remoção de usuários cadastrados.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar o gerenciamento de usuários.
  - O sistema deve listar os usuários cadastrados.
  - O administrador deve selecionar o usuário que deseja excluir.
  - O sistema deve solicitar confirmação antes da exclusão.
  - Após a confirmação, o sistema deve remover o usuário e exibir mensagem de sucesso.
- **RNFs relacionados:** RNF04.01, RNF04.02.

### RF05 - Consultar Usuários

- **Descrição:** O sistema deve permitir a visualização e pesquisa dos usuários cadastrados.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar o gerenciamento de usuários.
  - O sistema deve apresentar a lista de usuários cadastrados.
  - O administrador deve poder buscar ou filtrar usuários.
  - O sistema deve apresentar os resultados conforme os critérios informados.
- **RNFs relacionados:** RNF05.01, RNF05.02, RNF05.03.

### RF06 - Controlar Acesso por Perfil

- **Descrição:** O sistema deve controlar o acesso às funcionalidades de acordo com o perfil do usuário autenticado.
- **Usuários:** Administrador e Técnico.
- **Regras principais:**
  - O sistema deve identificar o perfil do usuário após o login.
  - O sistema deve verificar as permissões associadas ao perfil.
  - O sistema deve liberar apenas as funcionalidades permitidas ao perfil do usuário.
  - Se o usuário tentar acessar uma funcionalidade não autorizada, o sistema deve bloquear o acesso e exibir aviso de permissão insuficiente.
- **RNFs relacionados:** RNF06.01, RNF06.02, RNF06.03.

### RF07 - Cadastrar Produtos

- **Descrição:** O sistema deve permitir o cadastro de produtos para identificação e controle no estoque.
- **Usuários:** Administrador e Técnico.
- **Regras principais:**
  - O usuário deve acessar o gerenciamento de produtos.
  - O sistema deve exibir o formulário de cadastro de produto.
  - O usuário deve informar dados como nome, categoria, SKU ou código de barras e quantidade, quando aplicável.
  - O sistema deve validar os dados informados.
  - Se os dados forem válidos, o sistema deve salvar o produto e exibir confirmação.
- **RNFs relacionados:** RNF07.01, RNF07.02, RNF07.03.

### RF08 - Consultar Produtos

- **Descrição:** O sistema deve permitir a visualização e pesquisa dos produtos cadastrados.
- **Usuários:** Administrador e Técnico.
- **Regras principais:**
  - O usuário deve acessar o gerenciamento de produtos.
  - O sistema deve listar os produtos cadastrados.
  - O usuário deve poder buscar ou filtrar produtos por informações como nome, categoria, SKU ou código de barras.
  - O sistema deve apresentar os resultados conforme os critérios informados.
- **RNFs relacionados:** RNF08.01, RNF08.02, RNF08.03.

### RF09 - Editar Produtos

- **Descrição:** O sistema deve permitir a alteração das informações de produtos cadastrados.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar o gerenciamento de produtos.
  - O sistema deve listar os produtos cadastrados.
  - O administrador deve selecionar o produto que deseja editar.
  - O sistema deve exibir o formulário com os dados atuais.
  - O administrador deve alterar as informações necessárias.
  - O sistema deve validar e salvar as alterações.
- **RNFs relacionados:** RNF09.01, RNF09.02, RNF09.03.

### RF10 - Excluir Produtos

- **Descrição:** O sistema deve permitir a remoção de produtos cadastrados.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar o gerenciamento de produtos.
  - O sistema deve listar os produtos cadastrados.
  - O administrador deve selecionar o produto que deseja excluir.
  - O sistema deve solicitar confirmação antes da exclusão.
  - Após a confirmação, o sistema deve remover o produto e exibir mensagem de sucesso.
- **RNFs relacionados:** RNF10.01, RNF10.02.

### RF11 - Consultar Histórico de Movimentações

- **Descrição:** O sistema deve registrar e permitir a consulta do histórico de movimentações de estoque.
- **Usuários:** Administrador e Técnico.
- **Regras principais:**
  - O usuário deve acessar o histórico de movimentações.
  - O sistema deve listar as movimentações registradas.
  - O histórico deve apresentar produto, tipo de movimentação, quantidade e data da operação.
  - O usuário deve poder buscar ou filtrar movimentações específicas.
- **RNFs relacionados:** RNF11.01, RNF11.02, RNF11.03.

### RF12 - Emitir Alerta de Estoque Crítico

- **Descrição:** O sistema deve identificar produtos com quantidade igual ou inferior ao limite mínimo definido e emitir alerta.
- **Usuários:** Administrador.
- **Regras principais:**
  - O sistema deve verificar automaticamente a quantidade disponível dos produtos.
  - O sistema deve comparar a quantidade disponível com o limite mínimo configurado.
  - Quando o estoque estiver crítico, o sistema deve gerar uma notificação.
  - O administrador deve poder acessar as informações do produto para avaliar a reposição.
- **RNFs relacionados:** RNF12.01, RNF12.02, RNF12.03.

### RF13 - Cadastrar Estoque Inicial

- **Descrição:** O sistema deve permitir o registro da quantidade inicial de produtos no estoque.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar o gerenciamento de estoque.
  - O sistema deve listar os produtos cadastrados.
  - O administrador deve selecionar um produto.
  - O administrador deve informar a quantidade inicial.
  - O sistema deve salvar o registro e exibir confirmação.
- **RNFs relacionados:** RNF13.01, RNF13.02.

### RF14 - Incluir Estoque

- **Descrição:** O sistema deve permitir a adição de novas quantidades a produtos já existentes no estoque.
- **Usuários:** Administrador e Técnico.
- **Regras principais:**
  - O usuário deve acessar o gerenciamento de estoque.
  - O usuário deve selecionar o produto desejado.
  - O usuário deve informar a quantidade a ser adicionada.
  - O sistema deve atualizar o estoque, registrar a movimentação e exibir confirmação.
- **RNFs relacionados:** RNF14.01, RNF14.02.

### RF15 - Registrar Saída de Estoque por Venda

- **Descrição:** O sistema deve permitir o registro da saída de produtos do estoque em razão de vendas.
- **Usuários:** Administrador e Técnico.
- **Regras principais:**
  - O usuário deve acessar a funcionalidade de saída de estoque.
  - O usuário deve selecionar o produto.
  - O usuário deve informar a quantidade a ser retirada.
  - O sistema deve validar a disponibilidade em estoque.
  - Se houver quantidade suficiente, o sistema deve atualizar o estoque, registrar a saída e exibir confirmação.
- **RNFs relacionados:** RNF15.01, RNF15.02.

### RF16 - Registrar Expurgo de Estoque

- **Descrição:** O sistema deve permitir a retirada de produtos do estoque por perda, dano, vencimento ou outro motivo justificado.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar a funcionalidade de expurgo de estoque.
  - O administrador deve selecionar o produto.
  - O administrador deve informar a quantidade e o motivo do expurgo.
  - O sistema deve atualizar o estoque, registrar a movimentação e exibir confirmação.
- **RNFs relacionados:** RNF16.01, RNF16.02.

### RF17 - Gerar Relatório de Usuários

- **Descrição:** O sistema deve permitir a geração de relatórios com informações dos usuários cadastrados.
- **Usuários:** Administrador.
- **Regras principais:**
  - O administrador deve acessar a área de relatórios.
  - O administrador deve selecionar o relatório de usuários.
  - O sistema deve gerar o relatório para visualização ou exportação.
- **RNFs relacionados:** RNF17.01, RNF17.02.

## 3. Requisitos Não Funcionais

### 3.1 RNFs Associados aos Requisitos Funcionais

#### RNF01 - Login

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF01.01 | Segurança | As senhas dos usuários devem ser armazenadas de forma criptografada no banco de dados. |
| RNF01.02 | Desempenho | O sistema deve validar as credenciais de acesso em até 3 segundos. |
| RNF01.03 | Usabilidade | O sistema deve apresentar mensagens claras e compreensíveis em caso de login ou senha incorretos. |

#### RNF02 - Cadastro de Usuários

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF02.01 | Segurança | O sistema deve exigir senha com no mínimo 8 caracteres. |
| RNF02.02 | Usabilidade | O sistema deve indicar visualmente campos obrigatórios não preenchidos ou preenchidos incorretamente. |
| RNF02.03 | Confiabilidade | O sistema deve garantir que os dados cadastrados sejam armazenados corretamente no banco de dados. |

#### RNF03 - Edição de Usuários

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF03.01 | Segurança | A edição de usuários deve ser permitida apenas para usuários autorizados. |
| RNF03.02 | Usabilidade | O sistema deve apresentar interface clara para facilitar a atualização das informações. |
| RNF03.03 | Confiabilidade | O sistema deve garantir que as alterações sejam armazenadas corretamente no banco de dados. |

#### RNF04 - Exclusão de Usuários

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF04.01 | Segurança | A exclusão de usuários deve ser permitida apenas para administradores. |
| RNF04.02 | Confiabilidade | O sistema deve garantir que o usuário seja removido corretamente do banco de dados. |

#### RNF05 - Consulta de Usuários

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF05.01 | Desempenho | O sistema deve apresentar os resultados da consulta em até 3 segundos. |
| RNF05.02 | Usabilidade | A interface deve apresentar os usuários de forma organizada e de fácil visualização. |
| RNF05.03 | Disponibilidade | A consulta de usuários deve estar disponível sempre que o sistema estiver em funcionamento. |

#### RNF06 - Controle de Acesso por Perfil

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF06.01 | Segurança | O sistema deve garantir que apenas usuários autorizados acessem funcionalidades de acordo com seu perfil. |
| RNF06.02 | Confiabilidade | O sistema deve aplicar corretamente as permissões configuradas para cada perfil durante o uso. |
| RNF06.03 | Segurança | O controle de acesso deve permanecer ativo durante o uso do sistema. |

#### RNF07 - Cadastro de Produtos

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF07.01 | Usabilidade | O sistema deve apresentar formulário de cadastro claro e de fácil preenchimento. |
| RNF07.02 | Confiabilidade | O sistema deve garantir que as informações do produto sejam armazenadas corretamente no banco de dados. |
| RNF07.03 | Desempenho | O sistema deve registrar o cadastro do produto em até 3 segundos após a confirmação do usuário. |

#### RNF08 - Consulta de Produtos

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF08.01 | Usabilidade | A interface de consulta deve apresentar os produtos de forma organizada e de fácil visualização. |
| RNF08.02 | Disponibilidade | A consulta de produtos deve estar disponível sempre que o sistema estiver em funcionamento. |
| RNF08.03 | Desempenho | O sistema deve exibir os resultados da consulta em até 3 segundos. |

#### RNF09 - Edição de Produtos

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF09.01 | Usabilidade | O sistema deve apresentar interface clara para facilitar a edição das informações do produto. |
| RNF09.02 | Confiabilidade | O sistema deve garantir que as alterações realizadas sejam armazenadas corretamente no banco de dados. |
| RNF09.03 | Desempenho | O sistema deve atualizar as informações do produto em até 3 segundos. |

#### RNF10 - Exclusão de Produtos

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF10.01 | Segurança | A exclusão de produtos deve ser permitida apenas para usuários autorizados. |
| RNF10.02 | Confiabilidade | O sistema deve garantir que o produto seja removido corretamente do banco de dados. |

#### RNF11 - Histórico de Movimentações

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF11.01 | Confiabilidade | O sistema deve garantir que todas as movimentações sejam registradas corretamente no banco de dados. |
| RNF11.02 | Desempenho | O sistema deve exibir o histórico de movimentações em até 3 segundos. |
| RNF11.03 | Usabilidade | As informações do histórico devem ser apresentadas de forma organizada e de fácil visualização. |

#### RNF12 - Alerta de Estoque Crítico

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF12.01 | Confiabilidade | O sistema deve garantir que a verificação da quantidade de produtos seja realizada corretamente. |
| RNF12.02 | Desempenho | O sistema deve identificar e exibir alertas de estoque crítico em tempo adequado durante o uso. |
| RNF12.03 | Usabilidade | O alerta deve ser apresentado de forma clara e visível para facilitar sua identificação. |

#### RNF13 - Cadastro de Estoque Inicial

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF13.01 | Confiabilidade | O sistema deve garantir que a quantidade inicial seja registrada corretamente no banco de dados. |
| RNF13.02 | Usabilidade | A interface deve permitir a inserção da quantidade inicial de forma simples e clara. |

#### RNF14 - Inclusão de Estoque

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF14.01 | Confiabilidade | O sistema deve garantir que a quantidade adicionada seja atualizada corretamente no estoque. |
| RNF14.02 | Desempenho | A atualização do estoque deve ocorrer em até 3 segundos. |

#### RNF15 - Saída de Estoque por Venda

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF15.01 | Confiabilidade | O sistema deve impedir saída maior que o estoque disponível. |
| RNF15.02 | Segurança | A operação de saída de estoque deve ser permitida apenas para usuários autorizados. |

#### RNF16 - Expurgo de Estoque

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF16.01 | Confiabilidade | O sistema deve registrar corretamente o motivo do expurgo. |
| RNF16.02 | Segurança | A funcionalidade de expurgo deve ser restrita a administradores. |

#### RNF17 - Relatório de Usuários

| ID | Categoria | Descrição |
| --- | --- | --- |
| RNF17.01 | Desempenho | O relatório de usuários deve ser gerado em até 5 segundos. |
| RNF17.02 | Usabilidade | O relatório deve ser apresentado de forma clara e organizada. |

### 3.2 RNFs Gerais do Sistema

#### RNF18 - Criptografia de Dados

- **Categoria:** Segurança.
- **Descrição:** O sistema deve proteger dados sensíveis por meio de criptografia, incluindo senhas e informações de usuários.
- **Regras principais:**
  - O sistema deve armazenar senhas de forma criptografada.
  - O sistema deve proteger dados sensíveis durante o tráfego de informações.
  - O sistema deve utilizar algoritmos seguros e atualizados.

#### RNF19 - Compatibilidade e Responsividade

- **Categoria:** Compatibilidade.
- **Descrição:** O sistema deve funcionar corretamente em diferentes navegadores, ambientes e dispositivos.
- **Regras principais:**
  - O sistema deve ser compatível com os principais navegadores, incluindo Chrome, Edge e Firefox.
  - O sistema deve manter funcionamento adequado em diferentes resoluções de tela.
  - O sistema deve apresentar interface responsiva e adaptável.
