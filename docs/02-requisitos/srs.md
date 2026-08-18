# 1. REQUISITOS FUNCIONAIS (RF)

## 1.1 Módulo de Usuário e Autenticação

### RF01 - Realizar Login

**Descrição:**
O sistema deve permitir que usuários autenticados acessem a plataforma utilizando login e senha.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Validação das credenciais informadas contra o registro de base de dados e inicialização da sessão com base no nível de permissão associado.

**Integração:**
Vinculado diretamente ao UC02.

---

### RF02 - Alterar Senha

**Descrição:**
O sistema deve prover funcionalidade para alteração de credenciais de acesso em caso de esquecimento ou necessidade de atualização de segurança.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Envio de requisição de redefinição, validação da identidade do solicitante e gravação da nova senha.

**Integração:**
Vinculado diretamente ao UC07.

---

### RF03 - Recuperar Senha

**Descrição:**
O sistema deve permitir a solicitação de recuperação de senha através da opção "Esqueci minha senha" disponível na tela de login, utilizando um processo seguro de redefinição de acesso.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Envio da solicitação de recuperação de senha, validação da identidade do usuário e redefinição da senha.

**Integração:**
Vinculado diretamente ao UC07.

---

### RF04 - Cadastrar de Usuários

**Descrição:**
O sistema deve permitir a inclusão de novos usuários na plataforma, tornando obrigatório o preenchimento de nome, login único, senha e a definição do perfil de acesso.

**Atores:**
Administrador.

**Operações do Sistema:**
Verificação de exclusividade do login, aplicação de validação e armazenamento seguro da senha e persistência dos dados.

**Integração:**
Vinculado diretamente ao UC01.

---

### RF05 - Editar Usuário

**Descrição:**
O sistema deve permitir a alteração das informações cadastrais e dos perfis de acesso dos usuários previamente registrados.

**Atores:**
Administrador.

**Operações do Sistema:**
Buscar a identidade (Perfil), validar os novos dados e atualizar o registro.

**Integração:**
Vinculado diretamente ao UC03.

---

### RF06 - Excluir Usuário

**Descrição:**
O sistema deve permitir a remoção ou a suspensão do acesso de um usuário da base de dados ativa do sistema.

**Atores:**
Administrador.

**Operações do Sistema:**
Solicitação de confirmação de segurança e exclusão do usuário.

**Integração:**
Vinculado diretamente ao UC04.

---

### RF07 - Consultar Usuário

**Descrição:**
O sistema deve disponibilizar uma interface para a busca e visualização estruturada de todos os usuários cadastrados.

**Atores:**
Administrador.

**Operações do Sistema:**
Leitura da base de dados e exibição das identidades com paginação de resultados.

**Integração:**
Vinculado diretamente ao UC05.

---

## 1.2 Módulo de Gestão de Produtos

### RF08 - Cadastrar Produtos

**Descrição:**
O sistema deve permitir a inserção de novos itens no catálogo da assistência técnica, exigindo o preenchimento obrigatório da nomenclatura, categoria, código SKU.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Validação de campos obrigatórios, verificação de exclusividade do código SKU e gravação do registro de produto.

**Integração:**
Vinculado diretamente ao UC08.

---

### RF09 - Editar Produto

**Descrição:**
O sistema deve permitir que o usuário edite as informações de produtos já cadastrados.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Carregamento dos dados do produto selecionado, disponibilização das informações para edição, validação dos campos alterados (como nome, SKU e código de barras) e salvamento das atualizações no sistema após verificação.

**Integração:**
Vinculado diretamente ao UC10.

---

### RF10 - Excluir Produtos

**Descrição:**
O sistema deve permitir que o Administrador exclua produtos cadastrados no sistema.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Localização do produto selecionado, solicitação de confirmação da exclusão e remoção do produto do sistema após confirmação do usuário.

**Integração:**
Vinculado diretamente ao UC11.

---

### RF11 - Consultar Produtos

**Descrição:**
O sistema deve permitir a busca e visualização de produtos cadastrados.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Busca de produtos, aplicação de filtros e exibição dos dados do produto.

