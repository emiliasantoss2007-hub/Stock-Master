# Requisitos do Sistema 

>Requisitos Funcionais (RF) e Requisitos Não Funcionais (RNF).

---

## 1. Módulo de Autenticação e Segurança

### RF-01 — Controle de Acesso e Autenticação de Perfil

**Descrição:** O sistema deve permitir que os usuários realizem o acesso à plataforma mediante o fornecimento de credenciais de login e senha válidas.

**Atores:** Administrador e Técnico.

**Operações do Sistema:** Validação das credenciais informadas contra o registro de base de dados e inicialização da sessão com base no nível de permissão associado.

**Integração:** Vinculado diretamente a **RN01** e **UC01**.

#### Requisitos Não Funcionais — RF-01

| ID | Categoria | Descrição |
|---|---|---|
| RNF-01.01 | Segurança | As senhas dos usuários devem ser armazenadas de forma criptografada no banco de dados, garantindo a proteção das credenciais. |
| RNF-01.02 | Segurança | O sistema deve limitar a quantidade de tentativas consecutivas de login inválidas por usuário. |
| RNF-01.03 | Segurança | O sistema deve autenticar o usuário por login e senha válidos antes de liberar acesso ao sistema. |
| RNF-01.04 | Desempenho | O sistema deve validar as credenciais de acesso em até 3 segundos. |
| RNF-01.05 | Usabilidade | O sistema deve apresentar mensagens claras e compreensíveis em caso de erro de login ou senha incorreta. |

---

### RF-02 — Recuperação de Acesso Técnico

**Descrição:** O sistema deve prover funcionalidade para alteração de credenciais de acesso em caso de esquecimento ou necessidade de atualização de segurança.

**Atores:** Administrador e Técnico.

**Operações do Sistema:** Envio de requisição de redefinição, validação da identidade do solicitante e gravação da nova senha.

**Integração:** Vinculado diretamente a **UC04**.

#### Requisitos Não Funcionais — RF-02

| ID | Categoria | Descrição |
|---|---|---|
| RNF-02.01 | Segurança | O sistema deve exigir senha com no mínimo 8 caracteres, contendo letras e números, garantindo maior proteção às contas dos usuários. |
| RNF-02.02 | Usabilidade | O sistema deve indicar visualmente quando os campos obrigatórios não forem preenchidos corretamente. |
| RNF-02.03 | Confiabilidade | O sistema deve garantir que os dados cadastrados sejam armazenados corretamente no banco de dados. |

---

## 2. Módulo de Gestão de Usuários

### RF-03 — Cadastro de Usuários

**Descrição:** O sistema deve permitir a inclusão de novos usuários na plataforma, tornando obrigatório o preenchimento de nome, login único, senha e a definição do perfil de acesso.

**Atores:** Administrador.

**Operações do Sistema:** Verificação de exclusividade do login, aplicação de criptografia na credencial de texto e persistência dos dados.

**Integração:** Vinculado diretamente a **RN02** e **UC07**.

#### Requisitos Não Funcionais — RF-03

| ID | Categoria | Descrição |
|---|---|---|
| RNF-03.01 | Segurança | A edição de usuários deve ser permitida apenas para usuários autorizados. |
| RNF-03.02 | Segurança | O sistema deve notificar o usuário sempre que houver alteração em suas informações cadastrais. |
| RNF-03.03 | Usabilidade | O sistema deve apresentar interface clara para facilitar a atualização das informações. |
| RNF-03.04 | Confiabilidade | O sistema deve garantir que as alterações sejam armazenadas corretamente no banco de dados. |

---

### RF-04 — Modificação de Dados de Usuários

**Descrição:** O sistema deve permitir a alteração das informações cadastrais e dos perfis de acesso dos usuários previamente registrados.

**Atores:** Administrador.

**Operações do Sistema:** Recuperação dos dados da identidade, validação dos novos parâmetros informados e atualização do registro.

