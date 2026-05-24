# Regras de Negócio do Sistema Stock Master

## Convenções de Nomenclatura

- **Sistema:** Stock Master.
- **Usuário:** pessoa cadastrada no sistema.
- **Usuário autenticado:** usuário que realizou login com sucesso.
- **Administrador:** perfil com permissão para gerenciar usuários, produtos, estoque e relatórios.
- **Técnico:** perfil autorizado a executar operações operacionais de estoque, conforme permissões definidas.
- **Produto:** item cadastrado e controlado pelo sistema de estoque.
- **Estoque disponível:** quantidade atual de um produto registrada no sistema.
- **Movimentação de estoque:** qualquer entrada, saída ou expurgo de produto.
- **Expurgo:** retirada de produtos do estoque por perda, dano, vencimento ou outro motivo justificado.
- **Estoque crítico:** situação em que o estoque disponível atinge ou fica abaixo do nível mínimo definido.

## Acesso e Segurança

### RN01 - Controle de Acesso

O acesso ao sistema só pode ser permitido para usuários cadastrados que informem login e senha válidos.

**Critérios:**

- O usuário deve estar previamente cadastrado.
- O login informado deve existir no sistema.
- A senha deve ser validada com segurança.
- O acesso deve respeitar o perfil e as permissões do usuário.

## Gestão de Usuários

### RN02 - Cadastro de Usuários

Usuários só podem ser cadastrados por administradores quando todos os campos obrigatórios forem preenchidos.

**Critérios:**

- O cadastro deve conter nome, login, senha e perfil.
- O administrador deve estar autenticado.
- O perfil do usuário deve ser definido no momento do cadastro.
- Cadastros incompletos não devem ser salvos.

### RN03 - Exclusão de Usuários

Usuários só podem ser excluídos por administradores mediante confirmação da operação.

**Critérios:**

- O administrador deve estar autenticado.
- O usuário a ser excluído deve existir no sistema.
- A operação deve solicitar confirmação antes da exclusão.
- Após a exclusão, o acesso do usuário deve ser revogado.

## Gestão de Produtos

### RN04 - Cadastro de Produtos

Produtos só podem ser cadastrados por usuários autenticados quando os dados obrigatórios forem informados.

**Critérios:**

- O cadastro deve conter nome, categoria e quantidade.
- A quantidade informada deve ser válida.
- O usuário deve possuir permissão para cadastrar produtos.
- Produtos com dados obrigatórios ausentes não devem ser salvos.

### RN05 - Edição de Produtos

Produtos só podem ser editados por administradores quando estiverem previamente cadastrados no sistema.

**Critérios:**

- O produto deve existir no cadastro.
- O administrador deve estar autenticado.
- Os dados alterados devem ser validados antes do salvamento.
- A edição não deve gerar inconsistências no estoque.

### RN06 - Exclusão de Produtos

Produtos só podem ser excluídos por usuários autorizados após confirmação da exclusão.

**Critérios:**

- O produto deve existir no sistema.
- O usuário deve possuir permissão para excluir produtos.
- O sistema deve solicitar confirmação antes da exclusão.
- A exclusão deve respeitar vínculos e restrições operacionais do estoque.

## Controle de Estoque

### RN07 - Entrada de Estoque

A inclusão de estoque só pode ser realizada por administradores ou técnicos mediante informação de quantidade maior que zero.

**Critérios:**

- O produto deve estar cadastrado.
- A quantidade de entrada deve ser maior que zero.
- O usuário deve estar autenticado.
- A operação deve atualizar o estoque disponível.

### RN08 - Saída de Estoque

A saída de produtos só pode ser realizada por administradores ou técnicos quando a quantidade solicitada for menor ou igual ao estoque disponível.

**Critérios:**

- O produto deve estar cadastrado.
- A quantidade de saída deve ser maior que zero.
- A quantidade de saída não pode ultrapassar o estoque disponível.
- A operação deve atualizar o estoque disponível.

### RN09 - Expurgo de Estoque

O expurgo de produtos só pode ser realizado por administradores mediante informação do motivo da retirada.

**Critérios:**

- O produto deve estar cadastrado.
- O administrador deve estar autenticado.
- A quantidade expurgada deve ser válida.
- O motivo do expurgo deve ser informado.
- A operação deve atualizar o estoque disponível.

## Auditoria e Rastreabilidade

### RN10 - Histórico de Movimentações

Toda movimentação de estoque deve ser registrada com data, tipo de movimentação e quantidade da operação.

**Critérios:**

- O registro deve indicar o produto movimentado.
- O registro deve indicar o tipo da operação: entrada, saída ou expurgo.
- O registro deve conter a quantidade movimentada.
- O registro deve conter a data da operação.
- O histórico deve permitir acompanhamento das operações realizadas no estoque.

## Alertas e Relatórios

### RN11 - Alerta de Estoque Crítico

Alertas de estoque só devem ser gerados para produtos cadastrados quando o estoque disponível atingir o nível mínimo definido.

**Critérios:**

- O produto deve estar cadastrado.
- O produto deve possuir nível mínimo definido.
- O alerta deve ser gerado quando a quantidade disponível atingir ou ficar abaixo do limite mínimo.
- O limite pode ser configurado por produto, como 30% do estoque total.

### RN12 - Relatórios

Relatórios só podem ser gerados por administradores com base nos dados cadastrados no sistema.

**Critérios:**

- O administrador deve estar autenticado.
- Os relatórios devem utilizar dados registrados no sistema.
- As informações exibidas devem respeitar as permissões de acesso.
- Os relatórios devem apoiar a análise e o acompanhamento das operações do estoque.

