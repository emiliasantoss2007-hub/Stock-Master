# Contrato do Model de Histórico de Movimentações (RF-14)

## Função

`consultarHistorico(filtros = {})` em `src/models/movimentacaoModel.js` retorna uma Promise que resolve para uma lista de movimentações. Não recebe objetos Express nem gera respostas HTTP. Sem filtros ou sem resultados, resolve para uma lista vazia quando não houver linhas.

## Filtros opcionais

- `id_produto`: inteiro positivo ou string numérica positiva.
- `data_inicio`: string `YYYY-MM-DD`, incluída desde `00:00:00`.
- `data_fim`: string `YYYY-MM-DD`; o dia final é incluído usando limite superior exclusivo no dia seguinte.
- `tipo_movimentacao`: `ENTRADA`, `SAIDA` ou `EXPURGO`. A entrada é normalizada sem distinção de caixa ou acentos; os valores armazenados são comparados de forma equivalente.

Todos os filtros informados são combinados com `AND` e passados como parâmetros SQL. Filtros inválidos rejeitam a Promise com erro `code: INVALID_FILTER`. Erros do driver são propagados sem mascaramento.

## Campos retornados

Cada linha inclui `id_movimentacao`, `id_produto`, `nome_produto`, `sku_produto`, `id_usuario`, `nome_responsavel`, `login_responsavel`, `tipo_movimentacao`, `quantidade`, `data_movimentacao` e `justificativa`. Campos de senha, hash, e-mail e token não são consultados.

## Ordenação e desempenho

O SQL ordena por `data_movimentacao DESC, id_movimentacao DESC`. Há índices nas FKs `id_produto`/`id_usuario`; a tabela não possui índice em `data_movimentacao`. Não foi adicionada paginação ou DDL. Com alto volume, medir com dados representativos e avaliar paginação/índice em mudança autorizada.

## Tipos e fuso horário

O domínio documentado inclui `ENTRADA`, `SAIDA` e `EXPURGO`; o script possui uma amostra `entrada` e a tela demonstrativa usa formas acentuadas. A consulta normaliza apenas para comparação e retorna o valor armazenado original. `data_movimentacao` é `DATETIME`, sem fuso incorporado; a função aceita datas civis sem converter timestamps.