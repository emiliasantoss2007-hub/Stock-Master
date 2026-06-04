# Regras De Negócio

1. Módulo de Usuário e Autenticação
2. Módulo de Gestão de Produtos
3. Módulo de Controle de Estoque

| ID | Regra De Negócio | Aplica-se a | RF Relacionado | RNF Relacionado |
|----|-----------------|-------------|----------------|-----------------|
| RN - 01 | A recuperação de senha somente poderá ser realizada por usuários previamente cadastrados | Administrador e Técnico | RF-03 | RNF-01.03 |
| RN - 02 | O login de cada usuário deve ser único no sistema. | Administrador | RF-04 | RNF-03.04 |
| RN - 03 | Apenas administradores podem cadastrar novos usuários. | Administrador | RF-04 | RNF-06.01 |
| RN - 04 | Apenas usuários autorizados podem editar dados cadastrais de usuários. | Administrador | RF-05 | RNF-03.01 |

| ID | Regra De Negócio | Aplica-se a | RF Relacionado | RNF Relacionado |
|----|-----------------|-------------|----------------|-----------------|
| RN - 05 | Cada produto deve possuir um código SKU único. | Administrador e Técnico | RF-08 | RNF-07.02 |
| RN - 06 | Não é permitido cadastrar produtos sem nome, categoria e código SKU. | Administrador e Técnico | RF-08 | RNF-07.01 |
| RN - 07 | O gerenciamento de produtos deve respeitar as permissões definidas para cada perfil de usuário. | Administrador e Técnico | RF-08, RF-09 e RF-10 | RNF-06.01 e RNF-06.02 |
| RN - 08 | Somente produtos cadastrados podem ser consultados ou movimentados no sistema. | Administrador e Técnico | RF-11 | RNF-08.01 |

| ID | Regra De Negócio | Aplica-se a | RF Relacionado | RNF Relacionado |
|----|-----------------|-------------|----------------|-----------------|
| RN - 9 | Somente produtos cadastrados podem receber entrada de estoque. | Administrador e Técnico | RF-12 | RNF-13.01 |
| RN - 10 | Não é permitido registrar saída de produtos em quantidade superior ao estoque disponível. | Administrador e Técnico | RF-13 | RNF-15.01 |
| RN - 11 | Toda movimentação de entrada ou saída deve ser registrada no histórico de estoque. | Administrador e Técnico | RF-12, RF-13 e RF-14 | RNF-11.01 |
| RN - 12 | O expurgo de produtos deve exigir o registro do motivo da remoção. | Administrador e Técnico | RF-15 | RNF-16.01 |
| RN - 13 | Apenas administradores podem realizar o expurgo definitivo de produtos. | Administrador | RF-15 | RNF-16.02 |

## 4. Módulo de Movimentações e Relatórios

| ID | Regra De Negócio | Aplica-se a | RF Relacionado | RNF Relacionado |
|----|-----------------|-------------|----------------|-----------------|
| RN - 14 | Os relatórios devem ser gerados com base exclusivamente nos dados registrados no sistema | Administrador | RF-16, RF-17 e RF-18 | RNF-17.01 e RNF-17.02 |
