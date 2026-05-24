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

## Regras de Negócios 

As regras de negócio definem as condições e restrições que orientam o funcionamento do sistema. Elas estabelecem quem pode realizar determinadas ações e sob quais critérios, garantindo o controle, a segurança e a integridade das operações realizadas no sistema de gerenciamento de estoque.

## Acesso e Segurança

### RN01 - Controle de Acesso

O acesso ao sistema só pode ser permitido para usuários cadastrados que informem login e senha válidos.


## Gestão de Usuários

### RN02 - Cadastro de Usuários

Usuários só podem ser cadastrados, por administradores, com todos os campos obrigatórios preenchidos (nome, login, senha e perfil).

### RN03 - Exclusão de Usuários

Usuários só podem ser excluídos, por administradores, mediante confirmação da operação.

## Gestão de Produtos

### RN04 - Cadastro de Produtos

Produtos só podem ser cadastrados, por usuários autenticados, com nome, categoria e quantidade informados.

### RN05 - Edição de Produtos

Produtos só podem ser editados, por administradores, quando estiverem previamente cadastrados no sistema.

### RN06 - Exclusão de Produtos

Produtos só podem ser excluídos, por usuários autorizados, após confirmação da exclusão.

## Controle de Estoque

### RN07 - Entrada de Estoque

A inclusão de estoque só pode ser realizada, por administradores ou técnicos, informando uma quantidade maior que zero.

### RN08 - Saída de Estoque

A saída de produtos só pode ser realizada, por administradores ou técnicos, quando a quantidade solicitada for menor ou igual ao estoque disponível.

### RN09 - Expurgo de Estoque

O expurgo de produtos só pode ser realizado, por administradores, informando o motivo da retirada.

## Auditoria e Rastreabilidade

### RN10 - Histórico de Movimentações

Toda movimentação de estoque deve ser registrada, para todos os produtos, com data, tipo e quantidade da operação.

## Alertas e Relatórios

### RN11 - Alerta de Estoque Crítico

Alertas de estoque só devem ser gerados, para produtos cadastrados, quando atingirem o nível mínimo definido (ex: 30% do estoque).

### RN12 - Relatórios

Relatórios só podem ser gerados, por administradores, com base nos dados cadastrados no sistema.