**Integração:**
Vinculado diretamente a UC09.

---

## 1.3 Módulo de Controle de Estoque

### RF12 - Registrar Entrada de Produtos no Estoque

**Descrição:**
O sistema deve permitir o registro da entrada de produtos no estoque.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Recebimento dos dados da entrada de produtos, validação das informações informadas e atualização da quantidade disponível do produto no estoque.

**Integração:**
Vinculado diretamente ao UC12.

---

### RF13 - Registrar Saída de Produtos no Estoque

**Descrição:**
O sistema deve permitir o registro da saída de produtos do estoque.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Recebimento dos dados da saída de produtos, validação das informações informadas e atualização da quantidade disponível do produto no estoque.

**Integração:**
Vinculado diretamente ao UC13.

---

### RF14 - Consultar Histórico de Estoque

**Descrição:**
O sistema deve permitir a consulta do histórico de movimentações de estoque, exibindo registros de entradas e saídas de produtos.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Recuperação dos registros de movimentação de estoque, aplicação de filtros de busca (como produto, data ou tipo de movimentação) e exibição das informações registradas.

**Integração:**
Vinculado diretamente ao UC14

---

### RF15 - Expurgar Produto de Estoque

**Descrição:**
O sistema deve permitir a remoção definitiva de produtos do estoque que não serão mais utilizados.

**Atores:**
Administrador e Técnico.

**Operações do Sistema:**
Seleção do produto, confirmação da ação e remoção definitiva do item do estoque.

**Integração:**
Vinculado diretamente ao UC15

---

## 1.4 Módulo de Movimentações e Relatórios

### RF16 - Gerar Relatório de Movimentações de Estoque

**Descrição:**
O sistema deve permitir a geração de relatórios com base nas movimentações de estoque realizadas.

**Atores:**
Administrador.

**Operações do Sistema:**
Coleta das movimentações de estoque (entradas e saídas), aplicação de filtros (como período ou produto) e geração de relatório com os dados consolidados.

**Integração:**
Vinculado diretamente ao UC16.

---

### RF17 - Gerar Relatório de Estoque

**Descrição:**
O sistema deve permitir a geração de relatórios sobre o estoque de produtos.

**Atores:**
Administrador.

**Operações do Sistema:**
Coleta das informações do estoque, aplicação de filtros (como produto ou período) e geração de relatório com os dados atualizados do estoque.

**Integração:**
Vinculado diretamente ao UC17.

---

### RF18- Gerar Relatório de Produtos

**Descrição:**
O sistema deve permitir a geração de relatórios com base nos produtos cadastrados.

**Atores:**
Administrador.

**Operações do Sistema:**
Geração de relatório com os produtos cadastrados, exibindo informações básicas como nome, SKU, código de barras, categoria, quantidade e marca.

**Integração:**
Vinculado diretamente ao UC18.

---

### RF19 - Exportar Relatórios em Excel

**Descrição:**
O sistema deve permitir a exportação de relatórios gerados para o formato Excel (.xlsx).

**Atores:**
Adminitrador.

**Operações do Sistema:**
Conversão dos dados do relatório selecionado e geração de arquivo no formato Excel (.xlsx) para download ou armazenamento.

**Integração:**
Vinculado diretamente ao UC19.

---

### RF20 - Exportar Relatórios em PDF

**Descrição:**
O sistema deve permitir a exportação de relatórios gerados para o formato PDF (.pdf).

**Atores:**
Administrador.

**Operações do Sistema:**
Conversão dos dados do relatório selecionado e geração de arquivo no formato PDF (.pdf) para download ou armazenamento.

**Integração:**
Vinculado diretamente ao UC20.

---

## 1.5 Classificação de Prioridade dos Requisitos Funcionais

Todo requisito deste documento possui uma classificação que define sua obrigatoriedade dentro do sistema.

| Classificação | Significado |
|---------------|-------------|
| Obrigatório | Sem ela o sistema não cumpre seu objetivo principal. |
| Importante | Agrega funcionalidades relevantes para gestão e operação do sistema. |
| Desejável | Melhora a experiência e a gestão, mas o sistema consegue funcionar sem ela. |