**Integração:** Vinculado diretamente a **RN02** e **UC08**.

#### Requisitos Não Funcionais — RF-04

| ID | Categoria | Descrição |
|---|---|---|
| RNF-04.01 | Segurança | A exclusão de usuários deve ser permitida apenas para administradores. |
| RNF-04.02 | Confiabilidade | O sistema deve garantir que o usuário seja removido corretamente do banco de dados. |

---

### RF-05 — Inativação ou Exclusão Lógica de Usuários

**Descrição:** O sistema deve permitir a remoção ou a suspensão do acesso de um usuário da base de dados ativa do sistema.

**Atores:** Administrador.

**Operações do Sistema:** Solicitação de confirmação de segurança e alteração do status do usuário para "Inativo" ou remoção lógica.

**Integração:** Vinculado diretamente a **RN03**.

#### Requisitos Não Funcionais — RF-05

| ID | Categoria | Descrição |
|---|---|---|
| RNF-05.01 | Desempenho | O sistema deverá apresentar os resultados da consulta em até 3 segundos. |
| RNF-05.02 | Usabilidade | A interface deve apresentar aos usuários de forma organizada e de fácil visualização. |
| RNF-05.03 | Usabilidade | A funcionalidade de consulta deve estar disponível sempre que o sistema estiver em funcionamento. |

---

### RF-06 — Consulta e Listagem de Usuários

**Descrição:** O sistema deve disponibilizar uma interface para a busca e visualização estruturada de todos os usuários cadastrados.

**Atores:** Administrador.

**Operações do Sistema:** Leitura da base de dados e exibição das identidades com paginação de resultados.

**Integração:** Vinculado diretamente a **UC09**.

#### Requisitos Não Funcionais — RF-06

| ID | Categoria | Descrição |
|---|---|---|
| RNF-06.01 | Segurança | O sistema deve garantir que apenas usuários autorizados possam acessar determinadas funcionalidades, de acordo com seu perfil. |
| RNF-06.02 | Segurança | O sistema deve aplicar corretamente as configurações definidas para cada perfil durante o uso do sistema. |
| RNF-06.03 | Segurança | O controle de acesso deve estar sempre ativo durante o uso do sistema, garantindo que as permissões sejam verificadas continuamente. |

---

## 3. Módulo de Gestão de Produtos e Inventário

### RF-07 — Cadastro de Produtos

**Descrição:** O sistema deve permitir a inserção de novos itens no catálogo da assistência técnica, exigindo o preenchimento obrigatório da nomenclatura, categoria, lote inicial, código SKU e classificação fiscal (**NCM**).

**Atores:** Administrador.

**Operações do Sistema:** Validação de campos obrigatórios, verificação de exclusividade do código SKU e gravação do registro de produto.

**Integração:** Vinculado diretamente a **RN04**.

#### Requisitos Não Funcionais — RF-07

| ID | Categoria | Descrição |
|---|---|---|
| RNF-07.01 | Usabilidade | O sistema deve apresentar um formulário de cadastro claro e de fácil preenchimento para os usuários. |
| RNF-07.02 | Confiabilidade | O sistema deve garantir que as informações do produto sejam armazenadas corretamente no banco de dados. |
| RNF-07.03 | Desempenho | O sistema deve registrar o cadastro do produto em até 3 segundos após a confirmação do usuário. |

---

### RF-08 — Edição de Especificações de Produtos

**Descrição:** O sistema deve permitir a modificação dos metadados e parâmetros logísticos de produtos previamente existentes no catálogo.

**Atores:** Administrador.

**Operações do Sistema:** Carregamento das propriedades do item e salvamento das atualizações após validação técnica de dados.

**Integração:** Vinculado diretamente a **RN05**.

#### Requisitos Não Funcionais — RF-08

