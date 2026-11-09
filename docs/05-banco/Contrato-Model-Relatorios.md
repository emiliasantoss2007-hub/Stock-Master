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

`consultarRelatorioProdutos()` retorna uma Promise com uma lista de objetos
contendo `nome`, `sku`, `codigo_barras`, `categoria` e `quantidade_estoque`,
além de `marca`, proposta como coluna nullable em `database/script.sql`. Sem
registros, retorna uma lista vazia; erros do driver são propagados.

O RF-18 menciona `marca`, mas a tabela `produto` no schema atual de `develop`
ainda não possui essa coluna. Sua inclusão no script é apenas uma proposta local;
não foi aplicada ao banco real e requer aprovação e atualização controlada de
instalações existentes. O RF-18 não especifica filtros; nenhum filtro foi
inventado ou implementado.

## Desempenho

O RNF-16.01 estabelece até 5 segundos para gerar relatórios na tela. A consulta
RF-18 lê todos os produtos e o schema atual não declara índices adicionais
além da chave primária e da restrição única de `sku`. Essa análise é estrutural;
o requisito de tempo não foi medido nem comprovado.