---

### 1 Módulo de Usuário e Autenticação

| ID | Funcionalidade | Descrição | Prioridade |
|----|---------------|-----------|------------|
| RF- 01 | Realizar Login | O sistema deve permitir que usuários autenticados acessem a plataforma utilizando login e senha. | Obrigatório |
| RF- 02 | Alterar Senha | O sistema deve permitir a redefinição ou atualização da senha de acesso. | Importante |
| RF- 03 | Recuperar Senha | O sistema deve permitir a solicitação de recuperação de senha pela opção "Esqueci minha senha". | Importante |
| RF- 04 | Cadastrar Usuário | O sistema deve permitir o cadastro de novos usuários com nome, e-mail, login, senha e perfil de acesso. | Obrigatório |
| RF- 05 | Editar Usuário | O sistema deve permitir a alteração das informações cadastrais e dos perfis de acesso dos usuários previamente registrados. | Importante |
| RF- 06 | Excluir Usuário | O sistema deve permitir a remoção ou a suspensão do acesso de um usuário da base de dados ativa do sistema. | Importante |
| RF- 07 | Consultar Usuário | O sistema deve disponibilizar uma interface para a busca e visualização estruturada de todos os usuários cadastrados. | Obrigatório |

---

### 2 Módulo de Gestão de Produtos

| ID | Funcionalidade | Descrição | Prioridade |
|----|---------------|-----------|------------|
| RF- 08 | Cadastrar Produto | O sistema deve permitir o cadastro de novos itens com nomenclatura, categoria e código SKU. | Obrigatório |
| RF- 09 | Editar Produto | O sistema deve permitir que o usuário edite as informações de produtos já cadastrados. | Importante |
| RF- 10 | Excluir Produto | O sistema deve permitir que o Administrador exclua produtos cadastrados no sistema. | Importante |
| RF- 11 | Consultar Produto | O sistema deve permitir a busca e visualização de produtos cadastrados. | Obrigatório |

---

### 3 Módulo de Controle de Estoque

| ID | Funcionalidade | Descrição | Prioridade |
|----|---------------|-----------|------------|
| RF- 12 | Registrar Entrada de Produtos no Estoque | O sistema deve permitir o registro da entrada de produtos no estoque. | Obrigatório |
| RF- 13 | Registrar Saída de Produtos no Estoque | O sistema deve permitir o registro da saída de produtos do estoque. | Obrigatório |
| RF- 14 | Consultar Histórico de Estoque | O sistema deve permitir a consulta do histórico de movimentações de estoque, exibindo registros de entradas e saídas de produtos. | Importante |
| RF- 15 | Expurgar Produto de Estoque | O sistema deve permitir a remoção definitiva de produtos do estoque que não serão mais utilizados. | Desejável |

---

### 4 Módulo de Movimentações e Relatórios

| ID | Funcionalidade | Descrição | Prioridade |
|----|---------------|-----------|------------|
| RF- 16 | Gerar Relatório de Movimentações de Estoque | O sistema deve permitir a geração de relatórios com base nas movimentações de estoque realizadas. | Importante |
| RF- 17 | Gerar Relatório de Estoque | O sistema deve permitir a geração de relatórios sobre o estoque de produtos. | Importante |
| RF- 18 | Gerar Relatório de Produtos | O sistema deve permitir a geração de relatórios com base nos produtos cadastrados. | Importante |
| RF- 19 | Exportar Relatórios em Excel | O sistema deve permitir a exportação de relatórios gerados para o formato Excel (.xlsx). | Desejável |
| RF- 20 | Exportar Relatórios em PDF | O sistema deve permitir a exportação de relatórios gerados para o formato PDF (.pdf). | Desejável |

---

# Requisitos Não Funcionais

## 1. Módulo de Usuário e Autenticação