| ID | Categoria | Descrição |
|---|---|---|
| RNF-08.01 | Desempenho | A funcionalidade de consulta de produtos deve estar disponível sempre que o sistema estiver em funcionamento. |
| RNF-08.02 | Usabilidade | A interface de consulta deve apresentar os produtos de forma organizada e de fácil visualização. |
| RNF-08.03 | Usabilidade | O sistema deve exibir os resultados da consulta em até 3 segundos. |

---

### RF-09 — Remoção Lógica de Produtos

**Descrição:** O sistema deve permitir a exclusão de itens do catálogo de produtos ativos do sistema.

**Atores:** Administrador.

**Operações do Sistema:** Validação de integridade referencial para assegurar que o produto não possua movimentações históricas ou vínculos com Ordens de Serviço (OS) ativas antes de efetivar a remoção.

**Integração:** Vinculado diretamente a **RN06**.

#### Requisitos Não Funcionais — RF-09

| ID | Categoria | Descrição |
|---|---|---|
| RNF-09.01 | Confiabilidade | O sistema deve garantir que as alterações realizadas sejam armazenadas corretamente no banco de dados. |
| RNF-09.02 | Usabilidade | O sistema deve apresentar uma interface clara para facilitar a edição das informações do produto. |
| RNF-09.03 | Desempenho | O sistema deve atualizar as informações do produto em até 3 segundos. |

---

### RF-10 — Consulta ao Catálogo de Insumos

**Descrição:** O sistema deve fornecer ferramentas de pesquisa indexada para a localização imediata de produtos com base em filtros de busca.

**Atores:** Administrador e Técnico.

**Operações do Sistema:** Execução de consultas dinâmicas e exibição das especificações técnicas e do saldo atual do item em tela.

**Integração:** Vinculado diretamente a **RN04**.

#### Requisitos Não Funcionais — RF-10

| ID | Categoria | Descrição |
|---|---|---|
| RNF-10.01 | Segurança | A exclusão de produtos deve ser permitida apenas para usuários autorizados. |
| RNF-10.02 | Confiabilidade | O sistema deve garantir que o produto seja removido corretamente do banco de dados. |

---

## 4. Módulo de Fluxos e Movimentações de Estoque

### RF-11 — Registro de Movimentações Lógicas

**Descrição:** O sistema deve processar de forma atômica o incremento ou decremento quantitativo do estoque a partir de transações de Entrada, Venda, Uso em Ordem de Serviço (OS) ou Expurgo (Perdas e Danos).

**Atores:** Administrador e Técnico.

**Operações do Sistema:** Atualização matemática em tempo real do saldo disponível e gravação contínua na trilha de auditoria contendo data, hora (*timestamp*), tipo de movimentação, volume, **justificativa obrigatória** para expurgos e ID do operador.

**Integração:** Vinculado diretamente a **RN07**, **RN08**, **RN09**, **RN10**, **UC05**, **UC11** e **UC012**.

#### Requisitos Não Funcionais — RF-11

| ID | Categoria | Descrição |
|---|---|---|
| RNF-11.01 | Confiabilidade | O sistema deve garantir que todas as transações realizadas sejam registradas corretamente no banco de dados. |
| RNF-11.02 | Desempenho | O sistema deve exibir histórico de movimentações em até 3 segundos. |
| RNF-11.03 | Usabilidade | As informações do histórico devem ser apresentadas de forma organizada e de fácil visualização. |
| RNF-12.01 | Confiabilidade | O sistema deve garantir que a verificação da quantidade dos produtos seja realizada corretamente. |
| RNF-12.02 | Desempenho | O sistema deve identificar e exibir alertas de estoque crítico em tempo adequado durante o uso do sistema. |
| RNF-12.03 | Usabilidade | O alerta deve ser apresentado de forma clara e visível para facilitar a identificação dos usuários. |
| RNF-13.01 | Confiabilidade | O sistema deve garantir que a quantidade inicial seja registrada corretamente no banco de dados. |
| RNF-13.02 | Usabilidade | A interface deve permitir a inserção fácil da quantidade inicial. |
| RNF-14.01 | Confiabilidade | O sistema deve garantir que a quantidade seja atualizada corretamente. |
| RNF-14.02 | Desempenho | A atualização deve ocorrer em até 3 segundos. |
| RNF-15.01 | Confiabilidade | O sistema deve impedir a saída maior do que o estoque disponível. |
| RNF-15.02 | Confiabilidade | O sistema deve atualizar automaticamente a quantidade disponível em estoque após saída ou venda de produtos. |
| RNF-15.02 | Segurança | A operação deve ser permitida apenas para usuários autorizados. |
| RNF-16.01 | Confiabilidade | O sistema deve registrar corretamente o motivo da expurgo. |
| RNF-16.02 | Segurança | A funcionalidade deve ser restrita aos administradores. |

