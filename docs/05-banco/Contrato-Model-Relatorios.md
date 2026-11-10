# Contrato inicial dos Models de Relatórios

## RF-16 — Relatório de movimentações

Reaproveita `consultarHistorico` do Model RF-14; não define uma consulta
duplicada. A movimentação relaciona-se ao produto por
`movimentacao.id_produto = produto.id_produto`.

O retorno é uma `Promise<Array<MovimentacaoRelatorio>>`, vazia quando não há
registros. Cada objeto contém os campos efetivamente retornados pelo Model RF-14:
`id_movimentacao`, `id_produto`, `nome_produto`, `sku_produto`, `id_usuario`,
`nome_responsavel`, `login_responsavel`, `tipo_movimentacao`, `quantidade`,
`data_movimentacao` e `justificativa`.

O filtro `tipo_movimentacao` do Model RF-14 aceita `ENTRADA`, `SAIDA` e
`EXPURGO`, normalizando caixa e acentos para comparação. O campo retornado
preserva o valor armazenado; no schema, `tipo_movimentacao` é texto livre.

O SRS cita movimentações de entrada e saída e filtros como período ou produto,
mas não define agregações nem a semântica completa desses filtros. A estrutura
reaproveita os registros do RF-14 sem somatórios ou agrupamentos; qualquer
consolidação além da listagem depende de definição da equipe.

## RF-18 — Relatório de produtos

O produto consultado é cada registro cadastrado na tabela `produto`.
`consultarRelatorioProdutos()` não recebe filtros e retorna a Promise da lista
de linhas produzida pela consulta. Cada objeto contém `nome`, `sku`,
`codigo_barras`, `categoria` e `quantidade_estoque`, com os nomes exatos das
colunas selecionadas. Sem produtos, a consulta retorna uma lista vazia; erros
do driver são propagados. O RF-18 não define filtros específicos; nenhum filtro
foi inventado ou implementado.

## Desempenho

O RNF-16.01 estabelece até 5 segundos para gerar relatórios na tela. A consulta
RF-18 lê todos os produtos e o schema atual não declara índices adicionais
além da chave primária e da restrição única de `sku`. Essa análise é estrutural;
o requisito de tempo não foi medido nem comprovado.