- **RNF01.01 (Segurança):** As senhas dos usuários devem ser armazenadas no banco de dados utilizando algoritmos de criptografia fortes (como BCrypt ou PBKDF2).
- **RNF-01.02 (Segurança):** O sistema deve limitar a quantidade de tentativas consecutivas de login inválidas a no máximo 5 por usuário, bloqueando temporariamente a conta.
- **RNF-01.03 (Segurança):** O sistema deve autenticar obrigatoriamente o usuário por login e senha válidos antes de liberar o acesso a qualquer funcionalidade interna.
- **RNF-01.04 (Desempenho):** O sistema deve validar as credenciais de acesso e inicializar a sessão do usuário em até 3 segundos após a submissão.
- **RNF-01.05 (Usabilidade):** O sistema deve apresentar mensagens genéricas e claras em caso de falha (ex: "Usuário ou senha incorretos"), sem especificar qual dos campos está incorreto.
- **RNF-02.01 (Segurança):** O sistema deve exigir que as senhas criadas ou alteradas tenham no mínimo 8 caracteres, contendo obrigatoriamente letras e números.
- **RNF-02.02 (Usabilidade):** O sistema deve indicar visualmente e em tempo real quais campos obrigatórios de um formulário não foram preenchidos ou estão inválidos.
- **RNF-02.03 (Confiabilidade):** O sistema deve garantir a atomicidade das transações de cadastro, assegurando que os dados sejam gravados integralmente ou sejam descartados em caso de falha.
- **RNF-03.01 (Segurança):** A alteração de dados cadastrais de terceiros e de perfis de acesso deve ser permitida exclusivamente para o administrador.
- **RNF-03.02 (Segurança):** O sistema deve registrar em log de auditoria interno sempre que houver alteração em informações cadastrais ou permissões de usuários.
- **RNF-03.03 (Usabilidade):** A interface de edição deve ser clara, preenchendo previamente os campos com os dados antigos do usuário para facilitar a visualização antes da atualização.
- **RNF-03.04 (Confiabilidade):** O sistema deve garantir que as alterações de perfil e permissões sejam aplicadas imediatamente no banco de dados e propagadas para a sessão ativa do usuário.
- **RNF-04.01 (Segurança):** A remoção ou suspensão de um usuário na base de dados ativa deve ser uma funcionalidade restrita estritamente ao ator Administrador.
- **RNF-04.02 (Confiabilidade):** O sistema deve garantir que o usuário excluído/suspenso seja invalidado corretamente na base ativa, impedindo logins imediatamente após a ação.
- **RNF-05.01 (Desempenho):** O sistema deve exibir os resultados da busca e listagem estruturada de usuários em até 3 segundos.
- **RNF-05.02 (Usabilidade):** A tabela de consulta de usuários deve apresentar as informações de forma organizada, permitindo ordenação básica por colunas (como nome ou perfil).
- **RNF-05.03 (Disponibilidade):** A interface de consulta de usuários deve possuir alta disponibilidade, mantendo-se operacional durante todo o tempo de atividade da plataforma.
- **RNF-06.01 (Segurança):** O sistema deve restringir as funcionalidades exclusivas do Administrador, bloqueando automaticamente qualquer tentativa de acesso por parte do perfil Técnico.
- **RNF-06.02 (Segurança):** O sistema deve apresentar os componentes da interface de acordo com o perfil autenticado.
- **RNF-06.03 (Segurança):** A verificação do token ou sessão de segurança deve ocorrer de forma contínua em cada requisição feita ao servidor, bloqueando chamadas não autorizadas.

---

## 2. Módulo de Gestão de Produtos