---

## 5. Módulo de Inteligência Preventiva e Relatórios

### RF-12 — Monitoramento e Alerta de Estoque Crítico

**Descrição:** O sistema deve monitorar em plano de fundo os volumes físicos de armazenamento e disparar alertas visuais proativos na interface.

**Atores:** Administrador e Técnico.

**Operações do Sistema:** Execução de rotina matemática automatizada que compara a quantidade disponível contra o estoque mínimo definido. O alerta deve ser gerado quando o saldo do produto for igual ou inferior a **30% do seu limite mínimo configurado**.

**Integração:** Vinculado diretamente a **RN11**.

---

### RF-13 — Emissão de Relatório de Situação Atual do Estoque

**Descrição:** O sistema deve permitir a geração de relatórios que consolidem o estado físico e o valor financeiro total do inventário corrente.

**Atores:** Administrador.

**Operações do Sistema:** Consolidação estatística dos produtos, cálculo automatizado do custo patrimonial e destaque gráfico para itens abaixo do limite de segurança.

**Integração:** Vinculado diretamente a **RN12** e **UC010**.

---

### RF-14 — Geração e Exportação de Histórico de Movimentações

**Descrição:** O sistema deve permitir a extração estruturada de dados cronológicos relativos aos fluxos de insumos.

**Atores:** Administrador.

**Operações do Sistema:** Aplicação de filtros avançados por período, tipo de fluxo ou Ordem de Serviço, renderização na interface e exportação para arquivo em formato PDF não editável contendo cabeçalho institucional de integridade.

**Integração:** Vinculado diretamente a **RN12** e **UC012**.

#### Requisitos Não Funcionais — RF-13 / RF-14

| ID | Categoria | Descrição |
|---|---|---|
| RNF-17.01 | Desempenho | O relatório deve ser gerado em até 5 segundos. |
| RNF-17.02 | Usabilidade | O relatório deve ser apresentado de forma clara e organizada. |
| RNF-18.01 | Confiabilidade | O sistema deve armazenar as senhas dos usuários de forma criptografada no banco de dados. |

---

## Quadro 1 — Matriz de Permissões por Perfil de Acesso

| ID do Requisito | Funcionalidade Principal | Administrador | Técnico |
|---|---|---|---|
| **RF-01 / RF-02** | Autenticação e Segurança | Executa | Executa |
| **RF-03 ao RF-06** | Gerenciamento de Usuários (RBAC) | Executa | Bloqueado |
| **RF-07 ao RF-09** | Cadastro, Edição e Exclusão de Produtos | Executa | Bloqueado |
| **RF-10** | Consulta ao Catálogo | Executa | Executa |
| **RF-11** | Registro de Movimentações (Entrada e Saída) | Executa | Executa |
| **RF-11** | Registro de Movimentações (Expurgo/Perdas) | Executa | Bloqueado |
| **RF-12** | Visualização de Alertas Críticos | Executa | Executa |
| **RF-13 / RF-14** | Geração e Exportação de Relatórios | Executa | Bloqueado |