- **RNF-07.01 (Usabilidade):** O formulário de cadastro de produtos deve ser intuitivo, destacando visualmente os campos obrigatórios (Nomenclatura, Categoria e SKU).
- **RNF-07.02 (Confiabilidade):** O banco de dados deve aplicar regras de exclusividade para impedir a gravação de produtos duplicados com o mesmo código SKU.
- **RNF-07.03 (Desempenho):** O tempo de resposta entre o clique no botão de salvar e o retorno de sucesso do cadastro do produto não deve exceder 3 segundos.
- **RNF-08.01 (Disponibilidade):** A busca e filtragem do catálogo de produtos deve estar disponível continuamente aos usuários autenticados durante o tempo de operação da plataforma.
- **RNF-08.02 (Usabilidade):** A listagem de produtos consultados deve exibir de forma organizada as informações essenciais em formato de tabela ou grade responsiva.
- **RNF-08.03 (Desempenho):** O retorno da consulta de produtos com a aplicação de filtros de busca deve ser exibido na tela em no máximo 3 segundos.
- **RNF-09.01 (Confiabilidade):** O sistema deve garantir a consistência referencial ao alterar dados de um produto, assegurando que seu histórico de estoque não seja corrompido.
- **RNF-09.02 (Usabilidade):** A tela de edição deve reutilizar a estrutura visual do cadastro, preenchendo os dados atuais para facilitar as modificações (Nome, SKU, Código de Barras).
- **RNF-09.03 (Desempenho):** O salvamento e a atualização das informações modificadas do produto devem ser processados e persistidos no banco de dados em até 3 segundos.
- **RNF-10.01 (Segurança):** A exclusão de produtos do catálogo deve ser permitida apenas para o ator Administrador, bloqueando a execução por Técnicos.
- **RNF-10.02 (Confiabilidade):** O sistema deve validar se o produto não possui movimentações ativas ou saldo pendente antes de efetivar a remoção, garantindo a integridade histórica.

---

## 3. Módulo de Controle de Estoque

- **RNF-11.01 (Confiabilidade):** Todas as operações de entrada e saída de mercadorias devem ser tratadas como transações ACID, garantindo a perfeita consonância entre saldo e histórico.
- **RNF-11.02 (Desempenho):** A consulta ao histórico de movimentações de estoque, mesmo aplicando filtros por período ou produto, deve retornar os dados em até 3 segundos.
- **RNF-11.03 (Usabilidade):** Os registros de movimentação de estoque devem ser exibidos de forma cronológica e com distinção visual clara (ex: cores diferentes para entradas e saídas).
- **RNF-12.01 (Confiabilidade):** O sistema de cálculo de estoque deve realizar operações aritméticas precisas, impedindo divergências de arredondamento ou inconsistências de inventário.
- **RNF-12.02 (Desempenho):** O sistema deve avaliar a quantidade disponível imediatamente após cada movimentação, identificando e gerando alertas de estoque crítico em até 1 segundo.
- **RNF-12.03 (Usabilidade):** Os alertas de nível crítico de estoque devem ser destacados na interface por meio de elementos visuais evidentes (como mensagens vermelhas ou ícones).
- **RNF-13.01 (Confiabilidade):** O sistema deve validar os dados de entrada, impedindo que quantidades iniciais ou movimentações de entrada recebam valores negativos ou zerados.
- **RNF-13.02 (Usabilidade):** A interface de registro de movimentações deve ser otimizada para inserção rápida de dados, permitindo navegação fluida por teclado entre os campos.
- **RNF-14.01 (Confiabilidade):** O sistema deve usar travas de concorrência no banco de dados para garantir que movimentações simultâneas no mesmo produto não gerem erros de saldo.
- **RNF-14.02 (Desempenho):** O processamento da atualização matemática do saldo do produto em estoque deve levar no máximo 3 segundos após a confirmação da operação.
- **RNF-15.01 (Confiabilidade):** O sistema deve validar estritamente as requisições, impedindo de forma nativa saídas de produtos cuja quantidade solicitada supere o saldo atual disponível.
- **RNF-15.02 (Segurança):** A operação de expurgar definitivamente itens do estoque (RF15) deve ser restrita ao Administrador e exigir o registro obrigatório de uma justificativa.

---

## 4. Módulo de Movimentações e Relatórios

- **RNF-16.01 (Desempenho):** A consolidação de dados e a geração dos relatórios na tela (Movimentação, Estoque e Produtos) devem ser concluídas em até 5 segundos.
- **RNF-16.02 (Usabilidade):** Os relatórios gerados e os arquivos exportados em Excel (.xlsx) e PDF (.pdf) devem possuir layouts padronizados, com cabeçalhos claros e paginação correta.
- **RNF-16.03 (Confiabilidade):** O processo de exportação de arquivos volumosos (.pdf e .xlsx) deve ser isolado, garantindo que o consumo de memória não afete o desempenho geral.
